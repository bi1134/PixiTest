import { Container, Graphics, NineSliceSprite, Texture } from "pixi.js";
import { gsap } from "gsap";
import { List } from "@pixi/ui";
import { CardHistoryItem } from "../../../ui/CardHistoryItem";
import { GuessAction } from "../types/GameTypes";

/**
 * Manages the display of past card results using a horizontal scroll layout.
 * Uses `@pixi/ui` List for stable layout management and robust animation handling
 * to prevent race conditions during rapid updates ("speed runs").
 */
export type CardHistoryDirection = 'ltr' | 'rtl' | 'ttb' | 'btt';

export interface CardHistoryLayoutOptions {
  type?: 'horizontal' | 'vertical'; // default horizontal
  direction?: CardHistoryDirection; // default depends on type. Horizontal: ltr. Vertical: ttb/btt
}

class GapContainer extends Container {
  constructor(
    public leftPad: number,
    public rightPad: number,
    public type: 'horizontal' | 'vertical'
  ) {
    super();
  }

  public addItem(item: Container) {
    this.addChild(item);
    if (this.type === 'horizontal') {
      item.x = this.leftPad;
    } else {
      item.y = this.leftPad;
    }
  }

  // Override logical width/height to include padding
  public override get width(): number {
    if (this.type === 'horizontal') {
      const childSize = this.children.length > 0 ? this.children[0].width : 0;
      // Note: children[0].width is scale-adjusted.
      // But wait! If we just modified item.x, does child.width change? No.
      // However, we want the TOTAL layout span.
      // If we use super.width, it calculates bounds.
      // If child is at x=10, width=100. Bounds = 110.
      // We want 10 (left) + 100 (child) + right.
      // So super.width (110) + rightPad.
      // IF leftPad is negative (-10). Child at -10. Bounds: minX=-10, maxX=90. Width=100.
      // We want -10 + 100 + rightPad = 90 + rightPad.
      // super.width (100) - 10 ??? No.
      // Actually simply: leftPad + childSize + rightPad works for both?
      // 10 + 100 + 10 = 120.
      // -10 + 100 + 10 = 100.
      // Let's use explicit calculation.
      return this.leftPad + childSize + this.rightPad;
    }
    return super.width;
  }

  public override get height(): number {
    if (this.type === 'vertical') {
      const childSize = this.children.length > 0 ? this.children[0].height : 0;
      return this.leftPad + childSize + this.rightPad;
    }
    return super.height;
  }
}

export class CardHistoryLayout extends Container {
  private cardsHistoryBackground!: NineSliceSprite;
  private cardsHistoryMask!: Graphics;
  public list!: List;
  public listYOffset: number = 0;
  public listXOffset: number = 0;
  public pushBackPadding: number = 0; // Padding from bottom when scrolling up (overflow)
  public listStartPadding: number = 0; // Fixed start padding for the list


  private options: CardHistoryLayoutOptions;

  private currentListScrollAnim: any = null; // Track full list scroll animation

  // We intentionally don't keep a separate array if List handles children,
  // but the user's logic might rely on access. We can access list.children.

  constructor(options: CardHistoryLayoutOptions = {}) {
    super();
    this.options = {
      type: 'horizontal',
      direction: 'ltr',
      ...options
    };
    // Default vertical direction to btt (bottom-to-top) if not specified but type is vertical? 
    // Actually standard List is 'vertical' -> TTB. 
    // If user wants BTT, they might say direction: 'btt'.

    this.createLayout();
  }

  private createLayout() {
    const listWidth = this.options.type === 'vertical' ? 150 : 300;
    const listHeight = this.options.type === 'vertical' ? 300 : 150;

    // --- background box ---
    this.cardsHistoryBackground = new NineSliceSprite({
      texture: Texture.from("Bar-history.png"),
      leftWidth: 35,
      topHeight: 35,
      rightWidth: 35,
      bottomHeight: 35,
    });
    this.cardsHistoryBackground.width = listWidth;
    this.cardsHistoryBackground.height = listHeight;
    this.addChild(this.cardsHistoryBackground);

    // --- create mask for the visible region ---
    this.cardsHistoryMask = new Graphics()
      .rect(
        0,
        0,
        listWidth,
        listHeight,
      )
      .fill(0xffffff); // fill color doesn't matter, mask only uses alpha
    this.addChild(this.cardsHistoryMask);

    this.mask = this.cardsHistoryMask;

    // --- Create List ---
    this.list = new List({
      type: this.options.type ?? "horizontal",
      elementsMargin: 0,
    });

    this.addChild(this.list);
  }

  public addCardToHistory(
    value: string,
    suit: string,
    action: GuessAction,
    leftPad: number = 0,
    rightPad: number = 0,
    _scrollMutiplier: number = 5,
    itemScale?: number
  ) {
    // 1. Create New Item
    const item = new CardHistoryItem(value, suit, action);


    const finalScale = itemScale ?? 1;
    item.setBaseScale(finalScale);

    const itemWidth = item.getLocalBounds().width * finalScale;
    const itemHeight = item.getLocalBounds().height * finalScale; // Use bounds for animation offset

    // Use GapContainer wrapper to handle per-item spacing
    const wrapper = new GapContainer(leftPad, rightPad, this.options.type ?? 'horizontal');
    wrapper.addItem(item);

    // 3. Add to List
    this.list.addChild(wrapper); // Adds to end

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
    let slideOffset = 0;
    if (this.options.type === 'vertical') {
      // Slide in from bottom
      slideOffset = itemHeight + 20;
      item.animateEntry(slideOffset, 0.3);
    } else {
      slideOffset = itemWidth * 2;
      item.animateEntry(slideOffset, 0.3);
    }

    // 5. Build Scroll / Overflow logic ("Push Back" / "Push Up")

    // Calculate needed scroll position to keep the new item visible.
    // We use requestAnimationFrame to ensure we read the List's dimensions AFTER PixiUI has updated the layout.
    requestAnimationFrame(() => {
      if (this.destroyed) return;

      const listWidth = this.list.width;
      const listHeight = this.list.height;
      const visibleWidth = this.cardsHistoryBackground.width;
      const visibleHeight = this.cardsHistoryBackground.height;

      // Stop previous scroll animation if any to prevent fighting
      if (this.currentListScrollAnim) {
        this.currentListScrollAnim.kill();
        this.currentListScrollAnim = null;
      }

      if (this.options.type === 'vertical') {
        // Vertical Logic
        let finalY = this.listStartPadding;

        // Check for Overflow
        if (listHeight + this.listStartPadding * 2 <= visibleHeight) {
          finalY = this.listStartPadding; // Align Top
        } else {
          // Align Bottom / Scroll Up
          finalY = visibleHeight - listHeight - this.pushBackPadding;
        }

        this.currentListScrollAnim = gsap.to(this.list, {
          y: finalY + this.listYOffset,
          duration: 0.3,
          ease: "back.out",
        });

        // Center X logic for vertical list
        // Use itemWidth instead of list.width because list.width might fluctuate due to entry animations (sliding in from X).
        this.list.x = visibleWidth / 2 - itemWidth / 2 + this.listXOffset;

      } else {
        // Horizontal Logic (unchanged mostly)
        // Use itemHeight (target height) instead of item.heightScaled (current animating height) to prevent jumping
        this.list.y =
          visibleHeight / 2 - itemHeight / 2 + this.listYOffset; // Approximate centering

        const desiredX = visibleWidth - listWidth - this.pushBackPadding;
        // Use direction options if strictly needed, but assuming RTL push behavior for horizontal
        const finalX = Math.min(this.listStartPadding, desiredX);

        this.currentListScrollAnim = gsap.to(this.list, {
          x: finalX + this.listXOffset,
          duration: 0.3,
          ease: "back.out",
        });
      }
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
    this.list.x = 0 + this.listXOffset; // Reset scroll with offset
    this.list.y = 0 + this.listYOffset; // Reset scroll with offset

    // Safely destroy children
    for (const child of children) {
      if (child instanceof Container && !child.destroyed) {
        child.destroy({ children: true });
      }
    }
  }

  public setSize(width: number, height: number) {
    this.resize(width, height);
  }

  public resize(width: number, height: number, _padding?: number) {
    const padding = _padding ?? 0;
    this.listStartPadding = padding;

    // --- Resize and position background ---
    this.cardsHistoryBackground.width = width;
    this.cardsHistoryBackground.height = height;

    // --- Update mask to match background ---
    this.cardsHistoryMask
      .clear()
      .rect(
        0,
        0,
        width,
        height,
      )
      .fill(0xffffff);
    // Explicitly update hitArea or mask logic if needed, but Graphics mask works by geometry.

    if (this.options.type === 'vertical') {
      // For vertical:
      // 1. Center X
      this.list.x = width / 2 - this.list.width / 2 + this.listXOffset;

      // 2. Align Vertical
      let finalY = padding; // Default top alignment

      const contentHeight = this.list.height; // approximate content height

      // If content fits within visible height, align top.
      // If content exceeds visible height, align bottom to match "push up" behavior.
      if (contentHeight + padding * 2 <= height) {
        finalY = padding; // Start from top
      } else {
        // Overflow: Scroll to bottom (show newest items at bottom)
        // y = maxY = height - listHeight - padding
        finalY = height - contentHeight - this.pushBackPadding;
      }

      this.list.y = finalY + this.listYOffset;
    } else {
      // Horizontal Logic
      // 1. Center Y
      this.list.y = height / 2 - this.list.height / 2 + this.listYOffset;

      // 2. Align Horizontal
      let finalX = padding;

      const contentWidth = this.list.width;

      if (contentWidth + padding * 2 <= width) {
        finalX = padding;
      } else {
        finalX = width - contentWidth - this.pushBackPadding;
      }

      this.list.x = finalX + this.listXOffset;
    }
  }
}
