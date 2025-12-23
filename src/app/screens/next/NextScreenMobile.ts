import { Container, Graphics } from "pixi.js";
import { engine } from "../../getEngine";
// MainScreen unused, removing
import { MobileLayout } from "./layout/MobileLayout"; // Updated import
import { GameState, GuessAction, GuessResult } from "./types/GameTypes";
import { UI } from "../../ui/Manager/UIManager";
import { NextGameLogic } from "./logic/NextGameLogic";
import { GameData } from "../../data/GameData";
import { FireEffect } from "../../effects/FireEffect";

export class NextScreenMobile extends Container {
  public static assetBundles = ["main"];

  public layout!: MobileLayout; // Renamed for clarity

  private currentState: GameState = GameState.NonBetting;

  private fireEffect: FireEffect;

  constructor() {
    super();

    const { width, height } = engine().renderer.screen;

    this.layout = new MobileLayout(width, height);
    this.addChild(this.layout);

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
    this.vibratePhone(100);
  }

  private HalfButton() {
    const currentValue = parseFloat(this.layout.inputBox.value);
    if (currentValue <= this.layout.inputDefaultValue) {
      this.layout.inputBox.value = "0";
    } else {
      this.layout.inputBox.value = (currentValue / 2).toString();
    }
  }

  private DoubleButton() {
    const currentValue = parseFloat(this.layout.inputBox.value);
    this.layout.inputBox.value = (currentValue * 2).toString();
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
      this.vibratePhone(200);
      this.EnterBettingState();
    }
    // Skip does nothing extra beyond setting card (already done)

    // --- Add the NEW current card (after pressing button) to history ---
    this.layout.cardHistoryLayout.addCardToHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      action,
      8,
      0.5,
      1,
      1
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

    // Ensure fancySkipButton is on top
    this.layout.cardsContainer.setChildIndex(
      this.layout.fancySkipButton,
      this.layout.cardsContainer.children.length - 1
    );

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
    this.layout.inputBox.alpha = 0.75;
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
    this.layout.inputBox.alpha = 1;
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

  public prepare() { }

  public reset() { }

  // New container for safe area content
  private safeArea!: Container;
  private background!: Graphics; // Using Graphics as placeholder for blurred background

  public resize(width: number, height: number) {
    if (!this.safeArea) {
      this.safeArea = new Container();
      this.addChild(this.safeArea);
      // Move layout into safeArea
      this.safeArea.addChild(this.layout);

      if (this.fireEffect) this.safeArea.addChild(this.fireEffect);

      // Create Background
      this.background = new Graphics();
      this.addChildAt(this.background, 0); // Add at bottom

    }

    // 1. Calculate safe area scale
    const targetAspect = 9 / 16;
    const currentAspect = width / height;

    let scale = 1;
    let safeWidth = 1080;
    let safeHeight = 1920;

    // If screen is wider than target (e.g. Fold Open, Desktop-like mobile view)
    // We want to force 9:16 safe area in the middle
    if (currentAspect > targetAspect) {
      scale = height / 1920; // Fit Height
      safeWidth = 1080 * scale;
      safeHeight = 1920 * scale;

      this.safeArea.x = (width - safeWidth) / 2;
      this.safeArea.y = (height - safeHeight) / 2; // Should be 0 effectively
    } else {
      // If screen is taller than target (e.g. Sony Xperia, Modern standard phones)
      // We want to FILL the height, not letterbox top/bottom.
      // So we match width, and let height range expand.
      scale = width / 1080; // Fit Width

      // Re-calculate logical height to match screen aspect
      const contentHeight = height / scale;

      safeWidth = 1080 * scale;
      safeHeight = contentHeight * scale; // = height

      this.safeArea.x = 0;
      this.safeArea.y = 0;

      // Update logical height passed to layout
      // effectively > 1920
      this.layout.resize(1080, contentHeight, 1080 * 0.02);

      this.safeArea.scale.set(scale);
      this.background.clear().rect(0, 0, width, height).fill(0x1a1a1a);
      return; // Early return as we handled layout resize above
    }

    // 2. Apply Scale (For Wide Case)
    this.safeArea.scale.set(scale);

    // 3. Center Safe Area (For Wide Case)
    // already set x/y above

    // 4. Resize Internal Components to Fixed Reference Resolution (1080x1920)
    const padding = 1080 * 0.02; // 2% of fixed width
    this.layout.resize(1080, 1920, padding);

    // 5. Update Background to fill real screen
    this.background.clear();
    this.background.rect(0, 0, width, height).fill(0x1a1a1a);

    // 6. Update Position of overlaid elements within Safe Area
    // Layout now handles SettingsUI and SpeedButton positioning internal to resize call

    // Fire Effect
    if (this.fireEffect) {
      this.fireEffect.x = 1080 / 2;
      this.fireEffect.y = 1920 / 2;
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

  private vibratePhone(power: number = 100) {
    navigator.vibrate(power);
  }
}
