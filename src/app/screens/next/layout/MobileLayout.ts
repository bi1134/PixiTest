import { FancyButton, Input } from "@pixi/ui";
import { Container, Graphics, setPositions, Sprite } from "pixi.js";
import { Label } from "../../../ui/Label";
import { Button } from "../../../ui/Button";
import { Card } from "../../../ui/Card";
import { LayoutHelper } from "../../../utils/LayoutHelper";
import { ProfitLayout } from "./ProfitLayout";
import { CardHistoryLayout } from "./CardHistoryLayout";

export class MobileLayout extends Container {
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
    public fancySkipButton!: FancyButton;
    public profitLayout!: ProfitLayout;
    public cardHistoryLayout!: CardHistoryLayout;

    // Mobile specific additions (from Sidebar)
    public inputContainer!: Container;
    public inputContainerBg!: Graphics;
    public moneyLabel!: Label;
    public inputBox!: Input;
    public betButton!: FancyButton;

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

        this.highDes = new Label({ text: "Higher or equal", style: { fill: "#b2b2b2ff", fontSize: 15, fontFamily: "Arial" } });
        this.lowDes = new Label({ text: "Lower or equal", style: { fill: "#b2b2b2ff", fontSize: 15, fontFamily: "Arial" } });
        this.cardsContainer.addChild(this.highDes, this.lowDes);

        // This is the "Skip" button in fancy, but user also wants "Bet/Cash Out".
        this.fancySkipButton = new Button({ text: "Skip", width: 150, height: 70 });
        this.cardsContainer.addChild(this.fancySkipButton);

        // Bet Button (from Sidebar)
        this.betButton = new Button({ text: "Bet", width: 150, height: 100 });
        this.fancyBoxContainer.addChild(this.betButton); // We'll position this dynamically

        // --- Create Subcomponents ---
        this.profitLayout = new ProfitLayout();
        this.fancyBoxContainer.addChild(this.profitLayout);

        // --- Input Container (History Box) ---
        this.inputContainer = new Container();
        this.fancyBoxContainer.addChild(this.inputContainer);

        this.inputContainerBg = new Graphics(); // Size set in resize
        this.inputContainer.addChild(this.inputContainerBg);

        this.cardHistoryLayout = new CardHistoryLayout();
        // Add to inputContainer instead of fancyBoxContainer
        this.inputContainer.addChild(this.cardHistoryLayout);

        // --- Mobile Specifics: Money Label & Input ---
        this.moneyLabel = new Label({
            text: "Balance: $1000", // Example text, updated by logic
            style: { fill: "gold", fontSize: 25, fontFamily: "Arial", fontWeight: "bold" }
        });
        this.inputContainer.addChild(this.moneyLabel); // Add to input container

        const inputBg = Sprite.from("input.png"); // Reusing input asset
        this.inputBox = new Input({
            bg: inputBg,
            placeholder: "0.02",
            padding: 11,
            textStyle: { fill: 'white' },
            cleanOnFocus: true
        });
        this.inputBox.value = "0.02";
        this.inputContainer.addChild(this.inputBox); // Add to input container
    }

    public resize(width: number, height: number, padding: number) {
        this.fancyBox.setSize(width, height);

        // Stack Order:
        // Top: Profit Layout (Fixed Header)
        // Middle: Cards + Buttons (Flexible)
        // Middle: History + Input (Flexible)
        // Bottom: Bet Button (Fixed Footer)

        // --- 1. Profit Layout (Top Header) ---
        const profitWidth = width * 0.95;
        const profitHeight = 100;
        this.profitLayout.resize(profitWidth, profitHeight, 10);
        this.profitLayout.x = (width - profitWidth) / 2;
        this.profitLayout.y = 0 + padding * 2;

        // --- Footer Buttons (Skip & Bet) ---

        // Sizing: Share width
        const footerBtnWidth = (width - padding * 3) / 2;


        // Bet Button (Right)
        if (this.betButton.width !== footerBtnWidth) LayoutHelper.scaleToWidth(this.betButton, footerBtnWidth, true);

        this.betButton.x = width - footerBtnWidth - padding;
        const footerY = height - this.betButton.height / 2 - padding * 2;
        this.betButton.y = footerY;


        // Skip Button (Left)
        if (this.fancySkipButton.width !== footerBtnWidth) LayoutHelper.scaleToWidth(this.fancySkipButton, footerBtnWidth, false);
        this.fancySkipButton.x = padding;
        this.fancySkipButton.y = footerY;

        // --- Available Space (Main Game Area) ---
        // Back Card
        LayoutHelper.centerX(this.backCard, width);

        this.backCard.scale.set(3);
        this.currentCard.setBaseScale(3);
        this.backCard.y = (this.backCard.height * this.backCard.scale.y) / 2 - padding * 25;

        this.currentCard.x = this.backCard.x + this.backCard.width / 2;
        this.currentCard.y = this.backCard.y + this.backCard.height / 2;

        // Hi/Lo Buttons
        this.upButton.scale.set(0.6);
        this.downButton.scale.set(0.6);

        const btnY = this.backCard.y + (this.backCard.height * this.backCard.scale.y) / 2 - padding * 10;
        this.upButton.y = btnY;
        this.downButton.y = btnY;

        this.upButton.x = width / 2 - this.upButton.width - padding;
        this.downButton.x = width / 2 + padding;

        this.highDes.x = this.upButton.x + this.upButton.width / 2;
        this.lowDes.x = this.downButton.x + this.downButton.width / 2;

        this.highDes.y = this.upButton.y;
        this.lowDes.y = this.downButton.y;

        // Titles
        LayoutHelper.setPositionX(this.titleHigh, this.upButton.x + this.upButton.width / 2);
        this.titleHigh.y = this.upButton.y + this.upButton.height / 2 + this.titleHigh.height / 4;

        LayoutHelper.setPositionX(this.titleLow, this.downButton.x + this.downButton.width / 2);
        this.titleLow.y = this.downButton.y + this.downButton.height / 2 + this.titleLow.height / 4;

        // --- Input Container (History Box) ---

        const historyStartY = this.upButton.y + this.upButton.height + padding * 2;
        const containerW = width * 0.9;
        const innerWidth = containerW;

        // --- 1. Money Label ---
        // Calculate position relative to container (0,0)
        let currentY = padding * 2; // Top padding

        LayoutHelper.setPositionX(this.moneyLabel, innerWidth / 2);
        this.moneyLabel.y = currentY;

        currentY += this.moneyLabel.height + padding; // Spacing after label

        // --- 2. Input Box ---
        const inputW = innerWidth * 0.95;
        LayoutHelper.scaleToWidth(this.inputBox, inputW, false);
        this.inputBox.height = 125;
        this.inputBox.x = (innerWidth - inputW) / 2;
        this.inputBox.y = currentY;

        currentY += this.inputBox.height + padding; // Spacing after input

        // --- 3. History List ---
        const historyHeight = this.inputBox.height * 1.5;

        this.cardHistoryLayout.resize(innerWidth * 0.95, historyHeight);
        this.cardHistoryLayout.x = (innerWidth - innerWidth * 0.95) / 2;
        this.cardHistoryLayout.y = currentY;

        currentY += historyHeight + padding; // Spacing after history (Bottom padding)

        // --- 4. Background ---
        // Resize background to fit the total calculated content height
        this.inputContainerBg.clear()
            .rect(0, 0, containerW, currentY)
            .fill({ color: 0x000000, alpha: 0.3 });

        // Position the whole container
        this.inputContainer.x = (width - containerW) / 2;
        this.inputContainer.y = historyStartY;

        // Ensure visibility
        this.moneyLabel.visible = true;
        this.inputBox.visible = true;
        this.cardHistoryLayout.visible = true;

    }
}
