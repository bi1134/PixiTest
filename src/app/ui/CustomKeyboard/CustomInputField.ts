import { BitmapText, Container, Sprite } from "pixi.js";

export class CustomInputField extends Container {
    private _value: string;

    private valueText: BitmapText;
    private bg: Sprite;

    constructor(initialValue: string) {
        super();

        this._value = initialValue;

        this.bg = Sprite.from('bet_input_value_bg.png');

        this.valueText = new BitmapText({
            text: this._value,
            anchor: 0.5,
            style: {
                fontFamily: 'coccm-bitmap-3-normal',
                fontSize: 25,
                fill: 'yellow',
                letterSpacing: -1,
            }
        });

        this.addChild(
            this.bg,
            this.valueText,
        );

        this.centerText();
    }

    public set value(val: string) {
        this._value = val;
        this.updateTextUI();
    }

    public get value() { return this._value };

    private updateTextUI() {
        this.valueText.text = this._value;

        this.centerText();
    }

    private centerText() {
        this.valueText.position.set(this.bg.width / 2, this.bg.height / 2 - 3);
    }
}
