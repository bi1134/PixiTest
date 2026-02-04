import { Container } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { BitmapLabel } from "./BitmapLabel";
import { GameRoundResult } from "../data/GameData";

export class GameHistoryItem extends Container {
  private button: FancyButton;
  private textLabel: BitmapLabel;
  public targetX: number = 0; // For animation reference

  constructor(data: GameRoundResult) {
    super();

    // 1. Create the button (visual background)
    const bgTexture =
      data.multiplier > 0 ? "UI-bg-chart-lv-5.png" : "UI-bg-chart-lv-4.png";

    this.button = new FancyButton({
      defaultView: bgTexture,
      anchor: 0.5,
    });
    this.textLabel = new BitmapLabel({
      text: `x${data.multiplier}`,
      style: { fill: "#e9e9e9ff", fontSize: 20, fontFamily: "coccm-bitmap-3-normal", letterSpacing: -2 },
    });

    // Default dimensions, will be resized immediately by container
    this.button.width = 100;
    this.button.height = 40;

    this.addChild(this.button);
    this.addChild(this.textLabel);
  }

  public resize(width: number, height: number) {
    this.button.width = width;
    this.button.height = height;

    // Align text to the left
    this.textLabel.anchor.set(0, 0.5);
    // Button anchor is 0.5, so left edge is -width/2
    const padding = 10;
    this.textLabel.x = -width / 2 + padding * 3;
    this.textLabel.y = 0;
  }
}
