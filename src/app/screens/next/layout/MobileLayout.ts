import { FancyButton } from "@pixi/ui";
import { Container, Graphics, Sprite } from "pixi.js";
import { BitmapLabel } from "../../../ui/BitmapLabel";
import { Card } from "../../../ui/Card";
import { LayoutHelper } from "../../../utils/LayoutHelper";
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
  public cardHistoryLayout!: CardHistoryLayout;
  public gameHistory!: GameHistoryContainer;

  // Mobile specific additions (from Sidebar)
  public inputContainer!: Container;
  public moneyLabel!: BitmapLabel;
  public moneyContainer!: Container;
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

  public topContainer!: Container;
  public middleContainer!: Container;
  public bottomContainer!: Container;

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

    // --- Sections ---
    this.topContainer = new Container();
    this.middleContainer = new Container();
    this.bottomContainer = new Container();
    this.fancyBoxContainer.addChild(this.topContainer, this.middleContainer, this.bottomContainer);

    this.multiplierBoard = new NextMultiplierBoard();
    this.topContainer.addChild(this.multiplierBoard);

    this.cardsContainer = new Container();
    this.middleContainer.addChild(this.cardsContainer);

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
      style: { tint: 0xb2b2b2, fontSize: 30, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.titleLow = new BitmapLabel({
      text: "Lo",
      style: { tint: 0xb2b2b2, fontSize: 30, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.cardsContainer.addChild(this.titleHigh, this.titleLow);

    this.highDes = new BitmapLabel({
      text: "Higher or equal",
      style: { fill: "#fafafaff", fontSize: 20, fontFamily: "coccm-bitmap-3-normal", },
    });
    this.lowDes = new BitmapLabel({
      text: "Lower or equal",
      style: { fill: "#ffffffff", fontSize: 20, fontFamily: "coccm-bitmap-3-normal" },
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
    this.bottomContainer.addChild(this.BarMid);

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

    // Create Money Container
    this.moneyContainer = new Container();
    this.BarMid.addChild(this.moneyContainer);
    this.moneyContainer.addChild(this.coinIcon, this.moneyLabel);

    // Bet Button (from Sidebar)
    this.betButton = new BetButton();
    this.bottomContainer.addChild(this.betButton); // We'll position this dynamically

    // --- Create Subcomponents ---
    this.knightCharacter = new KnightCharacter();
    this.bottomContainer.addChild(this.knightCharacter);



    // --- Input Container (History Box) ---
    this.inputContainer = new Container();
    this.bottomContainer.addChild(this.inputContainer);


    this.cardHistoryLayout = new CardHistoryLayout({
      type: 'horizontal',
      direction: 'ltr'
    });
    // Add to inputContainer instead of fancyBoxContainer
    this.cardsContainer.addChild(this.cardHistoryLayout);


    this.inputBox = new CustomInput({
      bg: Sprite.from("Bet_volume.png"),
      placeholder: this.inputDefaultValue.toString(),
      fontSize: 33,
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
    this.bottomContainer.addChild(this.gameHistory);

    // Settings UI
    this.settingsUI = new SettingsUI();
    this.bottomContainer.addChild(this.settingsUI);

    // Speed Button
    this.speedButton = new SpeedButton();
    this.bottomContainer.addChild(this.speedButton);
  }

  public resize(width: number, height: number, padding: number) {
    // Resize background to cover
    if (this.background) {
      this.background.x = width / 2;
      this.background.y = height / 2;

      this.background.width = width;
      this.background.height = height;
    }

    // --- Container Positioning ---
    // Top and Middle start at 0 (or we could shift middle)
    this.topContainer.position.set(0, 0);
    this.middleContainer.position.set(0, -padding * 10);
    // Bottom container is anchored at the bottom
    this.bottomContainer.position.set(0, height);

    this.multiplierBoard.scale.set(0.75);
    this.multiplierBoard.x = width / 2;
    this.multiplierBoard.y = this.multiplierBoard.height / 2; // Relative to top (0)

    // Sizing: Share width
    const footerBtnWidth = (width - padding * 15) / 2;

    // Bet Button (Right)
    if (this.betButton.width !== footerBtnWidth)
      LayoutHelper.scaleToWidth(this.betButton, footerBtnWidth, true);

    this.betButton.x = width / 2;
    // Calculate global Y then convert to relative
    const footerY = height - this.betButton.height / 2 - this.BarMid.height - padding * 2;
    this.betButton.y = footerY - height; // Relative to bottom

    LayoutHelper.scaleToWidth(this.BarMid, this.betButton.width - padding * 1.5, true);
    this.BarMid.x = this.betButton.x - this.BarMid.width / 2;
    this.BarMid.y = (this.betButton.y + height) + (this.betButton.height - this.BarMid.height) / 2 - height; // Relative

    // --- Available Space (Main Game Area) ---
    // Back Card
    LayoutHelper.setPositionX(
      this.backCard,
      (width - this.backCard.width) / 2 - padding * 7.5,
    );
    LayoutHelper.setPositionX(
      this.cardPlaceHolder,
      (width - this.cardPlaceHolder.width) / 2 - padding * 11,
    );

    const cardScale = 1.35;

    this.backCard.scale.set(0.75);
    this.cardPlaceHolder.scale.set(cardScale);
    this.currentCard.setBaseScale(cardScale);
    this.backCard.y =
      (this.backCard.height * this.backCard.scale.y) / 2 + padding * 17;
    this.cardPlaceHolder.y = this.backCard.y;

    this.currentCard.x = this.backCard.x + this.backCard.width / 2 - padding / 2;
    this.currentCard.y = this.backCard.y + this.backCard.height / 2 - padding;

    // Skip Button (Left)
    this.fancySkipButton.width = this.currentCard.width / 3;
    this.fancySkipButton.height = this.currentCard.height / 8;
    this.fancySkipButton.x = this.currentCard.x;
    this.fancySkipButton.y = this.currentCard.y + this.currentCard.height / 2;
    // Ensure skip button is always on top
    this.cardsContainer.addChild(this.fancySkipButton);

    // Hi/Lo Buttons

    const buttonScale = 0.7;

    this.upButton.scale.set(buttonScale);
    this.downButton.scale.set(buttonScale);

    const btnY =
      this.backCard.y + this.backCard.height / 2 - this.upButton.height / 2;
    this.upButton.y = btnY - this.upButton.height / 2 - padding;
    this.downButton.y = btnY + this.downButton.height / 2 + padding * 0.75;

    const btnX =
      this.backCard.x + (this.backCard.width + this.upButton.width) / 2 + padding * 5;

    this.upButton.x = btnX;
    this.downButton.x = btnX;

    this.highDes.x = this.upButton.x + this.upButton.width / 2;
    this.lowDes.x = this.downButton.x + this.downButton.width / 2;

    this.highDes.y = this.upButton.y + this.upButton.height / 2 + padding * 1.5;
    this.lowDes.y = this.downButton.y + this.downButton.height / 2 + padding * 1;

    // Titles
    LayoutHelper.setPositionX(
      this.titleHigh,
      this.upButton.x + this.upButton.width / 2,
    );
    this.titleHigh.y =
      this.upButton.y + this.upButton.height / 2 - this.titleHigh.height + padding;

    const iconScale = 0.75;

    // High Icon
    this.highIcon.scale.set(iconScale); // Adjust scale if needed
    this.highIcon.anchor.set(1, 0.5);
    this.highIcon.x = this.titleHigh.x - padding * 3.5;
    this.highIcon.y = this.titleHigh.y;


    LayoutHelper.setPositionX(
      this.titleLow,
      this.downButton.x + this.downButton.width / 2,
    );
    this.titleLow.y =
      this.downButton.y + this.downButton.height / 2 - this.titleLow.height + padding / 3;

    // Low Icon
    this.lowIcon.scale.set(iconScale);
    this.lowIcon.anchor.set(1, 0.5);
    this.lowIcon.x = this.titleLow.x - padding * 3.5;
    this.lowIcon.y = this.titleLow.y;

    // --- Input Container (History Box) ---

    const containerW = width;
    // --- 1. History List ---

    this.cardHistoryLayout.resize(width - padding * 18.25, this.currentCard.height * 0.45);
    this.cardHistoryLayout.x = this.currentCard.x - this.cardHistoryLayout.width / 2 + padding * 2;
    this.cardHistoryLayout.y = this.backCard.y + this.backCard.height + padding * 3;
    this.cardHistoryLayout.pushBackPadding = 8;
    // --- 2. Input Box ---

    // Resize CustomInput
    this.inputBox.resize(innerWidth * 0.35, 135);
    this.inputBox.x = this.betButton.x - this.inputBox.width / 2;

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

    // Reset positions inside local container
    this.coinIcon.anchor.set(0, 0.5);
    this.coinIcon.x = 0;
    this.coinIcon.y = 0; // vertical center relative to container

    this.moneyLabel.anchor.set(0, 0.5);
    this.moneyLabel.x = this.coinIcon.width + 10; // Gap 10
    this.moneyLabel.y = 0;


    this.moneyContainer.x = this.BarMid.width / 2 - this.moneyContainer.width / 4;
    this.moneyContainer.y = this.BarMid.height - padding / 2; // Vertically center
    // --- 4. Background ---
    // Resize background to fit the total calculated content height
    this.moneyLabel.visible = true;
    this.inputBox.visible = true;
    this.cardHistoryLayout.visible = true;

    this.gameHistory.resize(width, 50);
    this.gameHistory.y = (height - this.gameHistory.height) - height; // Relative -70
    this.gameHistory.x = 0;

    // Resize history container properly to avoid scaling distortion

    // Position the whole container
    const historyStartY = (this.betButton.y + height) - this.betButton.height - this.inputContainer.height / 2;

    this.inputContainer.x = (width - containerW) / 2;
    this.inputContainer.y = historyStartY - height;

    this.knightCharacter.scale.set(0.75);
    this.knightCharacter.x = width / 2;
    this.knightCharacter.y = (this.inputContainer.y + height) + this.inputContainer.height / 2 - padding - height;
    // --- Settings UI & Speed Button ---
    // Settings UI
    LayoutHelper.scaleToHeight(this.settingsUI, this.betButton.height * 1.15);
    LayoutHelper.setPositionX(this.settingsUI, this.betButton.x + this.betButton.width / 2 + padding); // Align right with padding
    LayoutHelper.setPositionY(
      this.settingsUI,
      (this.betButton.y + height) - this.betButton.height / 2 - height
    );

    // Speed Button
    LayoutHelper.scaleToHeight(this.speedButton, this.betButton.height);
    LayoutHelper.setPositionX(
      this.speedButton,
      this.betButton.x - this.betButton.width / 2 - this.speedButton.width,
    );
    LayoutHelper.setPositionY(
      this.speedButton,
      (this.betButton.y + height) - this.betButton.height / 2 - height,
    );

    // Ensure betButton is on top of everything in bottomContainer
    this.bottomContainer.setChildIndex(this.betButton, this.bottomContainer.children.length - 1);
  }

  public updateMoney(value?: string, padding: number = 1075 * 0.02) {
    if (value !== undefined) {
      this.moneyLabel.text = value;
    }

    // Ensure container exists (should be created in resize/create, but safe guard)
    if (!this.moneyContainer) return;

    // Recalculate inner positions (in case label width changed)
    this.coinIcon.x = 0;
    this.moneyLabel.x = this.coinIcon.width + 10;

    // Recalculate container center position using stored padding
    this.moneyContainer.x = this.BarMid.width / 2 - this.moneyContainer.width / 4;
    this.moneyContainer.y = this.BarMid.height - padding / 2;
  }
}
