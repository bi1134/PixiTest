// src/ui/Card.ts
import { Container, Sprite } from "pixi.js";
import { Label } from "../ui/Label";

export type CardSuit = "spade" | "heart" | "club" | "diamond";
export class Card extends Container {
    private background: Sprite;

    private _rank: string = "A"; // Default rank
    private _suit: CardSuit = "spade"; // Default suit

    private ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    private suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

    constructor() {
        super();

        // --- default texture ---
        this.background = Sprite.from("main/cards/spade-card-a.jpg");
        this.addChild(this.background);
    }

    // --- randomize the card value ---
    public RandomizeValue(): void {
        this._rank = this.ranks[Math.floor(Math.random() * this.ranks.length)];
        this._suit = this.suits[Math.floor(Math.random() * this.suits.length)];

        this.UpdateTexture();
    }

    // --- get the card's numeric value based on its rank ---
    // Returns 0 for "A", 1 for "2", ..., 10 for "10", 11 for "J", 12 for "Q", 13 for "K"
    public GetNumericValue(): number {
        return this.ranks.indexOf(this._rank);
    }

    /** Manually set card (useful when game logic picks a specific card) */
    public SetValue(rank: string, suit: CardSuit): void {
        this._rank = rank;
        this._suit = suit;
        this.UpdateTexture();
    }

    /** Update displayed texture to match rank + suit */
    private UpdateTexture(): void {
        const textureName = `${this._suit}-card-${this._rank.toLowerCase()}.jpg`;
        this.background.texture = Sprite.from(textureName).texture;
    }

    // Expose rank and suit if needed
    public get rank(): string {
        return this._rank;
    }

    public get suit(): CardSuit {
        return this._suit;
    }
}
