import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { Container, PerspectiveMesh, Texture, Ticker, Rectangle } from "pixi.js";
import { gsap } from "gsap";

export type CardSuit = "spade" | "heart" | "club" | "diamond";
export enum AnimationState {
    OpenIdle = "open-idle",
    Flip = "flip",
    CloseIdle = "close-idle",
}

export class Card extends Container {
    private spineCard: Spine;
    private mesh: PerspectiveMesh;

    private _rank: string = "A";
    private _suit: CardSuit = "spade";

    private ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    private suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

    private angleX = 0;
    private angleY = 0;
    private targetX = 0;
    private targetY = 0;
    private readonly maxAngle = 8;
    private readonly perspective = 400;

    private hovering = false;
    private baseWidth: number;
    private baseHeight: number;
    private baseScale = 1;

    constructor() {
        super();

        //setup spine
        this.spineCard = Spine.from(
            {
                skeleton: "card.skel",
                atlas: "card.atlas"
            }
        );

        this.spineCard.state.setAnimation(0, AnimationState.OpenIdle, true);
        this.addChild(this.spineCard);

        const texture = Texture.from("main/cards/spade-card-a.jpg");
        this.mesh = new PerspectiveMesh({
            texture,
            width: texture.width,
            height: texture.height,
        });

        this.baseWidth = texture.width;
        this.baseHeight = texture.height;

        // Center mesh visually
        this.mesh.x = -this.baseWidth / 2;
        this.mesh.y = -this.baseHeight / 2;
        this.addChild(this.mesh);

        //make the card "hitbox" bigger
        this.setHoverPadding(15);

        // make Spine visually match the mesh’s center alignment
        this.spineCard.scale.set(1);
        this.spineCard.x = 0;
        this.spineCard.y = 0;

        // ensure mesh is hidden initially
        this.mesh.visible = false;

        // initial texture update (to match default A spade)
        this.UpdateTexture();

        // --- Interactivity ---
        this.eventMode = "static";
        this.interactive = true;

        this.on("pointermove", this.onPointerMove.bind(this));
        this.on("pointerover", this.onPointerOver.bind(this));
        this.on("pointerout", this.onPointerOut.bind(this));

        this.tiltLoop(); // keep the follow system always running
    }

    // --- same API as before ---
    public RandomizeValue(): void {
        this._rank = this.ranks[Math.floor(Math.random() * this.ranks.length)];
        this._suit = this.suits[Math.floor(Math.random() * this.suits.length)];
        this.UpdateTexture();
    }

    public GetNumericValue(): number {
        return this.ranks.indexOf(this._rank);
    }

    public SetValue(rank: string, suit: CardSuit): void {
        this._rank = rank;
        this._suit = suit;
        this.UpdateTexture();
    }

    private UpdateTexture(): void {
        // build texture file name
        const textureName = `${this._suit}-card-${this._rank.toLowerCase()}.jpg`;
        this.mesh.texture = Texture.from(textureName);

        // match mesh size with texture
        this.baseWidth = this.mesh.texture.width;
        this.baseHeight = this.mesh.texture.height;
        this.mesh.x = -this.baseWidth / 2;
        this.mesh.y = -this.baseHeight / 2;

        // spine skin name convention
        // e.g. "spade-a", "heart-10", "diamond-k"
        const skinName = `${this._suit}-${this._rank.toLowerCase()}`;

        try {
            this.spineCard.skeleton.setSkinByName(skinName);
            this.spineCard.skeleton.setSlotsToSetupPose();
        } catch (e) {
            console.warn(`Spine skin '${skinName}' not found.`);
        }

        this.setHoverPadding(15); // refresh hitbox if size changed
    }

    // ========== LOGIC ==========

    private onPointerMove(e: any): void {
        const local = e.getLocalPosition(this.mesh);
        const nx = (local.x / this.baseWidth) * 2 - 1;
        const ny = (local.y / this.baseHeight) * 2 - 1;

        this.targetX = ny * this.maxAngle;
        this.targetY = -nx * this.maxAngle;
    }

    private async onPointerOver(): Promise<void> {
        if (this.hovering) return;
        this.hovering = true;

        // swap visible targets
        this.spineCard.visible = false;
        this.mesh.visible = true;

        // play hover animations
        this.playTiltSequence();
        this.playLiftSequence();
    }

    private onPointerOut(): void {
        this.hovering = false;
        this.targetX = 0;
        this.targetY = 0;
        this.resetScale();

        // swap back
        this.mesh.visible = false;
        this.spineCard.visible = true;
    }

    // ===== ANIMATION ========

    private tiltLoop(): void {
        const points = [
            { x: 0, y: 0 },
            { x: this.baseWidth, y: 0 },
            { x: this.baseWidth, y: this.baseHeight },
            { x: 0, y: this.baseHeight },
        ];
        const outPoints = points.map((p) => ({ ...p }));

        const rotate3D = (angleX: number, angleY: number) => {
            const radX = (angleX * Math.PI) / 180;
            const radY = (angleY * Math.PI) / 180;
            const cosX = Math.cos(radX);
            const sinX = Math.sin(radX);
            const cosY = Math.cos(radY);
            const sinY = Math.sin(radY);

            for (let i = 0; i < 4; i++) {
                const src = points[i];
                const out = outPoints[i];
                const x = src.x - this.baseWidth / 2;
                const y = src.y - this.baseHeight / 2;
                let z = 0;

                // Rotate Y
                const xY = cosY * x + sinY * z;
                z = -sinY * x + cosY * z;

                // Rotate X
                const yX = cosX * y - sinX * z;
                z = sinX * y + cosX * z;

                const scale = this.perspective / (this.perspective - z);
                out.x = xY * scale + this.baseWidth / 2;
                out.y = yX * scale + this.baseHeight / 2;
            }

            this.mesh.setCorners(
                outPoints[0].x, outPoints[0].y,
                outPoints[1].x, outPoints[1].y,
                outPoints[2].x, outPoints[2].y,
                outPoints[3].x, outPoints[3].y,
            );
        };


        const tiltSpeed = 0.15;
        const ticker = Ticker.shared;

        ticker.add(() => {
            this.angleX += (this.targetX - this.angleX) * tiltSpeed * 2;
            this.angleY += (this.targetY - this.angleY) * tiltSpeed * 2;
            rotate3D(this.angleX, this.angleY);
        });
    }


    //one time tilt seq
    private async playTiltSequence() {
        // tilt left -> right -> center
        // Using angle (2D rotation) as per previous implication, but correcting source to angle
        // If previous code read angleY, it might have been using it as a "close enough" 0 start? 
        // I'll animate 'angle' (2D z-rotation) for the shake effect.
        const tiltAngle = 3;
        await gsap.to(this, { angle: -tiltAngle, duration: 0.05, ease: "power1.out" });
        await gsap.to(this, { angle: tiltAngle, duration: 0.05, ease: "power1.out" });
        await gsap.to(this, { angle: 0, duration: 0.05, ease: "power1.out" });
    }

    //lift effect
    private async playLiftSequence() {
        const targetBig = this.baseScale + 0.3;
        const targetSettle = this.baseScale + 0.2;

        await gsap.to(this.scale, { x: targetBig, y: targetBig, duration: 0.1, ease: "power1.out" });
        await gsap.to(this.scale, { x: targetSettle, y: targetSettle, duration: 0.15, ease: "power1.out" });
    }

    private resetScale() {
        gsap.to(this.scale, { x: this.baseScale, y: this.baseScale, duration: 0.2, ease: "power2.out" });
        gsap.to(this, { angle: 0, duration: 0.2, ease: "power2.out" }); // Also reset angle
    }

    // ========== UTILITY ==========

    public setBaseScale(scale: number): void {
        this.baseScale = scale;
        this.scale.set(scale);
    }

    public setHoverPadding(pixels: number) {
        this.hitArea = new Rectangle(
            -this.baseWidth / 2 - pixels,
            -this.baseHeight / 2 - pixels,
            this.baseWidth + pixels * 2,
            this.baseHeight + pixels * 2
        );
    }
    public cardSize() {
        return { width: this.baseWidth, height: this.baseHeight };
    }

    // --- public getters ---
    public get rank(): string { return this._rank; }
    public get suit(): CardSuit { return this._suit; }
}
