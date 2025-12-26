import { Ticker, Container, BitmapText, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { CustomSettingSwitcher, CustomSwitcherType } from "./CustomSettingSwitcher";

export class SpeedButton extends Container {
  private switcher: CustomSettingSwitcher;
  private icon: Sprite;
  private textLabel: BitmapText;
  private isSpeedUp = false;

  constructor() {
    super();

    // Switcher (Button-0-0 as default/OFF? User said default is Button-0-0, second is Button-0-1)
    // Assuming State 0 = 1x (Button-0-0), State 1 = 2x (Button-0-1)
    this.switcher = new CustomSettingSwitcher({
      views: ["Button-0-0.png", "Button-0-1.png"],
      type: CustomSwitcherType.SPEED,
    });

    this.addChild(this.switcher);
    // Icon (overlay)
    this.icon = Sprite.from("icon-speed.png");
    this.icon.anchor.set(0.5);
    this.icon.x = this.switcher.width / 2;
    this.icon.y = this.switcher.height / 2 - 20;
    this.switcher.addChild(this.icon);


    // Label (below)
    this.textLabel = new BitmapText({
      text: "Speed Up", // Default 1x
      style: {
        fontFamily: "coccm-bitmap-3-normal",
        fontSize: 35, // Matching previous customOpts or SettingsUI style
        align: "center",
      },
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.x = this.switcher.width / 2;
    this.textLabel.y = this.switcher.height + 20;
    this.addChild(this.textLabel);

    // Logic
    this.switcher.onChange.connect(this.onToggle.bind(this));
  }

  private onToggle(state: number | boolean) {
    // State 0 -> Button-0-0 -> 1x
    // State 1 -> Button-0-1 -> 2x
    this.isSpeedUp = state === 1;
    const speed = this.isSpeedUp ? 2 : 1;

    Ticker.shared.speed = speed;
    gsap.globalTimeline.timeScale(speed);
  }
}
