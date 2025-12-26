import { BitmapText, Container, Graphics, Sprite } from "pixi.js";

import { GuessAction } from "../screens/next/types/GameTypes";
import { gsap } from "gsap";

export class CardHistoryItem extends Container {
  private innerContainer: Container;
  private cardSprite!: Sprite;
  private actionSprite!: Sprite;
  private multiplierTextLabel!: BitmapText;
  private multiplierBackground!: Sprite;

  private _rank!: string;
  private _suit!: string;
  private _action!: GuessAction;

  public get value(): string {
    return this._rank;
  }
  public get suit(): string {
    return this._suit;
  }
  public get action(): GuessAction {
    return this._action;
  }

  // public targetX: number = 0; // Removed: Handled by PixiUI List

  constructor(rank: string, suit: string, action: GuessAction) {
    super();

    // Create inner container for local animations (like "fake position" slide-in)
    // independent of the parent Layout/List positioning.
    this.innerContainer = new Container();
    this.addChild(this.innerContainer);

    this.Setup(rank, suit, action);
  }

  private Setup(rank: string, suit: string, action: GuessAction) {
    // Clear previous if reusing
    this.innerContainer.removeChildren();

    this._rank = rank;
    this._suit = suit;
    this._action = action;

    // --- card sprite ---
    const textureName = `${this._suit}-card-${this._rank.toLowerCase()}.png`;
    this.cardSprite = Sprite.from(`${textureName}`);
    this.innerContainer.addChild(this.cardSprite);

    // --- action sprite ---
    const actionTexture = this.ActionToIcon(this._action);
    this.actionSprite = Sprite.from(actionTexture);
    this.innerContainer.addChild(this.actionSprite);

    // --- multiplier background (below card) ---
    this.multiplierBackground = Sprite.from("Bar-result.png");
    this.innerContainer.addChild(this.multiplierBackground);

    this.multiplierTextLabel = new BitmapText({
      text: "1.5x",
      anchor: 0.5,
      style: {
        fontSize: 45,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "center",
      },
    });
    this.innerContainer.addChild(this.multiplierTextLabel);

    this.updateLayout(4);
  }

  //guess enum to icon texture name
  private ActionToIcon(action: GuessAction): string {
    switch (action) {
      case GuessAction.Higher:
        return "icon-higher.png";
      case GuessAction.HigherOrEqual:
        return "icon-higherEqual.png";

      case GuessAction.Lower:
        return "icon-lower.png";
      case GuessAction.LowerOrEqual:
        return "icon-lowerEqual.png";

      case GuessAction.Equal:
        return "icon-equal.png";

      case GuessAction.Skip:
        return "icon-skip.png";
      case GuessAction.Start:
        return "transparent.png";
      default:
        return "blank-icon.jpg"; // fallback (optional)
    }
  }

  public updateLayout(padding: number = 4) {
    // --- Layout internal parts relative to this item’s origin ---
    this.multiplierBackground.width = this.cardSprite.width;
    this.multiplierBackground.height = this.cardSprite.height * 0.2;
    this.multiplierBackground.x =
      this.cardSprite.width / 2 - this.multiplierBackground.width / 2;
    this.multiplierBackground.y = this.cardSprite.height + padding;

    this.actionSprite.scale.set(1.75);
    this.actionSprite.x = this.cardSprite.x - this.actionSprite.width / 1.5;
    this.actionSprite.y =
      this.cardSprite.height / 2 - this.actionSprite.height / 2;

    this.multiplierTextLabel.x =
      this.multiplierBackground.x +
      this.multiplierBackground.width / 2;
    this.multiplierTextLabel.y =
      this.multiplierBackground.y + this.multiplierBackground.height / 2;
  }

  public get widthScaled(): number {
    return this.cardSprite.width * this.scale.x;
  }

  public get heightScaled(): number {
    return (
      (this.cardSprite.height + this.multiplierBackground.height + 20) * this.scale.y
      // Approximation of total visual height including multiplier and padding
    );
  }

  public setBaseScale(scale: number) {
    this.scale.set(scale);
  }

  // Track active animations so we can stop them on destroy
  private activeAnimations: gsap.core.Tween[] = [];

  /**
   * Animates the entry of the card content (slide in from right/offset).
   * @param startOffset The X offset to start from (relative to 0)
   * @param duration Duration in seconds
   */
  public animateEntry(startOffset: number, duration: number) {
    // Set initial position
    this.innerContainer.x = startOffset;

    // Animate to 0
    const anim = gsap.to(this.innerContainer, {
      x: 0,
      duration: duration,
      ease: "back.out",
    });
    this.trackAnimation(anim);
  }

  public trackAnimation(anim: gsap.core.Tween) {
    this.activeAnimations.push(anim);
    anim.then(() => {
      const index = this.activeAnimations.indexOf(anim);
      if (index > -1) {
        this.activeAnimations.splice(index, 1);
      }
    });
  }

  // --- clean up resources ---
  public override destroy(options?: {
    children?: boolean;
    texture?: boolean;
    baseTexture?: boolean;
  }) {
    // STOP ALL ANIMATIONS
    this.activeAnimations.forEach((anim) => {
      anim.kill();
    });
    this.activeAnimations = [];

    // explicit safety check to avoid double-destroy issues
    if (this.destroyed) return;

    // explicitly destroy all children (to ensure Label and Graphics are cleaned up)
    this.innerContainer?.destroy({ children: true });

    // We don't need to destroy sprites individually if we destroy innerContainer with children:true,
    // but keeping it explicit doesn't hurt if we want to be safe.
    // Actually, best to just let Container destroy children.

    // null references
    this.cardSprite = null!;
    this.actionSprite = null!;
    this.multiplierBackground = null!;
    this.multiplierTextLabel = null!;
    this.innerContainer = null!;

    // finally call the parent destroy
    super.destroy(options);
  }
}
