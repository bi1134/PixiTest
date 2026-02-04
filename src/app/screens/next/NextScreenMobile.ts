import { Container, Texture } from "pixi.js";
import { engine } from "../../getEngine";
import { MobileLayout } from "./layout/MobileLayout"; // Updated import
import { BetButton } from "../../ui/BetButton";
import { GameState, GuessAction, GuessResult } from "./types/GameTypes";
import { UI } from "../../ui/Manager/UIManager";
import { NextGameLogic } from "./logic/NextGameLogic";
import { GameData } from "../../data/GameData";
import { MultiplierManager } from "./logic/MultiplierManager";

export class NextScreenMobile extends Container {
  public static assetBundles = ["main"];

  public layout!: MobileLayout; // Renamed for clarity
  private multiplierManager: MultiplierManager;
  // private currentState: GameState = GameState.NonBetting; // Moved to GameData

  // New container for safe area content
  private safeArea!: Container;

  private firstLoad: boolean = true;

  constructor() {
    super();
    this.multiplierManager = new MultiplierManager();

    const { width, height } = engine().renderer.screen;

    this.layout = new MobileLayout(width, height);
    this.addChild(this.layout);

    // --- Setup Event Listeners ---
    this.setupEvents();

    this.layout.currentCard.RandomizeValue();
    this.EnterBettingState();

    this.resize(width, height);
    // Sync initial UI
    this.layout.updateMoney(`${GameData.instance.totalMoney.toFixed(2)} `);

  }

  private setupEvents() {

    this.layout.upButton.onPress.connect(() => this.HigherButton());
    this.layout.downButton.onPress.connect(() => this.LowerButton());
    this.layout.fancySkipButton.onPress.connect(() => this.SkipButton());
    this.layout.betButton.onPress.connect(() => {
      if (this.betButtonIsCashOut()) {
        this.CashOut();
      } else {
        const currentBet = parseFloat(this.layout.inputBox.value);
        const maxMoney = parseFloat(GameData.instance.totalMoney.toFixed(2));

        if (currentBet > maxMoney) {
          this.vibratePhone(100);
          return;
        }

        // Deduct money immediately (Scenario A)
        GameData.instance.totalMoney -= currentBet;
        this.layout.updateMoney(`${GameData.instance.totalMoney.toFixed(2)} `);

        this.EnterNonBettingState();
      }
    });

    this.layout.halfValueButton.onPress.connect(() => this.HalfButton());
    this.layout.doubleValueButton.onPress.connect(() => this.DoubleButton());
  }

  private betButtonIsCashOut(): boolean {
    return !this.layout.betButton.isBetting;
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
    this.layout.gameInfo.knightCharacter.playState('skip');
    this.layout.gameInfo.knightCharacter.say("YOU CAN DO IT!");
    this.vibratePhone(100);
  }

  private HalfButton() {
    const currentValue = parseFloat(this.layout.inputBox.value);
    if (currentValue <= this.layout.inputDefaultValue) {
      this.layout.inputBox.value = this.layout.inputDefaultValue.toString();
    } else {
      const half = currentValue / 2;
      this.layout.inputBox.value = parseFloat(half.toFixed(2)).toString();
    }
  }

  private DoubleButton() {
    let currentValue = parseFloat(this.layout.inputBox.value);

    currentValue *= 2;

    const maxMoney = GameData.instance.totalMoney;
    if (currentValue > maxMoney) {
      currentValue = maxMoney;
    }

    this.layout.inputBox.value = parseFloat(currentValue.toFixed(2)).toString();
  }

  // Helper to update UI labels based on current card
  private updateButtonLabels() {
    const rank = this.layout.currentCard.rank;
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const rankIndex = ranks.indexOf(rank);


    const labels = NextGameLogic.getLabelData(rank);

    // Update Icons based on action (needed for payout calculation)
    const highAction = NextGameLogic.getHighAction(rank);
    const lowAction = NextGameLogic.getLowAction(rank);

    // Logic: Show Description on First Load, then switch to Payouts forever once game starts
    if (this.firstLoad) {
      this.layout.highDes.text = labels.highDesc;
      this.layout.lowDes.text = labels.lowDesc;
    } else {
      // Show Payouts (Rp XXX)
      const currentBet = parseFloat(this.layout.inputBox.value);
      const validBet = isNaN(currentBet) ? GameData.MIN_BET : currentBet;

      // Calculate Potential Multipliers
      const highNextMult = this.multiplierManager.getNextMultiplier(rank, highAction);
      const lowNextMult = this.multiplierManager.getNextMultiplier(rank, lowAction);

      // Calculate Potential Payouts
      const highPayout = validBet * highNextMult;
      const lowPayout = validBet * lowNextMult;

      const formatPayout = (val: number) => {
        return val.toLocaleString('de-DE', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      };

      this.layout.highDes.text = `Rp ${formatPayout(highPayout)} `;
      this.layout.lowDes.text = `Rp ${formatPayout(lowPayout)} `;

      // Update Prediction Multipliers on the Board
      this.layout.gameInfo.updatePredictions(highNextMult, lowNextMult);
    }

    if (highAction === GuessAction.Equal) {
      this.layout.highIcon.texture = Texture.from("icon-equal.png");
    } else {
      this.layout.highIcon.texture = Texture.from("Icon-Arrow-high.png");
    }

    if (lowAction === GuessAction.Equal) {
      this.layout.lowIcon.texture = Texture.from("icon-equal.png");
    } else {
      this.layout.lowIcon.texture = Texture.from("Icon-Arrow-low.png");
    }

    // Calculate Percentages
    let highProb = 0;
    let lowProb = 0;
    const total = 13;

    if (rank === "A") {
      // High Button -> Strict Higher (> A)
      highProb = (total - 1) / total;
      // Low Button -> Equal (== A)
      lowProb = 1 / total;
    } else if (rank === "K") {
      // High Button -> Equal (== K)
      highProb = 1 / total;
      // Low Button -> Strict Lower (< K)
      lowProb = (total - 1) / total;
    } else {
      // High Button -> Higher or Equal (>= Rank)
      // Ranks >= current: (total - rankIndex)
      highProb = (total - rankIndex) / total;

      // Low Button -> Lower or Equal (<= Rank)
      // Ranks <= current: (rankIndex + 1)
      lowProb = (rankIndex + 1) / total;
    }

    this.layout.titleHigh.text = `${(highProb * 100).toFixed(1)}% `;
    this.layout.titleLow.text = `${(lowProb * 100).toFixed(1)}% `;

    // Update Next Multiplier Board (Prediction)
    // Show current multiplier accurately
    this.layout.multiplierBoard.setMultiplier(this.multiplierManager.currentMultiplier);

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

    // Visual Transition: Fly off old card
    this.layout.animateFlyOff(prevRank, this.layout.currentCard.suit);
    this.layout.animateDeal();

    // Update card visual (Flips to new value)
    this.layout.currentCard.SetValue(nextRank, nextSuit);

    // Handle Result
    if (result === GuessResult.Win) {
      // Win Logic
      this.multiplierManager.applyWin(prevRank, action); // Apply win using PREVIOUS rank and CHOSEN action

      this.enableButton(this.layout.betButton);
      // Update Cash Out Button with Value
      const currentMultiplier = this.multiplierManager.currentMultiplier;
      const currentBet = parseFloat(this.layout.inputBox.value);
      const validBet = isNaN(currentBet) ? GameData.MIN_BET : currentBet;
      const totalPayout = validBet * currentMultiplier;

      const formattedPayout = totalPayout.toLocaleString('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });

      this.layout.betButton.setCashOutValue(`Rp ${formattedPayout}`);

      this.layout.gameInfo.knightCharacter.playState('win');
      this.layout.gameInfo.knightCharacter.say('Good Job!');

    } else if (result === GuessResult.Lose) {
      // Loss Logic
      // Loss Logic
      const rawVal = parseFloat(this.layout.inputBox.value);
      const lostAmount = isNaN(rawVal) ? GameData.MIN_BET : rawVal;
      GameData.instance.addRoundResult(0, false, lostAmount);
      this.layout.gameHistory.addResult(0, false);

      this.layout.gameInfo.knightCharacter.playState('lose');
      this.layout.gameInfo.knightCharacter.say('BET AGAIN!');

      // Play Card Shake/Reveal
      this.layout.currentCard.playLoseAnimation();

      // Update Money and Recenter
      this.layout.updateMoney(`${GameData.instance.totalMoney.toFixed(2)} `);

      this.vibratePhone(200);
      this.EnterBettingState();
    }
    // Skip does nothing extra beyond setting card (already done)

    // Update Multiplier Board
    this.layout.multiplierBoard.setMultiplier(this.multiplierManager.currentMultiplier);

    // --- Add the NEW current card (after pressing button) to history ---
    // We pass the CURRENT multiplier (state after guess)
    this.layout.cardHistoryLayout.addCardToHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      action,
      0,
      -20,
      1,
      0.35, // 30% of original card size
      this.multiplierManager.currentMultiplier, // Pass multiplier
      result !== GuessResult.Lose // isWin
    );
    GameData.instance.addCardHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      action,
      this.multiplierManager.currentMultiplier
    );
    this.updateButtonLabels();

    this.updateButtonLabels();
  }

  private EnterNonBettingState() {
    GameData.instance.currentState = GameState.NonBetting;

    // Force switch back to Spine view
    this.layout.currentCard.resetToIdle();

    GameData.instance.currentState = GameState.NonBetting;


    //clear card history
    this.layout.cardHistoryLayout.clearHistory();
    GameData.instance.resetGameSession();

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
    this.multiplierManager.reset();
    this.layout.multiplierBoard.setMultiplier(this.multiplierManager.currentMultiplier); // Init board

    this.layout.currentCard.RandomizeValue();
    this.updateButtonLabels();

    this.layout.cardHistoryLayout.addCardToHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      GuessAction.Start,
      5,
      -20,
      1,
      0.35, // 30% of original card size
      this.multiplierManager.currentMultiplier,
      true // isWin
    );
    GameData.instance.addCardHistory(
      this.layout.currentCard.rank,
      this.layout.currentCard.suit,
      GuessAction.Start,
      this.multiplierManager.currentMultiplier
    );

    //input and buttons
    this.layout.inputBox.interactive = false;
    this.layout.betButton.setBettingState(false); // Non-Betting -> 1-0, Cash Out

    // Set initial cash out value (Start Bet)
    const currentBet = parseFloat(this.layout.inputBox.value);
    const validBet = isNaN(currentBet) ? GameData.MIN_BET : currentBet;
    const initialPayout = validBet * this.multiplierManager.currentMultiplier; // Should be 1.0

    const formattedInitial = initialPayout.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    this.layout.betButton.setCashOutValue(`Rp ${formattedInitial}`);

    this.layout.halfValueButton.interactive = false;
    this.layout.doubleValueButton.interactive = false;
    this.disableButton(this.layout.betButton); // Cannot cash out immediately on start

    this.enableButton(this.layout.upButton);
    this.enableButton(this.layout.downButton);
    this.layout.fancySkipButton.interactive = true;

    this.firstLoad = false; // Game has started, switching to Payout mode permanently

    this.firstLoad = false; // Game has started, switching to Payout mode permanently
  }

  private EnterBettingState() {
    GameData.instance.currentState = GameState.Betting;

    // Force Mesh View during betting (so it doesn't flip back to Spine on hover out)
    this.layout.currentCard.forceMeshView = true;

    // Enable input again for new round
    this.layout.inputBox.interactive = true;
    this.layout.betButton.setBettingState(true); // Betting -> 1-1, Bet
    this.enableButton(this.layout.betButton);
    this.layout.halfValueButton.interactive = true;
    this.layout.doubleValueButton.interactive = true;

    this.disableButton(this.layout.upButton);
    this.disableButton(this.layout.downButton);

    this.layout.fancySkipButton.interactive = false;

    this.updateButtonLabels();

    this.updateButtonLabels();
  }

  //#endregion

  private CashOut() {
    const multiplier = this.multiplierManager.currentMultiplier;
    const rawVal = parseFloat(this.layout.inputBox.value);
    const base = isNaN(rawVal) ? GameData.MIN_BET : rawVal;

    UI.showResult(multiplier, base);

    // Show back of card
    if (this.layout.currentCard.parent) {
      this.layout.currentCard.parent.removeChild(this.layout.currentCard);
    }

    const betAmount = isNaN(rawVal) ? GameData.MIN_BET : rawVal;
    GameData.instance.addRoundResult(multiplier, true, betAmount);
    this.layout.gameHistory.addResult(multiplier, true);

    // Update Money and Recenter
    this.layout.updateMoney(`${GameData.instance.totalMoney.toFixed(2)} `);

    this.EnterBettingState();
  }

  private ValidateInput() {
    let val = parseFloat(this.layout.inputBox.value);

    // reset invalid or below-zero values
    if (isNaN(val) || val < 0) {
      this.layout.inputBox.value = GameData.MIN_BET.toString();
      return;
    }

    // Cap at total money
    const maxMoney = GameData.instance.totalMoney;
    if (val > maxMoney) {
      val = maxMoney;
    }

    // Format: Remove unnecessary decimals (e.g. 3.00 -> 3) but keep up to 2 decimals
    this.layout.inputBox.value = parseFloat(val.toFixed(2)).toString();
  }

  public prepare() { }

  public reset() { }


  public resize(width: number, height: number) {
    if (!this.safeArea) {
      this.safeArea = new Container();
      this.addChild(this.safeArea);
      // Move layout into safeArea
      this.safeArea.addChild(this.layout);
    }

    // Fixed Safe Area Dimensions
    const SAFE_WIDTH = 720;
    const SAFE_HEIGHT = 1280;

    // Calculate scale to fit (Contain)
    const scale = Math.min(width / SAFE_WIDTH, height / SAFE_HEIGHT);

    // Apply scale
    this.safeArea.scale.set(scale);

    // Center Safe Area
    this.safeArea.x = (width - SAFE_WIDTH * scale) / 2;
    this.safeArea.y = (height - SAFE_HEIGHT * scale) / 2;

    // --- End Shadow ---

    // Resize Internal Components to Fixed Reference Resolution
    const padding = SAFE_WIDTH * 0.02; // 2% of fixed width

    // Calculate how much space is above/below the safe area (in logical pixels)
    // safeArea is centered, so top gap == bottom gap.
    const verticalMargin = this.safeArea.y / scale;

    this.layout.resize(SAFE_WIDTH, SAFE_HEIGHT, padding, verticalMargin);
  }

  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
  }

  private disableButton(button: any) {
    if (button instanceof BetButton) {
      button.setEnabled(false);
    } else {
      button.interactive = false;
      button.alpha = 0.5;
    }
  }

  private enableButton(button: any) {
    if (button instanceof BetButton) {
      button.setEnabled(true);
    } else {
      button.interactive = true;
      button.alpha = 1;
    }
  }

  private vibratePhone(power: number = 100) {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(power);
    }
  }
}
