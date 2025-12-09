import { Container, Graphics } from "pixi.js";
import { ProfitItem } from "./ProfitItem";
import { LayoutHelper } from "../../../utils/LayoutHelper";

export class ProfitLayout extends Container {
    public pHigherItem!: ProfitItem;
    public pLowerItem!: ProfitItem;
    public pTotalItem!: ProfitItem;

    private profitBackground!: Graphics;

    constructor() {
        super();
        this.createLayout();
    }

    private createLayout() {
        this.profitBackground = new Graphics().rect(0, 0, 300, 150).fill("#3c3c3cff");
        this.addChild(this.profitBackground);

        // reusable ProfitItem components
        this.pHigherItem = new ProfitItem("Profit Higher x");
        this.pLowerItem = new ProfitItem("Profit Lower x");
        this.pTotalItem = new ProfitItem("Total Profit x");

        this.addChild(this.pHigherItem, this.pLowerItem, this.pTotalItem);
    }

    public resize(width: number, height: number, padding: number) {
        // --- Profit container positioning ---
        this.profitBackground.setSize(width, height);

        // --- Profit item setup ---
        const itemWidth = this.profitBackground.width / 3 - padding * 1.3;

        // Resize each internal profit item
        this.pHigherItem.resize(itemWidth);
        this.pLowerItem.resize(itemWidth);
        this.pTotalItem.resize(itemWidth);

        // Position horizontally (anchored left → center → right)
        LayoutHelper.setPositionTo(this.pHigherItem, padding);
        LayoutHelper.setPositionTo(this.pLowerItem, this.pHigherItem.x + itemWidth + padding);
        LayoutHelper.setPositionTo(this.pTotalItem, this.pLowerItem.x + itemWidth + padding);

        // Align vertically inside background
        // Align vertically inside background - Align bottom of item background to bottom of layout
        // The item (0,0) is top-left of its background.
        // We want (0,0) + scaledBackgroundHeight = layoutHeight - padding
        const scaledBgH = this.pHigherItem.getBackgroundHeight() * this.pHigherItem.scale.y;
        const baseY = height - scaledBgH - padding;

        this.pHigherItem.y = this.pLowerItem.y = this.pTotalItem.y = baseY;
    }
}
