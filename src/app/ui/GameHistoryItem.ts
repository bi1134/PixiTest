import { Container } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Label } from "./Label";
import { GameRoundResult } from "../data/GameData";

export class GameHistoryItem extends Container {
  private button: FancyButton;
  private textLabel: Label;
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
    this.textLabel = new Label({
      text: `${data.multiplier}x`,
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontWeight: "bold", // "Arial" is default in Label or can be overridden
        fontFamily: "Arial",
      },
    });

    // Set dimensions if needed, or rely on asset
    this.button.width = 100;
    this.button.height = 40;

    this.addChild(this.button);
    this.addChild(this.textLabel);
  }

  public resize(width: number, height: number) {
    this.button.width = width;
    this.button.height = height;

    // Center text on the button
    // Since button anchor is 0.5, (0,0) is the center.
    this.textLabel.x = 0;
    this.textLabel.y = 0;
    this.textLabel.anchor.set(0.5);
  }
}
