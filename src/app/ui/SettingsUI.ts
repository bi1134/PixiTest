import { Switcher } from "@pixi/ui";
import { gsap } from "gsap";
import { BitmapText, ColorMatrixFilter, Container, Sprite } from "pixi.js";
import { engine } from "../getEngine";
import {
  CustomSettingSwitcher,
  CustomSwitcherType,
} from "./CustomSettingSwitcher";
import { LayoutHelper } from "../utils/LayoutHelper";
import { UI } from "./Manager/UIManager";

export class SettingsUI extends Container {
  private settingsSwitcher: Switcher;
  private questionMark: CustomSettingSwitcher;
  private historyIcon: CustomSettingSwitcher;
  private audio: CustomSettingSwitcher;
  private settingText: BitmapText;
  public bgSetting: Sprite;


  constructor() {
    super();

    this.sortableChildren = true;

    // Background
    this.bgSetting = Sprite.from("bg-setting.png");
    this.bgSetting.anchor.set(0.5);

    this.bgSetting.zIndex = -1;
    this.bgSetting.visible = false;

    // Title Text
    this.settingText = new BitmapText({
      text: "Settingan",
      anchor: 0.5,
      style: {
        fontSize: 10,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "center",
      },
    });
    this.settingText.position.set(
      this.bgSetting.width / 2,
      this.bgSetting.y + this.bgSetting.height + 10,
    );

    // Main switcher button
    this.settingsSwitcher = new Switcher([
      "settings_icon_open.png",
      "settings_icon_close.png",
    ]);
    this.settingsSwitcher.onChange.connect((state) => {
      this.updateVisibleUI(state);
    });

    // History Icon
    this.historyIcon = new CustomSettingSwitcher({
      views: ["history.png", "history.png"],
      type: CustomSwitcherType.HISTORY,
    });
    this.historyIcon.visible = false;
    this.historyIcon.onChange.connect(() => {
      this.settingsSwitcher.switch(0);
      UI.showHistory();
    });

    // Audio Icon
    this.audio = new CustomSettingSwitcher({
      views: ["audio_on.png", "audio_off.png"],
      type: CustomSwitcherType.SOUND,
    });

    this.audio.visible = false;
    this.audio.onChange.connect((state) => {
      if (state) {
        engine().audio.setMasterVolume(0);
      } else {
        engine().audio.setMasterVolume(0.5);
      }
    });

    // Question Icon
    this.questionMark = new CustomSettingSwitcher({
      views: ["question_mark.png", "question_mark.png"],
      type: CustomSwitcherType.HELP,
    });
    this.questionMark.visible = false;
    this.questionMark.onChange.connect(() => {
      UI.showGameRule();
    });

    this.addChild(
      this.bgSetting,
      this.settingText,
      this.historyIcon,
      this.audio,
      this.questionMark,
      this.settingsSwitcher,
    );

    // Initial layout
    this.resize(this.width, this.height);
  }

  public resize(width: number, height: number) {
    const padding = 10;

    LayoutHelper.centerX(this.bgSetting, this.settingsSwitcher.width, 0, false);
    LayoutHelper.setPositionY(
      this.bgSetting,
      this.settingsSwitcher.y - this.bgSetting.height / 2 - padding,
    );

    const backgroundCenter = this.bgSetting.x;

    LayoutHelper.setPositionX(this.historyIcon, backgroundCenter);
    LayoutHelper.setPositionX(this.audio, backgroundCenter);
    LayoutHelper.setPositionX(this.questionMark, backgroundCenter);

    LayoutHelper.setPositionY(this.audio, this.bgSetting.y - padding);
    LayoutHelper.setPositionY(
      this.historyIcon,
      this.audio.y - this.audio.height - padding,
    );
    LayoutHelper.setPositionY(
      this.questionMark,
      this.audio.y + this.audio.height + padding,
    );

    LayoutHelper.setPositionX(
      this.settingText,
      this.settingsSwitcher.x + this.settingsSwitcher.width / 2,
    );
    LayoutHelper.setPositionY(
      this.settingText,
      this.settingsSwitcher.y + this.settingsSwitcher.height + padding,
    );
  }

  public updateUI(isBetting: boolean) {
    if (isBetting) {
      const color = new ColorMatrixFilter();
      color.grayscale(0.35, false);

      this.questionMark.filters = [color];
      this.historyIcon.filters = [color];
      this.questionMark.interactiveChildren = false;
      this.historyIcon.interactiveChildren = false;
    } else {
      this.questionMark.filters = [];
      this.historyIcon.filters = [];
      this.questionMark.interactiveChildren = true;
      this.historyIcon.interactiveChildren = true;
    }
  }

  private updateVisibleUI(state: number | boolean) {
    if (state) {
      gsap.to(this.bgSetting, {
        duration: 0.1,
        ease: "back.out",
        scale: 1,
        onStart: () => {
          this.bgSetting.visible = true;
        },
      });

      gsap.to(this.audio, {
        duration: 0.1,
        ease: "back.out",
        scale: 1,
        onStart: () => {
          this.audio.visible = true;
        },
      });
      gsap.to(this.historyIcon, {
        duration: 0.1,
        ease: "back.out",
        scale: 1,
        onStart: () => {
          this.historyIcon.visible = true;
        },
      });
      gsap.to(this.questionMark, {
        duration: 0.1,
        ease: "back.out",
        scale: 1,
        onStart: () => {
          this.questionMark.visible = true;
        },
      });
    } else {
      gsap.to(this.bgSetting, {
        duration: 0.1,
        ease: "back.in",
        scale: 0.75,
        onStart: () => {
          this.bgSetting.visible = false;
        },
      });

      gsap.to(this.audio, {
        duration: 0.1,
        ease: "back.in",
        scale: 0.75,
        onStart: () => {
          this.audio.visible = false;
        },
      });
      gsap.to(this.historyIcon, {
        duration: 0.1,
        ease: "back.in",
        scale: 0.75,
        onStart: () => {
          this.historyIcon.visible = false;
        },
      });
      gsap.to(this.questionMark, {
        duration: 0.1,
        ease: "back.in",
        scale: 0.75,
        onStart: () => {
          this.questionMark.visible = false;
        },
      });
    }
  }
}
