import { Container, NineSliceSprite, BitmapText, Texture } from "pixi.js";
import { gsap } from "gsap";
import { Spine } from "@esotericsoftware/spine-pixi-v8";

export enum AnimationState {
    Idle = "idle",
    Laugh = "laugh",
    Lose = "lose",
    Skip = "skip",
    Win = "win",
}

export class Character extends Container {
    private dialogBubble: NineSliceSprite;
    private character?: Spine;
    private dialogText: BitmapText;
    private dialogContainer: Container;

    constructor() {
        super();

        import("pixi.js").then(({ Assets }) => {
            Assets.load([
                "/spine-assets/hilo-character.skel",
                "/spine-assets/hilo-character.atlas"
            ]).then(() => {
                // Once loaded, create the Spine instance
                this.character = Spine.from({
                    skeleton: "/spine-assets/hilo-character.skel",
                    atlas: "/spine-assets/hilo-character.atlas",
                });

                // Log available animations for debugging
                console.log("Character Animations:", this.character.skeleton.data.animations.map(a => a.name));
                console.log("AnimationState Enum:", AnimationState);

                this.character.state.setAnimation(0, AnimationState.Idle, true);
                this.addChild(this.character);

                // Ensure dialog is visually on top of the character
                this.addChild(this.dialogContainer);

                // Re-apply visibility/transform settings
                this.character.x = 0;
                this.character.y = 0;
                this.character.scale.x = -1;

                const padding = 10;
                this.dialogContainer.x = this.character.x - this.character.width;
                this.dialogContainer.y = this.character.y - this.character.height / 2;
                this.say("Press Bet to Start");

            });
        });
        this.dialogContainer = new Container();
        this.addChild(this.dialogContainer);

        // NineSlice Chat Bubble
        this.dialogBubble = new NineSliceSprite({
            texture: Texture.from("Dialog_1.png"),
            leftWidth: 40,
            topHeight: 45,
            rightWidth: 20,
            bottomHeight: 50,
        });
        this.dialogBubble.anchor.set(0.5, 1); // Bottom center anchor for bubble growing upwards
        this.dialogBubble.scale.x = -1; // Flip horizontally
        this.dialogContainer.addChild(this.dialogBubble);

        // Label for text
        this.dialogText = new BitmapText({
            text: "",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 30,
                align: "center",
                wordWrap: true, // Need word wrap for chat bubble
                wordWrapWidth: 800,
                fill: "#fbca3f"
            }
        });
        this.dialogText.anchor.set(0.5, 0.5);
        // Text is centered in the bubble
        // Bubble anchor is (0.5, 1), so (0, -height/2) is center
        this.dialogContainer.addChild(this.dialogText);

        this.dialogContainer.addChild(this.dialogText);
    }

    public say(text: string) {
        gsap.killTweensOf(this.dialogContainer);
        gsap.killTweensOf(this.dialogContainer.scale);

        if (!text) {
            gsap.to(this.dialogContainer.scale, {
                x: 0.75,
                y: 0.75,
                duration: 0.4,
                ease: "back.in",
                onComplete: () => {
                    this.dialogContainer.visible = false;
                }
            });
            return;
        }

        this.dialogContainer.visible = true;

        // Calculate target width based on character
        let charWidth = 100; // Default fallback
        if (this.character) {
            // Use stable skeleton data width to avoid size jumping during animations
            charWidth = this.character.skeleton.data.width;
        }
        const bubbleW = charWidth * 1.25;
        const paddingH = 50;

        // Update text style to wrap within bubble
        this.dialogText.style.wordWrap = true;
        this.dialogText.style.wordWrapWidth = bubbleW - 30; // internal padding
        this.dialogText.text = text;

        // Measure text height after wrapping
        const bounds = this.dialogText.getLocalBounds();
        const paddingV = 45;

        // Resize bubble
        const bubbleH = Math.max(80, bounds.height + paddingV);

        this.dialogBubble.width = bubbleW;
        this.dialogBubble.height = bubbleH;

        // Re-center text in bubble
        // Bubble visual center is (0, -bubbleH/2) since it grows up from (0,0)
        this.dialogText.position.set(0, -bubbleH / 2);

        // Animate In
        this.dialogContainer.scale.set(0);
        gsap.to(this.dialogContainer.scale, {
            x: 1,
            y: 1,
            duration: 0.2,
            ease: "back.out(1.7)",
        });
    }
    public playState(state: 'win' | 'lose' | 'skip') {
        if (!this.character) return;

        let animName = AnimationState.Idle;

        switch (state) {
            case 'win':
                animName = AnimationState.Win;
                break;
            case 'lose':
                animName = AnimationState.Lose;
                break;
            case 'skip':
                animName = AnimationState.Skip; // Assuming you have a Skip animation, or maybe use flip? user said "skip then skip state"
                break;
        }

        // Play specific animation once, then queue idle loop
        this.character.state.setAnimation(0, animName, false);
        this.character.state.addAnimation(0, AnimationState.Idle, true, 0);
    }
}
