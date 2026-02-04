import { ButtonOptions, FancyButton } from "@pixi/ui";
import { BitmapText } from "pixi.js";

export type CustomButtonOptions = {
    text?: string;
    fontSize?: number;
    offsetY?: number;
    lineHeight?: number;
    fontFamily?: string;
    rotation?: number;
    textColor?: number;
}

export const buttonAnimation = {
    hover: {
        props: {
            scale: {
                x: 1.01,
                y: 1.01,
            }
        },
        duration: 100,
    },
    pressed: {
        props: {
            scale: {
                x: 0.98,
                y: 0.98,
            }
        },
        duration: 100,
    }
}

export class CustomButton extends FancyButton {
    protected customText: BitmapText;

    public get CustomText() {
        return this.customText.text;
    }

    public get text(): string {
        return this.customText?.text ?? "";
    }
    public set text(value: string | number) {
        if (this.customText) {
            this.customText.text = value.toString();
        }
    }

    constructor(opts?: CustomButtonOptions, options: ButtonOptions = {}) {
        options.animations = buttonAnimation;
        options.anchor = 0.5;

        super(options);

        this.customText = new BitmapText({
            text: opts?.text,
            style: {
                fontFamily: opts?.fontFamily ?? 'coccm-bitmap-3-normal.fnt',
                fontSize: opts?.fontSize ?? 23,
                align: 'center',
                lineHeight: opts?.lineHeight,
                letterSpacing: -2,
            }
        });

        // Handle tint and anchor separately
        this.customText.anchor.set(0.5);
        this.customText.tint = opts?.textColor ?? 0x4a4a4a;

        if (opts?.offsetY) {
            this.customText.y -= opts.offsetY;
        }

        if (opts?.rotation) {
            this.customText.rotation = opts.rotation;
        }

        this.addChild(this.customText);
    }

    public removeAnimation() {
        this.animations = {};
    }

    public addAnimation() {
        this.animations = buttonAnimation;

    }
}