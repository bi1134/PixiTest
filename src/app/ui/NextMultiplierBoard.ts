import { Container, Sprite, BitmapText } from "pixi.js";

export class NextMultiplierBoard extends Container {
    private bg: Sprite;
    private topLabel: BitmapText;
    private bottomLabel: BitmapText;

    constructor() {
        super();

        // Background
        this.bg = Sprite.from("Bar-info.png");
        this.bg.anchor.set(0.5);
        this.addChild(this.bg);

        // Top Label "Next Win"
        this.topLabel = new BitmapText({
            text: "Multiplier",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 30, // Estimated size
                align: "center",
            }
        });
        this.topLabel.anchor.set(0.5);
        this.topLabel.position.set(0, this.bg.y); // Upper half
        this.topLabel.tint = 0xd6c6c6; // Slightly dim or white
        //this.addChild(this.topLabel);

        // Bottom Label "1.5x"
        this.bottomLabel = new BitmapText({
            text: "1.5x",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 35, // Larger
                align: "center",
                fill: "#ffffffff" // Gold-ish
            }
        });
        this.bottomLabel.anchor.set(0.5);
        this.bottomLabel.position.set(0, this.bg.y); // Lower half
        this.addChild(this.bottomLabel);
    }

    public setMultiplier(value: number) {
        this.bottomLabel.text = `${value}x`;
    }
}
