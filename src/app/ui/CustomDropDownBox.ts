import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";

export class CustomDropdownBox extends Container {
    private headerContainer: Container;
    private contentContainer: Container;
    private isOpen = false;
    private maskGfx: Graphics;
    private contentHeight = 0;

    constructor(header: Container) {
        super();

        // --- Header (The always-visible part) ---
        this.headerContainer = new Container();
        this.headerContainer.addChild(header);

        // Make header interactive
        this.headerContainer.eventMode = "static";
        this.headerContainer.cursor = "pointer";
        this.headerContainer.on("pointertap", () => this.toggle());
        this.addChild(this.headerContainer);

        // --- Content container (hidden when collapsed) ---
        this.contentContainer = new Container();
        this.contentContainer.y = this.headerContainer.height; // Start below header
        this.addChild(this.contentContainer);

        // --- Mask for content ---
        this.maskGfx = new Graphics();
        this.maskGfx.y = 0; // Relative to contentContainer
        this.contentContainer.addChild(this.maskGfx);
        this.contentContainer.mask = this.maskGfx;

        // Initialize state
        this.updateMask(0);
    }

    /** Add any PIXI object as dropdown content */
    public setContent(child: Container) {
        this.contentContainer.removeChildren();
        this.contentContainer.addChild(child);
        this.contentHeight = child.height + 20; // Add some padding
        if (!this.isOpen) this.updateMask(0);
        else this.updateMask(this.contentHeight);
    }

    /** Toggle open/closed */
    public toggle() {
        console.log("CustomDropdownBox: Toggle called. Current State Open:", this.isOpen);
        this.isOpen ? this.close() : this.open();
    }

    public open() {
        if (this.isOpen) return;
        this.isOpen = true;

        // Recalculate content height in case it changed
        this.contentHeight = this.contentContainer.height + 10;
        console.log("CustomDropdownBox: Opening. Content Height:", this.contentHeight);

        gsap.killTweensOf(this.maskGfx);
        gsap.to(this.maskGfx, {
            height: this.contentHeight,
            duration: 0.3,
            ease: "back.out(1.0)",
            onUpdate: () => {
                this.updateMask(this.maskGfx.height);
                this.notifyParentResize();
            },
            onComplete: () => this.notifyParentResize()
        });
    }

    public close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        gsap.killTweensOf(this.maskGfx);
        gsap.to(this.maskGfx, {
            height: 0,
            duration: 0.3,
            ease: "power2.out",
            onUpdate: () => {
                this.updateMask(this.maskGfx.height);
                this.notifyParentResize();
            },
            onComplete: () => this.notifyParentResize()
        });
    }

    private updateMask(height: number) {
        if (!this.headerContainer) return; // Safety
        this.maskGfx.clear();
        const w = this.headerContainer.width;
        // console.log("Mask Update: w=", w, "h=", height);
        this.maskGfx.rect(0, 0, w, height).fill(0xffffff);
    }

    private notifyParentResize() {
        // If inside a layout or scrollbox, request an update
        if (this.parent && (this.parent as any).update) {
            // For some PIXI UI layouts
            (this.parent as any).update();
        }

        // Often ScrollBox lists need 'arrangeChildren' or similar
        // Try standard PIXI UI List methods if available
        if (this.parent && typeof (this.parent as any).arrangeChildren === 'function') {
            (this.parent as any).arrangeChildren();
        }
    }
}
