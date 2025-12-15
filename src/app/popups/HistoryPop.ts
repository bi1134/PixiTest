import { Container, Sprite, Texture, BlurFilter, Scroller } from "pixi.js";
import { engine } from "../getEngine";
import { gsap } from "gsap/gsap-core";
import { RoundedBox } from "../ui/RoundedBox";
import { FancyButton, ScrollBox, Select } from "@pixi/ui";
import { Label } from "../ui/Label";
import type { Text } from "pixi.js";
import { HistoryItem } from "../ui/HistoryItem";

export class HistoryPopup extends Container {

    /** The dark semi-transparent background covering current screen */
    private bg: Sprite;
    /** Container for the popup UI components */
    private panel: Container;
    /** The popup title label */
    private title: Text;
    /** Button that closes the popup */
    private doneButton: FancyButton;
    /** The panel background */
    private panelBase: RoundedBox;

    private scrollBox: ScrollBox;

    private testSprite: Sprite;

    private dropdown: Select;

    constructor() {
        super();

        const width = engine().renderer.screen.width;
        const height = engine().renderer.screen.height;

        this.bg = new Sprite(Texture.WHITE);
        this.bg.tint = 0x0;
        this.bg.interactive = true;
        this.addChild(this.bg);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = new RoundedBox({ height: height * 0.6 });
        this.panel.addChild(this.panelBase);

        this.title = new Label({
            text: "History",
            style: {
                fill: 0xec1561,
                fontSize: 100,
                fontFamily: "Arial",
                fontWeight: "bold",
            },
        });
        this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
        this.panel.addChild(this.title);

        this.doneButton = new FancyButton({
            defaultView: "exitButton.png",
        });
        this.doneButton.onPress.connect(() => engine().navigation.dismissPopup());
        this.panel.addChild(this.doneButton);

        // --- Scrollable Area (ScrollBox) ---
        this.scrollBox = new ScrollBox({
            width: 350,
            height: this.panelBase.height,
            background: 0x000000, // Optional background (transparent is fine)
            elementsMargin: 8,
            dragScroll: true,
            verticalScroll: true,
            scrollbarSize: 6,
            type: "vertical",
        });
        this.panel.addChild(this.scrollBox);

        this.dropdown = new Select({
            closedBG: "select.png",
            openBG: "select_open.png",
            textStyle: { fill: 0xffffff, fontSize: 20 },
            items: {
                items: ["Today", "Yesterday", "This Week", "This Month"],
                backgroundColor: 0x333333,
                hoverColor: 0x555555,
                width: 250,
                height: 50,
            },
            scrollBox: {
                width: 250,
                height: 200,
                radius: 15,
            },
        });

        // Populate with History Items
        for (let i = 0; i < 20; i++) {
            // Mock data
            const isWin = Math.random() > 0.5;
            const amount = Math.floor(Math.random() * 500) + 10;
            const profit = isWin ? Math.floor(amount * 1.5) : 0;

            const item = new HistoryItem(
                `Round ${i + 1} - ${isWin ? "Win" : "Loss"}`,
                {
                    time: "12:34 PM",
                    id: `#987${i}`,
                    amount: amount.toString(),
                    multiplier: isWin ? "2.5" : "0.0",
                    profit: profit.toString(),
                    result: isWin ? "Win" : "Loss"
                }
            );

            this.scrollBox.list.addChild(item);
        }
    }

    /** Resize the popup, fired whenever window size changes */
    public resize(width: number, height: number) {
        const padding = 10;

        this.bg.width = width;
        this.bg.height = height;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;

        this.panelBase.width = width - padding * 15;

        this.doneButton.x = this.panelBase.width / 2 - this.doneButton.width - padding;
        this.doneButton.y = -this.panelBase.boxHeight / 2 + padding;

        // Position scroll area right below the title
        this.scrollBox.width = this.panelBase.width - padding * 15;
        this.scrollBox.x = -this.scrollBox.width / 2;
        this.scrollBox.y = this.title.y + this.title.height / 2 + 20;
        this.scrollBox.height = this.panelBase.height - this.title.height - padding * 4;

        this.scrollBox.list.x = this.scrollBox.width / 2 - this.scrollBox.list.width / 2;


    }

    public async show() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [
                new BlurFilter({ strength: 4 }),
            ];
        }

        // Reset to initial invisible + scaled down state
        this.bg.alpha = 0;
        this.panel.scale.set(0.5);

        // --- Background fade in ---
        gsap.to(this.bg, {
            alpha: 0.8,
            duration: 0.2,
            ease: "power2.out",
        });

        // --- Panel "pop in" effect ---
        gsap.to(this.panel.scale, {
            x: 1,
            y: 1,
            duration: 0.1,
            ease: "back.out",
        });
    }

    /** Dismiss the popup, animated */
    public async hide() {
        const currentEngine = engine();
        if (currentEngine.navigation.currentScreen) {
            currentEngine.navigation.currentScreen.filters = [];
        }

        // --- Panel "pop out" / shrink away ---
        await gsap.to(this.panel.scale, {
            x: 0.5,
            y: 0.5,
            duration: 0.25,
            ease: "back.in",
            onComplete: () => {
                this.panel.visible = false;
            },
        });

        // Fade out the background
        await gsap.to(this.bg, {
            alpha: 0,
            duration: 0.2,
        });

    }
}
