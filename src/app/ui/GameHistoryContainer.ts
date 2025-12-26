import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";
import { GameHistoryItem } from "./GameHistoryItem";

export class GameHistoryContainer extends Container {
  private background: Graphics;
  private historyItems: GameHistoryItem[] = [];
  private maskGfx: Graphics;

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

    const centerY = height / 2;
    for (const item of this.historyItems) {

      item.y = centerY;
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
    // Calculate item width to fit ~5-6 items
    const itemWidth = this.background.width / 5;
    const itemHeight = this.background.height * 0.7;

    item.resize(itemWidth, itemHeight);

    // Start position (Offscreen Right)
    item.x = this.background.width + itemWidth;
    item.y = this.background.height / 2;

    // Add at index 2 (after Background and Mask) so it appears behind previous items
    this.addChildAt(item, 2);
    this.historyItems.push(item);

    // Overlap: Negative gap
    const gap = -itemWidth * 0.15; // 15% overlap
    const shiftAmount = itemWidth + gap;

    // 1. Shift existing items Left
    for (const historyItem of this.historyItems) {
      if (historyItem === item) continue; // Skip new one for now

      historyItem.targetX -= shiftAmount;
      // Use GSAP for speed control reference
      gsap.to(historyItem, {
        x: historyItem.targetX,
        duration: 0.3,
        ease: "back.out",
      });

      // Cull items that go offscreen left
      if (historyItem.targetX < -itemWidth) {
        // cleanup if needed
        if (historyItem.targetX < -500) {
        }
      }
    }

    // 2. Position New Item
    // It enters at: Width - Padding - ItemWidth/2
    const entryX = this.background.width - padding - itemWidth / 3;

    item.targetX = entryX;

    // Initial setup for animation
    item.x = this.background.width + 100; // Start offscreen right
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
