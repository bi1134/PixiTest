import { FancyButton } from "@pixi/ui";
import { Container, Graphics, Sprite } from "pixi.js";
import { BitmapLabel } from "../../../ui/BitmapLabel";
import { Card } from "../../../ui/Card";
import { LayoutHelper } from "../../../utils/LayoutHelper";
import { ProfitLayout } from "./ProfitLayout";
import { CardHistoryLayout } from "./CardHistoryLayout";
import { GameHistoryContainer } from "../../../ui/GameHistoryContainer";
import { SettingsUI } from "../../../ui/SettingsUI";
import { SpeedButton } from "../../../ui/SpeedButton";
import { BetButton } from "../../../ui/BetButton";
import { CustomButton } from "../../../ui/CustomButton";
import { CustomInput } from "../../../ui/CustomInput";
import { NextMultiplierBoard } from "../../../ui/NextMultiplierBoard";
import { KnightCharacter } from "../../../ui/KnightCharacter";


export class MobileLayout extends Container {
  public fancyBoxContainer!: Container;
  public fancyBox!: Graphics;
  public cardsContainer!: Container;
  public currentCard!: Card;
  public backCard!: Sprite;
  public cardPlaceHolder!: Sprite;
  public upButton!: FancyButton;
  public downButton!: FancyButton;
  public titleHigh!: BitmapLabel;
  public titleLow!: BitmapLabel;
  public highDes!: BitmapLabel;
  public lowDes!: BitmapLabel;
  public fancySkipButton!: CustomButton;
  public profitLayout!: ProfitLayout;
  public cardHistoryLayout!: CardHistoryLayout;
  public gameHistory!: GameHistoryContainer;

  // Mobile specific additions (from Sidebar)
  public inputContainer!: Container;
  public moneyLabel!: BitmapLabel;
  public inputBox!: CustomInput;
  public inputDefaultValue: number = 0.02;
  public betButton!: BetButton;

  public halfValueButton!: CustomButton;
  public doubleValueButton!: CustomButton;

  public settingsUI!: SettingsUI;
  public speedButton!: SpeedButton;
  public background!: Sprite;

  public BarMid!: Sprite;

  public multiplierBoard: NextMultiplierBoard;
  public knightCharacter: KnightCharacter;

  public coinIcon!: Sprite;
  public highIcon!: Sprite;
  public lowIcon!: Sprite;

  constructor(width: number, height: number) {
    super();
    this.createLayout(width, height);
  }

  private createLayout(width: number, height: number) {
    this.fancyBoxContainer = new Container();
    this.addChild(this.fancyBoxContainer);

    this.background = Sprite.from("BG.png");
    this.background.anchor.set(0.5);
    this.fancyBoxContainer.addChild(this.background);
    // this.fancyBox = new Graphics().rect(0, 0, width, height).fill("#5252daff");
    // this.fancyBoxContainer.addChild(this.fancyBox);
    this.multiplierBoard = new NextMultiplierBoard();
    this.fancyBoxContainer.addChild(this.multiplierBoard);

    this.cardsContainer = new Container();
    this.fancyBoxContainer.addChild(this.cardsContainer);

    // --- create the card ---
    this.currentCard = new Card();

    this.backCard = Sprite.from("card-back.png");
    this.cardsContainer.addChild(this.backCard);

    this.cardPlaceHolder = Sprite.from("opened-card-area.png");
    //this.cardsContainer.addChild(this.cardPlaceHolder);

    // --- create the buttons ---
    this.upButton = new FancyButton({ defaultView: "Button-high.png" });
    this.downButton = new FancyButton({ defaultView: "Button-low.png" });

    this.cardsContainer.addChild(this.upButton, this.downButton);

    // --- labels and descriptions ---
    this.titleHigh = new BitmapLabel({
      text: "Hi",
      style: { tint: 0xb2b2b2, fontSize: 40, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.titleLow = new BitmapLabel({
      text: "Lo",
      style: { tint: 0xb2b2b2, fontSize: 40, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.cardsContainer.addChild(this.titleHigh, this.titleLow);

    this.highDes = new BitmapLabel({
      text: "Higher or equal",
      style: { fill: "#d3c7c7ff", fontSize: 23, fontFamily: "coccm-bitmap-3-normal", },
    });
    this.lowDes = new BitmapLabel({
      text: "Lower or equal",
      style: { fill: "#c9bfbfff", fontSize: 23, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.cardsContainer.addChild(this.highDes, this.lowDes);

    // This is the "Skip" button in fancy, but user also wants "Bet/Cash Out".
    this.fancySkipButton = new CustomButton({
      text: "Skip",
      fontSize: 28,
      fontFamily: "coccm-bitmap-3-normal",
      textColor: 0x4a4a4a
    }, {
      defaultView: "Button-2-0.png",
    });
    this.cardsContainer.addChild(this.fancySkipButton);

    this.BarMid = Sprite.from("Bar-mid.png");
    this.fancyBoxContainer.addChild(this.BarMid);

    // --- icons for title ---
    this.highIcon = Sprite.from("Icon-Arrow-high.png");
    this.lowIcon = Sprite.from("Icon-Arrow-low.png");
    this.cardsContainer.addChild(this.highIcon, this.lowIcon);

    // --- Mobile Specifics: Money Label & Input ---
    this.coinIcon = Sprite.from("Icon-coin.png");
    this.BarMid.addChild(this.coinIcon);

    this.moneyLabel = new BitmapLabel({
      text: "$1000", // Example text, updated by logic
      style: {
        fill: "#f7c049", // Gold
        fontSize: 25,
        fontFamily: "coccm-bitmap-3-normal",
      },
    });
    this.BarMid.addChild(this.moneyLabel); // Add to input container

    // Bet Button (from Sidebar)
    this.betButton = new BetButton();
    this.fancyBoxContainer.addChild(this.betButton); // We'll position this dynamically

    // --- Create Subcomponents ---
    this.profitLayout = new ProfitLayout();
    this.fancyBoxContainer.addChild(this.profitLayout);

    this.knightCharacter = new KnightCharacter();
    this.fancyBoxContainer.addChild(this.knightCharacter);



    // --- Input Container (History Box) ---
    this.inputContainer = new Container();
    this.fancyBoxContainer.addChild(this.inputContainer);


    this.cardHistoryLayout = new CardHistoryLayout({
      type: 'horizontal',
      direction: 'ltr'
    });
    // Add to inputContainer instead of fancyBoxContainer
    this.cardsContainer.addChild(this.cardHistoryLayout);


    this.inputBox = new CustomInput({
      bg: Sprite.from("Bet_volume.png"),
      placeholder: this.inputDefaultValue.toString(),
      fontSize: 55,
      fontFamily: "coccm-bitmap-3-normal",
      align: "center",
      textColor: 0xFFFFFF,
      padding: 0
    });
    this.inputBox.value = this.inputDefaultValue.toString(); // value is string accessor
    this.inputContainer.addChild(this.inputBox); // Add to input container

    // Handle validation on blur (onEnter fires when input loses focus)
    this.inputBox.onEnter.connect((val: string) => {
      const num = parseFloat(val);

      if (val === "" || isNaN(num)) {
        // Reset to default if empty or invalid
        const defaultVal = this.inputDefaultValue.toString();
        this.inputBox.value = defaultVal;
      } else {
        // Optional: Format number (e.g. 0.20)
        // this.inputBox.value = num.toString();
      }
    });

    this.halfValueButton = new CustomButton({
      text: "1/2",
      fontSize: 42,
      fontFamily: "coccm-bitmap-3-normal",
      textColor: 0x4a4a4a
    }, {
      defaultView: "Button-2-1.png",
    });
    this.inputContainer.addChild(this.halfValueButton);

    this.doubleValueButton = new CustomButton({
      text: "x2",
      fontSize: 42,
      fontFamily: "coccm-bitmap-3-normal",
      textColor: 0x4a4a4a
    }, {
      defaultView: "Button-2-2.png",
    });
    this.inputContainer.addChild(this.doubleValueButton);

    this.gameHistory = new GameHistoryContainer(width, 70);
    this.fancyBoxContainer.addChild(this.gameHistory);

    // Settings UI
    this.settingsUI = new SettingsUI();
    this.fancyBoxContainer.addChild(this.settingsUI);

    // Speed Button
    this.speedButton = new SpeedButton();
    this.fancyBoxContainer.addChild(this.speedButton);
  }

  public resize(width: number, height: number, padding: number) {
    // Resize background to cover
    if (this.background) {
      this.background.x = width / 2;
      this.background.y = height / 2;

      const scaleX = width / this.background.width;
      const scaleY = height / this.background.height;
      const scale = Math.max(scaleX, scaleY);
      this.background.width = width;
      this.background.height = height;
    }
    this.multiplierBoard.scale.set(0.75);
    this.multiplierBoard.x = width / 2;
    this.multiplierBoard.y = padding * 15.5;

    // --- 1. Profit Layout (Top Header) ---
    const profitWidth = width * 0.95;
    const profitHeight = 100;
    this.profitLayout.resize(profitWidth, profitHeight, 10);
    this.profitLayout.x = (width - profitWidth) / 2;
    this.profitLayout.y = 0 + padding * 2;

    // --- Footer Buttons (Skip & Bet) ---

    // Sizing: Share width
    const footerBtnWidth = (width - padding * 15) / 2;

    // Bet Button (Right)
    if (this.betButton.width !== footerBtnWidth)
      LayoutHelper.scaleToWidth(this.betButton, footerBtnWidth, true);

    this.betButton.x = width / 2;
    const footerY = height - this.betButton.height / 2 - padding * 15;
    this.betButton.y = footerY;

    LayoutHelper.scaleToWidth(this.BarMid, this.betButton.width - padding * 1.5, true);
    this.BarMid.x = this.betButton.x - this.BarMid.width / 2;
    this.BarMid.y = this.betButton.y + (this.betButton.height - this.BarMid.height) / 2;
    // --- Available Space (Main Game Area) ---
    // Back Card
    LayoutHelper.setPositionX(
      this.backCard,
      (width - this.backCard.width) / 2 - padding * 10,
    );
    LayoutHelper.setPositionX(
      this.cardPlaceHolder,
      (width - this.cardPlaceHolder.width) / 2 - padding * 13,
    );

    const cardScale = 1.35;

    this.backCard.scale.set(0.75);
    this.cardPlaceHolder.scale.set(cardScale);
    this.currentCard.setBaseScale(cardScale);
    this.backCard.y =
      (this.backCard.height * this.backCard.scale.y) / 2 + padding * 15;
    this.cardPlaceHolder.y = this.backCard.y;

    this.currentCard.x = this.backCard.x + this.backCard.width / 2 - padding;
    this.currentCard.y = this.backCard.y + this.backCard.height / 2 - padding;

    // Skip Button (Left)
    LayoutHelper.scaleToWidth(this.fancySkipButton, this.currentCard.width / 2, false);
    this.fancySkipButton.x = this.currentCard.x;
    this.fancySkipButton.y = this.currentCard.y + this.currentCard.height / 2;
    // Ensure skip button is always on top
    this.cardsContainer.addChild(this.fancySkipButton);

    // Hi/Lo Buttons

    const buttonScale = 0.75;

    this.upButton.scale.set(buttonScale);
    this.downButton.scale.set(buttonScale);

    const btnY =
      this.backCard.y + this.backCard.height / 2 - this.upButton.height / 2;
    this.upButton.y = btnY - this.upButton.height / 2 - padding;
    this.downButton.y = btnY + this.downButton.height / 2 + padding;

    const btnX =
      this.backCard.x + (this.backCard.width + this.upButton.width) / 2 + padding * 5;

    this.upButton.x = btnX;
    this.downButton.x = btnX;

    this.highDes.x = this.upButton.x + this.upButton.width / 2;
    this.lowDes.x = this.downButton.x + this.downButton.width / 2;

    this.highDes.y = this.upButton.y + this.upButton.height - padding * 1.5;
    this.lowDes.y = this.downButton.y + padding * 1.5;

    // Titles
    LayoutHelper.setPositionX(
      this.titleHigh,
      this.upButton.x + this.upButton.width / 2,
    );
    this.titleHigh.y =
      this.upButton.y + this.upButton.height / 2 + this.titleHigh.height / 2;

    // High Icon
    this.highIcon.scale.set(1); // Adjust scale if needed
    this.highIcon.anchor.set(1, 0.5);
    this.highIcon.x = this.titleHigh.x - this.titleHigh.width / 2;
    this.highIcon.y = this.titleHigh.y - this.titleHigh.height / 2 + this.highDes.height / 2;


    LayoutHelper.setPositionX(
      this.titleLow,
      this.downButton.x + this.downButton.width / 2,
    );
    this.titleLow.y =
      this.downButton.y + this.downButton.height / 2;

    // Low Icon
    this.lowIcon.scale.set(1);
    this.lowIcon.anchor.set(1, 0.5);
    this.lowIcon.x = this.titleLow.x - this.titleLow.width / 2;
    this.lowIcon.y = this.titleLow.y;


    // --- Input Container (History Box) ---

    const containerW = width * 0.9;
    const innerWidth = containerW;

    // --- 1. History List ---
    const inputBoxHeight = 155;

    this.cardHistoryLayout.resize(width - padding * 18, this.currentCard.height * 0.5);
    this.cardHistoryLayout.x = this.currentCard.x - this.cardHistoryLayout.width / 2 + padding * 4;
    this.cardHistoryLayout.y = this.backCard.y + this.backCard.height + padding * 3;
    this.cardHistoryLayout.pushBackPadding = 40;

    // --- 2. Input Box ---
    const inputW = innerWidth * 0.55;

    // Resize CustomInput
    this.inputBox.resize(inputW, inputBoxHeight);

    this.inputBox.x = (innerWidth - inputW) / 2;

    //half button
    LayoutHelper.scaleToHeight(this.halfValueButton, this.inputBox.height);

    LayoutHelper.setPositionX(this.halfValueButton, this.inputBox.x + this.halfValueButton.width / 2);
    this.halfValueButton.y =
      this.inputBox.y +
      this.inputBox.height / 2;

    //double button
    LayoutHelper.scaleToHeight(this.doubleValueButton, this.inputBox.height);
    LayoutHelper.setPositionX(
      this.doubleValueButton,
      this.inputBox.x + this.inputBox.width - this.doubleValueButton.width / 2,
    );
    LayoutHelper.setPositionY(this.doubleValueButton, this.halfValueButton.y);



    // --- 3. Money Label & Icon ---
    // Calculate position relative to container (0,0)
    // Group them: Icon - Gap - Label
    const gap = 10;
    const totalW = this.coinIcon.width + this.moneyLabel.width;

    this.coinIcon.anchor.set(0, 0.5);
    this.coinIcon.y = this.BarMid.height / 2 + this.coinIcon.height - padding / 3;

    // Start X to center the group
    const startX = (this.BarMid.width - totalW) / 2;
    this.coinIcon.x = startX;

    this.moneyLabel.anchor.set(0, 0.5);
    this.moneyLabel.x = this.coinIcon.x + this.coinIcon.width + gap;
    this.moneyLabel.y = this.coinIcon.y; // Match Y since anchor is 0.5

    // --- 4. Background ---
    // Resize background to fit the total calculated content height
    this.moneyLabel.visible = true;
    this.inputBox.visible = true;
    this.cardHistoryLayout.visible = true;

    this.gameHistory.y = height - this.gameHistory.height - 200;
    this.gameHistory.x = 0;

    // Resize history container properly to avoid scaling distortion
    this.gameHistory.resize(width, 70);

    // Position the whole container
    const historyStartY = this.betButton.y - this.betButton.height - this.inputContainer.height / 2;

    this.inputContainer.x = (width - containerW) / 2;
    this.inputContainer.y = historyStartY;

    this.knightCharacter.scale.set(0.75);
    this.knightCharacter.x = width / 2;
    this.knightCharacter.y = this.inputContainer.y + this.inputContainer.height / 2 - padding;
    // --- Settings UI & Speed Button ---
    // Settings UI
    LayoutHelper.scaleToHeight(this.settingsUI, this.betButton.height * 1.15);
    LayoutHelper.setPositionX(this.settingsUI, this.betButton.x + this.betButton.width / 2 + padding); // Align right with padding
    LayoutHelper.setPositionY(
      this.settingsUI,
      this.betButton.y - this.betButton.height / 2
    );

    // Speed Button
    LayoutHelper.scaleToHeight(this.speedButton, this.betButton.height);
    LayoutHelper.setPositionX(
      this.speedButton,
      this.betButton.x - this.betButton.width / 2 - this.speedButton.width,
    );
    LayoutHelper.setPositionY(
      this.speedButton,
      this.betButton.y - this.betButton.height / 2,
    );

    // Ensure betButton is on top of everything to prevent overlap issues
    this.fancyBoxContainer.setChildIndex(this.betButton, this.fancyBoxContainer.children.length - 1);
  }
}
