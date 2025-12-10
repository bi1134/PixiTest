import { Container } from "pixi.js";
import { engine } from "../../getEngine";
import { NextScreenDesktop } from "./NextScreenDesktop";
import { NextScreenMobile } from "./NextScreenMobile";

/**
 * Acts as a router between the Desktop and Mobile versions of the Next screen.
 * It automatically detects the device size and redirects accordingly.
 */
export class NextScreen extends Container {
    constructor() {
        super();

        // Run detection logic immediately on construction
        this.detectAndRedirect();
    }

    /**
     * Detects whether the app is running on mobile or desktop,
     * then redirects to the appropriate screen.
     */
    private async detectAndRedirect(): Promise<void> {
        const isMobile = this.isMobileDevice();

        console.log(`[NextScreen] Redirecting to ${isMobile ? "Mobile" : "Desktop"} version...`);

        // Redirect based on the detected platform
        if (isMobile) {
            await engine().navigation.showScreen(NextScreenMobile);
        } else {
            await engine().navigation.showScreen(NextScreenDesktop);
        }
    }

    /**
     * Simple device check — you can improve this using user-agent or orientation later.
     */
    private isMobileDevice(): boolean {
        // Option 1: viewport-based check
        if (window.innerWidth < 768) return true;

        // Option 2: user agent fallback (optional)
        const ua = navigator.userAgent || navigator.vendor;
        return /android|iPad|iPhone|iPod/i.test(ua);
    }
}
