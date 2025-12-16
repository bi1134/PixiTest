import { FancyButton } from "@pixi/ui";
import { Ticker } from "pixi.js";
import { gsap } from "gsap";

export interface SpeedButtonOptions {
  defaultView?: string;
  textStyle?: any;
}

export class SpeedButton extends FancyButton {
  private speedIndex = 0;
  private speeds = [1, 2, 5, 10];

  constructor(options?: SpeedButtonOptions) {
    super({
      defaultView: options?.defaultView ?? "rounded-rectangle.png",
      text: "Speed: 1x",
      textStyle: options?.textStyle ?? {
        fill: 0xffffff,
        fontSize: 20,
        fontWeight: "bold",
      },
      anchor: 0.5,
    });

    this.onPress.connect(this.cycleSpeed.bind(this));
  }

  private cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
    const speed = this.speeds[this.speedIndex];

    Ticker.shared.speed = speed;
    gsap.globalTimeline.timeScale(speed);

    this.text = `Speed: ${speed}x`;
  }
}
