import { FancyButton, Input } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { FillInput, Ticker } from "pixi.js";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { ResultPopup } from "../../popups/ResultPopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { MainScreen } from "../main/MainScreen";
import { input, th } from "motion/react-client";
import { Label } from "../../ui/Label";

import { ProfitItem } from "./ProfitItem";
import { Card } from "../../ui/Card";
import { CardHistoryItem } from "../../ui/CardHistoryItem";
import { Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';


export class NextScreen extends Container {
    public static assetBundles = ["main"];
    //the left sidebar container and its elements
    private boxContainer: Container;
    private amountContainer: Container;
    private higherLowerContainer: Container;
    private skipBetContainer: Container;

    private box: Graphics;
    private fancyBox: Graphics;

    private title: Text;
    private inputBox: Input;

    private higherButton: FancyButton;
    private lowerButton: FancyButton;

    private skipButton: FancyButton;
    private betButton: FancyButton;

    private backButton: FancyButton;

    //the right fancy container and its elements
    private fancyBoxContainer: Container;
    private cardsContainer: Container;
    private profitContainer: Container;
    private cardsHistoryContainer: Container;

    //the visuals and its elements
    private currentCard: Card;
    private backCard: Sprite;

    private upButton: FancyButton;
    private downButton: FancyButton;
    private titleHigh: Text;
    private titleLow: Text;
    private highDes: Text;
    private lowDes: Text;

    private fancySkipButton: FancyButton;

    private profitBackground: Graphics;

    private pHigherItem: ProfitItem;
    private pLowerItem: ProfitItem;
    private pTotalItem: ProfitItem;

    private cardsHistoryBackground: Graphics;

    private cardHistory: CardHistoryItem[] = [];

    private currentState: GameState.NonBetting;

    constructor() {
        super();

        const { width, height } = engine().renderer.screen;

        // --- create main sections ---
        this.CreateSidebar(width, height);
        this.CreateFancyBox(width, height);
        this.CreateProfitContainer();
        this.CreateCardsHistoryContainer();

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

        this.EnterBettingState();
    }

    private CreateSidebar(width: number, height: number) {
        this.boxContainer = new Container();
        this.addChild(this.boxContainer);

        this.box = new Graphics().rect(0, 0, width / 4, height).fill("#444449");
        this.boxContainer.addChild(this.box);

        // amount section
        this.amountContainer = new Container();
        this.boxContainer.addChild(this.amountContainer);

        //the input box
        const sprite = Sprite.from("input.png");
        sprite.width = this.box.width;

        this.title = new Label({
            text: "Amount",
            style: { fill: "#b2b2b2ff", fontSize: 35, fontFamily: "Arial" },
        });
        this.amountContainer.addChild(this.title);

        this.inputBox = new Input({
            bg: sprite,
            placeholder: "0.02",
            padding: 11,
            textStyle: { fill: 'white' },
            cleanOnFocus: true
        });
        this.amountContainer.addChild(this.inputBox);

        // set the default value initially
        this.inputBox.value = "0.02";

        this.inputBox.onEnter.connect(() => {
            this.ValidateInput();
        });
        // buttons
        this.higherLowerContainer = new Container();
        this.boxContainer.addChild(this.higherLowerContainer);

        this.higherButton = new Button({ text: "Higher or Equal \n 111%", width: this.box.width / 2, height: 75 });
        this.lowerButton = new Button({ text: "Lower or Equal \n 111%", width: this.box.width / 2, height: 75 });

        this.higherButton.onPress.connect(() => this.HigherButton());
        this.lowerButton.onPress.connect(() => this.LowerButton());
        this.higherLowerContainer.addChild(this.higherButton, this.lowerButton);

        this.skipBetContainer = new Container();
        this.boxContainer.addChild(this.skipBetContainer);

        this.skipButton = new Button({ text: "Skip >>", width: this.box.width, height: 75 });

        this.skipButton.onPress.connect(() => this.SkipButton());

        this.betButton = new Button({ text: "Bet", width: this.box.width, height: 90 });

        this.betButton.onPress.connect(() => {
            if (this.currentState === GameState.Betting) {
                this.EnterNonBettingState(); // start playing
            } else if (this.currentState === GameState.NonBetting) {
                this.CashOut();
            }
        });

        this.skipBetContainer.addChild(this.skipButton, this.betButton);

    }

    private CreateFancyBox(width: number, height: number) {
        this.fancyBoxContainer = new Container();
        this.addChild(this.fancyBoxContainer);

        this.fancyBox = new Graphics().rect(0, 0, width - width / 4, height).fill("#5252daff");
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

        this.upButton.onPress.connect(() => this.HigherButton());
        this.downButton.onPress.connect(() => this.LowerButton());

        this.cardsContainer.addChild(this.upButton, this.downButton);

        // --- labels and descriptions ---
        this.titleHigh = new Label({ text: "Hi", style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" } });
        this.titleLow = new Label({ text: "Lo", style: { fill: "#b2b2b2ff", fontSize: 40, fontFamily: "Arial" } });
        this.cardsContainer.addChild(this.titleHigh, this.titleLow);

        this.highDes = new Label({ text: "Higher or equal", style: { fill: "#b2b2b2ff", fontSize: 30, fontFamily: "Arial" } });
        this.lowDes = new Label({ text: "Lower or equal", style: { fill: "#b2b2b2ff", fontSize: 30, fontFamily: "Arial" } });
        this.cardsContainer.addChild(this.highDes, this.lowDes);

        this.fancySkipButton = new Button({ text: "Skip", width: 150, height: 100 });
        this.fancySkipButton.onPress.connect(() => this.SkipButton());
        this.cardsContainer.addChild(this.fancySkipButton);
    }

    private CreateProfitContainer() {
        this.profitContainer = new Container();
        this.fancyBoxContainer.addChild(this.profitContainer);

        this.profitBackground = new Graphics().rect(0, 0, 300, 150).fill("#3c3c3cff");
        this.profitContainer.addChild(this.profitBackground);

        // reusable ProfitItem components
        this.pHigherItem = new ProfitItem("Profit Higher x");
        this.pLowerItem = new ProfitItem("Profit Lower x");
        this.pTotalItem = new ProfitItem("Total Profit x");

        this.profitContainer.addChild(this.pHigherItem, this.pLowerItem, this.pTotalItem);
    }

    private CreateCardsHistoryContainer() {
        this.cardsHistoryContainer = new Container();
        this.fancyBoxContainer.addChild(this.cardsHistoryContainer);

        // --- background box ---
        this.cardsHistoryBackground = new Graphics()
            .rect(0, 0, 300, 150)
            .fill("#3c3c3cff");
        this.cardsHistoryContainer.addChild(this.cardsHistoryBackground);

        // --- create mask for the visible region ---
        this.cardsHistoryMask = new Graphics()
            .rect(
                this.cardsHistoryBackground.x,
                this.cardsHistoryBackground.y,
                this.cardsHistoryBackground.width,
                this.cardsHistoryBackground.height
            )
            .fill(0xffffff); // fill color doesn't matter, mask only uses alpha
        this.cardsHistoryContainer.addChild(this.cardsHistoryMask);

        this.cardsHistoryContainer.mask = this.cardsHistoryMask;
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

    private EvaluateGuess(action: GuessAction) {
        const prevRank = this.currentCard.rank;
        const prevNumeric = this.currentCard.GetNumericValue();

        // --- Generate the next card ---
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

        const nextRank = ranks[Math.floor(Math.random() * ranks.length)];
        const nextSuit = suits[Math.floor(Math.random() * suits.length)];
        const nextNumeric = ranks.indexOf(nextRank);

        let result: GuessResult.Win | GuessResult.Lose | GuessResult.Skip;

        // --- Evaluate the guess ---
        switch (action) {
            case GuessAction.Skip:
                result = GuessResult.Skip;
                this.currentCard.SetValue(nextRank, nextSuit);
                break;

            case GuessAction.Higher:
                if (nextNumeric >= prevNumeric) {
                    result = GuessResult.Win;
                    this.currentCard.SetValue(nextRank, nextSuit);
                } else {
                    result = GuessResult.Lose;
                    this.currentCard.SetValue(nextRank, nextSuit);
                    this.EnterBettingState();
                }
                break;

            case GuessAction.Lower:
                if (nextNumeric <= prevNumeric) {
                    result = GuessResult.Win;
                    this.currentCard.SetValue(nextRank, nextSuit);
                } else {
                    result = GuessResult.Lose;
                    this.currentCard.SetValue(nextRank, nextSuit);
                    this.EnterBettingState();
                }
                break;
        }

        // if win then can cash out now
        if (result === GuessResult.Win) {
            this.enableButton(this.betButton);
        }
        // --- Add the NEW current card (after pressing button) to history ---
        this.AddCardToHistory(this.currentCard.rank, this.currentCard.suit, action);

        console.log(`Prev: ${prevRank}, Next: ${nextRank}, Guess: ${action}, Result: ${result}`);
    }

    private AddCardToHistory(value: string, suit: string, action: GuessAction) {
        const padding = 8; // smaller gap looks cleaner
        const item = new CardHistoryItem(value, suit, action);

        // resize card to fit history background height
        item.ResizeToFit(this.cardsHistoryBackground.height, padding);

        // --- Horizontal placement ---
        const index = this.cardHistory.length;

        // start at left padding + previous cards’ total width
        const prevItem = this.cardHistory[index - 1];
        if (prevItem) {
            item.x = prevItem.x + prevItem.width - padding;
        } else {
            item.x = padding; // first card starts a bit from the left
        }

        // --- Vertical centering ---
        item.y =
            this.cardsHistoryBackground.y +
            this.cardsHistoryBackground.height / 2 - item.height / 2;

        this.cardsHistoryContainer.addChild(item);
        this.cardHistory.push(item);

        // --- Auto scroll when overflow ---
        const totalWidth = item.x + item.widthScaled + padding;
        const maxVisibleWidth = this.cardsHistoryBackground.width - padding * 5;

        if (totalWidth > maxVisibleWidth) {
            const overflow = totalWidth - maxVisibleWidth;
            for (const card of this.cardHistory) {
                card.x -= overflow;
            }
        }
    }

    private EnterNonBettingState() {
        this.currentState = GameState.NonBetting;

        console.log(this.inputBox.value);

        //clear card history
        for (const item of this.cardHistory) {
            item.destroy();
        }
        this.cardHistory.length = 0;

        //prepare for new round
        if (!this.cardsContainer.children.includes(this.currentCard)) {
            this.cardsContainer.addChild(this.currentCard);
            this.cardsContainer.setChildIndex(this.fancySkipButton, this.cardsContainer.children.length - 1);
        }
        // --- randomize the starting card (rank + suit) ---
        this.currentCard.RandomizeValue();

        this.AddCardToHistory(this.currentCard.rank, this.currentCard.suit, GuessAction.Start);

        //input and buttons
        this.inputBox.interactive = false;
        this.disableButton(this.betButton);
        this.betButton.text = "Cash Out";

        // Disable in-game action buttons
        this.enableButton(this.higherButton);
        this.enableButton(this.lowerButton);
        this.enableButton(this.skipButton);

        this.enableButton(this.upButton);
        this.enableButton(this.downButton);
        this.enableButton(this.fancySkipButton);

        console.log("Entered Non Betting State");
    }

    private EnterBettingState() {
        this.currentState = GameState.Betting;

        // Enable input again for new round
        this.inputBox.interactive = true;

        this.enableButton(this.betButton);
        this.betButton.text = "Bet";

        // Disable in-game action buttons
        this.disableButton(this.higherButton);
        this.disableButton(this.lowerButton);
        this.disableButton(this.skipButton);

        this.disableButton(this.upButton);
        this.disableButton(this.downButton);
        this.fancySkipButton.interactive = false;

        console.log("Entered Betting State");
    }

    private CashOut() {
        const multiplier = 6.5; // example
        const base = parseFloat(this.inputBox.value) || 0.02;

        engine().navigation.presentPopup(ResultPopup, (popup) => {
            (popup as ResultPopup).setResult(multiplier, base);
        });

        this.EnterBettingState();
    }

    private ValidateInput() {
        let val = parseFloat(this.inputBox.value);

        // reset invalid or below-zero values
        if (isNaN(val) || val <= 0) {
            this.inputBox.value = "0.02";
            return;
        }

        // optionally clamp decimals
        this.inputBox.value = val.toFixed(2);
    }


    public prepare() { }

    public reset() { }

    public resize(width: number, height: number) {
        const sidebarWidth = width / 4;
        const sidebarHeight = height;
        const fancyWidth = width - sidebarWidth;
        const fancyHeight = height;
        const padding = sidebarWidth * 0.02;

        // sidebar box
        this.box.setSize(sidebarWidth, sidebarHeight);

        // fancy box background
        this.fancyBox.setSize(fancyWidth, fancyHeight);
        this.fancyBox.x = 0;
        this.fancyBox.y = 0;

        this.fancyBoxContainer.x = sidebarWidth; // start right after sidebar
        this.fancyBoxContainer.y = 0;

        // layout sections
        this.SideBarLayout(sidebarWidth, sidebarHeight, padding);
        this.FancyBoxLayout(fancyWidth, fancyHeight, padding);
        this.ProfitItemsLayout(padding);
        this.CardHistoryLayout(padding);

        this.backButton.x = 100; this.backButton.y = height - 50;
    }

    private SideBarLayout(sidebarWidth: number, sidebarHeight: number, padding: number) {
        // --- amount container ---
        this.SetPositionTo(this.title, this.title.width / 2 + padding);
        this.title.y = this.title.height / 2 + padding;

        this.scaleToWidth(this.inputBox, sidebarWidth - padding * 2, false);
        this.centerX(this.inputBox, sidebarWidth);
        this.placeBelow(this.inputBox, this.title, 0 - padding);

        // --- higher/lower container ---
        this.scaleToWidth(this.higherButton, sidebarWidth / 2.25 - padding);
        this.higherButton.height = this.inputBox.height * 1.75;
        this.SetPositionTo(this.higherButton, this.higherButton.width / 2 + padding);
        this.higherButton.y = 0;

        this.scaleToWidth(this.lowerButton, sidebarWidth / 2.25 - padding);
        this.lowerButton.height = this.inputBox.height * 1.75;
        this.SetPositionTo(this.lowerButton, sidebarWidth - this.lowerButton.width / 2 - padding);
        this.lowerButton.y = 0;

        // --- skip/bet container ---
        this.scaleToWidth(this.skipButton, sidebarWidth + padding * 2, false);
        this.scaleToWidth(this.betButton, sidebarWidth + padding * 2, false);
        this.centerX(this.skipButton, sidebarWidth, 0, false);
        this.centerX(this.betButton, sidebarWidth, 0, false);
        this.skipButton.y = - padding;
        this.placeBelow(this.betButton, this.skipButton, padding);

        // --- container positioning ---
        this.amountContainer.x = 0;
        this.amountContainer.y = 0;

        this.higherLowerContainer.x = 0;
        this.higherLowerContainer.y =
            this.amountContainer.y + this.amountContainer.height + this.higherLowerContainer.height / 2 + padding * 2;

        this.skipBetContainer.x = 0;
        this.skipBetContainer.y =
            this.higherLowerContainer.y + this.higherLowerContainer.height;
    }

    private FancyBoxLayout(fancyWidth: number, fancyHeight: number, padding: number) {
        // --- main cards container ---
        this.centerX(this.cardsContainer, fancyWidth, 0, false);
        this.centerY(this.cardsContainer, fancyHeight + 150);
        this.cardsContainer.y -= 150; // intentional upward offset

        // --- main card ---
        this.currentCard.setBaseScale(3);

        this.backCard.scale.set(3);
        this.centerX(this.backCard, 0); // since parent is centered
        this.centerY(this.backCard, 0);

        // --- fancy skip button ---
        this.scaleToWidth(this.fancySkipButton, this.currentCard.width / 1.5 + padding, false);
        this.SetPositionTo(this.fancySkipButton, this.currentCard.x + this.currentCard.width / 2);

        this.scaleToWidth(this.fancySkipButton, this.backCard.width / 1.5 + padding, false);
        this.SetPositionTo(this.fancySkipButton, this.backCard.x + this.backCard.width / 2);
        this.placeBelow(this.fancySkipButton, this.backCard, 0, true);

        // --- up / down buttons ---
        this.upButton.scale.set(0.75);
        this.downButton.scale.set(0.75);

        const horizontalOffset = this.backCard.width / 2 + padding * 4;
        this.SetPositionTo(this.upButton, -this.upButton.width - horizontalOffset);
        this.SetPositionTo(this.downButton, horizontalOffset);
        this.upButton.y = this.downButton.y = -this.downButton.height / 2;

        // --- titles for up / down buttons ---
        this.SetPositionTo(this.titleHigh, this.upButton.x + this.upButton.width / 2);
        this.SetPositionTo(this.titleLow, this.downButton.x + this.downButton.width / 2);

        this.titleHigh.y = this.upButton.y + this.upButton.height / 2 + padding;
        this.titleLow.y = this.downButton.y + this.downButton.height / 2 - padding;

        // --- descriptions ---
        this.SetPositionTo(this.highDes, this.upButton.x + this.upButton.width / 2);
        this.SetPositionTo(this.lowDes, this.downButton.x + this.downButton.width / 2);

        this.highDes.y = this.upButton.y + this.upButton.height + padding * 2;
        this.lowDes.y = this.downButton.y - padding * 2;
    }

    private ProfitItemsLayout(padding: number) {
        // --- Profit container positioning ---
        this.profitBackground.setSize(this.cardsContainer.width, this.cardsContainer.height / 5);

        this.SetPositionTo(this.profitContainer, this.cardsContainer.x - this.cardsContainer.width / 2);
        this.placeBelow(this.profitContainer, this.cardsContainer, padding * 4, false);

        // --- Profit item setup ---
        const itemWidth = this.profitBackground.width / 3 - padding * 1.3;

        // Resize each internal profit item
        this.pHigherItem.resize(itemWidth);
        this.pLowerItem.resize(itemWidth);
        this.pTotalItem.resize(itemWidth);

        // Position horizontally (anchored left → center → right)
        this.SetPositionTo(this.pHigherItem, padding);
        this.SetPositionTo(this.pLowerItem, this.pHigherItem.x + itemWidth + padding);
        this.SetPositionTo(this.pTotalItem, this.pLowerItem.x + itemWidth + padding);

        // Align vertically inside background
        const baseY = this.profitBackground.height - this.pHigherItem.getHeight() / 2 - padding * 1.5;
        this.pHigherItem.y = this.pLowerItem.y = this.pTotalItem.y = baseY;
    }

    private CardHistoryLayout(padding: number) {
        // --- Resize and position background ---
        this.cardsHistoryBackground.setSize(this.cardsContainer.width, this.cardsContainer.height / 2);

        this.SetPositionTo(this.cardsHistoryContainer, this.cardsContainer.x - this.cardsContainer.width / 2);
        this.placeBelow(this.cardsHistoryContainer, this.profitContainer, padding, true);

        // --- Update mask to match background ---
        this.cardsHistoryMask.clear()
            .rect(
                this.cardsHistoryBackground.x,
                this.cardsHistoryBackground.y,
                this.cardsHistoryBackground.width,
                this.cardsHistoryBackground.height
            )
            .fill(0xffffff);
    }

    // --- layout helpers ---
    private centerX(element: any, containerWidth: number, padding: number = 0, conddition: boolean = true) {
        if (conddition) {
            element.x = containerWidth / 2 - element.width / 2 - padding;
        }
        else {
            element.x = containerWidth / 2;
        }
    }

    private centerY(element: any, containerHeight: number) {
        element.y = containerHeight / 2 - element.height / 2;
    }

    private placeBelow(target: any, reference: any, padding: number, condition: boolean = true) {
        if (condition)
            target.y = reference.y + reference.height + padding;
        else
            target.y = reference.y + reference.height / 2 + padding;
    }

    private SetPositionTo(element: any, x: number) {
        element.x = x;
    }

    // Optional aliases — just for readability
    private anchorLeft(element: any, padding: number = 0) {
        this.SetPositionTo(element, padding);
    }

    private anchorRight(element: any, containerWidth: number, padding: number = 0) {
        this.SetPositionTo(element, containerWidth - element.width - padding);
    }

    private scaleToWidth(element: any, width: number, maintainAspect = true) {
        if (maintainAspect) {
            // Cache the original width the first time
            if (!element._originalWidth) {
                element._originalWidth = element.width;
            }

            const ratio = width / element._originalWidth;
            element.scale.set(ratio);
        } else {
            element.width = width;
        }
    }

    public async show(): Promise<void> {
        engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

        const elementsToAnimate = [
            this.inputBox,
            this.higherButton,
            this.lowerButton,
            this.backButton,
            this.skipButton,
            this.betButton,
        ];

    }


    private disableButton(button: FancyButton) {
        button.interactive = false;
        button.alpha = 0.5; // visually indicate disabled state
    }

    private enableButton(button: FancyButton) {
        button.interactive = true;
        button.alpha = 1; // reset to normal opacity
    }


}
export enum GuessAction {
    Higher = "Higher",
    Lower = "Lower",
    Skip = "Skip",
    Start = "Start",
}

export enum GuessResult {
    Win = "Win",
    Lose = "Lose",
    Skip = "Skip",
}

export enum GameState {
    NonBetting = "NonBetting",
    Betting = "Betting",
}
