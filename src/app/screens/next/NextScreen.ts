import { Container } from "pixi.js";
import { engine } from "../../getEngine";

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
    // Always treat as "mobile" app logic-wise (responsive single view)

    console.log(`[NextScreen] Loading Mobile View (Unified)...`);

    // Preload Character Spine Assets to prevent pop-in delay
    const { Assets } = await import("pixi.js");
    await Assets.load([
      "/spine-assets/hilo-character.skel",
      "/spine-assets/hilo-character.atlas",
      "/spine-assets/cash-out.skel",
      "/spine-assets/cash-out.atlas",
      "/spine-assets/Card.skel",
      "/spine-assets/Card.atlas",
      "/spine-assets/UI_Info.skel",
      "/spine-assets/UI_Info.atlas"
    ]);

    await engine().navigation.showScreen(NextScreenMobile);
  }
}
