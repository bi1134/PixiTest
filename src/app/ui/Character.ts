import { Container, BitmapText, Texture, NineSliceSprite } from "pixi.js";
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
    private comboInfoLabel: BitmapText;
    private comboPredictionLabel: BitmapText;
    private comboCurrentLabel: BitmapText;
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
        // Normal Dialog Bubble (NineSliceSprite now)
        this.dialogBubble = new NineSliceSprite({
            texture: Texture.from("Dialog.png"),
            leftWidth: 45,
            topHeight: 45,
            rightWidth: 45,
            bottomHeight: 45
        });
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

        // --- Combo UI Elements --
        // 1. Info Label ("x more High to receive")
        this.comboInfoLabel = new BitmapText({
            text: "",
            style: {
                fontFamily: "SVN-Supercell Magic",
                fontSize: 17,
                align: "left",
                fill: "#327ac4", // White for Supercell
                wordWrap: true,
                wordWrapWidth: 300
            }
        });
        this.comboInfoLabel.anchor.set(0.5, 0.5);
        this.comboInfoLabel.position.set(50, -80); // Top
        this.dialogContainer.addChild(this.comboInfoLabel);

        // 2. Prediction Label ("15.5x") - Prominent
        this.comboPredictionLabel = new BitmapText({
            text: "",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 19, // Larger
                align: "center",
                fill: "#fbca3f", // Yellow
            }
        });
        this.comboPredictionLabel.anchor.set(0.5, 0.5);
        this.comboPredictionLabel.position.set(0, -60); // Middle
        this.dialogContainer.addChild(this.comboPredictionLabel);

        // 3. Current Label ("Current: 1.2x")
        this.comboCurrentLabel = new BitmapText({
            text: "",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 30,
                align: "center",
                fill: "#fbca3f", //yellow
            }
        });
        this.comboCurrentLabel.anchor.set(0.5, 0.5);
        this.comboCurrentLabel.position.set(0, -25); // Bottom
        this.dialogContainer.addChild(this.comboCurrentLabel);

        // Hide initially
        this.comboInfoLabel.visible = false;
        this.comboPredictionLabel.visible = false;
        this.comboCurrentLabel.visible = false;

        // Position Dialog Container
        const padding = 10;
        this.dialogContainer.x = this.character.x - this.character.width;
        this.dialogContainer.y = this.character.y - this.character.height / 2 + padding * 2;

        // Initial Dialog
        this.say("Press Bet \n to Start");
    }

    public say(mainText: string, type: 'normal' | 'combo' = 'normal', subText: string = "", extraText: string = "") {
        gsap.killTweensOf(this.dialogContainer);
        gsap.killTweensOf(this.dialogContainer.scale);

        if (!mainText) {
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

        const normalTexture = Texture.from("Dialog.png");
        const comboTexture = Texture.from("Dialog_1.png");

        if (type === 'combo') {
            this.dialogBubble.texture = comboTexture;

            // Match size of normal dialog and flip
            // Assuming we want the visual width to match normal width
            const scaleX = (normalTexture.width / comboTexture.width) * -1 / 3.55;
            const scaleY = (normalTexture.height / comboTexture.height);

            this.dialogBubble.scale.set(scaleX, scaleY);

            // Show Combo Labels, Hide Normal Text
            this.comboInfoLabel.visible = true;
            this.comboPredictionLabel.visible = true;
            this.comboCurrentLabel.visible = true;
            this.dialogText.visible = false;

            this.comboInfoLabel.text = mainText; // "x more High to receive"
            this.comboPredictionLabel.text = subText; // "15x"
            this.comboCurrentLabel.text = extraText; // "Current: 1.0x"

            // Layout Logic: Align Info and Prediction on same line
            const spacing = 5;
            const yPos = -85; // Middle-ish

            // Ensure text is updated before measuring
            // this.comboInfoLabel.updateText(true);
            // this.comboPredictionLabel.updateText(true);

            const w1 = this.comboInfoLabel.width;
            const w2 = this.comboPredictionLabel.width;
            const totalW = w1 + w2 + spacing;

            // Start X to center the group
            const startX = -totalW / 2 - 5;

            // Set positions
            // Left Item Center = StartX + (w1 / 2)
            this.comboInfoLabel.position.set(startX + (w1 / 2), yPos);

            // Right Item Center = StartX + w1 + spacing + (w2 / 2)
            this.comboPredictionLabel.position.set(startX + w1 + spacing + (w2 / 2), yPos - 2);

            // Current Label stays at bottom
            this.comboCurrentLabel.position.set(0, -35);

        } else {
            this.dialogBubble.texture = normalTexture;
            this.dialogBubble.scale.set(1, 1);

            // Show Normal Text, Hide Combo Labels
            this.comboInfoLabel.visible = false;
            this.comboPredictionLabel.visible = false;
            this.comboCurrentLabel.visible = false;
            this.dialogText.visible = true;

            this.dialogText.text = mainText;
        }

        // --- Normal Dialog Logic ---
        this.dialogContainer.visible = true;

        if (type !== 'combo') {
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
        }

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
