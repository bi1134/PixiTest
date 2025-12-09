import { Container } from "pixi.js";
import { engine } from "../../getEngine";
import { ResultPopup } from "../../popups/ResultPopup";
import { Button } from "../../ui/Button";
import { CardSuit } from "../../ui/Card";
import { MainScreen } from "../main/MainScreen";
import { MobileLayout } from "./MobileLayout"; // Updated import
import { Input } from "@pixi/ui";
import { GameState, GuessAction, GuessResult } from "./types/GameTypes";

export class NextScreenMobile extends Container {
    public static assetBundles = ["main"];

    public layout!: MobileLayout; // Renamed for clarity

    private currentState: GameState = GameState.NonBetting;

    constructor() {
        super();

        const { width, height } = engine().renderer.screen;

        this.layout = new MobileLayout(width, height);
        this.addChild(this.layout);

        // --- Setup Event Listeners ---
        this.setupEvents();

        this.EnterBettingState();
        this.resize(width, height);
    }


    private setupEvents() {
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
    }

    private betButtonIsCashOut(): boolean {
        return this.layout.betButton.text === "Cash Out";
    }

    private HigherButton() {
        this.EvaluateGuess(GuessAction.Higher);
    }

    private LowerButton() {
        this.EvaluateGuess(GuessAction.Lower);
    }

    private SkipButton() {
        this.EvaluateGuess(GuessAction.Skip);
    }

    //#region guessing logic
    private EvaluateGuess(action: GuessAction) {
        const prevRank = this.layout.currentCard.rank;
        const prevNumeric = this.layout.currentCard.GetNumericValue();

        // --- Generate the next card ---
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

        const nextRank = ranks[Math.floor(Math.random() * ranks.length)];
        const nextSuit = suits[Math.floor(Math.random() * suits.length)];
        const nextNumeric = ranks.indexOf(nextRank);

        let result: GuessResult = GuessResult.Lose;

        // --- Evaluate the guess ---
        switch (action) {
            case GuessAction.Skip:
                result = GuessResult.Skip;
                this.layout.currentCard.SetValue(nextRank, nextSuit);
                break;

            case GuessAction.Higher:
                if (nextNumeric >= prevNumeric) {
                    result = GuessResult.Win;
                    this.layout.currentCard.SetValue(nextRank, nextSuit);
                } else {
                    result = GuessResult.Lose;
                    this.layout.currentCard.SetValue(nextRank, nextSuit);
                    this.EnterBettingState();
                }
                break;

            case GuessAction.Lower:
                if (nextNumeric <= prevNumeric) {
                    result = GuessResult.Win;
                    this.layout.currentCard.SetValue(nextRank, nextSuit);
                } else {
                    result = GuessResult.Lose;
                    this.layout.currentCard.SetValue(nextRank, nextSuit);
                    this.EnterBettingState();
                }
                break;
        }

        // if win then can cash out now
        if (result === GuessResult.Win) {
            this.enableButton(this.layout.betButton);
            this.layout.betButton.text = "Cash Out";
        }
        // --- Add the NEW current card (after pressing button) to history ---
        this.layout.cardHistoryLayout.addCardToHistory(this.layout.currentCard.rank, this.layout.currentCard.suit, action, 8, 4);

        console.log(`Prev: ${prevRank}, Next: ${nextRank}, Guess: ${action}, Result: ${result}`);
    }

    private EnterNonBettingState() {
        this.currentState = GameState.NonBetting;

        console.log(this.layout.inputBox.value);

        //clear card history
        this.layout.cardHistoryLayout.clearHistory();

        //prepare for new round
        if (!this.layout.cardsContainer.children.includes(this.layout.currentCard)) {
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

        this.layout.cardHistoryLayout.addCardToHistory(this.layout.currentCard.rank, this.layout.currentCard.suit, GuessAction.Start, 8, 4);

        //input and buttons
        this.layout.inputBox.interactive = false;
        this.layout.betButton.text = "Cash Out";
        this.disableButton(this.layout.betButton); // Cannot cash out immediately on start

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

        this.disableButton(this.layout.upButton);
        this.disableButton(this.layout.downButton);
        this.layout.fancySkipButton.interactive = false;


        console.log("Entered Betting State");
    }

    //#endregion

    private CashOut() {
        const multiplier = 6.5; // example
        const base = parseFloat(this.layout.inputBox.value) || 0.02;

        engine().navigation.presentPopup(ResultPopup, (popup) => {
            (popup as ResultPopup).setResult(multiplier, base);
        });

        // Show back of card
        if (this.layout.currentCard.parent) {
            this.layout.currentCard.parent.removeChild(this.layout.currentCard);
        }

        this.EnterBettingState();
    }

    private ValidateInput() {
        let val = parseFloat(this.layout.inputBox.value);

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

    public resize(width: number, height: number) {
        // Mobile layout takes full screen
        const padding = width * 0.02;

        this.layout.resize(width, height, padding);
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
