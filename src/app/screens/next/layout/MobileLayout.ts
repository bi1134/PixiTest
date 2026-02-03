import { Container, Sprite } from "pixi.js";
import { GameLogic } from "../../../framework/GameLogic/GameLogic";
import { GameInformation } from "../../../framework/GameInformation/GameInformation";
import { BetBar } from "../../../framework/BetBar/BetBar";

export class MobileLayout extends Container {
  public fancyBoxContainer!: Container;
  public background!: Sprite;

  public gameLogic!: GameLogic;
  public gameInfo!: GameInformation;
  public betBar!: BetBar;

  constructor(width: number, height: number) {
    super();
    this.createLayout(width);
    this.resize(width, height, 0); // Initial resize check?
  }

  private createLayout(width: number) {
    this.fancyBoxContainer = new Container();
    this.addChild(this.fancyBoxContainer);

    this.background = Sprite.from("BG.png");
    this.background.anchor.set(0.5);
    this.fancyBoxContainer.addChild(this.background);

    // --- Instantiate Framework Components ---
    this.gameInfo = new GameInformation();
    this.fancyBoxContainer.addChild(this.gameInfo);

    this.gameLogic = new GameLogic();
    this.fancyBoxContainer.addChild(this.gameLogic);

    this.betBar = new BetBar(width);
    this.fancyBoxContainer.addChild(this.betBar);
  }

  public get currentCard() { return this.gameLogic.currentCard; }
  public get inputBox() { return this.betBar.inputBox; }
  public get inputDefaultValue() { return this.betBar.inputDefaultValue; }
  public get upButton() { return this.gameLogic.upButton; }
  public get downButton() { return this.gameLogic.downButton; }
  public get fancySkipButton() { return this.gameLogic.fancySkipButton; }
  public get betButton() { return this.betBar.betButton; }
  public get halfValueButton() { return this.betBar.halfValueButton; }
  public get doubleValueButton() { return this.betBar.doubleValueButton; }
  public get highDes() { return this.gameLogic.highDes; }
  public get lowDes() { return this.gameLogic.lowDes; }
  public get highIcon() { return this.gameLogic.highIcon; }
  public get lowIcon() { return this.gameLogic.lowIcon; }
  public get titleHigh() { return this.gameLogic.titleHigh; }
  public get titleLow() { return this.gameLogic.titleLow; }
  public get multiplierBoard() { return this.gameLogic.multiplierBoard; }
  public get gameHistory() { return this.betBar.gameHistory; }
  public get cardHistoryLayout() { return this.gameLogic.cardHistoryLayout; }
  public get cardsContainer() { return this.gameLogic.cardsContainer; }

  // Proxy methods
  public updateMoney(value?: string) {
    this.betBar.updateMoney(value);
  }

  public resize(width: number, height: number, padding: number, verticalMargin: number = 0) {
    // Resize background to cover
    if (this.background) {
      this.background.x = width / 2;
      this.background.y = height / 2;

      // Scale to cover (maintain aspect ratio)
      const scale = Math.max(width / this.background.texture.width, height / this.background.texture.height);
      this.background.scale.set(scale);
    }

    const bgTop = this.background ? this.background.y - this.background.height / 2 : 0;
    const bgBottom = this.background ? this.background.y + this.background.height / 2 : height;

    // --- Resize Delegate ---

    // 1. BetBar (Bottom)
    this.betBar.resize(width, 0, padding);
    this.betBar.y = Math.min(height + verticalMargin * 0, bgBottom); // Adjust bottom clamp if needed

    // 2. Game Logic (Middle)
    this.gameLogic.resize(width, height, padding);
    this.gameLogic.y = 0;

    // 3. Game Info (Top)
    // Needs global Y of input box for relative positioning of Knight
    this.gameInfo.resize(width, height, padding, this.betBar.inputBox.y + this.betBar.y, this.betBar.inputBox.height);
    this.gameInfo.y = Math.max(-verticalMargin, bgTop);

  }
}
