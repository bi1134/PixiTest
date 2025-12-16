import { FancyButton } from "@pixi/ui";
import { BitmapText, Container, Text } from "pixi.js";
import { buttonAnimation } from "../../ui/ButtonAnimations";

export class TopHistoryUI extends Container {
  private readonly TOTAL_DAYS_OFFSET = 2;
  private currentDayOffset: number = 0;

  private previousBtn: FancyButton;
  private nextBtn: FancyButton;

  public onDayOffsetChange?: (dayOffset: number) => void;

  private dateText: BitmapText;
  private timeZoneText: Text;

  constructor() {
    super();

    this.dateText = new BitmapText({
      text: "Hari ini",
      anchor: 0.5,
      style: {
        fontFamily: "coccm-bitmap-3-normal.fnt",
        fontSize: 23,
      },
    });

    this.timeZoneText = new Text({
      text: "Zona Waktu (GMT +7)",
      anchor: 0.5,
      style: {
        fontFamily: "Supercell-magic-webfont",
        fontSize: 20,
        fontWeight: "bold",
        fill: "#76859F",
      },
    });
    this.timeZoneText.position.set(
      0,
      this.dateText.y + this.dateText.height * 2,
    );

    this.previousBtn = new FancyButton({
      defaultView: "next-button-off.png",
      animations: buttonAnimation,
    });
    this.previousBtn.position.set(-this.timeZoneText.width, 0);

    this.nextBtn = new FancyButton({
      defaultView: "next-button-on.png",
      animations: buttonAnimation,
    });
    this.nextBtn.scale.x = -1; // Flip horizontal to get sprite
    this.nextBtn.position.set(this.timeZoneText.width, 0);

    this.addChild(
      this.nextBtn,
      this.previousBtn,
      this.dateText,
      this.timeZoneText,
    );

    // Handle event clicked
    this.previousBtn.onPress.connect(() => {
      this.currentDayOffset--;

      if (this.currentDayOffset === 0)
        this.previousBtn.defaultView = "next-button-off.png";

      if (this.currentDayOffset < 0) {
        this.currentDayOffset = 0;
        return;
      }
      this.nextBtn.defaultView = "next-button-on.png";

      this.updateDateText();
      this.onDayOffsetChange?.(this.currentDayOffset);
    });

    this.nextBtn.onPress.connect(() => {
      this.currentDayOffset++;

      if (this.currentDayOffset === this.TOTAL_DAYS_OFFSET)
        this.nextBtn.defaultView = "next-button-off.png";

      if (this.currentDayOffset > this.TOTAL_DAYS_OFFSET) {
        this.currentDayOffset = this.TOTAL_DAYS_OFFSET;
        return;
      }

      this.previousBtn.defaultView = "next-button-on.png";

      this.updateDateText();
      this.onDayOffsetChange?.(this.currentDayOffset);
    });
  }

  private updateDateText() {
    const date = new Date();
    date.setDate(date.getDate() - this.currentDayOffset);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let dateString: string;

    if (this.currentDayOffset === 0) {
      dateString = "Hari ini";
    } else if (this.currentDayOffset === 1) {
      dateString = "Kemarin";
    } else {
      dateString = `${month}/${day}/${year}`;
    }

    this.dateText.text = dateString;
  }

  public reset() {
    this.currentDayOffset = 0;
    this.previousBtn.defaultView = "next-button-off.png";
    this.nextBtn.defaultView = "next-button-on.png";
    this.updateDateText();
  }
}
