import { FancyButton, Input } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { FillInput, Ticker } from "pixi.js";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";

import { MainScreen } from "../main/MainScreen";
import { input, th } from "motion/react-client";
import { Label } from "../../ui/Label";


export class NextScreen extends Container {
    public static assetBundles = ["main"];
    private boxContainer: Container;
    private amountContainer: Container;
    private higherLowerContainer: Container;
    private skipBetContainer: Container;

    private fancyBoxContainer: Container;

    private box: Graphics;

    private title: Text;
    private inputBox: Input;

    private higherButton: FancyButton;
    private lowerButton: FancyButton;

    private skipButton: FancyButton;
    private betButton: FancyButton;

    private backButton: FancyButton;

    private highButton: FancyButton;
    private lowButton: FancyButton;

    constructor() {
        super();

        const { width, height } = engine().renderer.screen;
        const sprite = Sprite.from("input.png");

        //container for inputs and buttons
        this.boxContainer = new Container();
        this.addChild(this.boxContainer);

        //the grey box background
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

        this.highButton = new FancyButton({
            defaultView: "high.png",
        });
        this.highButton.onPress.connect(() => { }//empty for now
        );
        this.fancyBoxContainer.addChild(this.highButton);

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

        this.box.setSize(width / 4, height);
        const containerWidth = this.box.width;
        const containerHeight = this.box.height;

        const padding = 10;

        //container on the left for the buttons and input box
        this.boxContainer.x = 0;
        this.boxContainer.y = 0;

        //container positioning
        this.amountContainer.x = this.boxContainer.x;
        this.amountContainer.y = this.boxContainer.y;

        this.higherLowerContainer.x = this.boxContainer.x;
        this.higherLowerContainer.y = this.amountContainer.y + this.amountContainer.height * 2 + padding;

        this.skipBetContainer.x = containerWidth / 2;
        this.skipBetContainer.y = this.higherLowerContainer.y - this.higherLowerContainer.height + padding;

        //amount text
        this.title.x = this.amountContainer.x + this.title.width / 2 + padding;
        this.title.y = this.amountContainer.y + this.title.height / 2 + padding;

        //input box
        this.inputBox.width = containerWidth - 2 * padding;
        this.inputBox.x = containerWidth / 2 - this.inputBox.width / 2;
        this.inputBox.y = this.title.y + this.title.height - padding / 2;

        //higher and lower button
        this.higherButton.width = containerWidth / 2;
        this.lowerButton.width = containerWidth / 2;

        this.higherButton.x = this.higherLowerContainer.x + this.higherButton.width / 2 + padding;
        this.lowerButton.x = this.higherLowerContainer.x + containerWidth - this.lowerButton.width / 2 - padding;

        //skip and bet buttons
        this.skipButton.width = containerWidth + 2 * padding;
        this.betButton.width = containerWidth + 2 * padding;

        this.skipButton.y = this.skipBetContainer.y;
        this.betButton.y = this.skipBetContainer.y + this.skipButton.height + padding;

        this.backButton.x = 100;
        this.backButton.y = height - 50;

        //fancy box container
        this.fancyBoxContainer.x = this.box.width;
        this.fancyBoxContainer.y = 0;

        this.fancyBoxContainer.width = width - this.box.width;
        this.fancyBoxContainer.height = containerHeight;

        this.highButton.scale = 0.15;
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
