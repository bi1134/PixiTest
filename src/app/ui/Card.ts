// src/ui/Card.ts
import { Container, Sprite } from "pixi.js";
import { Label } from "../ui/Label";

export class Card extends Container {
    private background: Sprite;
    private valueLabel: Label;

    private _value: string = "A"; // Default value

    constructor(textureName: string = "Card1.png") {
        super();

        // --- card sprite ---
        this.background = Sprite.from(textureName);
        this.addChild(this.background);

        // --- text on card ---
        this.valueLabel = new Label({
            text: this._value,
            style: {
                fill: "#ffffff",
                fontSize: 30,
                fontFamily: "Arial",
                fontWeight: "bold",
                stroke: "#000000",
                strokeThickness: 5,
                align: "center",
            },
        });
        this.addChild(this.valueLabel);

        this.centerText();
    }

    // --- randomize the card value ---
    public randomizeValue(): void {
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        this._value = ranks[Math.floor(Math.random() * ranks.length)];
        this.valueLabel.text = this._value;
        this.centerText();
    }

    // --- center the text on the sprite ---
    private centerText(): void {
        this.valueLabel.x = this.background.width / 2;
        this.valueLabel.y = this.background.height / 2;
    }

    // --- expose value if needed ---
    public get value(): string {
        return this._value;
    }
}
