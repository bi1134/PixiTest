import { Container, BitmapText, Sprite } from "pixi.js";
import { Signal } from "typed-signals";

export class BetButton extends Container {
    private bgDisabled: Sprite;
    private bgEnabled: Sprite;
    private textLabel: BitmapText;
    private labelCashOut: BitmapText;
    private labelValue: BitmapText;
    public onPress: Signal<(elem?: any) => void>;

    constructor() {
        super();
        this.onPress = new Signal();

        // View 0: Non-Betting/Inactive (Button-1-0.png)
        this.bgDisabled = Sprite.from("Button-1-0.png");
        this.bgDisabled.anchor.set(0.5);
        this.bgDisabled.eventMode = 'passive'; // Allow hit testing
        this.bgDisabled.visible = false; // Default hidden
        this.addChild(this.bgDisabled);

        // View 1: Betting/Active (Button-1-1.png)
        this.bgEnabled = Sprite.from("Button-1-1.png");
        this.bgEnabled.anchor.set(0.5);
        this.bgEnabled.eventMode = 'passive'; // Allow hit testing
        this.bgEnabled.visible = true; // Default visible
        this.addChild(this.bgEnabled);


        // We need to capture clicks on the container
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointertap', () => {
            this.onPress.emit(this);
        });

        this.textLabel = new BitmapText({
            text: "Bet",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 50,
                align: "center",
                letterSpacing: -2,
            }
        });
        this.addChild(this.textLabel);
        this.textLabel.anchor.set(0.5);
        this.textLabel.position.set(0, 0);

        // 2. Cash Out Label (The Title) - Larger
        this.labelCashOut = new BitmapText({
            text: "CASH OUT",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 30, // Big Title
                align: "center",
                fill: "#FFFFFF",
                letterSpacing: -2,
            }
        });
        this.labelCashOut.anchor.set(0.5);
        this.labelCashOut.position.set(0, -25); // Move up
        this.labelCashOut.visible = false;
        this.addChild(this.labelCashOut);

        // 3. Value Label (The Amount) - Smaller
        this.labelValue = new BitmapText({
            text: "",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 25, // Smaller Value
                align: "center",
                fill: "#FFFFFF",
                letterSpacing: -2,
            }
        });
        this.labelValue.anchor.set(0.5);
        this.labelValue.position.set(0, 25); // Move down
        this.labelValue.visible = false;
        this.addChild(this.labelValue);

        this._originalHeight = this.bgEnabled.height || 140; // Fallback
    }

    private _originalHeight: number = 0;

    public get defaultHeight(): number {
        return this._originalHeight;
    }

    private _isBetting: boolean = false;

    public get isBetting(): boolean {
        return this._isBetting;
    }

    public setBettingState(isBetting: boolean) {
        this._isBetting = isBetting;
        // Update Text Logic:
        // Betting -> "Bet"
        // NonBetting -> "Cash Out"
        if (isBetting) {
            // "Bet" Mode
            this.textLabel.visible = true;
            this.labelCashOut.visible = false;
            this.labelValue.visible = false;

            this.textLabel.text = "Bet";
            this.textLabel.style = {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 50,
                align: "center",
                fill: "#FFFFFF"
            };
        } else {
            // "Cash Out" Mode (Wait/Playing)
            this.textLabel.visible = false;
            this.labelCashOut.visible = true;
            this.labelValue.visible = true;
            // Default value empty or generic
            this.labelValue.text = "";
        }
    }

    public setCashOutValue(value: string | number) {
        let displayValue: string;

        if (typeof value === 'number') {
            displayValue = `RP ${value.toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })}`;
        } else {
            // Assume it's already formatted if it's a string, just ensure prefix consistency if needed
            // But if the user passes "Rp 123", we might just want to use it.
            // Given NextScreenMobile passes `Rp ${formatted}`, we can just use the value directly if it's not a pure number string
            const isPureNumber = !isNaN(parseFloat(value)) && isFinite(Number(value));
            if (isPureNumber) {
                const num = parseFloat(value);
                displayValue = `RP ${num.toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })}`;
            } else {
                displayValue = value; // Use directly
            }
        }

        // Update Separate Labels
        this.labelValue.text = displayValue.toUpperCase(); // Ensure "RP" is caps if desired

        // Ensure visibility
        this.textLabel.visible = false;
        this.labelCashOut.visible = true;
        this.labelValue.visible = true;
    }

    public setEnabled(enabled: boolean) {
        this.interactive = enabled;

        // Toggle sprites
        this.bgEnabled.visible = enabled;
        this.bgDisabled.visible = !enabled;

        // Ensure alpha is reset 
        this.alpha = 1;
    }

    public get text(): string {
        return this.textLabel.text;
    }

    public set text(val: string) {
        this.textLabel.text = val;
    }

    public setSize(width: number, height: number) {
        this.bgDisabled.width = width;
        this.bgDisabled.height = height;
        this.bgEnabled.width = width;
        this.bgEnabled.height = height;
    }
}
