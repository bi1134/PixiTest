import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";
import { List } from "@pixi/ui";
import { CardHistoryItem } from "../../../ui/CardHistoryItem";
import { GuessAction } from "../types/GameTypes";

/**
 * Manages the display of past card results using a horizontal scroll layout.
 * Uses `@pixi/ui` List for stable layout management and robust animation handling
 * to prevent race conditions during rapid updates ("speed runs").
 */
export class CardHistoryLayout extends Container {
  private cardsHistoryBackground!: Graphics;
  private cardsHistoryMask!: Graphics;
  public list!: List;
  public listYOffset: number = 0;

  private currentListScrollAnim: any = null; // Track full list scroll animation

  // We intentionally don't keep a separate array if List handles children,
  // but the user's logic might rely on access. We can access list.children.

  constructor() {
    super();
    this.createLayout();
  }

  private createLayout() {
    // --- background box ---
    this.cardsHistoryBackground = new Graphics()
      .rect(0, 0, 300, 150)
      .fill("#3c3c3cff");
    this.addChild(this.cardsHistoryBackground);

    // --- create mask for the visible region ---
    this.cardsHistoryMask = new Graphics()
      .rect(
        this.cardsHistoryBackground.x,
        this.cardsHistoryBackground.y,
        this.cardsHistoryBackground.width,
        this.cardsHistoryBackground.height,
      )
      .fill(0xffffff); // fill color doesn't matter, mask only uses alpha
    this.addChild(this.cardsHistoryMask);

    this.mask = this.cardsHistoryMask;

    // --- Create List ---
    this.list = new List({
      type: "horizontal",
      elementsMargin: 0, // We'll handle spacing via item size or margin if needed
    });

    this.addChild(this.list);
  }

  public addCardToHistory(
    value: string,
    suit: string,
    action: GuessAction,
    padding: number = 8,
    gapMultipler: number = 1,
    _scrollMutiplier: number = 5,
  ) {
    // 1. Create New Item
    const item = new CardHistoryItem(value, suit, action);

    // 2. Resize ensures scale is correct for dimensions
    item.ResizeToFit(this.cardsHistoryBackground.height, padding);
    const finalScale = item.scale.x;
    const itemWidth = item.getLocalBounds().width * finalScale;

    // Set margin for the list
    // PixiUI List doesn't seemingly support per-item margin easily in constructor unless uniform elementsMargin is used.
    // But we can just rely on the layout.
    // If we want "gap", we can set it on the List.
    this.list.elementsMargin = padding / gapMultipler;

    // 3. Add to List
    // The user wants new items to appear.
    // Previously: "Push from right to left". Newest was at "TargetX".
    // If we use a horizontal list, items are added Left to Right usually.
    // If we want Right to Left (History), we typically prepend?
    // Or we append and scroll?
    // Let's assume standard appending for now, but usually history shows [Old] [New] ->
    // Or [New] [Old] <- ?
    // Based on previous code: `targetX` increased as list grew.
    // So it was: [Item 1] [Item 2] [Item 3].
    // Then if it overflowed, everything shifted LEFT.
    // So the "View" is a window over the end of the list.

    this.list.addChild(item); // Adds to end

    // 4. Trigger Item Entry Animations
    // "Pop In"
    item.alpha = 0;
    item.scale.set(finalScale * 0.5);
    const popDuration = 0.3;

    const animAlpha = gsap.to(item, {
      alpha: 1,
      duration: popDuration,
      ease: "linear",
    });
    item.trackAnimation(animAlpha as any);

    const animScale = gsap.to(item.scale, {
      x: finalScale,
      y: finalScale,
      duration: popDuration,
      ease: "back.out",
    });
    item.trackAnimation(animScale as any);

    // "Fake Position" Slide In
    // Slides the inner visuals from an offset (width + 20px) to 0.
    // This creates a "slide in" feel without fighting the List's layout positioning.
    const slideOffset = itemWidth + 20;
    item.animateEntry(slideOffset, 0.3);

    // 5. Build Scroll / Overflow logic ("Push Back")
    this.list.y =
      this.cardsHistoryBackground.height / 2 - item.heightScaled / 2 + this.listYOffset; // Approximate centering

    // Calculate needed scroll position to keep the new item visible.
    // We use requestAnimationFrame to ensure we read the List's width AFTER PixiUI has updated the layout.
    requestAnimationFrame(() => {
      if (this.destroyed) return;

      const listWidth = this.list.width;
      const visibleWidth = this.cardsHistoryBackground.width;
      const desiredX = visibleWidth - listWidth - padding;

      // If list is smaller than visible container, stick to left padding.
      // If larger, align right (equivalent to "scrolling" to the end).
      const finalX = Math.min(padding, desiredX);

      // Stop previous scroll animation if any to prevent fighting
      if (this.currentListScrollAnim) {
        this.currentListScrollAnim.kill();
        this.currentListScrollAnim = null;
      }

      // Smoothly animate the List container to the new position
      this.currentListScrollAnim = gsap.to(this.list, {
        x: finalX,
        duration: 0.3,
        ease: "back.out",
      });
    });
  }

  public clearHistory() {
    // Stop global scroll animation immediately
    if (this.currentListScrollAnim) {
      this.currentListScrollAnim.kill();
      this.currentListScrollAnim = null;
    }

    // Create copy of children for safe iteration
    const children = [...this.list.children];

    // Remove from display list immediately to prevent weird state
    this.list.removeChildren();
    this.list.x = 0; // Reset scroll

    // Safely destroy children
    for (const child of children) {
      if (child instanceof Container && !child.destroyed) {
        child.destroy({ children: true });
      }
    }
  }

  public resize(width: number, height: number) {
    // --- Resize and position background ---
    this.cardsHistoryBackground.setSize(width, height);

    // --- Update mask to match background ---
    this.cardsHistoryMask
      .clear()
      .rect(
        this.cardsHistoryBackground.x,
        this.cardsHistoryBackground.y,
        this.cardsHistoryBackground.width,
        this.cardsHistoryBackground.height,
      )
      .fill(0xffffff);

    // Keep list vertically centered roughly
    this.list.y = height / 2 - 30 + this.listYOffset; // Approx
  }
}
