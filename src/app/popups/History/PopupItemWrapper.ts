import gsap from "gsap";
import { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { HisotryPopupItem } from "./HistoryPopupItem";

export class PopupItemWrapper extends Container {
  private readonly ITEM_OFFSET = 5;
  private readonly SCROLL_SPEED = 0.5;
  private readonly LOAD_THRESHOLD = 200; // pixels from bottom to trigger auto-load

  private maskHistory: Graphics;
  private itemsContainer: Container;
  private isDragging = false;
  private lastPointerY = 0;
  private minY = 0;
  private maxY = 0;
  private currentOpenItem: HisotryPopupItem | null = null;

  // Pagination state
  private currentPage = 1;
  private totalPages = 1;
  private isLoading = false;
  private currentDayOffset = 0;

  private listWidth = 600;

  public onHistoryLoaded?: (hasHistory: boolean) => void;

  constructor(validWidth: number, validHeight: number) {
    super();

    this.listWidth = validWidth;

    this.maskHistory = new Graphics()
      .rect(0, 0, 1000, validHeight)
      .fill({ color: "black", alpha: 0.5 });
    this.addChild(this.maskHistory);
    this.hitArea = this.maskHistory.getBounds().rectangle;

    // Create a container for items to scroll
    this.itemsContainer = new Container();
    this.addChild(this.itemsContainer);
    this.itemsContainer.mask = this.maskHistory;

    this.initItems().then(() => {
      this.setupScrolling();
    });
  }

  private checkAndLoadMore() {
    // Don't load if already loading or no more pages
    if (this.isLoading || this.currentPage >= this.totalPages) {
      return;
    }

    // Calculate how far from bottom we are
    const scrollPosition = -this.itemsContainer.y;
    const visibleHeight = this.maskHistory.height;
    const totalHeight = this.getTotalContentHeight();
    const distanceFromBottom = totalHeight - (scrollPosition + visibleHeight);

    // Trigger load if within threshold
    if (distanceFromBottom < this.LOAD_THRESHOLD) {
      this.loadPage(this.currentPage + 1, this.currentDayOffset);
    }
  }

  private getTotalContentHeight(): number {
    const lastItem = this.getLastHistoryItem();
    return lastItem ? lastItem.y + lastItem.height : 0;
  }

  private getLastHistoryItem(): HisotryPopupItem | null {
    const children = this.itemsContainer.children;
    // Find the last HisotryPopupItem
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i] instanceof HisotryPopupItem) {
        return children[i] as HisotryPopupItem;
      }
    }
    return null;
  }

  public async initItems(dayOffset?: number) {
    this.removeItemsChildren();
    this.currentPage = 1;
    this.currentDayOffset = dayOffset ?? 0;

    // Reset scroll position to top
    this.itemsContainer.y = 0;

    await this.loadPage(this.currentPage, this.currentDayOffset);
  }

  private async loadPage(page: number, _dayOffset: number) {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      // Mock Response Structure
      const mockDataLength = 20;
      const mockData = Array(mockDataLength).fill(null).map((_, idx) => ({
        bet_id: "preview_id_" + idx,
        amount: (idx + 1) * 1000,
        timestamp: new Date().toISOString(),
        multiplier: idx % 2 === 0 ? 2.5 : 0,
        total_win: idx % 2 === 0 ? (idx + 1) * 2500 : 0,
        status: idx % 2 === 0 ? 1 : 0
      }));

      // Update pagination info (Mock)
      this.currentPage = page;
      this.totalPages = 1; // Single page for preview

      // Only trigger callback on first load
      if (page === 1) {
        this.onHistoryLoaded?.(true);
      }

      // Get the current total height before adding new items
      const lastItem = this.getLastHistoryItem();
      let startY = 0;
      if (lastItem) {
        startY = lastItem.y + lastItem.height + this.ITEM_OFFSET;
      }

      // Add new items
      for (let i = 0; i < mockData.length; i++) {
        const historyPopupItem = new HisotryPopupItem(this.listWidth);
        historyPopupItem.setHistoryDetailData(mockData[i]);

        historyPopupItem.y =
          startY + i * (this.ITEM_OFFSET + historyPopupItem.height);
        historyPopupItem.onItemVisibleChange = (state: boolean) => {
          this.onItemVisibleChange(historyPopupItem, state);
        };

        this.itemsContainer.addChild(historyPopupItem);
      }

      // Calculate scroll bounds
      this.updateScrollBounds();
    } catch (error: any) {
      console.error("Error loading mock history page:", error);
    } finally {
      this.isLoading = false;
    }
  }

  private removeItemsChildren() {
    this.itemsContainer.removeChildren();
  }

  private setupScrolling() {
    this.eventMode = "static";

    // Mouse wheel scrolling
    this.on("wheel", this.onWheel.bind(this));

    // Touch/drag scrolling
    this.on("pointerdown", this.onPointerDown.bind(this));
    this.on("pointermove", this.onPointerMove.bind(this));
    this.on("pointerup", this.onPointerUp.bind(this));
    this.on("pointerupoutside", this.onPointerUp.bind(this));
  }

  private onWheel(event: WheelEvent) {
    const delta = event.deltaY * this.SCROLL_SPEED;
    this.scrollBy(delta);

    // Check if we need to load more after scrolling
    this.checkAndLoadMore();
  }

  private onPointerDown(event: FederatedPointerEvent) {
    this.isDragging = true;
    this.lastPointerY = event.global.y;
  }

  private onPointerMove(event: FederatedPointerEvent) {
    if (!this.isDragging) return;

    const currentY = event.global.y;
    const delta = currentY - this.lastPointerY;

    this.scrollBy(-delta);
    this.lastPointerY = currentY;
  }

  private onPointerUp() {
    this.isDragging = false;

    // Check if we need to load more after dragging
    this.checkAndLoadMore();
  }

  private scrollBy(delta: number) {
    const newY = this.itemsContainer.y - delta;
    this.itemsContainer.y = Math.max(this.minY, Math.min(this.maxY, newY));
  }

  private updateScrollBounds() {
    const totalHeight = this.getTotalContentHeight();

    this.maxY = 0;
    this.minY = Math.min(0, this.maskHistory.height - totalHeight);
  }

  private onItemVisibleChange(item: HisotryPopupItem, state: boolean) {
    // If opening a new item, close the currently open one
    if (state && this.currentOpenItem && this.currentOpenItem !== item) {
      this.currentOpenItem.collapse();
    }

    // Update the current open item reference
    this.currentOpenItem = state ? item : null;

    // Update positions when items expand/collapse
    this.repositionItems();
  }

  private repositionItems() {
    let currentY = 0;
    const animationDuration = 0.25;

    this.itemsContainer.children.forEach((child, index) => {
      const targetY = currentY;

      // Animate each item to its new position
      gsap.to(child, {
        y: targetY,
        duration: animationDuration,
        ease: "power2.out",
        onUpdate: () => {
          // Update scroll bounds during animation
          this.updateScrollBounds();
        },
        onComplete: () => {
          // Final update when animation completes
          if (index === this.itemsContainer.children.length - 1) {
            this.updateScrollBounds();
          }
        },
      });

      currentY += (child as HisotryPopupItem).height + this.ITEM_OFFSET;
    });
  }

  public close() {
    // Collapse open item
    if (this.currentOpenItem) {
      this.currentOpenItem.collapse();
    }

    // Reset scroll to the top
    this.itemsContainer.y = 0;
  }

  // Check if more pages are available
  public hasMorePages(): boolean {
    return this.currentPage < this.totalPages;
  }
}
