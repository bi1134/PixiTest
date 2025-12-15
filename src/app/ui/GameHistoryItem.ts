import { Container } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Label } from "./Label";
import { GameRoundResult } from "../data/GameData";

export class GameHistoryItem extends Container {
    private button: FancyButton;
    private label: Label;
    public targetX: number = 0; // For animation reference


    constructor(data: GameRoundResult) {
        super();

        // 1. Create the button (visual background)
        // Using "select.png" or similar as placeholder, or a colored rect if assets unavailable.
        // Assuming we want distinct looks for win/loss.
        // For now, let's use a generic generic button style, colored by code if possible or just standard.
        // Since user mentioned "fancy button", we use that.

        this.button = new FancyButton({
            defaultView: "rounded-rectangle.png", // specific asset or placeholder
            anchor: 0.5,
        });
        this.label = new Label({
            text: `${data.multiplier}x`,
            style: {
                fill: 0xffffff,
                fontSize: 20,
                fontWeight: "bold",
            }
        });


        // Tint based on result
        if (data.isWin) {
            this.button.defaultView.tint = 0x00ff00; // Green for win
        } else {
            this.button.defaultView.tint = 0xff0000; // Red for loss
        }

        // Set dimensions if needed, or rely on asset
        this.button.width = 80;
        this.button.height = 40;

        this.addChild(this.button);

        this.label.x = this.button.x;
        this.label.y = this.button.y;
        this.addChild(this.label);
    }
}
