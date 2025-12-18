import { Container, Sprite } from "pixi.js";
import { Input } from "@pixi/ui";
import { BitmapLabel } from "./BitmapLabel";

export class CustomInput extends Container {
    public input: Input;
    public bg: Sprite;
    public displayText: BitmapLabel;

    private _value: string = "";

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
            cleanOnFocus: true,
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

        // Handle "cleanOnFocus" visual for the bitmap label
        // Input doesn't emit 'focus' directly publicly easily, but 'pointertap' is close enough for start of editing
        this.input.on("pointertap", () => {
            // If cleanOnFocus is true, Input clears its value. We should clear our label too.
            // Input clears 'value' on focus? 
            // @pixi/ui Input cleanOnFocus clears text when focused *if* it matches placeholder? 
            // Actually `cleanOnFocus` usually clears the text if it's the default/placeholder? 
            // Let's just sync. If Input clears value, onChange should fire?
            // Usually onChange fires when text changes.

            // In MobileLayout we had specific logic:
            // this.inputBox.on('pointertap', () => { this.inputBitmapLabel.text = ""; });
            // We'll replicate that.
            this.displayText.text = "";
        });

        // Initial sync
        this.updateText();
    }

    private updateText() {
        this.displayText.text = this.input.value;
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
