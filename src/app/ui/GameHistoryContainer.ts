import { Container, Graphics } from "pixi.js";
import { animate } from "motion";
import { GameHistoryItem } from "./GameHistoryItem";

export class GameHistoryContainer extends Container {
    private background: Graphics;
    private historyItems: GameHistoryItem[] = [];
    private maskGfx: Graphics;

    constructor(width: number = 400, height: number = 60) {
        super();

        // Background
        this.background = new Graphics()
            .rect(0, 0, width, height)
            .fill(0x000000);
        this.background.alpha = 0.5;
        this.addChild(this.background);

        // Mask
        this.maskGfx = new Graphics()
            .rect(0, 0, width, height)
            .fill(0xffffff);
        this.addChild(this.maskGfx);
        this.mask = this.maskGfx;
    }

    public addResult(multiplier: number, isWin: boolean) {
        // We could also pass the full object here if the container's method signature changed,
        // but for now we construct it here or change the signature.
        // Let's match the GameRoundResult interface, roughly.
        const item = new GameHistoryItem({
            multiplier,
            isWin,
            timestamp: Date.now(),
            amount: 0 // placeholder as this view might not need amount
        });

        const padding = 10;
        const itemWidth = 80; // Approximate

        // Start position (Offscreen Right)
        item.x = this.background.width + itemWidth;
        item.y = this.background.height / 2;

        this.addChild(item);
        this.historyItems.push(item);

        // Calculate targets for ALL items (Pushing Left)
        // Newest item goes to the Rightmost visible slot
        // Actually, "push from right to left" usually means:
        // [Oldest] <--- [Newer] <--- [Newest]
        // So Newest enters at Right edge, pushes everything Left.

        // Let's position them based on index from the right
        // We need to re-calculate targetX for everyone.

        // Logic: The list grows. The last item in array is right-most.
        // Wait, CardHistoryLayout pushes them. 
        // "Push from right to left" -> New items appear at Right, shifting previous items to Left.

        // Let's just place the Newest at a specific "Entry" slot, 
        // and if there was someone there, they move left.

        // BUT, usually history is time based. 
        // Let's say we align them from Right to Left.
        // [Item N-2] [Item N-1] [Item N (New)] |

        // Let's loop backwards to determine positions?
        // Or just shift everyone by (ItemWidth + Gap)

        const gap = 10;
        const shiftAmount = itemWidth + gap;

        // 1. Shift existing items Left
        // We iterate backwards? No, all move left.
        for (const historyItem of this.historyItems) {
            if (historyItem === item) continue; // Skip new one for now

            historyItem.targetX -= shiftAmount;
            animate(historyItem, { x: historyItem.targetX }, { duration: 0.3, ease: "backOut" });

            // Cull items that go offscreen left
            if (historyItem.targetX < -itemWidth) {
                // Determine removal later or now?
                // Let's just hide/destroy if too far
                if (historyItem.targetX < -500) { // Safety buffer
                    // cleanup if needed
                }
            }
        }

        // 2. Position New Item
        // It enters at: Width - Padding - ItemWidth/2 (since anchor 0.5)
        const entryX = this.background.width - padding - (itemWidth / 2);

        item.targetX = entryX;

        // Initial setup for animation
        item.x = this.background.width + 100; // Start offscreen right
        item.alpha = 0;

        // Animate In
        animate(item, { x: item.targetX, alpha: 1 }, { duration: 0.3, ease: "backOut" });
    }
}
