import { Switcher } from "@pixi/ui";
import { BitmapText, Container } from "pixi.js";

export type CustomSettingsOptions = {
    views?: Array<Container | string>;
    type: CustomSwitcherType;
};

export enum CustomSwitcherType {
    HISTORY = 'HISTORY',
    SOUND = 'SOUND',
    HELP = 'BANTUAN'
}

export class CustomSettingSwitcher extends Switcher {

    constructor(opts: CustomSettingsOptions) {
        super(opts.views);

        // Wait until the textures are loaded, or you can do this right after super() if sizes are static
        this.pivot.set(this.width / 2, this.height / 2);

        // Optional: make it start visually centered at (0,0)
        this.position.set(this.width / 2, this.height / 2);

    }


}