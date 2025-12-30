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
    // But allow desktop capabilities (min dimensions)
    engine().resizeOptions = {
      minWidth: 200,
      minHeight: 200,
      letterbox: false, // We handle letterboxing/centering manually in NextScreenMobile
    };

    // Force an immediate resize to apply the new options
    engine().resize();

    console.log(`[NextScreen] Loading Mobile View (Unified)...`);

    await engine().navigation.showScreen(NextScreenMobile);
  }
}
