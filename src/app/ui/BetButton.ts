import { Container, BitmapText, Sprite } from "pixi.js";
import { Signal } from "typed-signals";

export class BetButton extends Container {
    private bgDisabled: Sprite;
    private bgEnabled: Sprite;
    private textLabel: BitmapText;
    public onPress: Signal<(elem?: any) => void>;

    constructor() {
        super();
        this.onPress = new Signal();

        // View 0: Non-Betting/Inactive (Button-1-0.png)
        this.bgDisabled = Sprite.from("Button-1-0.png");
        this.bgDisabled.anchor.set(0.5);
        this.bgDisabled.eventMode = 'passive'; // Allow hit testing
        this.bgDisabled.visible = true; // Default start
        this.addChild(this.bgDisabled);

        // View 1: Betting/Active (Button-1-1.png)
        this.bgEnabled = Sprite.from("Button-1-1.png");
        this.bgEnabled.anchor.set(0.5);
        this.bgEnabled.eventMode = 'passive'; // Allow hit testing
        this.bgEnabled.visible = false;
        this.addChild(this.bgEnabled);


        // We need to capture clicks on the container
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointertap', () => {
            console.log("BetButton Pressed");
            this.onPress.emit(this);
        });

        this.textLabel = new BitmapText({
            text: "Bet",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 60,
                align: "center"
            }
        });
        this.textLabel.anchor.set(0.5);
        this.textLabel.position.set(0, 0); // Initially at 0,0, wait, need center.

        this.addChild(this.textLabel);

        // Let's center based on estimated size or just wait.
        // Better: Hook into one sprite's texture update.
        if (this.bgDisabled.texture.baseTexture.valid) {
            this.alignText();
        } else {
            this.bgDisabled.texture.once('update', () => this.alignText());
        }
    }

    private alignText() {
        this.textLabel.position.set(this.bgDisabled.width / 2, this.bgDisabled.height / 2);
    }

    public setBettingState(isBetting: boolean) {
        // Update Text Logic:
        // Betting -> "Bet"
        // NonBetting -> "Cash Out"
        if (isBetting) {
            this.textLabel.text = "Bet";
            this.textLabel.style = {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 80,
                align: "center",
                fill: "#FFFFFF"
            };
        } else {
            this.textLabel.text = "Cash Out";
            this.textLabel.style = {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 55,
                align: "center",
                fill: "#FFFFFF"
            };
        }
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
}
