import { Container, Sprite, Texture, Graphics } from "pixi.js";
import { gsap } from "gsap"; // Using GSAP directly
import { engine } from "../getEngine";
import { BitmapLabel } from "../ui/BitmapLabel";
import { RoundedBox } from "../ui/RoundedBox";
import { FancyButton } from "@pixi/ui";

/** Popup that shows up when gameplay is paused */
export class ResultPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: BitmapLabel;
  /** The panel background */
  private panelBase: RoundedBox;

  private resultLabel: BitmapLabel;
  private resultBackground: Sprite | Graphics;

  private invisButton: FancyButton;

  // Container for safe area scaling
  private safeArea: Container;

  constructor() {
    super();

    // 1. Background Overlay
    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x000000;
    this.bg.interactive = true; // Block clicks
    this.bg.alpha = 0;
    this.addChild(this.bg);

    this.safeArea = new Container();
    this.addChild(this.safeArea);

    this.panel = new Container();
    this.safeArea.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 300 });
    this.panel.addChild(this.panelBase);

    this.title = new BitmapLabel({
      text: "1.25x",
      style: { fill: 0xec1561, fontSize: 120, fontFamily: "coccm-bitmap-3-normal" },
    });
    this.title.y = -80;
    this.panel.addChild(this.title);

    // --- result background (placeholder, can be replaced with sprite later) ---
    this.resultBackground = new Graphics()
      .roundRect(0, 0, 400, 80, 20)
      .fill(0x222222);
    this.resultBackground.y = -this.resultBackground.height / 2;
    this.panel.addChild(this.resultBackground);

    // --- result label ---
    this.resultLabel = new BitmapLabel({
      text: "0.13", // placeholder
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontFamily: "coccm-bitmap-3-normal",
        align: "center",
      },
    });
    this.resultLabel.anchor.set(0.5);
    this.resultLabel.x = this.resultBackground.width / 2;
    this.resultLabel.y = this.resultBackground.height / 2;
    this.panel.addChild(this.resultLabel);

    this.invisButton = new FancyButton({
      defaultView: "rounded-rectangle.png",
      anchor: 0.5,
      width: 100, // placeholder
      height: 100,
    });
    this.invisButton.alpha = 0;
    this.safeArea.addChild(this.invisButton); // Add to safe area to cover content
    this.invisButton.onPress.connect(() => engine().navigation.dismissPopup());
  }

  public setResult(multiplier: number, baseAmount: number) {
    const total = baseAmount * multiplier;
    this.title.text = `${multiplier.toFixed(2)}x`;

    // Check if total is effectively an integer (or close enough) to decide decimals?
    // User requested same format as main money but with currency symbol: "rp 2000" or "$2000"
    // Using id-ID to match MobileLayout logic, adding 'currency' style
    this.resultLabel.text = total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    // --- Resize BG ---
    this.bg.width = width;
    this.bg.height = height;

    // --- Safe Area Scaling (Match MobileLayout) ---
    const SAFE_WIDTH = 1075;
    const SAFE_HEIGHT = 1920;

    // Calculate scale to fit (Contain) within the window
    const scale = Math.min(width / SAFE_WIDTH, height / SAFE_HEIGHT);

    this.safeArea.scale.set(scale);
    this.safeArea.x = (width - SAFE_WIDTH * scale) / 2;
    this.safeArea.y = (height - SAFE_HEIGHT * scale) / 2;

    // Now treat safeArea as 1075x1920 space.
    // Center panel in safe area
    this.panel.x = SAFE_WIDTH / 2;
    this.panel.y = SAFE_HEIGHT / 2;

    const panelWidth = SAFE_WIDTH * 0.9; // 90% of phone width

    this.panelBase.width = panelWidth;

    const panelHeight = this.panelBase.height;
    const labelHeight = (panelHeight * 2) / 3;
    const resultHeight = (panelHeight * 1) / 3;

    // Optionally scale text to fit section (if you want dynamic font size)
    this.title.scale.set((labelHeight - 40 * 2) / this.title.height);
    // Clamp scale
    if (this.title.scale.x > 1) this.title.scale.set(1);

    // --- Multiplier label (top section) ---
    this.title.x = 0;
    this.title.y = this.panelBase.y - this.title.height / 2;

    // --- Result background (bottom section) ---
    const resultWidth = panelWidth - 40 * 2;
    this.resultBackground.width = resultWidth;
    this.resultBackground.height = resultHeight;
    this.resultBackground.x = -resultWidth / 2;
    this.resultBackground.y =
      this.panelBase.y + this.panelBase.height / 2 - resultHeight - 20;

    // --- Result label centered on result background ---
    this.resultLabel.x =
      this.resultBackground.x + this.resultBackground.width / 2;
    this.resultLabel.y =
      this.resultBackground.y + this.resultBackground.height / 2;

    // Invis button covers the whole safe Area (effectively blocking clicks on game, but user can click anywhere in safe area to close?)
    // Or should it cover entire screen? 
    // Construct logic: invisButton needs to be full screen really.
    // Use bg for full screen click? Or use InvisButton added to this (root) but sized to width/height

    // Invis button covers the whole safe Area (effectively blocking clicks on game, but user can click anywhere in safe area to close?)
    if (this.invisButton.parent !== this) {
      this.addChild(this.invisButton);
    }
    this.invisButton.width = width;
    this.invisButton.height = height;
    this.invisButton.x = width / 2;
    this.invisButton.y = height / 2;

  }

  public async show() {

    // Safety Force Resize
    const { width, height } = engine().screen;
    this.resize(width, height);

    // Initial State
    this.bg.alpha = 0;
    this.panel.scale.set(0.5);
    this.visible = true;

    // --- Background fade in ---
    gsap.to(this.bg, {
      alpha: 0.8,
      duration: 0.2,
      ease: "power2.out",
    });

    // --- Panel "pop in" effect (Clash Royale style) ---
    await gsap.to(this.panel.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      ease: "back.out",
    });
    // wait 2 seconds (non-blocking for animation but blocking for hide?)
    // If we want it to auto-hide:
    setTimeout(() => {
      this.hide().then(() => engine().navigation.dismissPopup());
    }, 2000);
  }

  /** Dismiss the popup, animated */
  public async hide() {


    // --- Panel "pop out" / shrink away ---
    await gsap.to(this.panel.scale, {
      x: 0.5,
      y: 0.5,
      duration: 0.3,
      ease: "back.in(1.7)",
    });

    // Parallel fade out
    gsap.to(this.panel, { alpha: 0, duration: 0.2 });

    // Fade out the background
    await gsap.to(this.bg, {
      alpha: 0,
      duration: 0.2,
    });

    this.visible = false;
  }
}
