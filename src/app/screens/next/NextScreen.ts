import { FancyButton, Input } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { FillInput, Ticker } from "pixi.js";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { MainScreen } from "../main/MainScreen";
import { input, th } from "motion/react-client";
import { Label } from "../../ui/Label";
import { Spine } from "@esotericsoftware/spine-pixi-v8";


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


    //the visuals and its elements
    private card: Sprite

    private upButton: FancyButton;
    private downButton: FancyButton;
    private titleHigh: Text;
    private titleLow: Text;
    private highDes: Text;
    private lowDes: Text;

    private fancySkipButton: FancyButton;

    private profitBackground: Graphics;

    private pHigherTitle: Text;
    private pLowerTitle: Text;
    private pTotalTitle: Text;

    private pHigherBackground: Graphics;
    private pLowerBackground: Graphics;
    private pTotalBackground: Graphics;

    private pHigherText: Text;
    private pLowerText: Text;
    private pTotalText: Text;


    private testCard: Spine;

    constructor() {
        super();

        const { width, height } = engine().renderer.screen;
        const sprite = Sprite.from("input.png");

        //container for inputs and buttons
        this.boxContainer = new Container();
        this.addChild(this.boxContainer);

        //the grey box sidebar
        this.box = new Graphics().rect(0, 0, width / 4, height).fill("#444449");
        this.boxContainer.addChild(this.box);

        this.amountContainer = new Container();
        this.boxContainer.addChild(this.amountContainer);

        this.higherLowerContainer = new Container();
        this.boxContainer.addChild(this.higherLowerContainer);

        this.skipBetContainer = new Container();
        this.boxContainer.addChild(this.skipBetContainer);

        //title text
        this.title = new Label({
            text: "Amount",
            style: {
                fill: "#b2b2b2ff",
                fontSize: 40,
                fontFamily: "Arial",
            },
        });
        this.amountContainer.addChild(this.title);

        //input box (change the sprite width)
        sprite.width = this.box.width;
        this.inputBox = new Input(
            {
                bg: sprite,
                placeholder: "0",
                padding: 11,
                textStyle: { fill: 'white' },
            }
        );
        this.amountContainer.addChild(this.inputBox);

        //higher and lower buttons
        this.higherButton = new Button({
            text: "Higher or Equal",
            width: this.box.width / 2,
            height: 75,
        });
        this.higherLowerContainer.addChild(this.higherButton);

        this.lowerButton = new Button({
            text: "Lower or Equal",
            width: this.box.width / 2,
            height: 75,
        });
        this.higherLowerContainer.addChild(this.lowerButton);

        // skip and bet buttons
        this.skipButton = new Button({
            text: "Skip >>",
            width: this.box.width,
            height: 75,
        });
        this.skipBetContainer.addChild(this.skipButton);

        this.betButton = new Button({
            text: "Bet",
            width: this.box.width,
            height: 90,
        });
        this.skipBetContainer.addChild(this.betButton);

        //this container for the cards and stuff (also have the some buttons with the same function as the container above)
        this.fancyBoxContainer = new Container();
        this.addChild(this.fancyBoxContainer)

        //the rest of the background box (fancy box)
        this.fancyBox = new Graphics().rect(0, 0, width - this.box.width, height).fill("#5252daff");
        this.fancyBoxContainer.addChild(this.fancyBox);

        this.cardsContainer = new Container();
        this.fancyBoxContainer.addChild(this.cardsContainer);

        //card sprite
        this.card = Sprite.from("Card1.png");
        this.cardsContainer.addChild(this.card);

        //up-down buttons
        this.upButton = new FancyButton({
            defaultView: "high.png",
        });
        this.upButton.onPress.connect(() => { }//empty for now
        );
        this.cardsContainer.addChild(this.upButton);

        this.titleHigh = new Label({
            text: "Hi",
            style: {
                fill: "#b2b2b2ff",
                fontSize: 40,
                fontFamily: "Arial",
            }
        });
        this.cardsContainer.addChild(this.titleHigh);

        this.titleLow = new Label({
            text: "Lo",
            style: {
                fill: "#b2b2b2ff",
                fontSize: 40,
                fontFamily: "Arial",
            }
        });
        this.cardsContainer.addChild(this.titleLow);

        this.highDes = new Label({
            text: "Higher or equal",
            style: {
                fill: "#b2b2b2ff",
                fontSize: 30,
                fontFamily: "Arial",
            }
        });
        this.cardsContainer.addChild(this.highDes);

        this.lowDes = new Label({
            text: "Lower or equal",
            style: {
                fill: "#b2b2b2ff",
                fontSize: 30,
                fontFamily: "Arial",
            }
        });
        this.cardsContainer.addChild(this.lowDes);

        this.downButton = new FancyButton({
            defaultView: "low.png",
        });
        this.downButton.onPress.connect(() => { }//empty for now
        );
        this.cardsContainer.addChild(this.downButton);

        //"fancy" skip button
        this.fancySkipButton = new Button({
            text: "Skip",
            width: 150,
            height: 100,
        });
        this.fancySkipButton.onPress.connect(async () => {
            //nothing for now
        });
        this.cardsContainer.addChild(this.fancySkipButton);

        this.profitContainer = new Container();
        this.fancyBoxContainer.addChild(this.profitContainer);

        this.profitBackground = new Graphics().rect(0, 0, 300, 150).fill("#3c3c3cff");
        this.profitContainer.addChild(this.profitBackground);

        //profit description text
        this.pHigherTitle = new Label({
            text: "Profit Higher x",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
                align: "Left",
            }
        });
        this.profitContainer.addChild(this.pHigherTitle);

        this.pLowerTitle = new Label({
            text: "Profit Lower x",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
                align: "Left",
            }
        });
        this.profitContainer.addChild(this.pLowerTitle);

        this.pTotalTitle = new Label({
            text: "Total Profit x",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
                align: "Left",
            }
        });
        this.profitContainer.addChild(this.pTotalTitle);

        //profit stuff backgrounds
        this.pHigherBackground = new Graphics().rect(0, 0, 250, 50).fill("#5c5c5cff");
        this.profitContainer.addChild(this.pHigherBackground);

        this.pLowerBackground = new Graphics().rect(0, 0, 250, 50).fill("#5c5c5cff");
        this.profitContainer.addChild(this.pLowerBackground);

        this.pTotalBackground = new Graphics().rect(0, 0, 250, 50).fill("#5c5c5cff");
        this.profitContainer.addChild(this.pTotalBackground);

        //profit texts
        this.pHigherText = new Label({
            text: "0.00",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
            }
        });
        this.profitContainer.addChild(this.pHigherText);

        this.pLowerText = new Label({
            text: "0.00",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
            }
        });
        this.profitContainer.addChild(this.pLowerText);

        this.pTotalText = new Label({
            text: "0.00",
            style: {
                fill: "#a0a0a0ff",
                fontSize: 25,
                fontFamily: "Arial",
            }
        });
        this.profitContainer.addChild(this.pTotalText);


        this.testCard = Spine.from({ atlas: 'card.atlas', skeleton: 'card.skel' });
        this.fancyBoxContainer.addChild(this.testCard);

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
        this.layoutSidebar(sidebarWidth, sidebarHeight, padding);
        this.layoutFancyBox(fancyWidth, fancyHeight, padding);

        //profit container
        this.profitBackground.setSize(this.cardsContainer.width, this.cardsContainer.height / 4);

        this.SetPositionTo(this.profitContainer, this.cardsContainer.x - this.cardsContainer.width / 2);
        this.placeBelow(this.profitContainer, this.cardsContainer, padding * 4, false);

        //profit stuff
        this.pHigherBackground.width = this.pLowerBackground.width = this.pTotalBackground.width = this.profitBackground.width / 3 - padding * 1.3;

        this.pHigherBackground.x = padding;
        this.pLowerBackground.x = this.pHigherBackground.x + this.pHigherBackground.width + padding;
        this.pTotalBackground.x = this.pLowerBackground.x + this.pLowerBackground.width + padding;

        this.pHigherBackground.y = this.pLowerBackground.y = this.pTotalBackground.y = this.profitBackground.height - this.pTotalBackground.height - padding;

        //profit title
        this.pHigherTitle.x = this.pHigherBackground.x + this.pHigherTitle.width / 2;
        this.pHigherTitle.y = this.pHigherBackground.y - this.pHigherTitle.height / 2;

        this.pLowerTitle.x = this.pLowerBackground.x + this.pLowerTitle.width / 2;
        this.pLowerTitle.y = this.pLowerBackground.y - this.pLowerTitle.height / 2;

        this.pTotalTitle.x = this.pTotalBackground.x + this.pTotalTitle.width / 2;
        this.pTotalTitle.y = this.pTotalBackground.y - this.pTotalTitle.height / 2;

        //profit texts positioning
        this.pHigherText.x = this.pHigherBackground.x + this.pHigherText.width / 2 + padding * 0.5;
        this.pHigherText.y = this.pHigherBackground.y + this.pHigherBackground.height - padding * 1.5;

        this.pLowerText.x = this.pLowerBackground.x + this.pLowerText.width / 2 + padding * 0.5;
        this.pLowerText.y = this.pLowerBackground.y + this.pLowerBackground.height - padding * 1.5;

        this.pTotalText.x = this.pTotalBackground.x + this.pTotalText.width / 2 + padding * 0.5;
        this.pTotalText.y = this.pTotalBackground.y + this.pTotalBackground.height - padding * 1.5;


        this.backButton.x = 100; this.backButton.y = height - 50;
    }

    private layoutSidebar(sidebarWidth: number, sidebarHeight: number, padding: number) {
        // --- amount container ---
        this.SetPositionTo(this.title, this.title.width / 2 + padding);
        this.title.y = this.title.height / 2 + padding;

        this.scaleToWidth(this.inputBox, sidebarWidth - padding * 2, false);
        this.centerX(this.inputBox, sidebarWidth);
        this.placeBelow(this.inputBox, this.title, 0 - padding);

        // --- higher/lower container ---
        this.scaleToWidth(this.higherButton, sidebarWidth / 2.25 - padding);
        this.SetPositionTo(this.higherButton, this.higherButton.width / 2 + padding);
        this.higherButton.y = 0;

        this.scaleToWidth(this.lowerButton, sidebarWidth / 2.25 - padding);
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
            this.higherLowerContainer.y + this.higherLowerContainer.height + padding * 2;
    }

    private layoutFancyBox(fancyWidth: number, fancyHeight: number, padding: number) {
        // --- main cards container ---
        this.centerX(this.cardsContainer, fancyWidth, 0, false);
        this.centerY(this.cardsContainer, fancyHeight + 150);
        this.cardsContainer.y -= 150; // intentional visual offset upward

        // --- main card ---
        this.card.scale.set(5);
        this.centerX(this.card, 0); // since its parent (cardsContainer) is centered, use 0 as reference
        this.centerY(this.card, 0);

        // --- fancy skip button ---
        this.fancySkipButton.width = this.card.width / 1.5 + padding;
        this.fancySkipButton.x = this.card.x + this.card.width / 2;
        this.fancySkipButton.y = this.card.y + this.card.height;

        // --- up / down buttons ---
        this.upButton.scale.set(0.75);
        this.downButton.scale.set(0.75);

        const horizontalOffset = this.card.width / 2 + padding * 4;
        this.upButton.x = -this.upButton.width - horizontalOffset;
        this.downButton.x = horizontalOffset;
        this.upButton.y = this.downButton.y = -this.downButton.height / 2;

        // --- titles for up / down buttons ---
        this.titleHigh.x = this.upButton.x + this.upButton.width / 2;
        this.titleLow.x = this.downButton.x + this.downButton.width / 2;
        this.titleHigh.y = this.upButton.y + this.upButton.height / 2 + padding;
        this.titleLow.y = this.downButton.y + this.downButton.height / 2 - padding;

        // --- descriptions ---
        this.highDes.x = this.upButton.x + this.upButton.width / 2;
        this.lowDes.x = this.downButton.x + this.downButton.width / 2;

        this.highDes.y = this.upButton.y + this.upButton.height + padding * 2;
        this.lowDes.y = this.downButton.y - padding * 2;
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

    private SetPositionTo(element: any, padding: number = 0) {
        element.x = padding;
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

        let finalPromise!: AnimationPlaybackControls;
        for (const element of elementsToAnimate) {
            element.alpha = 0;
            finalPromise = animate(
                element,
                { alpha: 1 },
                { duration: 0.3, delay: 0.75, ease: "backOut" },
            );
        }

        await finalPromise;
    }
}
