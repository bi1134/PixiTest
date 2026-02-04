import { Container, Sprite, BitmapText } from "pixi.js";
import { Label } from "../../ui/Label";
import { LayoutHelper } from "../../utils/LayoutHelper";

export type PredictionType = 'higher' | 'lower';

export class PredictionContainer extends Container {
    private _type: PredictionType;
    private logo: Sprite;
    private background: Sprite;
    private multiplierText: BitmapText;
    private labelText: Label;


    constructor(type: PredictionType) {
        super();
        this._type = type;

        this.background = Sprite.from("Tray-ProfitPart.png");
        this.background.scale.set(4);
        this.addChild(this.background);


        this.labelText = new Label({
            text: type === 'higher' ? "Higher" : "Lower",
            style: {
                fontFamily: "SVN-Supercell Magic", // Consistent font
                fontSize: 20,
                align: "center",
                fill: "#ebb33d",
                letterSpacing: -2,
            }
        });
        this.labelText.anchor.set(0.5);
        this.background.addChild(this.labelText);


        // 3. Logo Sprite
        const iconName = "Icon-Arrow-0.png";
        this.logo = Sprite.from(iconName);
        this.logo.anchor.set(0.5);

        if (type === 'lower') {
            this.logo.scale.y = -1;
        }
        this.background.addChild(this.logo);

        // 4. Multiplier Text
        this.multiplierText = new BitmapText({
            text: "01.25x",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 23,
                align: "center",
                fill: "#fbdb52"
            }
        });
        this.multiplierText.anchor.set(0, 0.5); // Anchor Left Center
        this.background.addChild(this.multiplierText);

        // Layout
        const spacing = 20;

        this.labelText.x = this.background.x + this.labelText.width / 2 + spacing;
        this.labelText.y = this.background.height / 8;

        LayoutHelper.scaleToHeight(this.logo, this.labelText.height * 1.25, true);
        if (type === 'lower') {
            this.logo.scale.y *= -1;
        }
        this.logo.x = this.labelText.x + this.labelText.width / 2 + spacing * 0.75;
        this.logo.y = this.labelText.y;

        this.multiplierText.x = this.background.x + this.background.width / 4 - this.multiplierText.width - spacing / 2;
        this.multiplierText.y = this.background.height / 8;
    }

    public setMultiplier(value: number) {
        // Format: 00.00x
        this.multiplierText.text = `${value.toFixed(2)}x`;
    }

    public get Type() { return this._type; }
}
