import { Ticker } from "pixi.js";
import { gsap } from "gsap";
import { CustomButton, CustomButtonOptions } from "./CustomButton";
import { ButtonOptions } from "@pixi/ui";

export interface SpeedButtonOptions extends ButtonOptions {
  // Speed specific options if any
}

export class SpeedButton extends CustomButton {
  private speedIndex = 0;
  private speeds = [1, 2, 5, 10];

  constructor(options?: any) { // Type as any or custom options to fit existing calls
    // User passes { defaultView: ... } which fits ButtonOptions

    // CustomButton expects (opts?: CustomButtonOptions, options?: ButtonOptions)
    // We want default text args.
    const customOpts: CustomButtonOptions = {
      text: "Speed: 1x",
      fontSize: 20,
      fontFamily: "coccm-bitmap-3-normal",
    };

    const buttonOpts: ButtonOptions = {
      defaultView: options?.defaultView ?? "rounded-rectangle.png",
      anchor: 0.5,
      ...options // allow override
    };

    super(customOpts, buttonOpts);

    this.onPress.connect(this.cycleSpeed.bind(this));
  }

  private cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
    const speed = this.speeds[this.speedIndex];

    Ticker.shared.speed = speed;
    gsap.globalTimeline.timeScale(speed);

    // CustomButton stores text in protected customText
    if (this.customText) {
      this.customText.text = `Speed: ${speed}x`;
    }
  }
}
