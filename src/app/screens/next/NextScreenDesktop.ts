import { Container } from "pixi.js";
import { engine } from "../../getEngine";
import { ResultPopup } from "../../popups/ResultPopup";
import { Button } from "../../ui/Button";
// let's just remove the explicit import if it's unused as a value.

import { MainScreen } from "../main/MainScreen";
import { FancyLayout } from "./layout/FancyLayout";
import { SidebarLayout } from "./layout/SidebarLayout";
import { FancyButton } from "@pixi/ui";
import { GameState, GuessAction, GuessResult } from "./types/GameTypes";
import { NextGameLogic } from "./logic/NextGameLogic";

export class NextScreenDesktop extends Container {
    public static assetBundles = ["main"];

    private sidebar!: SidebarLayout;
    public fancy!: FancyLayout;
    private backButton!: FancyButton;

    private currentState: GameState = GameState.NonBetting;

    constructor() {
        super();

        const { width, height } = engine().renderer.screen;

        this.sidebar = new SidebarLayout(width, height);
        this.addChild(this.sidebar);

        this.fancy = new FancyLayout(width, height);
        this.addChild(this.fancy);

        //back button
        this.backButton = new Button({
            text: "Back to Main",
            width: 150,
            height: 100,
        });
        this.backButton.onPress.connect(async () => {
            await engine().navigation.showScreen(MainScreen);
        });
        this.addChild(this.backButton);

        // --- Setup Event Listeners ---
        this.setupSidebarEvents();
        this.setupFancyEvents();

        this.EnterBettingState();
    }

    private setupSidebarEvents() {
        this.sidebar.inputBox.onEnter.connect(() => {
            this.ValidateInput();
        });

        this.sidebar.higherButton.onPress.connect(() => this.HigherButton());
        this.sidebar.lowerButton.onPress.connect(() => this.LowerButton());
        this.sidebar.skipButton.onPress.connect(() => this.SkipButton());

        this.sidebar.betButton.onPress.connect(() => {
            if (this.currentState === GameState.Betting) {
                this.EnterNonBettingState(); // start playing
            } else if (this.currentState === GameState.NonBetting) {
                this.CashOut();
            }
        });
    }

    private setupFancyEvents() {
        this.fancy.upButton.onPress.connect(() => this.HigherButton());
        this.fancy.downButton.onPress.connect(() => this.LowerButton());
        this.fancy.fancySkipButton.onPress.connect(() => this.SkipButton());
    }

    private HigherButton() {
        const rank = this.fancy.currentCard.rank;
        const action = NextGameLogic.getHighAction(rank);
        this.EvaluateGuess(action);
    }

    private LowerButton() {
        const rank = this.fancy.currentCard.rank;
        const action = NextGameLogic.getLowAction(rank);
        this.EvaluateGuess(action);
    }

    private SkipButton() {
        this.EvaluateGuess(GuessAction.Skip);
    }

    //#region guessing logic
    private EvaluateGuess(action: GuessAction) {
        const prevRank = this.fancy.currentCard.rank;
        const prevNumeric = this.fancy.currentCard.GetNumericValue();

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
        this.fancy.currentCard.SetValue(nextRank, nextSuit);

        // Handle Result
        if (result === GuessResult.Win) {
            this.enableButton(this.sidebar.betButton);
        } else if (result === GuessResult.Lose) {
            this.EnterBettingState();
        }

        // --- Add the NEW current card (after pressing button) to history ---
        this.fancy.cardHistoryLayout.addCardToHistory(
            this.fancy.currentCard.rank,
            this.fancy.currentCard.suit,
            action,
        );
        this.updateButtonLabels();

        console.log(
            `Prev: ${prevRank}, Next: ${nextRank}, Guess: ${action}, Result: ${result}`,
        );
    }

    private updateButtonLabels() {
        const rank = this.fancy.currentCard.rank;
        const labels = NextGameLogic.getLabelData(rank);

        // Sidebar uses Button which has 'text' property
        this.sidebar.higherButton.text = labels.highTitle + "\n" + labels.highDesc;
        this.sidebar.lowerButton.text = labels.lowTitle + "\n" + labels.lowDesc;
    }

    private EnterNonBettingState() {
        this.currentState = GameState.NonBetting;

        console.log(this.sidebar.inputBox.value);

        //clear card history
        this.fancy.cardHistoryLayout.clearHistory();

        //prepare for new round
        if (!this.fancy.cardsContainer.children.includes(this.fancy.currentCard)) {
            this.fancy.cardsContainer.addChild(this.fancy.currentCard);
        }

        // Re-add logic or ensure z-order
        if (this.fancy.currentCard.parent !== this.fancy.cardsContainer) {
            this.fancy.cardsContainer.addChild(this.fancy.currentCard);
        }

        // Ensure fancySkipButton is on top
        this.fancy.cardsContainer.setChildIndex(
            this.fancy.fancySkipButton,
            this.fancy.cardsContainer.children.length - 1,
        );

        // --- randomize the starting card (rank + suit) ---
        this.fancy.currentCard.RandomizeValue();
        this.updateButtonLabels();

        this.fancy.cardHistoryLayout.addCardToHistory(
            this.fancy.currentCard.rank,
            this.fancy.currentCard.suit,
            GuessAction.Start,
        );

        //input and buttons
        this.sidebar.inputBox.interactive = false;
        this.sidebar.inputBox.alpha = 0.75;
        this.disableButton(this.sidebar.betButton);
        this.sidebar.betButton.text = "Cash Out";

        // Disable in-game action buttons
        this.enableButton(this.sidebar.higherButton);
        this.enableButton(this.sidebar.lowerButton);
        this.enableButton(this.sidebar.skipButton);

        this.enableButton(this.fancy.upButton);
        this.enableButton(this.fancy.downButton);
        this.enableButton(this.fancy.fancySkipButton);

        console.log("Entered Non Betting State");
    }

    private EnterBettingState() {
        this.currentState = GameState.Betting;

        // Enable input again for new round
        this.sidebar.inputBox.interactive = true;
        this.sidebar.inputBox.alpha = 1;

        this.enableButton(this.sidebar.betButton);
        this.sidebar.betButton.text = "Bet";

        // Disable in-game action buttons
        this.disableButton(this.sidebar.higherButton);
        this.disableButton(this.sidebar.lowerButton);
        this.disableButton(this.sidebar.skipButton);

        this.updateButtonLabels();

        this.disableButton(this.fancy.upButton);
        this.disableButton(this.fancy.downButton);
        this.fancy.fancySkipButton.interactive = false;

        console.log("Entered Betting State");
    }

    //#endregion

    private CashOut() {
        const multiplier = 6.5; // example
        const base = parseFloat(this.sidebar.inputBox.value) || 0.02;

        engine().navigation.presentPopup(ResultPopup, (popup) => {
            (popup as ResultPopup).setResult(multiplier, base);
        });

        this.EnterBettingState();
    }

    private ValidateInput() {
        const val = parseFloat(this.sidebar.inputBox.value);

        // reset invalid or below-zero values
        if (isNaN(val) || val <= 0) {
            this.sidebar.inputBox.value = "0.02";
            return;
        }

        // optionally clamp decimals
        this.sidebar.inputBox.value = val.toFixed(2);
    }

    public prepare() { }

    public reset() { }

    public resize(width: number, height: number) {
        const sidebarWidth = width / 4;
        const padding = sidebarWidth * 0.02;

        this.sidebar.resize(sidebarWidth, height, padding);

        // fancy layout needs to be positioned
        this.fancy.x = sidebarWidth;
        this.fancy.resize(width - sidebarWidth, height, padding);
        this.fancy.cardHistoryLayout.listYOffset = -25;

        this.backButton.x = 100;
        this.backButton.y = height - 50;
    }

    public async show(): Promise<void> {
        engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });
    }

    private disableButton(button: any) {
        // Type 'any' or 'FancyButton'
        button.interactive = false;
        button.alpha = 0.5;
    }

    private enableButton(button: any) {
        button.interactive = true;
        button.alpha = 1;
    }
}
