// src/app/ui/UIManager.ts

import { engine } from "../../getEngine";
import { ResultPopup } from "../../popups/ResultPopup";
import { PopupHistoryUI } from "../../popups/History/PopupHistoryUI";
import { GameRulePopup } from "../../popups/GameRulePopup";

export class UIManager {
  private static _instance: UIManager;

  // Prevent external construction
  private constructor() { }

  /** Access the singleton instance */
  public static get instance(): UIManager {
    if (!this._instance) this._instance = new UIManager();
    return this._instance;
  }

  /** Show the result popup */
  public showResult(multiplier: number, base: number) {
    engine().navigation.presentPopup(ResultPopup, (popup) => {
      (popup as ResultPopup).setResult(multiplier, base);
    });
  }

  /** Show the history popup */
  public showHistory() {
    engine().navigation.presentPopup(PopupHistoryUI);
  }

  /** Show the game rule popup */
  public showGameRule() {
    engine().navigation.presentPopup(GameRulePopup);
  }

  /** Close all popups or handle cleanup */
  public closeAll() {
    engine().navigation.dismissPopup();
  }
}

// Optional: export shortcut for convenience
export const UI = UIManager.instance;
