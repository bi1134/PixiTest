import { BitmapText, Container, Sprite } from "pixi.js";

export enum NumberType {
    MAX = 10,
    ZERO = 11,
    DELETE = 12
}

export class CustomNumber extends Container {
    private bg: Sprite;
    private _value: number;
    private text: BitmapText;

    constructor(value: number) {
        super();

        this._value = value;

        if (this._value === NumberType.MAX)
            this.bg = Sprite.from('max_input.png');
        else if (this._value === NumberType.DELETE)
            this.bg = Sprite.from('delete_input.png');
        else
            this.bg = Sprite.from('bg_number_input.png');

        this.text = new BitmapText({
            text: `${this._value}`,
            anchor: 0.5,
            style: {
                fontFamily: 'coccm-bitmap-3-normal', // Fixed font name for PixiTest if different? using same for now
                fontSize: 24
            }
        });

        this.addChild(this.bg, this.text);

        // Change sprite depend on specific value
        if (this._value === NumberType.MAX) {
            this.text.text = 'MAX';
        }
        else if (this._value === NumberType.ZERO) {
            this.text.text = '0';
            this._value = 0;
        }
        else if (this._value === NumberType.DELETE) {
            this.text.text = '';

            const icon_delete = Sprite.from('icon_delete_input.png');
            icon_delete.anchor = .5;
            icon_delete.position.set(this.bg.width / 2, this.bg.height / 2);
            this.addChild(icon_delete);
        }

        this.text.position.set(this.bg.width / 2, this.bg.height / 2 - 3);
    }

    public get value(): number { return this._value };
}
