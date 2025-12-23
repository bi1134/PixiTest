import { FancyButton, Switcher } from "@pixi/ui";
import gsap from "gsap";
import { BitmapText, Container, Graphics, Sprite, Text } from "pixi.js";

export class RuleItem extends Container {
    private readonly ITEM_HEIGHT = 80;
    private readonly PADDING = 20;

    private itemWidth: number;
    private bg: Graphics;
    private titleText: BitmapText;
    private expandSwitcher: Switcher;

    private innerWrapper: Container;
    private descriptionText: Text;

    public onItemVisibleChange?: (state: boolean) => void;

    constructor(title: string, description: string, width: number = 600) {
        super();
        this.itemWidth = width;

        // Background
        this.bg = new Graphics()
            .roundRect(0, 0, this.itemWidth, this.ITEM_HEIGHT, 15)
            .fill({ color: 0x2A2E37 });
        this.addChild(this.bg);

        // Title
        this.titleText = new BitmapText({
            text: title,
            style: {
                fontFamily: "coccm-bitmap-3-normal.fnt",
                fontSize: 24,
                align: "left",
            },
        });
        this.titleText.anchor.set(0, 0.5);
        this.titleText.position.set(this.PADDING, this.ITEM_HEIGHT / 2);
        this.addChild(this.titleText);

        // Expand Switcher
        const sprite = Sprite.from("expand-button.png");
        sprite.anchor.set(0.5);
        const collapseSprite = Sprite.from("expand-button.png");
        collapseSprite.scale.y = -1;
        collapseSprite.anchor.set(0.5);

        this.expandSwitcher = new Switcher([sprite, collapseSprite]);
        this.expandSwitcher.position.set(
            this.itemWidth - this.PADDING - this.expandSwitcher.width / 2,
            this.ITEM_HEIGHT / 2
        );
        this.expandSwitcher.onChange.connect(this.onExpandChange.bind(this));
        this.addChild(this.expandSwitcher);

        // Inner Wrapper (Description)
        this.innerWrapper = new Container();
        this.innerWrapper.visible = false;
        this.innerWrapper.alpha = 0;

        this.descriptionText = new Text({
            text: description,
            style: {
                fontFamily: "Arial", // Fallback or specific font
                fontSize: 18,
                fill: 0xCCCCCC,
                wordWrap: true,
                wordWrapWidth: this.itemWidth - this.PADDING * 2,
                lineHeight: 24,
            },
        });

        this.innerWrapper.addChild(this.descriptionText);
        this.innerWrapper.position.set(this.PADDING, this.ITEM_HEIGHT + 10);
        this.addChild(this.innerWrapper);
    }

    private onExpandChange(state: number) {
        const isExpanded = state === 1;

        if (isExpanded) {
            this.innerWrapper.visible = true;
            gsap.to(this.innerWrapper, {
                alpha: 1,
                duration: 0.2,
            });
        } else {
            gsap.to(this.innerWrapper, {
                alpha: 0,
                duration: 0.2,
                onComplete: () => {
                    this.innerWrapper.visible = false;
                },
            });
        }

        this.onItemVisibleChange?.(isExpanded);
    }

    public collapse() {
        this.expandSwitcher.forceNotify(0);
    }

    public get totalHeight(): number {
        if (this.innerWrapper.visible) {
            return this.ITEM_HEIGHT + 10 + this.innerWrapper.height + 10;
        }
        return this.ITEM_HEIGHT;
    }
}
