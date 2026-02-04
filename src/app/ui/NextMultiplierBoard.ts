import { Container, Sprite, BitmapText } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";

export enum UIInfoAnimationState {
    Idle = "idle",
    action = "action"
}

export class NextMultiplierBoard extends Container {
    private bg: Sprite;
    private topLabel: BitmapText;
    private bottomLabel: BitmapText;
    private infoSpine?: Spine;

    constructor() {
        super();

        this.sortableChildren = true;

        // Background
        this.bg = Sprite.from("Bar-info.png");
        this.bg.anchor.set(0.5);
        this.bg.zIndex = 0;
        this.addChild(this.bg);

        import("pixi.js").then(({ Assets }) => {
            Assets.load([
                "/spine-assets/UI_Info.skel",
                "/spine-assets/UI_Info.atlas"
            ]).then(() => {
                // Once loaded, create the Spine instance
                this.infoSpine = Spine.from({
                    skeleton: "/spine-assets/UI_Info.skel",
                    atlas: "/spine-assets/UI_Info.atlas",
                });

                // Log available animations for debugging
                console.log("UI Info Animations:", this.infoSpine.skeleton.data.animations.map(a => a.name));

                this.infoSpine.state.setAnimation(0, UIInfoAnimationState.Idle, true);
                this.infoSpine.zIndex = 1;
                this.addChild(this.infoSpine);

                // Position
                this.infoSpine.x = 0; // Relative to this container
                this.infoSpine.y = 0;
            });
        });

        // Top Label "Next Win"
        this.topLabel = new BitmapText({
            text: "Multiplier",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 30, // Estimated size
                align: "center",
            }
        });
        this.topLabel.anchor.set(0.5);
        this.topLabel.position.set(0, this.bg.y); // Upper half
        this.topLabel.tint = 0xd6c6c6; // Slightly dim or white
        this.topLabel.zIndex = 2;
        //this.addChild(this.topLabel);

        // Bottom Label "1.5x"
        this.bottomLabel = new BitmapText({
            text: "1.5x",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 35, // Larger
                align: "center",
                fill: "#ffffffff" // Gold-ish
            }
        });
        this.bottomLabel.anchor.set(0.5);
        this.bottomLabel.position.set(0, this.bg.y); // Lower half
        this.bottomLabel.zIndex = 2;
        this.addChild(this.bottomLabel);
    }

    public setMultiplier(value: number) {
        // Deprecated or fallback
        this.updateValues(value, 0);
    }

    public updateValues(multiplier: number, currentBet: number) {
        const totalWin = multiplier * currentBet;

        let displayString = `${multiplier}x`;
        if (totalWin > 0) {
            const formatted = totalWin.toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
            // Display: "Rp 1,000"
            // If we want multiplier too: "Rp 1,000 (1.5x)"
            // User asked "like in BetButton", which is just Money usually.
            // But this is "NextMultiplierBoard".
            // Let's explicitly format it as Money.
            displayString = `Rp ${formatted}`; // Capitalize RP? BetButton uses "RP". NextScreen "Rp".
        }

        this.bottomLabel.text = displayString;

        if (this.infoSpine) {
            this.infoSpine.state.setAnimation(0, UIInfoAnimationState.action, false);
            this.infoSpine.state.addAnimation(0, UIInfoAnimationState.Idle, true, 0);
        }
    }

    /**
     * Override getLocalBounds to return only the background bounds.
     * This prevents the spine animation from affecting the container's layout size.
     */
    public override getLocalBounds(): import("pixi.js").Bounds {
        return this.bg.getLocalBounds();
    }
}
