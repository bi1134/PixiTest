import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";
import { GameHistoryItem } from "./GameHistoryItem";


export class GameHistoryContainer extends Container {
  private background: Graphics;
  private historyItems: GameHistoryItem[] = [];
  private maskGfx: Graphics;

  private lastItemWidth: number = 100;
  private lastItemHeight: number = 60;

  constructor(width: number = 400, height: number = 60) {
    super();

    // Background
    this.background = new Graphics();
    this.background.alpha = 0.25;
    this.addChild(this.background);

    // Mask
    this.maskGfx = new Graphics();
    this.addChild(this.maskGfx);
    this.mask = this.maskGfx;

    // Initial draw
    this.resize(width, height);
  }

  public resize(width: number, height: number) {
    // 1. Resize Background & Mask
    this.background.clear().rect(0, 0, width, height).fill(0x000000);
    this.maskGfx.clear().rect(0, 0, width, height).fill(0x000000);

    // Calculate dimensions: 5.5 items visible
    this.lastItemWidth = width / 4.5;
    this.lastItemHeight = height;

    const centerY = height / 2;
    for (const item of this.historyItems) {
      // Resize item to fill height (as requested)
      item.resize(this.lastItemWidth, this.lastItemHeight);
      item.y = centerY;
      // Note: X positions might need update if we want perfect reflow, 
      // but usually items are just drifting. If we need to fix their positions rel to each other:
      // Ideally we'd need to re-layout based on their logical index. 
      // For now, updating size is critical.
    }
  }

  public addResult(multiplier: number, isWin: boolean) {
    const item = new GameHistoryItem({
      multiplier,
      isWin,
      timestamp: Date.now(),
      amount: 0, // placeholder as this view might not need amount
    });

    const padding = 10;
    const itemWidth = this.lastItemWidth;
    const itemHeight = this.lastItemHeight;

    item.resize(itemWidth, itemHeight);

    // Start position (Offscreen Left)
    item.x = -itemWidth;
    item.y = this.background.height / 2;

    // Add to the top of the display list (highest z-index)
    this.addChild(item);
    this.historyItems.push(item);

    // Overlap: Negative gap based on item width
    const gap = -itemWidth * 0.15; // 15% overlap
    const shiftAmount = itemWidth + gap;

    // 1. Shift existing items Right
    for (const historyItem of this.historyItems) {
      if (historyItem === item) continue; // Skip new one for now

      historyItem.targetX += shiftAmount;
      // Use GSAP for speed control reference
      gsap.to(historyItem, {
        x: historyItem.targetX,
        duration: 0.3,
        ease: "back.out",
      });

      // Cull items that go offscreen Right
      if (historyItem.targetX > this.background.width + itemWidth) {
        // cleanup possible here
      }
    }

    // 2. Position New Item
    // It enters at: Padding
    // We aim for the left side with some padding.
    const entryX = padding + itemWidth / 3;

    item.targetX = entryX;

    // Initial setup for animation
    item.x = -itemWidth; // Start offscreen Left
    item.alpha = 0;

    // Animate In - GSAP
    gsap.to(item, {
      x: item.targetX,
      alpha: 1,
      duration: 0.3,
      ease: "back.out",
    });
  }
}
