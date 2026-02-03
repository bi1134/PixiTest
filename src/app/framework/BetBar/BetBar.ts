import { Container, Sprite } from "pixi.js";
import { BetButton } from "../../ui/BetButton";
import { BetInput } from "../../ui/BetInput";
import { CustomButton } from "../../ui/CustomButton";
import { GameHistoryContainer } from "../../ui/GameHistoryContainer";
import { SettingsUI } from "../../ui/SettingsUI";
import { SpeedButton } from "../../ui/SpeedButton";
import { BitmapLabel } from "../../ui/BitmapLabel";
import { GameData } from "../../data/GameData";
import { CustomKeyboard } from "../../ui/CustomKeyboard/CustomKeyboard";
import { CustomKeyboardUnit } from "../../ui/CustomKeyboard/CustomKeyboardUnit.enum";
import { LayoutHelper } from "../../utils/LayoutHelper";


export class BetBar extends Container {
    public betButton: BetButton;
    public inputBox: BetInput;
    public halfValueButton: CustomButton;
    public doubleValueButton: CustomButton;
    public settingsUI: SettingsUI;
    public speedButton: SpeedButton;
    public gameHistory: GameHistoryContainer;

    public barMid: Sprite;
    public moneyLabel: BitmapLabel;
    public moneyContainer: Container;
    public coinIcon: Sprite;

    public keyboard: CustomKeyboard;

    public inputDefaultValue: number = GameData.MIN_BET;

    constructor(width: number) {
        super();

        this.barMid = Sprite.from("Bar-mid.png");
        this.addChild(this.barMid);

        this.moneyContainer = new Container();
        this.addChild(this.moneyContainer);

        // --- Money Label & Icon ---
        this.coinIcon = Sprite.from("Icon-coin.png");
        this.moneyContainer.addChild(this.coinIcon);

        this.moneyLabel = new BitmapLabel({
            text: "$1000",
            style: {
                fill: "#f7c049",
                fontSize: 25,
                fontFamily: "coccm-bitmap-3-normal",
            },
        });
        this.moneyLabel.anchor.set(0, 0.5);
        this.moneyContainer.addChild(this.moneyLabel);

        // --- Bet Button ---
        this.betButton = new BetButton();
        this.addChild(this.betButton);

        this.inputBox = new BetInput({
            bg: Sprite.from("Bet_volume.png"),
            placeholder: GameData.MIN_BET.toString(),
            fontSize: 23,
            fontFamily: "coccm-bitmap-3-normal",
            align: "center",
            textColor: 0xFFFFFF,
            textLimitRatio: 0.45
        });
        this.addChild(this.inputBox);

        this.inputBox.value = this.inputDefaultValue.toString();


        this.halfValueButton = new CustomButton({
            text: "1/2",
            fontSize: 42,
            fontFamily: "coccm-bitmap-3-normal",
            textColor: 0x4a4a4a
        }, {
            defaultView: "Button-2-1.png",
        });
        this.addChild(this.halfValueButton);

        this.doubleValueButton = new CustomButton({
            text: "x2",
            fontSize: 42,
            fontFamily: "coccm-bitmap-3-normal",
            textColor: 0x4a4a4a
        }, {
            defaultView: "Button-2-2.png",
        });
        this.addChild(this.doubleValueButton);

        // --- History ---
        this.gameHistory = new GameHistoryContainer(width);
        this.addChild(this.gameHistory);

        // --- Settings & Speed ---
        this.settingsUI = new SettingsUI();
        this.addChild(this.settingsUI);

        this.speedButton = new SpeedButton();
        this.addChild(this.speedButton);

        // --- Keyboard ---
        this.keyboard = new CustomKeyboard();
        this.addChild(this.keyboard); // Overlay

        this.setupKeyboardEvents();
    }

    private setupKeyboardEvents() {
        this.inputBox.onPress.connect(() => {
            this.keyboard.visible = true;
            let currentVal = parseFloat(this.inputBox.value);
            if (isNaN(currentVal)) currentVal = 0;
            this.keyboard.open(currentVal, CustomKeyboardUnit.CURRENCY);
        });

        this.keyboard.onCloseKeyboard = () => {
            this.keyboard.visible = false;
        };

        this.keyboard.onCompleted = (newVal: number, _unit: unknown) => { // unit unused for now
            this.keyboard.visible = false;
            this.inputBox.value = newVal.toString();
        };
    }

    public resize(width: number, height: number, padding: number) {
        // Stack Bottom Up:
        // [History Bar] (Bottom)
        // [Bet Control Row] (Speed | Bet | Settings)
        // [Bar Mid] (Behind Input, overlapping BetButton top?)
        // [Input Row] (Half | Input | Double)

        const centerX = width / 2;

        LayoutHelper.scaleToWidth(this.keyboard, width);
        this.keyboard.y = height - this.keyboard.height / 1.15;
        // 1. History Bar (Bottom)
        const historyHeight = this.betButton.height * 0.35;
        this.gameHistory.resize(width, historyHeight);
        this.gameHistory.x = 0;
        this.gameHistory.y = height - historyHeight;

        // 2. Bet Control Row (Above History)
        const betBtnMaxW = width * 0.5;
        // Reset scale so we don't double scale if this is called multiple times
        this.betButton.scale.set(1);
        this.betButton.setSize(betBtnMaxW, this.betButton.defaultHeight * 0.5);

        this.betButton.x = centerX;
        this.betButton.y = this.gameHistory.y - this.betButton.height / 2 - this.gameHistory.height / 1.15; // Padding using new height estimate

        LayoutHelper.scaleToHeight(this.speedButton, this.betButton.height, true);
        // Speed (Left of Bet)
        this.speedButton.x = this.betButton.x - this.betButton.width / 2 - this.speedButton.width; // Left side
        this.speedButton.y = this.betButton.y - this.betButton.height / 2; // Align Y center?

        LayoutHelper.scaleToHeight(this.settingsUI, this.betButton.height, true);
        // Settings (Right of Bet)
        this.settingsUI.x = this.betButton.x + this.betButton.width / 2;
        this.settingsUI.y = this.betButton.y - this.betButton.height / 2;

        // 3. BarMid (Money)
        LayoutHelper.scaleToWidth(this.barMid, this.betButton.width * 0.75, true);
        this.barMid.anchor.set(0.5, 0.5);
        this.barMid.x = centerX;
        this.barMid.y = this.betButton.y + this.betButton.height / 2; // Overlap?

        this.updateMoneyLayout(); // Centers money on BarMid

        // 4. Input Row (Above BarMid)
        const inputHeight = this.betButton.height * 0.7;
        const inputWidth = this.betButton.width;

        this.inputBox.resize(inputWidth, inputHeight);
        LayoutHelper.scaleToHeight(this.inputBox, inputHeight, true);
        this.inputBox.pivot.set(this.inputBox.width / 2, this.inputBox.height / 2);

        this.inputBox.x = centerX;
        this.inputBox.y = this.betButton.y - this.betButton.height; // Slightly up?

        // Half / Double
        LayoutHelper.scaleToHeight(this.halfValueButton, inputHeight, true);
        this.halfValueButton.x = this.inputBox.x - this.inputBox.width / 2 + this.halfValueButton.width / 2;
        this.halfValueButton.y = this.inputBox.y + padding / 7;

        LayoutHelper.scaleToHeight(this.doubleValueButton, inputHeight, true);
        this.doubleValueButton.x = this.inputBox.x + this.inputBox.width / 2 - this.doubleValueButton.width / 2;
        this.doubleValueButton.y = this.inputBox.y + padding / 7;
    }

    public updateMoney(value?: string) {
        if (value !== undefined) {
            const numValue = parseFloat(value.replace(/,/g, ''));
            if (!isNaN(numValue)) {
                this.moneyLabel.text = numValue.toLocaleString('de-DE', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                });
            } else {
                this.moneyLabel.text = value;
            }
        }

        this.updateMoneyLayout();
    }

    private updateMoneyLayout() {
        if (!this.moneyContainer) return;

        this.coinIcon.x = 0;
        this.moneyLabel.x = this.coinIcon.width + this.coinIcon.width / 2;
        this.moneyLabel.y = this.coinIcon.y;
        this.coinIcon.anchor.set(0, 0.5);

        const contentWidth = this.moneyLabel.x + this.moneyLabel.width;
        const maxW = this.barMid.width * 0.8;
        this.moneyContainer.scale.set(1);
        if (contentWidth > maxW) {
            this.moneyContainer.scale.set(maxW / contentWidth);
        }

        // Position MoneyContainer centered on BarMid
        // Since they are now siblings, we use barMid's position
        this.moneyContainer.x = this.barMid.x - this.moneyContainer.width / 2;
        this.moneyContainer.y = this.barMid.y + (this.barMid.height / 5);
    }
}
