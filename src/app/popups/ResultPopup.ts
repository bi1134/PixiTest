import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture, Graphics } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

/** Popup that shows up when gameplay is paused */
export class ResultPopup extends Container {

    /** Container for the popup UI components */
    private panel: Container;
    /** The popup title label */
    private title: Label;
    /** The panel background */
    private panelBase: RoundedBox;

    private resultLabel: Label;
    private resultBackground: Sprite | Graphics;

    constructor() {
        super();

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ height: 300 });
        this.panel.addChild(this.panelBase);

        this.title = new Label({
            text: "1.25x",
            style: { fill: 0xec1561, fontSize: 50, fontFamily: "Arial" },
        });
        this.title.y = -80;
        this.panel.addChild(this.title);

        // --- result background (placeholder, can be replaced with sprite later) ---
        this.resultBackground = new Graphics()
            .roundRect(0, 0, 400, 80, 20)
            .fill(0x222222);
        this.resultBackground.y = -this.resultBackground.height / 2;
        this.panel.addChild(this.resultBackground);

        // --- result label ---
        this.resultLabel = new Label({
            text: "0.13", // placeholder
            style: { fill: 0xffffff, fontSize: 40, fontFamily: "Arial", align: "center" },
        });
        this.resultLabel.anchor.set(0.5);
        this.resultLabel.x = this.resultBackground.width / 2;
        this.resultLabel.y = this.resultBackground.height / 2;
        this.panel.addChild(this.resultLabel);

    }

    public setResult(multiplier: number, baseAmount: number) {
        const total = baseAmount * multiplier;
        this.title.text = `${multiplier.toFixed(2)}x`;
        this.resultLabel.text = total.toFixed(2);
    }

    /** Resize the popup, fired whenever window size changes */
    public resize(width: number, height: number) {
        // --- Center the panel ---
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;

        const padding = 40;

        // --- Resize main panel background ---
        const panelWidth = width / 4;
        this.panelBase.width = panelWidth;

        const panelHeight = this.panelBase.height;
        const labelHeight = (panelHeight * 2) / 3;
        const resultHeight = (panelHeight * 1) / 3;

        // Optionally scale text to fit section (if you want dynamic font size)
        this.title.scale.set((labelHeight - padding * 2) / this.title.height);

        // --- Multiplier label (top section) ---
        this.title.x = 0;
        this.title.y = this.panelBase.y - this.title.height / 2;

        // --- Result background (bottom section) ---
        const resultWidth = panelWidth - padding * 2;
        this.resultBackground.width = resultWidth;
        this.resultBackground.height = resultHeight;
        this.resultBackground.x = -resultWidth / 2;
        this.resultBackground.y = this.title.y + this.title.height - padding;

        // --- Result label centered on result background ---
        this.resultLabel.x = this.resultBackground.x + this.resultBackground.width / 2;
        this.resultLabel.y = this.resultBackground.y + this.resultBackground.height / 2;
    }

    public async show() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [
                new BlurFilter({ strength: 5 }),
            ];
        }

        this.panel.scale.set(0.5);
        this.panel.alpha = 0;

        // Animate both alpha and scale at the same time
        await Promise.all([
            animate(this.panel, { alpha: 1 }, { duration: 0.3, ease: "linear" }),
            animate(this.panel.scale, { x: 1, y: 1 }, { duration: 0.3, ease: "backOut" }),
        ]);

        //wait 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Hide the popup
        await engine().navigation.dismissPopup();
    }

    /** Dismiss the popup, animated */
    public async hide() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [];
        }

        // shrink & fade out together
        await Promise.all([
            animate(this.panel, { alpha: 0 }, { duration: 0.4, ease: "linear" }),
            animate(this.panel.scale, { x: 0.5, y: 0.5 }, { duration: 0.4, ease: "circIn" }),
        ]);
    }

}
