import { FancyButton, Input } from "@pixi/ui";
import { Container, Graphics, setPositions, Sprite } from "pixi.js";
import { Label } from "../../../ui/Label";
import { Button } from "../../../ui/Button";
import { Card } from "../../../ui/Card";
import { LayoutHelper } from "../../../utils/LayoutHelper";
import { ProfitLayout } from "./ProfitLayout";
import { CardHistoryLayout } from "./CardHistoryLayout";
import { GameHistoryContainer } from "../../../ui/GameHistoryContainer";
import { SettingsUI } from "../../../ui/SettingsUI";
import { SpeedButton } from "../../../ui/SpeedButton";


export class MobileLayout extends Container {
  public fancyBoxContainer!: Container;
  public fancyBox!: Graphics;
  public cardsContainer!: Container;
  public currentCard!: Card;
  public backCard!: Sprite;
  public cardPlaceHolder!: Sprite;
  public upButton!: FancyButton;
  public downButton!: FancyButton;
  public titleHigh!: Label;
  public titleLow!: Label;
  public highDes!: Label;
  public lowDes!: Label;
  public fancySkipButton!: FancyButton;
  public profitLayout!: ProfitLayout;
  public cardHistoryLayout!: CardHistoryLayout;
  public gameHistory!: GameHistoryContainer;

  // Mobile specific additions (from Sidebar)
  public inputContainer!: Container;
  public inputContainerBg!: Graphics;
  public moneyLabel!: Label;
  public inputBox!: Input;
  public inputBgSprite!: Sprite; // Promoted from local variable
  public inputDefaultValue: number = 0.02;
  public betButton!: FancyButton;

  public halfValueButton: FancyButton;
  public doubleValueButton: FancyButton;

  public settingsUI!: SettingsUI;
  public speedButton!: SpeedButton;

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

    this.cardPlaceHolder = Sprite.from("opened-card-area.png");
    this.cardsContainer.addChild(this.cardPlaceHolder);

    // --- create the buttons ---
    this.upButton = new FancyButton({ defaultView: "high.png" });
    this.downButton = new FancyButton({ defaultView: "low.png" });

    this.cardsContainer.addChild(this.upButton, this.downButton);

    // --- labels and descriptions ---
    this.titleHigh = new Label({
      text: "Hi",
      style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" },
    });
    this.titleLow = new Label({
      text: "Lo",
      style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" },
    });
    this.cardsContainer.addChild(this.titleHigh, this.titleLow);

    this.highDes = new Label({
      text: "Higher or equal",
      style: { fill: "#b2b2b2ff", fontSize: 15, fontFamily: "Arial" },
    });
    this.lowDes = new Label({
      text: "Lower or equal",
      style: { fill: "#b2b2b2ff", fontSize: 15, fontFamily: "Arial" },
    });
    this.cardsContainer.addChild(this.highDes, this.lowDes);

    // This is the "Skip" button in fancy, but user also wants "Bet/Cash Out".
    this.fancySkipButton = new Button({ text: "Skip", width: 150, height: 70 });
    this.cardsContainer.addChild(this.fancySkipButton);

    // Bet Button (from Sidebar)
    this.betButton = new Button({ text: "Bet", width: 150, height: 75 });
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
      style: {
        fill: "gold",
        fontSize: 25,
        fontFamily: "Arial",
        fontWeight: "bold",
      },
    });
    this.inputContainer.addChild(this.moneyLabel); // Add to input container

    this.inputBgSprite = Sprite.from("input.png"); // Reusing input asset
    this.inputBox = new Input({
      bg: this.inputBgSprite,
      placeholder: this.inputDefaultValue.toString(),
      textStyle: { fill: "white", fontSize: 75, fontFamily: "Arial", fontWeight: "bold" },
      cleanOnFocus: true,
      align: "center",
    });
    this.inputBox.value = this.inputDefaultValue;
    this.inputContainer.addChild(this.inputBox); // Add to input container

    this.halfValueButton = new FancyButton({
      defaultView: "icon-settings.png",
      text: "x1/2",
      style: { fontFamily: "Arial", fontWeight: "bold", align: "center" },
    });
    this.inputContainer.addChild(this.halfValueButton);

    this.doubleValueButton = new FancyButton({
      defaultView: "icon-settings.png",
      text: "x2",
      style: { fontFamily: "Arial", fontWeight: "bold", align: "center" },
    });
    this.inputContainer.addChild(this.doubleValueButton);

    this.gameHistory = new GameHistoryContainer(width, 70);
    this.fancyBoxContainer.addChild(this.gameHistory);

    // Settings UI
    this.settingsUI = new SettingsUI();
    this.fancyBoxContainer.addChild(this.settingsUI);

    // Speed Button
    this.speedButton = new SpeedButton({
      defaultView: "rounded-rectangle.png",
    });
    this.fancyBoxContainer.addChild(this.speedButton);

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
    if (this.betButton.width !== footerBtnWidth)
      LayoutHelper.scaleToWidth(this.betButton, footerBtnWidth, true);

    this.betButton.x = width - footerBtnWidth - padding;
    const footerY = height - this.betButton.height / 2 - padding * 6;
    this.betButton.y = footerY;

    // Skip Button (Left)
    if (this.fancySkipButton.width !== footerBtnWidth)
      LayoutHelper.scaleToWidth(this.fancySkipButton, footerBtnWidth, false);
    this.fancySkipButton.x = this.betButton.x;
    this.fancySkipButton.y = footerY - this.betButton.height / 1.5;

    // --- Available Space (Main Game Area) ---
    // Back Card
    LayoutHelper.setPositionX(
      this.backCard,
      (width - this.backCard.width) / 2 + padding * 13,
    );
    LayoutHelper.setPositionX(
      this.cardPlaceHolder,
      (width - this.cardPlaceHolder.width) / 2 - padding * 13,
    );

    const cardScale = 3.5;

    this.backCard.scale.set(cardScale);
    this.cardPlaceHolder.scale.set(cardScale);
    this.currentCard.setBaseScale(cardScale);
    this.backCard.y =
      (this.backCard.height * this.backCard.scale.y) / 2 - padding * 25;
    this.cardPlaceHolder.y = this.backCard.y;

    this.currentCard.x = this.backCard.x + this.backCard.width / 2;
    this.currentCard.y = this.backCard.y + this.backCard.height / 2;

    // Hi/Lo Buttons

    const buttonScale = 1;

    this.upButton.scale.set(buttonScale);
    this.downButton.scale.set(buttonScale);

    const btnY =
      this.backCard.y +
      (this.backCard.height * this.backCard.scale.y) / 2 -
      padding * 15;
    this.upButton.y = btnY;
    this.downButton.y = btnY;

    this.upButton.x =
      this.cardPlaceHolder.x +
      this.cardPlaceHolder.width / 2 -
      this.upButton.width / 2;
    this.downButton.x =
      this.backCard.x + this.backCard.width / 2 - this.downButton.width / 2;

    this.highDes.x = this.upButton.x + this.upButton.width / 2;
    this.lowDes.x = this.downButton.x + this.downButton.width / 2;

    this.highDes.y = this.upButton.y;
    this.lowDes.y = this.downButton.y;

    // Titles
    LayoutHelper.setPositionX(
      this.titleHigh,
      this.upButton.x + this.upButton.width / 2,
    );
    this.titleHigh.y =
      this.upButton.y + this.upButton.height / 2 + this.titleHigh.height / 4;

    LayoutHelper.setPositionX(
      this.titleLow,
      this.downButton.x + this.downButton.width / 2,
    );
    this.titleLow.y =
      this.downButton.y + this.downButton.height / 2 + this.titleLow.height / 4;

    // --- Input Container (History Box) ---

    const historyStartY = this.upButton.y + this.upButton.height + padding * 2;
    const containerW = width * 0.9;
    const innerWidth = containerW;

    // --- 1. History List ---
    let currentY = padding * 2; // Top padding
    const inputBoxHeight = 155;
    const historyHeight = inputBoxHeight * 1.5;

    this.cardHistoryLayout.resize(innerWidth * 0.95, historyHeight);
    this.cardHistoryLayout.x = (innerWidth - innerWidth * 0.95) / 2;
    this.cardHistoryLayout.y = currentY;

    currentY += historyHeight + padding; // Spacing after history

    // --- 2. Input Box ---
    const inputW = innerWidth * 0.95;

    // Resize background directly to avoid scaling the container (which stretches text)
    this.inputBgSprite.width = inputW;
    this.inputBgSprite.height = inputBoxHeight;
    this.inputBox.scale.set(1); // Ensure scale is 1

    // We might need to tell Input about the size if it doesn't auto-detect from bg
    // But usually it respects BG size for visuals. 
    // Force update layout by re-setting value
    const val = this.inputBox.value;
    this.inputBox.value = "";
    this.inputBox.value = val;

    this.inputBox.x = (innerWidth - inputW) / 2;
    this.inputBox.y = currentY;

    //half button
    LayoutHelper.scaleToHeight(this.halfValueButton, this.inputBox.height);

    LayoutHelper.setPositionX(this.halfValueButton, this.inputBox.x);
    this.halfValueButton.y =
      this.inputBox.y +
      this.inputBox.height / 2 -
      this.halfValueButton.height / 2;

    //double button
    LayoutHelper.scaleToHeight(this.doubleValueButton, this.inputBox.height);
    LayoutHelper.setPositionX(
      this.doubleValueButton,
      this.inputBox.x + this.inputBox.width - this.doubleValueButton.width,
    );
    LayoutHelper.setPositionY(this.doubleValueButton, this.halfValueButton.y);

    currentY += this.inputBox.height + padding; // Spacing after input

    // --- 3. Money Label ---
    // Calculate position relative to container (0,0)

    LayoutHelper.setPositionX(this.moneyLabel, innerWidth / 2);
    this.moneyLabel.y = currentY + padding;

    currentY += this.moneyLabel.height + padding; // Spacing after label (Bottom padding)

    // --- 4. Background ---
    // Resize background to fit the total calculated content height
    this.inputContainerBg
      .clear()
      .rect(0, 0, containerW, currentY)
      .fill({ color: 0x000000, alpha: 0.3 });

    // Position the whole container
    this.inputContainer.x = (width - containerW) / 2;
    this.inputContainer.y = historyStartY;

    // Ensure visibility
    this.moneyLabel.visible = true;
    this.inputBox.visible = true;
    this.cardHistoryLayout.visible = true;

    this.gameHistory.y = height - this.gameHistory.height;
    this.gameHistory.x = 0;

    // Resize history container properly to avoid scaling distortion
    this.gameHistory.resize(width, 70);

    // --- Settings UI & Speed Button ---
    // Settings UI
    LayoutHelper.scaleToHeight(this.settingsUI, this.betButton.height);
    LayoutHelper.setPositionX(this.settingsUI, width - this.settingsUI.width); // Align right with padding
    LayoutHelper.setPositionY(
      this.settingsUI,
      this.betButton.y - this.settingsUI.height / 2
    );

    // Speed Button
    this.speedButton.width = this.settingsUI.width * 0.75;
    this.speedButton.height = this.settingsUI.height * 0.75;
    LayoutHelper.setPositionX(
      this.speedButton,
      this.betButton.x - this.speedButton.width * 2,
    );
    LayoutHelper.setPositionY(
      this.speedButton,
      this.settingsUI.y + this.settingsUI.height / 2,
    );
  }
}
