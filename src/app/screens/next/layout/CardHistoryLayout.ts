import { Container, Graphics } from "pixi.js";
import { animate } from "motion";
import { CardHistoryItem } from "../../../ui/CardHistoryItem";
import { GuessAction } from "../types/GameTypes";

export class CardHistoryLayout extends Container {
    private cardsHistoryBackground!: Graphics;
    private cardsHistoryMask!: Graphics;
    private cardHistory: CardHistoryItem[] = [];

    constructor() {
        super();
        this.createLayout();
    }

    private createLayout() {
        // --- background box ---
        this.cardsHistoryBackground = new Graphics()
            .rect(0, 0, 300, 150)
            .fill("#3c3c3cff");
        this.addChild(this.cardsHistoryBackground);

        // --- create mask for the visible region ---
        this.cardsHistoryMask = new Graphics()
            .rect(
                this.cardsHistoryBackground.x,
                this.cardsHistoryBackground.y,
                this.cardsHistoryBackground.width,
                this.cardsHistoryBackground.height
            )
            .fill(0xffffff); // fill color doesn't matter, mask only uses alpha
        this.addChild(this.cardsHistoryMask);

        this.mask = this.cardsHistoryMask;
    }

    public addCardToHistory(value: string, suit: string, action: GuessAction, padding: number = 8, gapMultipler: number = 1, scrollMutiplier: number = 5) {
        // 1. Create New Item (No Pooling)
        const item = new CardHistoryItem(value, suit, action);

        // 2. Resize ensures scale is correct for dimensions
        item.ResizeToFit(this.cardsHistoryBackground.height, padding);
        const finalScale = item.scale.x;
        const itemWidth = item.getLocalBounds().width * finalScale;
        const finalHeight = item.getLocalBounds().height * finalScale;

        // 3. Determine Target Position based on TAIL of list
        let prevItem = this.cardHistory.length > 0 ? this.cardHistory[this.cardHistory.length - 1] : null;
        let targetX = padding;

        if (prevItem) {
            targetX = prevItem.targetX + prevItem.width - padding / gapMultipler;
        }

        // Logical Target for new item
        item.targetX = targetX;

        // 4. Check Overflow
        const maxVisibleWidth = this.cardsHistoryBackground.width - padding * scrollMutiplier;
        const totalReqWidth = targetX + itemWidth + padding;

        let overflow = 0;
        if (totalReqWidth > maxVisibleWidth) {
            overflow = totalReqWidth - maxVisibleWidth;
        }

        // 5. Apply Shift (if any) to PREVIOUS items
        if (overflow > 0) {
            for (const prev of this.cardHistory) {
                prev.targetX -= overflow;
                // Animate to new target
                animate(prev, { x: prev.targetX }, { duration: 0.3, ease: "circOut" });
            }

            // Adjust NEW item's target too
            item.targetX -= overflow;
        }

        // 6. Setup New Item Initial State WITH Animation Offset
        // Restore the "Fake Distance" logic
        const startOffset = 50;
        const popDuration = 0.3;
        const slideDuration = 0.3;
        const slideDelay = 0.2;

        // Start at Target + Offset
        item.x = item.targetX + startOffset;
        item.y = this.cardsHistoryBackground.y + this.cardsHistoryBackground.height / 2 - finalHeight / 2;
        item.alpha = 0;
        item.scale.set(finalScale * 0.5);

        this.addChild(item);
        this.cardHistory.push(item);

        // 7. Animate Entry (Pop In + Slide Back)
        // Pop In
        animate(item, { alpha: 1 }, { duration: popDuration, ease: "linear" });
        animate(item.scale, { x: finalScale, y: finalScale }, { duration: popDuration, ease: "backOut" });

        // Slide Back to Logical Target
        animate(item, { x: item.targetX }, { duration: slideDuration, delay: slideDelay, ease: "circOut" });

        // 8. Garbage Collection (Buffer Check)
        // DISABLED FOR DEBUGGING as per user request
        /*
        const bufferSize = 3;
        if (this.cardHistory.length > bufferSize) {
            // Check the item at the edge of the buffer (index 3)
            // If THIS item is also off-screen, then items 0, 1, 2 are definitely off-screen.
            // We can safely remove item 0.
            const bufferItem = this.cardHistory[bufferSize];
            const bufferItemWidth = bufferItem.getLocalBounds().width * bufferItem.scale.x;

            // Check if buffer item is effectively off-screen to the left
            if (bufferItem.targetX + bufferItemWidth < 0) {
                const removed = this.cardHistory.shift();
                if (removed) {
                    this.removeChild(removed);
                    removed.destroy();
                }
            }
        }
        */
    }

    public clearHistory() {
        for (const item of this.cardHistory) {
            item.destroy();
        }
        this.cardHistory.length = 0;
    }

    public resize(width: number, height: number) {
        // --- Resize and position background ---
        this.cardsHistoryBackground.setSize(width, height);

        // --- Update mask to match background ---
        this.cardsHistoryMask.clear()
            .rect(
                this.cardsHistoryBackground.x,
                this.cardsHistoryBackground.y,
                this.cardsHistoryBackground.width,
                this.cardsHistoryBackground.height
            )
            .fill(0xffffff);
    }
}
