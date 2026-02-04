import { Container, Sprite, BitmapText } from "pixi.js";
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
    private dialogBubble: Sprite;
    private character?: Spine;
    private dialogText: BitmapText;
    private dialogContainer: Container;

    constructor() {
        super();

        // Initialize containers first
        this.dialogContainer = new Container();

        // Assets are preloaded in NextScreen.ts
        // Create the Spine instance synchronously
        this.character = Spine.from({
            skeleton: "/spine-assets/hilo-character.skel",
            atlas: "/spine-assets/hilo-character.atlas",
        });

        this.addChild(this.character);
        this.addChild(this.dialogContainer); // Ensure dialog is on top

        // Log available animations for debugging
        if (this.character.skeleton && this.character.skeleton.data && this.character.skeleton.data.animations) {
            console.log("Character Animations:", this.character.skeleton.data.animations.map(a => a.name));
        }
        console.log("AnimationState Enum:", AnimationState);

        this.character.state.setAnimation(0, AnimationState.Idle, true);

        // Transform Settings
        this.character.x = 0;
        this.character.y = 0;
        this.character.scale.x = -1;

        // NineSlice Chat Bubble
        // Normal Dialog Bubble (Sprite)
        this.dialogBubble = Sprite.from("Dialog.png");
        this.dialogBubble.anchor.set(0.5, 1); // Bottom center
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
                fill: "#fbca3f",
                lineHeight: 40
            }
        });
        this.dialogText.anchor.set(0.5, 0.5);
        // Text is centered in the bubble
        // Bubble anchor is (0.5, 1), so (0, -height/2) is center
        this.dialogContainer.addChild(this.dialogText);

        // Position Dialog Container
        const padding = 10;
        this.dialogContainer.x = this.character.x - this.character.width;
        this.dialogContainer.y = this.character.y - this.character.height / 2 + padding * 2;

        // Initial Dialog
        this.say("Press Bet \n to Start");
    }

    public say(text: string, type: 'normal' | 'combo' = 'normal') {
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

        if (type === 'combo') {
            // TODO: Implement combo dialog logic
            return;
        }

        // --- Normal Dialog Logic ---
        this.dialogContainer.visible = true;

        // Reset scale before measurement
        this.dialogText.scale.set(1);

        // Use bubble size to constrain text
        // Ensure we have valid dimensions (fallback if texture not ready)
        const bubbleW = this.dialogBubble.width > 2 ? this.dialogBubble.width : 250;
        const bubbleH = this.dialogBubble.height > 2 ? this.dialogBubble.height : 150;

        // Set wrapping to fit within bubble width with padding
        const paddingX = 40;
        const maxTextW = bubbleW - paddingX;
        this.dialogText.style.wordWrapWidth = maxTextW;

        this.dialogText.text = text;

        // Scale down if text exceeds bounds (height or width)
        const bounds = this.dialogText.getLocalBounds();
        const maxTextH = bubbleH * 0.65; // ~65% of height to avoid tail/edges

        let scale = 1;
        if (bounds.width > maxTextW) {
            scale = maxTextW / bounds.width;
        }
        if (bounds.height > maxTextH) {
            const hScale = maxTextH / bounds.height;
            if (hScale < scale) scale = hScale;
        }
        this.dialogText.scale.set(scale);

        // Center text in bubble visual center
        // Bubble anchor (0.5, 1) -> (0,0) is bottom-center
        // Visual center is roughly mid-height above tail
        this.dialogText.position.set(0, -bubbleH / 2);

        // Animate In
        this.dialogContainer.scale.set(0);
        gsap.to(this.dialogContainer.scale, {
            x: 1.1,
            y: 1.1,
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
                animName = AnimationState.Laugh;
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
