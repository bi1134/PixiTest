import { Container, Graphics } from "pixi.js";
import { Label } from "../../ui/Label";

export class ProfitItem extends Container {
    private background: Graphics;
    private title: Label;
    private value: Label;

    private padding = 10;

    constructor(titleText: string, initialValue: string = "0.00") {
        super();

        // --- background ---
        this.background = new Graphics()
            .rect(0, 0, 250, 50)
            .fill("#5c5c5cff");
        this.addChild(this.background);

        // --- title ---
        this.title = new Label({
            text: titleText,
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
                align: "left",
            },
        });
        this.addChild(this.title);

        // --- value ---
        this.value = new Label({
            text: initialValue,
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
            },
        });
        this.addChild(this.value);

        this.layout();
    }

    private layout() {
        // position the title above the background
        this.title.x = this.background.x + this.title.width / 2;
        this.title.y = this.background.y - this.title.height / 2;

        // position the value inside the background 
        this.value.x = this.background.x + this.value.width / 2 + this.padding / 2;
        this.value.y = this.background.y + this.background.height / 2;
    }

    /** Resize width dynamically */
    public resize(width: number) {
        this.background.width = width;
        this.layout();
    }

    /** Change displayed value */
    public setValue(value: string | number) {
        this.value.text = value.toString();
    }

    /** Change title text */
    public setTitle(text: string) {
        this.title.text = text;
    }

    /** Get the background height (so parent can use it for layout) */
    public getHeight(): number {
        return this.background.height + this.title.height + this.padding;
    }
}
