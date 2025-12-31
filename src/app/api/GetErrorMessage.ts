import { engine } from "../../app/getEngine";
import { PausePopup } from "../../app/popups/PausePopup";
import { ERROR_MESSAGE } from "../config/GlobalConfig";
import { GameData } from "../data/GameData";

export class GetErrorMessage {

  public static showApiErrorPopup(error: any) {
    this.resetGameState();

    // We don't have a specific error code logic in GameData yet, 
    // but preventing betting is effectively done by resetting game state.

    // Try to find error message by code (string)
    const errorCode = error?.code ? String(error.code) : "Unknown";
    const errorObj = ERROR_MESSAGE.get(errorCode);

    if (errorObj) {
      engine().navigation.presentPopup(PausePopup, (popup: PausePopup) => {
        popup.setTitle(errorObj.title);
        popup.setMessage(errorObj.message);
      });
    } else {
      engine().navigation.presentPopup(PausePopup, (popup: PausePopup) => {
        popup.setTitle("Error");
        popup.setMessage(error?.message || "An unexpected error occurred.");
      });
    }
  }

  private static resetGameState() {
    GameData.instance.resetGameSession();
  }

  public static showUnExpectedError(message: any) {
    this.resetGameState();

    engine().navigation.presentPopup(PausePopup, (popup: PausePopup) => {
      popup.setTitle("Unexpected Error");
      popup.setMessage(String(message));
    });
  }

}
