import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Label;
  /** Button that closes the popup */
  private doneButton: Button;
  /** The panel background */
  private panelBase: RoundedBox;

  private messageLabel: Label;

  constructor(title: string = "Paused", message: string = "Game Paused") {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 350 }); // Increase height for message
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: title,
      style: { fill: 0xec1561, fontSize: 50 },
    });
    this.title.y = -100;
    this.panel.addChild(this.title);

    this.messageLabel = new Label({
      text: message,
      style: {
        fill: 0xffffff,
        fontSize: 24,
        wordWrap: true,
        wordWrapWidth: 350,
        align: 'center'
      },
    });
    this.messageLabel.y = -20;
    this.panel.addChild(this.messageLabel);

    this.doneButton = new Button({ text: "Resume" });
    this.doneButton.y = 100;
    this.doneButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);
  }

  public setTitle(text: string) {
    this.title.text = text;
  }

  public setMessage(text: string) {
    this.messageLabel.text = text;
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
