import { FancyButton } from "@pixi/ui";
import { Container, NineSliceSprite, Texture } from "pixi.js";
import { GameData } from "../../data/GameData";
import { formatIntNumber } from "../../utils/format-number";
import { buttonAnimation } from "../ButtonAnimations";
import { CustomButton } from "../CustomButton";
import { BoardNumber } from "./BoardNumber";
import { CustomInputField } from "./CustomInputField";
import { CustomKeyboardUnit, displayUnitMap } from "./CustomKeyboardUnit.enum";
import { NumberType } from "./CustomNumber";
import { engine } from "../../getEngine";



export class CustomKeyboard extends Container {
    private readonly unitLimitMap = new Map<CustomKeyboardUnit, { min: number; max: number }>([
        [CustomKeyboardUnit.NUMBER_OF_GAMES, { min: 0, max: 9999 }],
        [CustomKeyboardUnit.STOP_ON_LOSS, { min: 0, max: 100 }],
        [CustomKeyboardUnit.STOP_ON_WIN, { min: 0, max: 9999 }],
        [CustomKeyboardUnit.CURRENCY, { min: GameData.MIN_BET, max: Math.min(GameData.instance.totalMoney, GameData.MAX_BET) }],
    ]);

    private readonly MAX_LENGTH = 14;

    public onCloseKeyboard?: () => void;
    private closeBtn: FancyButton;
    private bg: NineSliceSprite;
    private inputAmount: CustomInputField;
    private resetButton: FancyButton;

    private readonly BOARD_NUMBER_OFFSET_Y = 20;
    private boardNumber: BoardNumber;

    private okButton: FancyButton;

    private currentUnit: CustomKeyboardUnit = CustomKeyboardUnit.CURRENCY;
    private currentVal: number = GameData.MIN_BET;

    private set CurrentVal(val: number) {
        this.currentVal = val;
        this.updateValueText();
    }
    public onCompleted?: (newVal: number, unit: CustomKeyboardUnit) => void;

    constructor() {
        super();
        this.interactive = true;
        this.interactiveChildren = true;

        this.bg = new NineSliceSprite({
            texture: Texture.from('bg-history-popup.png'),
            topHeight: 175,
            height: 890
        });
        this.closeBtn = new FancyButton({ defaultView: 'closed-btn.png', animations: buttonAnimation });
        this.closeBtn.onPress.connect(() => { engine().audio.sfx.play('main/sounds/menu_click_06.ogg'); this.onCloseKeyboard?.(); });
        this.closeBtn.position.set(
            this.bg.width - this.closeBtn.width - 10,
            10
        );

        this.inputAmount = new CustomInputField(`Rp `);

        this.resetButton = new FancyButton({ defaultView: 'input_reset_btn.png', animations: buttonAnimation, anchor: 0.5 });
        this.resetButton.onPress.connect(this.handleReset.bind(this));

        this.boardNumber = new BoardNumber();

        // Add listeners to key pressed event
        this.boardNumber.onKeyPressed = this.handleKeyPressed.bind(this);

        const okButtonSprite = new NineSliceSprite({
            texture: Texture.from('bet_btn_default.png'),
            topHeight: 25,
            bottomHeight: 25,
            leftWidth: 25,
            rightWidth: 25,
            width: 440,
            height: 140
        });
        this.okButton = new CustomButton({ text: 'OK', fontSize: 32 }, { defaultView: okButtonSprite });
        this.okButton.onPress.connect(this.confirmPressed.bind(this));

        this.addChild(
            this.bg,
            this.closeBtn,
            this.inputAmount,
            this.resetButton,
            this.boardNumber,
            this.okButton
        );

        this.inputAmount.position.set((this.bg.width - this.inputAmount.width) / 2, 75);
        this.resetButton.position.set(
            this.inputAmount.x + this.inputAmount.width - this.resetButton.width / 2,
            this.inputAmount.y + this.resetButton.height / 2 + 5
        );

        this.boardNumber.position.set(
            (this.bg.width - this.boardNumber.width) / 2,
            this.inputAmount.y + this.inputAmount.height + this.BOARD_NUMBER_OFFSET_Y
        );

        this.okButton.position.set(
            this.bg.width / 2,
            this.boardNumber.y + this.boardNumber.height + this.okButton.height / 1.8
        );

        this.visible = false;
    }

    public open(current_val: number, unit: CustomKeyboardUnit) {
        this.currentUnit = unit;
        this.CurrentVal = current_val;
    }

    public get bottomOffset() {
        return this.okButton.y + this.okButton.height * 3;
    }

    private getUnitLimits(unit: CustomKeyboardUnit) {
        if (unit === CustomKeyboardUnit.CURRENCY) {
            // Dynamic check because totalMoney changes
            return {
                min: GameData.MIN_BET,
                max: Math.min(GameData.instance.totalMoney, GameData.MAX_BET)
            };
        }

        return this.unitLimitMap.get(unit)!;
    }

    private handleKeyPressed(value: number) {
        engine().audio.sfx.play('main/sounds/menu_click_06.ogg');

        const { min, max } = this.getUnitLimits(this.currentUnit);

        switch (value) {
            case NumberType.MAX:
                this.currentVal = max;
                break;

            case NumberType.DELETE:
                const str = this.currentVal.toString();
                this.currentVal = str.length > 1 ? parseInt(str.slice(0, -1)) : min;
                break;

            default:
                if (this.inputAmount.value.length - this.currentUnit.length < this.MAX_LENGTH) {
                    let next = this.currentVal * 10 + value;
                    this.currentVal = Math.min(next, max);
                }
                break;
        }

        this.updateValueText();
    }


    private handleReset() {
        engine().audio.sfx.play('main/sounds/menu_click_06.ogg');

        if (this.currentUnit === CustomKeyboardUnit.CURRENCY)
            this.currentVal = GameData.MIN_BET;
        else
            this.currentVal = this.getUnitLimits(this.currentUnit).min;
        this.updateValueText();
    }

    private updateValueText() {
        if (displayUnitMap[this.currentUnit] === displayUnitMap[CustomKeyboardUnit.CURRENCY])
            this.inputAmount.value = `${displayUnitMap[this.currentUnit]}${formatIntNumber(this.currentVal)}`;
        else
            this.inputAmount.value = `${formatIntNumber(this.currentVal)}${displayUnitMap[this.currentUnit]}`;
    }

    private confirmPressed() {
        engine().audio.sfx.play('main/sounds/menu_click_06.ogg');

        let finalVal = this.currentVal;

        if (this.currentUnit === CustomKeyboardUnit.CURRENCY) {
            finalVal = Math.max(finalVal, GameData.MIN_BET);
        }

        // Hoisting event
        this.onCompleted?.(finalVal, this.currentUnit);
    }
}
