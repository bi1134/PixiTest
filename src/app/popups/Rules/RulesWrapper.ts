import gsap from "gsap";
import { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { RuleItem } from "./RuleItem";

export class RulesWrapper extends Container {
    private readonly ITEM_OFFSET = 10;
    private readonly SCROLL_SPEED = 0.5;

    private listWidth: number;
    private listHeight: number;

    private maskRules: Graphics;
    private itemsContainer: Container;

    private isDragging = false;
    private lastPointerY = 0;
    private minY = 0;
    private maxY = 0;

    private currentOpenItem: RuleItem | null = null;

    // Mock Data
    private readonly RULES_DATA = [
        {
            title: "Cara Bermain",
            description: "Pilih chip taruhan Anda dan letakkan pada posisi yang diinginkan. Tekan tombol putar untuk memulai permainan. Tunggu hingga roda berhenti berputar untuk melihat hasilnya."
        },
        {
            title: "Pembayaran",
            description: "Pembayaran didasarkan pada odds dari setiap posisi taruhan. Semakin kecil peluang menang, semakin besar pembayarannya. Lihat tabel pembayaran untuk detail lengkap."
        },
        {
            title: "Fitur Bonus",
            description: "Dapatkan simbol bonus untuk memicu putaran gratis atau permainan bonus interaktif. Pengganda kemenangan dapat diterapkan selama putaran bonus."
        },
        {
            title: "Informasi Umum",
            description: "Permainan ini menggunakan RNG (Random Number Generator) untuk memastikan hasil yang adil. RTP (Return to Player) adalah 96.5%. Segala bentuk kecurangan akan membatalkan kemenangan."
        }
    ];

    constructor(width: number, height: number) {
        super();
        this.listWidth = width;
        this.listHeight = height;

        // Mask
        this.maskRules = new Graphics()
            .rect(0, 0, width, height)
            .fill({ color: 0x000000, alpha: 0.5 });
        this.addChild(this.maskRules);
        this.hitArea = this.maskRules.getBounds().rectangle;

        // Items Container
        this.itemsContainer = new Container();
        this.itemsContainer.mask = this.maskRules;
        this.addChild(this.itemsContainer);

        this.initItems();
        this.setupScrolling();
    }

    private initItems() {
        let currentY = 0;

        this.RULES_DATA.forEach((data) => {
            const item = new RuleItem(data.title, data.description, this.listWidth);
            item.y = currentY;

            item.onItemVisibleChange = (state: boolean) => {
                this.onItemVisibleChange(item, state);
            };

            this.itemsContainer.addChild(item);
            currentY += item.totalHeight + this.ITEM_OFFSET;
        });

        this.updateScrollBounds();
    }

    private onItemVisibleChange(item: RuleItem, state: boolean) {
        if (state && this.currentOpenItem && this.currentOpenItem !== item) {
            this.currentOpenItem.collapse();
        }

        this.currentOpenItem = state ? item : null;
        this.repositionItems();
    }

    private repositionItems() {
        let currentY = 0;
        const items = this.itemsContainer.children as RuleItem[];

        items.forEach((item) => {
            gsap.to(item, {
                y: currentY,
                duration: 0.25,
                ease: "power2.out",
                onUpdate: () => this.updateScrollBounds(),
                onComplete: () => this.updateScrollBounds(),
            });
            currentY += item.totalHeight + this.ITEM_OFFSET;
        });
    }

    private setupScrolling() {
        this.eventMode = "static";
        this.on("wheel", this.onWheel.bind(this));
        this.on("pointerdown", this.onPointerDown.bind(this));
        this.on("pointermove", this.onPointerMove.bind(this));
        this.on("pointerup", this.onPointerUp.bind(this));
        this.on("pointerupoutside", this.onPointerUp.bind(this));
    }

    private onWheel(event: WheelEvent) {
        const delta = event.deltaY * this.SCROLL_SPEED;
        this.scrollBy(delta);
    }

    private onPointerDown(event: FederatedPointerEvent) {
        this.isDragging = true;
        this.lastPointerY = event.global.y;
    }

    private onPointerMove(event: FederatedPointerEvent) {
        if (!this.isDragging) return;
        const currentY = event.global.y;
        const delta = currentY - this.lastPointerY;
        this.scrollBy(-delta);
        this.lastPointerY = currentY;
    }

    private onPointerUp() {
        this.isDragging = false;
    }

    private scrollBy(delta: number) {
        const newY = this.itemsContainer.y - delta;
        this.itemsContainer.y = Math.max(this.minY, Math.min(this.maxY, newY));
    }

    private updateScrollBounds() {
        const lastItem = this.itemsContainer.children[this.itemsContainer.children.length - 1] as RuleItem;
        const totalHeight = lastItem ? lastItem.y + lastItem.totalHeight : 0;

        this.maxY = 0;
        this.minY = Math.min(0, this.listHeight - totalHeight);
    }
}
