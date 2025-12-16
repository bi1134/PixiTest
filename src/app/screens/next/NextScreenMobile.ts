import { Container } from "pixi.js";
import { SpeedButton } from "../../ui/SpeedButton";
import { engine } from "../../getEngine";
import { MainScreen } from "../main/MainScreen";
import { SettingsUI } from "../../ui/SettingsUI";
import { MobileLayout } from "./layout/MobileLayout"; // Updated import
import { GameState, GuessAction, GuessResult } from "./types/GameTypes";
import { LayoutHelper } from "../../utils/LayoutHelper";
import { UI } from "../../ui/Manager/UIManager";
import { NextGameLogic } from "./logic/NextGameLogic";
import { GameData } from "../../data/GameData";
import { FireEffect } from "../../effects/FireEffect";

export class NextScreenMobile extends Container {
  public static assetBundles = ["main"];

  public layout!: MobileLayout; // Renamed for clarity

  private currentState: GameState = GameState.NonBetting;

  private settingsUI: SettingsUI;
  private speedButton: SpeedButton;

  private fireEffect: FireEffect;

  constructor() {
    super();

    const { width, height } = engine().renderer.screen;

    this.layout = new MobileLayout(width, height);
    this.addChild(this.layout);

    this.settingsUI = new SettingsUI();
    this.addChild(this.settingsUI);

    this.speedButton = new SpeedButton({
      defaultView: "rounded-rectangle.png",
    });

    this.addChild(this.speedButton);

    // --- Setup Event Listeners ---
    this.setupEvents();

    this.layout.currentCard.RandomizeValue();
    this.EnterBettingState();

    this.resize(width, height);

    // Sync initial UI
    this.layout.moneyLabel.text = `Balance: $${GameData.instance.totalMoney.toFixed(2)}`;

    this.fireEffect = new FireEffect();
    //this.addChild(this.fireEffect);
    this.fireEffect.setColors(["#5252daff", "rgba(239, 193, 193, 0.9)"]);
    this.fireEffect.start();
  }

  private setupEvents() {
    this.layout.inputBox.onEnter.connect(() => {
      this.ValidateInput();
    });

    this.layout.upButton.onPress.connect(() => this.HigherButton());
    this.layout.downButton.onPress.connect(() => this.LowerButton());
    this.layout.fancySkipButton.onPress.connect(() => this.SkipButton());
    this.layout.betButton.onPress.connect(() => {
      if (this.betButtonIsCashOut()) {
        this.CashOut();
      } else {
        this.EnterNonBettingState();
      }
    });

    this.layout.halfValueButton.onPress.connect(() => this.HalfButton());
    this.layout.doubleValueButton.onPress.connect(() => this.DoubleButton());
  }

  private betButtonIsCashOut(): boolean {
    return this.layout.betButton.text === "Cash Out";
  }

  private HigherButton() {
    const rank = this.layout.currentCard.rank;
    const action = NextGameLogic.getHighAction(rank);
    this.EvaluateGuess(action);
  }

  private LowerButton() {
    const rank = this.layout.currentCard.rank;
    const action = NextGameLogic.getLowAction(rank);
    this.EvaluateGuess(action);
  }

  private SkipButton() {
    this.EvaluateGuess(GuessAction.Skip);
  }

  private HalfButton() {
    if (this.layout.inputBox.value <= this.layout.inputDefaultValue) {
      this.layout.inputBox.value = 0;
    } else {
      this.layout.inputBox.value = this.layout.inputBox.value / 2;
    }
  }

  private DoubleButton() {
    this.layout.inputBox.value = this.layout.inputBox.value * 2;
  }

  // Helper to update UI labels based on current card
  private updateButtonLabels() {
    const rank = this.layout.currentCard.rank;
    console.log(`[UpdateLabels] Rank: ${rank}`);

    const labels = NextGameLogic.getLabelData(rank);

    this.layout.titleHigh.text = labels.highTitle;
    this.layout.highDes.text = labels.highDesc;

    this.layout.titleLow.text = labels.lowTitle;
    this.layout.lowDes.text = labels.lowDesc;
  }

  //#region guessing logic
  private EvaluateGuess(action: GuessAction) {
    const prevRank = this.layout.currentCard.rank;
    const prevNumeric = this.layout.currentCard.GetNumericValue();

    // --- Generate the next card ---
    const nextCardData = NextGameLogic.generateNextCard();
    const nextRank = nextCardData.rank;
    const nextSuit = nextCardData.suit;
    const nextNumeric = nextCardData.numeric;

    // --- Evaluate the guess ---
    const result = NextGameLogic.evaluateGuess(
      prevNumeric,
      nextNumeric,
      action,
    );

    // Update card visual
    this.layout.currentCard.SetValue(nextRank, nextSuit);

    // Handle Result
    if (result === GuessResult.Win) {
      // Win Logic
      this.enableButton(this.layout.betButton);
      this.layout.betButton.text = "Cash Out";
    } else if (result === GuessResult.Lose) {
      // Loss Logic
      const lostAmount = parseFloat(this.layout.inputBox.value) || 0.02;
      GameData.instance.addRoundResult(0, false, lostAmount);
      this.layout.gameHistory.addResult(0, false);
      this.layout.moneyLabel.text = `Balance: $${GameData.instance.totalMoney.toFixed(2)}`;

      this.EnterBettingState();
    }
    // Skip does nothing extra beyond setting card (already done)

    // --- Add the NEW current card (after pressing button) to history ---
    this.layout.cardHistoryLayout.addCardToHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      action,
      8,
      4,
    );
    this.updateButtonLabels();

    console.log(
      `Prev: ${prevRank}, Next: ${nextRank}, Guess: ${action}, Result: ${result}`,
    );
  }

  private EnterNonBettingState() {
    this.currentState = GameState.NonBetting;

    console.log(this.layout.inputBox.value);

    //clear card history
    this.layout.cardHistoryLayout.clearHistory();

    //prepare for new round
    if (
      !this.layout.cardsContainer.children.includes(this.layout.currentCard)
    ) {
      this.layout.cardsContainer.addChild(this.layout.currentCard);
    }

    // Reset Card?
    // Show back of card
    if (this.layout.currentCard.parent) {
      this.layout.currentCard.parent.removeChild(this.layout.currentCard);
    }

    // Re-add logic or ensure z-order
    if (this.layout.currentCard.parent !== this.layout.cardsContainer) {
      this.layout.cardsContainer.addChild(this.layout.currentCard);
    }

    // --- randomize the starting card (rank + suit) ---
    this.layout.currentCard.RandomizeValue();
    this.updateButtonLabels();

    this.layout.cardHistoryLayout.addCardToHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      GuessAction.Start,
      8,
      4,
    );

    //input and buttons
    this.layout.inputBox.interactive = false;
    this.layout.betButton.text = "Cash Out";
    this.disableButton(this.layout.betButton); // Cannot cash out immediately on start
    this.disableButton(this.layout.halfValueButton);
    this.disableButton(this.layout.doubleValueButton);

    this.enableButton(this.layout.upButton);
    this.enableButton(this.layout.downButton);
    this.enableButton(this.layout.fancySkipButton);

    console.log("Entered Non Betting State");
  }

  private EnterBettingState() {
    this.currentState = GameState.Betting;

    // Enable input again for new round
    this.layout.inputBox.interactive = true;
    this.layout.betButton.text = "Bet";
    this.enableButton(this.layout.betButton);
    this.enableButton(this.layout.halfValueButton);
    this.enableButton(this.layout.doubleValueButton);

    this.disableButton(this.layout.upButton);
    this.disableButton(this.layout.downButton);
    this.disableButton(this.layout.fancySkipButton);

    this.updateButtonLabels();

    console.log("Entered Betting State");
  }

  //#endregion

  private CashOut() {
    const multiplier = 6.5; // example
    const base = parseFloat(this.layout.inputBox.value) || 0.02;

    UI.showResult(multiplier, base);

    // Show back of card
    if (this.layout.currentCard.parent) {
      this.layout.currentCard.parent.removeChild(this.layout.currentCard);
    }

    const betAmount = parseFloat(this.layout.inputBox.value) || 0.02;
    GameData.instance.addRoundResult(multiplier, true, betAmount);
    this.layout.gameHistory.addResult(multiplier, true);
    this.layout.moneyLabel.text = `Balance: $${GameData.instance.totalMoney.toFixed(2)}`;

    this.EnterBettingState();
  }

  private ValidateInput() {
    const val = parseFloat(this.layout.inputBox.value);

    // reset invalid or below-zero values
    if (isNaN(val) || val <= 0) {
      this.layout.inputBox.value = "0.02";
      return;
    }

    // optionally clamp decimals
    this.layout.inputBox.value = val.toFixed(2);
  }

  public prepare() {}

  public reset() {}

  public resize(width: number, height: number) {
    // Mobile layout takes full screen
    const padding = width * 0.02;

    this.layout.resize(width, height, padding);
    LayoutHelper.scaleToHeight(this.settingsUI, this.layout.betButton.height);
    LayoutHelper.setPositionX(this.settingsUI, width - this.settingsUI.width);
    LayoutHelper.setPositionY(
      this.settingsUI,
      this.layout.betButton.y - this.settingsUI.height / 2,
    );

    // Position Speed Button (Top Left)
    if (this.speedButton) {
      this.speedButton.width = this.settingsUI.width * 0.75;
      this.speedButton.height = this.settingsUI.height * 0.75;
      LayoutHelper.setPositionX(
        this.speedButton,
        this.layout.betButton.x - this.speedButton.width * 2,
      );
      LayoutHelper.setPositionY(
        this.speedButton,
        this.layout.betButton.y - this.speedButton.height / 4,
      );
    }

    if (this.fireEffect) {
      this.fireEffect.x = width / 2;
      this.fireEffect.y = height / 2;
      this.fireEffect.intensity = 1;
      this.fireEffect.setColors(["#5252daff", "#00000000"]);
    }
  }

  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
  }

  private disableButton(button: any) {
    button.interactive = false;
    button.alpha = 0.5;
  }

  private enableButton(button: any) {
    button.interactive = true;
    button.alpha = 1;
  }
}
