import { ButtonOptions, FancyButton } from "@pixi/ui";
import { BitmapText, Text, TextStyleOptions } from "pixi.js";

export type CustomButtonOptions = {
    text?: string;
    fontSize?: number;
    offsetY?: number;
    lineHeight?: number;
    fontFamily?: string;
    rotation?: number;
    textColor?: number;
    style?: TextStyleOptions; // Support for rich text styling
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
    protected customText: BitmapText | Text;

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

        if (opts?.style) {
            // Use standard Text for rich styling
            this.customText = new Text({
                text: opts.text ?? "",
                style: opts.style,
            });
            // If Text, we assume color is handled in style (fill), but fallback to tint if provided?
            // Usually tinting Text works, but it tints the whole texture (including stroke/shadow).
            // Users usually want 'fill'. If opts.textColor is provided, maybe apply it?
            // But opts.style probably contains fill.
            if (opts.textColor !== undefined && !opts.style.fill) {
                this.customText.style.fill = opts.textColor;
            }
        } else {
            // Legacy BitmapText
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
            this.customText.tint = opts?.textColor ?? 0x4a4a4a;
        }

        // Handle anchor separately
        this.customText.anchor.set(0.5);

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