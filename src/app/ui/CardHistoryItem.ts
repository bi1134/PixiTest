import { Container, Graphics, Sprite } from "pixi.js";
import { Label } from "../ui/Label";
import { GuessAction } from "../screens/next/types/GameTypes";

export class CardHistoryItem extends Container {
    private cardSprite!: Sprite;
    private actionSprite!: Sprite;
    private multiplierTextLabel!: Label;
    private multiplierBackground!: Graphics;

    private _rank!: string;
    private _suit!: string;
    private _action!: GuessAction;

    public targetX: number = 0; // The true "logical" X position, ignoring animation

    constructor(rank: string, suit: string, action: GuessAction) {
        super();
        this.Setup(rank, suit, action);
    }

    private Setup(rank: string, suit: string, action: GuessAction) {
        // Clear previous if reusing (though we might just update textures)
        this.removeChildren();

        this._rank = rank;
        this._suit = suit;
        this._action = action;

        // --- card sprite ---
        const textureName = `${this._suit}-card-${this._rank.toLowerCase()}.jpg`;
        this.cardSprite = Sprite.from(`${textureName}`);
        this.addChild(this.cardSprite);

        // --- action sprite ---
        const actionTexture = this.ActionToIcon(this._action);
        this.actionSprite = Sprite.from(actionTexture);
        this.addChild(this.actionSprite);

        // --- multiplier background (below card) ---
        this.multiplierBackground = new Graphics()
            .rect(0, 0, this.cardSprite.width, 25)
            .fill("#653838ff");
        this.addChild(this.multiplierBackground);

        this.multiplierTextLabel = new Label({
            text: "x1.5",
            style: {
                fill: "#ffffff",
                fontSize: 18,
                fontWeight: "bold",
                align: "center",
            },
        });
        this.addChild(this.multiplierTextLabel);
    }

    //guess enum to icon texture name
    private ActionToIcon(action: GuessAction): string {
        switch (action) {
            case GuessAction.Higher: return "higher-icon.jpg";
            case GuessAction.Lower: return "lower-icon.jpg";
            case GuessAction.Skip: return "skip-icon.jpg";
            case GuessAction.Start: return "transparent.png";
            default: return "blank-icon.jpg"; // fallback (optional)
        }
    }

    /** Resize this item so it fits the history background height minus padding */
    public ResizeToFit(maxHeight: number, padding: number) {
        // --- Layout internal parts relative to this item’s origin ---
        this.multiplierBackground.width = this.cardSprite.width;
        this.multiplierBackground.height = this.cardSprite.height * 0.2;
        this.multiplierBackground.x = this.cardSprite.width / 2 - this.multiplierBackground.width / 2;
        this.multiplierBackground.y = this.cardSprite.height + padding;

        this.actionSprite.x = this.cardSprite.x - this.actionSprite.width / 1.33;
        this.actionSprite.y = this.cardSprite.height / 2 - this.actionSprite.height / 2;

        this.multiplierTextLabel.x = this.multiplierBackground.x + this.multiplierTextLabel.width / 2 + padding / 2;
        this.multiplierTextLabel.y = this.multiplierBackground.y + this.multiplierBackground.height / 2;

        // --- Scale whole thing to fit background height ---
        const totalHeight = this.cardSprite.height + this.multiplierBackground.height + padding * 2;
        const scale = (maxHeight - padding) / totalHeight;
        this.scale.set(scale);
    }

    // --- expose scaled width & height ---
    public get widthScaled(): number {
        return this.cardSprite.width * this.cardSprite.scale.x;
    }

    public get heightScaled(): number {
        return this.cardSprite.height * this.cardSprite.scale.y + this.multiplierBackground.height;
    }

    // --- clean up resources ---
    public override destroy(options?: { children?: boolean; texture?: boolean; baseTexture?: boolean }) {
        // explicitly destroy all children (to ensure Label and Graphics are cleaned up)
        this.cardSprite?.destroy();
        this.actionSprite?.destroy();
        this.multiplierBackground?.destroy();
        this.multiplierTextLabel?.destroy();

        // null references so GC can clean up CPU memory
        this.cardSprite = null!;
        this.actionSprite = null!;
        this.multiplierBackground = null!;
        this.multiplierTextLabel = null!;

        // finally call the parent destroy
        super.destroy(options);
    }
}
