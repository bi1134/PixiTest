import { Container, Sprite } from "pixi.js";
import { Input } from "@pixi/ui";
import { BitmapLabel } from "./BitmapLabel";

export class CustomInput extends Container {
    public input: Input;
    public bg: Sprite;
    public displayText: BitmapLabel;

    private _value: string = "";
    private _clearOnNextTouch: boolean = true;

    public get value(): string {
        return this.input.value;
    }
    public set value(v: string) {
        this.input.value = v;
        this.updateText();
    }

    public get onEnter() {
        return this.input.onEnter;
    }

    public get onChange() {
        return this.input.onChange;
    }

    public set interactive(v: boolean) {
        this.input.interactive = v;
    }

    constructor(options: {
        bg: Sprite;
        fontSize?: number;
        fontFamily?: string;
        placeholder?: string;
        align?: "left" | "center" | "right";
        textColor?: number; // Tint for bitmap label
        padding?: number;
    }) {
        super();

        this.bg = options.bg;
        this.addChild(this.bg);

        this.input = new Input({
            bg: this.bg,
            placeholder: options.placeholder,
            textStyle: {
                fill: "transparent", // Hide native text
                fontSize: options.fontSize || 30,
                fontFamily: "Arial",
                fontWeight: "bold",
            },
            align: options.align || "center",
            padding: options.padding || 0,
            cleanOnFocus: false, // Disable auto-clean to fix mobile focus issues
        });

        // Ensure input container itself doesn't have scale issues
        this.addChild(this.input);

        // 2. Create BitmapLabel for display
        this.displayText = new BitmapLabel({
            text: "",
            style: {
                fontFamily: options.fontFamily || "coccm-bitmap-3-normal",
                fontSize: options.fontSize || 30,
                align: options.align || "center",
                tint: options.textColor || 0xffffff,
            },
        });
        this.displayText.anchor.set(0.5);
        this.displayText.eventMode = "none"; // Pass clicks through to input
        this.addChild(this.displayText);

        // 3. Sync Logic
        this.input.onChange.connect(() => {
            this.updateText();
        });

        this.input.onEnter.connect(() => {
            this._clearOnNextTouch = true;
        });

        // Handle "cleanOnFocus" visual for the bitmap label
        this.input.on("pointertap", () => {
            // Manual Clear on First Touch
            if (this._clearOnNextTouch) {
                this.input.value = "";
                this.displayText.text = "RP ";
                this._clearOnNextTouch = false;
            }
        });

        // Initial sync
        this.updateText();
    }

    private updateText() {
        this.displayText.text = "RP " + this.input.value;
    }

    public resize(width: number, height: number) {
        // Resize background directly to avoid container scaling
        this.bg.width = width;
        this.bg.height = height;

        // Ensure Input container is unscaled
        this.input.scale.set(1);

        // Center Display Text
        this.displayText.x = width / 2;
        this.displayText.y = height / 2;

        // Force re-layout of input text (hidden, but affects cursor/placeholder logic if any)
        const val = this.input.value;
        this.input.value = "";
        this.input.value = val;
    }
}
