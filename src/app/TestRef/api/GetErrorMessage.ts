import { engine } from "../../app/getEngine";
import { PausePopup } from "../../app/popups/PausePopup";
import { ERROR_MESSAGE } from "../config/GlobalConfig";
import { GameState } from "../manage_game_states/GameState";
import { GameStateManager } from "../manage_game_states/GameStateManager";

export class GetErrorMessage {

  public static showApiErrorPopup(error: any) {
    this.resetGameSate();

    GameStateManager.getInstance().setState(GameState.NOT_BETTING);

    const errorObj = ERROR_MESSAGE.get(error.code);

    if (errorObj)
      engine().navigation.presentPopup(new PausePopup(errorObj.title, errorObj.message));
    else
      engine().navigation.presentPopup(new PausePopup(error.code, error.message));
  }

  private static resetGameSate() {
    GameStateManager.getInstance().unFreezeGame();
  }

  public static showUnExpectedError(message: any) {
    this.resetGameSate();

    engine().navigation.presentPopup(
      new PausePopup("Unexpected Error", message),
    );
  }

}
