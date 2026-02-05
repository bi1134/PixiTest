import { FancyButton } from "@pixi/ui";
import { Container, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { BitmapLabel } from "../../ui/BitmapLabel";
import { Card, CardSuit } from "../../ui/Card";
import { CustomButton } from "../../ui/CustomButton";
import { LayoutHelper } from "../../utils/LayoutHelper";
import { CardHistoryLayout } from "../../screens/next/layout/CardHistoryLayout";
import { NextMultiplierBoard } from "../../ui/NextMultiplierBoard";

export class GameLogic extends Container {
    public cardsContainer: Container;
    public buttonsContainer: Container;
    public currentCard: Card;
    public backCard: Sprite;
    public cardPlaceHolder: Sprite;

    public upButton: FancyButton;
    public downButton: FancyButton;

    public titleHigh: BitmapLabel;
    public titleLow: BitmapLabel;
    public highDes: BitmapLabel;
    public lowDes: BitmapLabel;

    public highIcon: Sprite;
    public lowIcon: Sprite;

    public fancySkipButton: CustomButton;
    private skipButtonText: Sprite;
    public cardHistoryLayout: CardHistoryLayout;
    public multiplierBoard: NextMultiplierBoard;

    constructor() {
        super();

        this.multiplierBoard = new NextMultiplierBoard();
        this.addChild(this.multiplierBoard);

        this.cardsContainer = new Container();
        this.addChild(this.cardsContainer);

        this.buttonsContainer = new Container();
        this.addChild(this.buttonsContainer);

        // --- create the card ---
        this.currentCard = new Card();

        this.backCard = Sprite.from("card-back.png");
        this.cardsContainer.addChild(this.backCard);

        this.cardPlaceHolder = Sprite.from("opened-card-area.png");
        //this.cardsContainer.addChild(this.cardPlaceHolder);

        // --- create the buttons ---
        this.upButton = new FancyButton({ defaultView: "Button-high.png" });
        this.downButton = new FancyButton({ defaultView: "Button-low.png" });

        this.buttonsContainer.addChild(this.upButton, this.downButton);

        // --- labels and descriptions ---
        this.titleHigh = new BitmapLabel({
            text: "Hi",
            style: { tint: 0xb2b2b2, fontSize: 20, fontFamily: "coccm-bitmap-3-normal", letterSpacing: -2 },
        });
        this.titleLow = new BitmapLabel({
            text: "Lo",
            style: { tint: 0xb2b2b2, fontSize: 20, fontFamily: "coccm-bitmap-3-normal", letterSpacing: -2 },
        });
        this.buttonsContainer.addChild(this.titleHigh, this.titleLow);

        this.highDes = new BitmapLabel({
            text: "Higher or equal",
            style: { fill: "#f9e45c", fontSize: 19, fontFamily: "coccm-bitmap-3-normal", letterSpacing: -2 },
        });
        this.lowDes = new BitmapLabel({
            text: "Lower or equal",
            style: { fill: "#f9e45c", fontSize: 19, fontFamily: "coccm-bitmap-3-normal", letterSpacing: -2 },
        });
        this.buttonsContainer.addChild(this.highDes, this.lowDes);

        // Skip / Cash Out button visual in fancy
        this.fancySkipButton = new CustomButton({
            fontSize: 28,
            fontFamily: "coccm-bitmap-3-normal",
            textColor: 0x4a4a4a
        }, {
            defaultView: "Button-Skip.png",
        });
        this.addChild(this.fancySkipButton);

        this.skipButtonText = Sprite.from("Skip.png");
        this.skipButtonText.anchor.set(0.5);
        this.fancySkipButton.addChild(this.skipButtonText);

        // --- icons for title ---
        this.highIcon = Sprite.from("Icon-Arrow-high.png");
        this.lowIcon = Sprite.from("Icon-Arrow-low.png");
        this.buttonsContainer.addChild(this.highIcon, this.lowIcon);

        this.cardHistoryLayout = new CardHistoryLayout({
            type: 'horizontal',
            direction: 'ltr'
        });
        this.addChild(this.cardHistoryLayout);
    }

    public async animateFlyOff(rank: string, suit: CardSuit) {
        // Create Sprite clone of the card
        const textureName = `${suit}-card-${rank.toLowerCase()}.png`;
        const flySprite = Sprite.from(textureName);

        // Match current card transform
        flySprite.anchor.set(0.5);
        flySprite.scale.copyFrom(this.currentCard.scale);
        flySprite.position.copyFrom(this.currentCard.position);

        // Add to container (above back card, below current?)
        // Ideally above everything to fly out clearly
        this.cardsContainer.addChild(flySprite);

        // Animate
        // Darken -> Tint
        flySprite.tint = 0x888888;

        const targetX = -500; // Fly left offscreen

        await gsap.to(flySprite, {
            x: targetX,
            angle: -25, // Tilt left
            duration: 0.25,
            ease: "back.in(0.8)",
            onComplete: () => {
                flySprite.destroy();
            }
        });
    }

    public animateDeal() {
        const startX = this.backCard.x + this.backCard.width / 2;
        const startY = this.backCard.y + this.backCard.height / 2;

        const targetX = this.cardPlaceHolder.x + this.cardPlaceHolder.width / 2;
        const targetY = this.cardPlaceHolder.y + this.cardPlaceHolder.height / 2;

        this.currentCard.position.set(startX, startY);

        gsap.to(this.currentCard, {
            x: targetX,
            y: targetY,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    public resize(width: number, _height: number, padding: number) {


        LayoutHelper.scaleToWidth(this.multiplierBoard, width * 0.8);
        this.multiplierBoard.x = width / 2;
        // Reset to strict top position + half height (anchor 0.5 assumed or desired centered)
        this.multiplierBoard.y = this.multiplierBoard.height / 2;

        this.backCard.scale.set(0.85);
        this.cardPlaceHolder.scale.set(1.85);
        this.currentCard.setBaseScale(0.85);

        LayoutHelper.setPositionX(this.backCard, this.backCard.width / 10);
        LayoutHelper.setPositionY(this.backCard, this.backCard.height / 13 - 2);

        // Position current card placeholder to the right of the deck (backCard)
        this.cardPlaceHolder.x = this.backCard.x - this.cardPlaceHolder.width / 8;
        this.cardPlaceHolder.y = this.backCard.y - this.cardPlaceHolder.height / 10.5 + 2;  // Align vertically with deck? Or centered?

        this.currentCard.x = this.cardPlaceHolder.x + this.cardPlaceHolder.width / 2;
        this.currentCard.y = this.cardPlaceHolder.y + this.cardPlaceHolder.height / 2;

        this.cardsContainer.x = this.multiplierBoard.x / 4;
        // Position cards container below multiplier board
        this.cardsContainer.y = this.multiplierBoard.y + this.multiplierBoard.height / 2 + padding * 2;

        // Reset to natural size or specific logic if needed, but user said reset size
        // Keeping positioning relative to card but removing overwrite of width/height?
        // Or perhaps just removing the overrides.
        // Let's assume natural size is desired.
        this.fancySkipButton.scale.set(1);
        this.fancySkipButton.x = this.cardsContainer.x + this.skipButtonText.width / 2;
        this.fancySkipButton.y = this.backCard.y + this.backCard.height - padding / 3;

        // Ensure skip button is always on top
        this.cardsContainer.addChild(this.fancySkipButton);

        // Hi/Lo Buttons
        this.upButton.scale.set(1.01);
        this.downButton.scale.set(1.01);

        const btnY =
            this.backCard.y + this.backCard.height / 2.65;

        this.upButton.y = - padding * 1.2 - 3;
        this.downButton.y = this.downButton.height + padding * 1.2 + 2;

        const btnX =
            0;

        this.upButton.x = btnX;
        this.downButton.x = btnX;

        // Higher lower text position
        LayoutHelper.setPositionX(
            this.highDes,
            this.upButton.x + this.upButton.width / 2,
        );
        LayoutHelper.setPositionX(
            this.lowDes,
            this.downButton.x + this.downButton.width / 2,
        );
        LayoutHelper.setPositionY(
            this.highDes,
            this.upButton.y + this.upButton.height - this.highDes.height / 0.65,
        );
        LayoutHelper.setPositionY(
            this.lowDes,
            this.downButton.y + this.lowDes.height * 1.25,
        );

        // Titles
        LayoutHelper.setPositionX(
            this.titleHigh,
            this.upButton.x + this.upButton.width / 2,
        );
        LayoutHelper.setPositionY(
            this.titleHigh,
            this.upButton.y + this.upButton.height / 2,
        );

        // High Icon
        this.highIcon.scale.set(1);
        this.highIcon.anchor.set(0.5);
        LayoutHelper.setPositionX(
            this.highIcon,
            this.upButton.x + this.upButton.width / 2,
        );
        LayoutHelper.setPositionY(
            this.highIcon,
            this.upButton.y + this.highIcon.height / 1.25,
        );


        LayoutHelper.setPositionX(
            this.titleLow,
            this.downButton.x + this.downButton.width / 2,
        );
        LayoutHelper.setPositionY(
            this.titleLow,
            this.downButton.y + this.downButton.height / 2.25,
        );

        // Low Icon
        this.lowIcon.scale.set(1);
        this.lowIcon.anchor.set(0.5);
        LayoutHelper.setPositionX(
            this.lowIcon,
            this.downButton.x + this.downButton.width / 2,
        );
        LayoutHelper.setPositionY(
            this.lowIcon,
            this.downButton.y + this.downButton.height - this.lowIcon.height / 1.25,
        );

        this.buttonsContainer.x = this.multiplierBoard.x + this.multiplierBoard.width / 15;
        this.buttonsContainer.y = btnY;

        // Card History Layout
        // User requested 30% of card sprite size
        const historyHeight = this.backCard.texture.height * 0.3;
        this.cardHistoryLayout.resize(this.multiplierBoard.width, historyHeight);
        this.cardHistoryLayout.x = this.multiplierBoard.x - this.multiplierBoard.width / 2;

        const cardAreaBottom = this.buttonsContainer.y + this.buttonsContainer.height;
        this.cardHistoryLayout.y = cardAreaBottom + padding;

        this.cardHistoryLayout.pushBackPadding = -25;

    }
}
