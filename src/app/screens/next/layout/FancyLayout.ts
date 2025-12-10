import { FancyButton } from "@pixi/ui";
import { Container, Graphics, Sprite } from "pixi.js";
import { Label } from "../../../ui/Label";
import { Button } from "../../../ui/Button";
import { Card } from "../../../ui/Card";
import { LayoutHelper } from "../../../utils/LayoutHelper";
import { ProfitLayout } from "./ProfitLayout";
import { CardHistoryLayout } from "./CardHistoryLayout";

export class FancyLayout extends Container {
    public fancyBoxContainer!: Container;
    public fancyBox!: Graphics;
    public cardsContainer!: Container;
    public currentCard!: Card;
    public backCard!: Sprite;
    public upButton!: FancyButton;
    public downButton!: FancyButton;
    public titleHigh!: Label;
    public titleLow!: Label;
    public highDes!: Label;
    public lowDes!: Label;
    public fancySkipButton!: Button;
    public profitLayout!: ProfitLayout;
    public cardHistoryLayout!: CardHistoryLayout;

    constructor(width: number, height: number) {
        super();
        this.createLayout(width, height);
    }

    private createLayout(width: number, height: number) {
        this.fancyBoxContainer = new Container();
        this.addChild(this.fancyBoxContainer);

        this.fancyBox = new Graphics().rect(0, 0, width, height).fill("#5252daff");
        this.fancyBoxContainer.addChild(this.fancyBox);

        this.cardsContainer = new Container();
        this.fancyBoxContainer.addChild(this.cardsContainer);

        // --- create the card ---
        this.currentCard = new Card();

        this.backCard = Sprite.from("card-back.jpg");
        this.cardsContainer.addChild(this.backCard);

        // --- create the buttons ---
        this.upButton = new FancyButton({ defaultView: "high.png" });
        this.downButton = new FancyButton({ defaultView: "low.png" });

        this.cardsContainer.addChild(this.upButton, this.downButton);

        // --- labels and descriptions ---
        this.titleHigh = new Label({ text: "Hi", style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" } });
        this.titleLow = new Label({ text: "Lo", style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" } });
        this.cardsContainer.addChild(this.titleHigh, this.titleLow);

        this.highDes = new Label({ text: "Higher or equal", style: { fill: "#b2b2b2ff", fontSize: 30, fontFamily: "Arial" } });
        this.lowDes = new Label({ text: "Lower or equal", style: { fill: "#b2b2b2ff", fontSize: 30, fontFamily: "Arial" } });
        this.cardsContainer.addChild(this.highDes, this.lowDes);

        this.fancySkipButton = new Button({ text: "Skip", width: 150, height: 100 });
        this.cardsContainer.addChild(this.fancySkipButton);

        // --- Create Subcomponents ---
        this.profitLayout = new ProfitLayout();
        this.fancyBoxContainer.addChild(this.profitLayout);

        this.cardHistoryLayout = new CardHistoryLayout();
        this.fancyBoxContainer.addChild(this.cardHistoryLayout);
    }

    public resize(width: number, height: number, padding: number) {
        const fancyWidth = width;
        const fancyHeight = height;

        // fancy box background
        this.fancyBox.setSize(fancyWidth, fancyHeight);
        this.fancyBox.x = 0;
        this.fancyBox.y = 0;

        // --- main cards container ---
        LayoutHelper.centerX(this.cardsContainer, fancyWidth, 0, false);
        LayoutHelper.centerY(this.cardsContainer, fancyHeight + 150);
        this.cardsContainer.y -= 150; // intentional upward offset

        // --- main card ---
        this.currentCard.setBaseScale(3);

        this.backCard.scale.set(3);
        LayoutHelper.centerX(this.backCard, 0); // since parent is centered
        LayoutHelper.centerY(this.backCard, 0);

        // --- fancy skip button ---
        LayoutHelper.scaleToWidth(this.fancySkipButton, this.currentCard.width / 1.5 + padding, false);
        LayoutHelper.setPositionX(this.fancySkipButton, this.currentCard.x + this.currentCard.width / 2);

        LayoutHelper.scaleToWidth(this.fancySkipButton, this.backCard.width / 1.5 + padding, false);
        LayoutHelper.setPositionX(this.fancySkipButton, this.backCard.x + this.backCard.width / 2);
        LayoutHelper.placeBelow(this.fancySkipButton, this.backCard, 0, true);

        // --- up / down buttons ---
        this.upButton.scale.set(0.75);
        this.downButton.scale.set(0.75);

        const horizontalOffset = this.backCard.width / 2 + padding * 4;
        LayoutHelper.setPositionX(this.upButton, -this.upButton.width - horizontalOffset);
        LayoutHelper.setPositionX(this.downButton, horizontalOffset);
        this.upButton.y = this.downButton.y = -this.downButton.height / 2;

        // --- titles for up / down buttons ---
        LayoutHelper.setPositionX(this.titleHigh, this.upButton.x + this.upButton.width / 2);
        LayoutHelper.setPositionX(this.titleLow, this.downButton.x + this.downButton.width / 2);

        this.titleHigh.y = this.upButton.y + this.upButton.height / 2 + padding;
        this.titleLow.y = this.downButton.y + this.downButton.height / 2 - padding;

        // --- descriptions ---
        LayoutHelper.setPositionX(this.highDes, this.upButton.x + this.upButton.width / 2);
        LayoutHelper.setPositionX(this.lowDes, this.downButton.x + this.downButton.width / 2);

        this.highDes.y = this.upButton.y + this.upButton.height + padding * 2;
        this.lowDes.y = this.downButton.y - padding * 2;

        // --- Resize Subcomponents ---

        // Profit Layout
        this.profitLayout.resize(this.cardsContainer.width, this.cardsContainer.height / 5, padding);
        LayoutHelper.setPositionX(this.profitLayout, this.cardsContainer.x - this.cardsContainer.width / 2);
        this.profitLayout.y = 0; // Reset Y before relative placement
        // The original code uses cardsContainer as reference for Y
        // "this.placeBelow(this.profitContainer, this.cardsContainer, padding * 4, false);"
        // Since cardsContainer and profitLayout are siblings in fancyBoxContainer, this works.
        LayoutHelper.placeBelow(this.profitLayout, this.cardsContainer, padding * 4, false);

        // Card History Layout
        this.cardHistoryLayout.resize(this.cardsContainer.width, this.cardsContainer.height / 2, padding);
        LayoutHelper.setPositionX(this.cardHistoryLayout, this.cardsContainer.x - this.cardsContainer.width / 2);
        LayoutHelper.placeBelow(this.cardHistoryLayout, this.profitLayout, padding, true);
    }

    // --- layout helpers ---
}

