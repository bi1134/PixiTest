import { Container, Sprite, NineSliceSprite, BitmapText, Texture } from "pixi.js";

export class KnightCharacter extends Container {
    private knight: Sprite;
    private table: Sprite;
    private dialogBubble: NineSliceSprite;
    private dialogText: BitmapText;
    private dialogContainer: Container;

    constructor() {
        super();

        // 1. Knight (Picture)
        this.knight = Sprite.from("char.png");
        this.knight.anchor.set(0.5, 1); // Anchor bottom center
        this.addChild(this.knight);

        // 2. Table (On top of Knight)
        this.table = Sprite.from("table.png");
        this.table.anchor.set(0.5, 1); // Anchor bottom center
        // Position table relative to knight? 
        // Assuming they share a ground line at y=0
        this.table.y = 0;

        this.knight.x = this.table.x + (this.table.width - this.knight.width) / 2;
        this.knight.y = 0;
        this.addChild(this.table);

        // 3. Dialog Container (Bubble + Text)
        this.dialogContainer = new Container();
        // Position dialog above knight/table roughly
        this.dialogContainer.y = -this.knight.height * 0.8;
        this.addChild(this.dialogContainer);

        // NineSlice Chat Bubble
        this.dialogBubble = new NineSliceSprite({
            texture: Texture.from("Dialog-0.png"),
            leftWidth: 40,
            topHeight: 40,
            rightWidth: 40,
            bottomHeight: 40,
        });
        this.dialogBubble.anchor.set(0.5, 1); // Bottom center anchor for bubble growing upwards
        this.dialogBubble.scale.x = -1; // Flip horizontally
        this.dialogContainer.addChild(this.dialogBubble);

        // Label for text
        this.dialogText = new BitmapText({
            text: "",
            style: {
                fontFamily: "coccm-bitmap-3-normal",
                fontSize: 50,
                align: "center",
                maxWidth: 800, // Max width before wrapping?
                wordWrap: true, // Need word wrap for chat bubble
                wordWrapWidth: 800,
                fill: "#f3da67"
            }
        });
        this.dialogText.anchor.set(0.5, 0.5);
        // Text is centered in the bubble
        // Bubble anchor is (0.5, 1), so (0, -height/2) is center
        this.dialogContainer.addChild(this.dialogText);

        const padding = 10;
        this.dialogContainer.x = this.knight.x - this.knight.width / 2 - padding * 30;
        this.dialogContainer.y = this.knight.y - this.knight.height / 2 + padding * 10;

        // Initial hidden state or default text
        this.say("Press Bet to Start");
    }

    public say(text: string) {
        if (!text) {
            this.dialogContainer.visible = false;
            return;
        }
        this.dialogContainer.visible = true;
        this.dialogText.text = text;

        // Measure text
        const bounds = this.dialogText.getLocalBounds();
        const paddingH = 50;
        const paddingV = 40;

        // Resize bubble
        const bubbleW = Math.max(100, bounds.width + paddingH);
        const bubbleH = Math.max(80, bounds.height + paddingV);

        this.dialogBubble.width = bubbleW;
        this.dialogBubble.height = bubbleH;

        // Re-center text in bubble
        // Bubble is anchored bottom-center (0.5, 1) at (0,0) in dialogContainer
        // So bubble visual center is (0, -bubbleH/2)
        this.dialogText.position.set(0, -bubbleH / 2);
    }
}
