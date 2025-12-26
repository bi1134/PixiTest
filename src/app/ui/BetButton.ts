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
        // Position relative to the background size
        // Assuming both sprites are same size usage
        // We use bgDisabled just for reference, they should be same size
        // If bgDisabled isn't loaded yet, it might be 1x1.
        // But usually pixi handles this update.
        this.textLabel.position.set(0, 0); // Initially at 0,0, wait, need center.

        // We can center on frame updates or assume a size.
        // Or if the sprite loads, it updates.
        // Let's rely on standard alignment if possible or center manually if we know size.
        // Button-1-0 is roughly 300x150?
        // Let's hook into texture update? No, that's overkill.
        // Just set it to center of the sprite container.
        // Wait, if sprites are 0,0, text at 0,0 is top-left.
        // We need it at width/2, height/2.
        // Let's trust that layout happens.

        // Actually, if we just center it in the container and the container takes size of children...
        // We might need to reposition label after load.
        // Or just use a fixed center if we know it.
        // For now, let's defer to the fact that previous code did switcher.width/2.
        // I will use a reasonable center or try to read sprite width.
        // Since we removed hardcoded bounds, we rely on sprite.

        // Use a dirty hack: Check periodically or use 'onload'?
        // No, let's just center it relative to what we expect.
        // The previous code used switcher.width.

        // Let's add the label and assume it centers? No.
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
        this.textLabel.text = isBetting ? "Bet" : "Cash Out";
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
