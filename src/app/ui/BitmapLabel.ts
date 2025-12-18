import { BitmapText } from "pixi.js";

// Define strict options interface if needed, or use Partial<IBitmapTextStyle>
// PixiJS v7/v8 uses IBitmapTextStyle or similar. 
// We will allow flexible options to mimic Label

export interface BitmapLabelOptions {
    text?: string;
    style?: any; // Allow fontFamily as alias for fontName
    anchor?: number | { x: number, y: number };
}

export class BitmapLabel extends BitmapText {
    constructor(opts?: BitmapLabelOptions) {
        // Map fontFamily to fontName if provided, as BitmapText uses fontName
        const style: any = { ...opts?.style };

        if (opts?.style?.fontFamily && !style.fontName) {
            style.fontName = opts.style.fontFamily.replace('.fnt', ''); // Remove .fnt extension if present, as fontName is usually the face name
            // However, user passed "coccm-bitmap-3-normal.fnt" in MobileLayout. 
            // The .fnt file says face="coccm-bitmap-3-normal". 
            // So we should strip ".fnt".
        }

        // If fontName is still missing, default to the known bitmap font?
        // Let's rely on passed options.

        super({
            text: opts?.text ?? "",
            style: style,
        });

        if (opts?.anchor !== undefined) {
            this.anchor.set(typeof opts.anchor === 'number' ? opts.anchor : opts.anchor.x); // BitmapText anchor is usually set via anchor.set()
            // Note: In some Pixi versions BitmapText anchor setter might differ. 
            // But usually it has an anchor property which is an ObservablePoint.
        } else {
            this.anchor.set(0.5); // Default to center like Label
        }
    }
}
