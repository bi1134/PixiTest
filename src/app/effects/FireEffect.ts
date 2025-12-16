import { Container, Sprite, Texture, Color, ColorSource } from "pixi.js";
import { gsap } from "gsap";

export interface FireEffectOptions {
  particleCount?: number; // Particles per spawn
  spawnInterval?: number; // Milliseconds between spawns
  maxParticles?: number;
  colors?: (string | number)[]; // Gradient colors (Bottom -> Top)
  scaleRange?: { min: number; max: number };
  lifeTimeRange?: { min: number; max: number };
}

export class FireEffect extends Container {
  private active: boolean = false;
  private spawnTimer: any;
  private pool: Sprite[] = [];
  private options: FireEffectOptions;

  // Default Balatro-esque fire colors (Bright Yellow -> Orange -> Red -> Dark)
  private static readonly DEFAULT_COLORS = [
    0xffff00, 0xffa500, 0xff4500, 0x8b0000,
  ];
  private static _circleTexture: Texture;

  constructor(options?: FireEffectOptions) {
    super();
    this.options = {
      particleCount: 2,
      spawnInterval: 50,
      maxParticles: 200, // Increased default
      colors: FireEffect.DEFAULT_COLORS,
      scaleRange: { min: 0.5, max: 1.2 },
      lifeTimeRange: { min: 0.8, max: 1.5 },
      ...options,
    };
  }

  private _intensity: number = 1;

  public get intensity(): number {
    return this._intensity;
  }

  public set intensity(value: number) {
    this._intensity = Math.max(0, value);

    if (this._intensity === 0) {
      this.stop();
    } else if (!this.active) {
      this.start();
    }
  }

  public setColors(colors: (string | number)[]) {
    this.options.colors = colors;
  }

  public start() {
    if (this.active || this._intensity <= 0) return;
    this.active = true;
    this.spawnLoop();
  }

  public stop() {
    this.active = false;
    if (this.spawnTimer) {
      this.spawnTimer.kill();
      this.spawnTimer = null;
    }
  }

  private spawnLoop() {
    if (!this.active) return;

    const baseInterval = this.options.spawnInterval || 50;
    // Interval decreases less aggressively
    const currentInterval = Math.max(
      20,
      baseInterval / (1 + (this._intensity - 1) * 0.5),
    );

    // Count increases with intensity
    const baseCount = this.options.particleCount || 2;
    const currentCount = Math.max(
      1,
      Math.floor(baseCount * Math.sqrt(this._intensity)),
    );

    // Spawn particles
    for (let i = 0; i < currentCount; i++) {
      this.spawnParticle();
    }

    // Schedule next spawn
    this.spawnTimer = gsap.delayedCall(currentInterval / 1000, () =>
      this.spawnLoop(),
    );
  }

  private spawnParticle() {
    const particle = this.getParticle();

    // Reset particle state
    particle.alpha = 1;

    const scaleMod = Math.min(2.5, Math.pow(this._intensity, 0.4));
    particle.scale.set(
      this.randomRange(
        this.options.scaleRange!.min,
        this.options.scaleRange!.max,
      ) * scaleMod,
    );

    // Wider spread at higher intensity
    particle.x = (Math.random() - 0.5) * 40 * Math.sqrt(this._intensity);
    particle.y = 0;

    particle.rotation = Math.random() * Math.PI * 2;

    // Resolve Initial Color
    const initialColorVal =
      this.options.colors && this.options.colors.length > 0
        ? this.options.colors[0]
        : 0xffffff;
    const cInitial = new Color(initialColorVal);
    particle.tint = cInitial.toNumber(); // rgb number
    particle.alpha = cInitial.alpha; // sync alpha if provided in color

    this.addChild(particle);

    const duration = this.randomRange(
      this.options.lifeTimeRange!.min,
      this.options.lifeTimeRange!.max,
    );

    // Animation Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        this.recycleParticle(particle);
      },
    });

    // Move Up + Sway
    const heightMod = Math.min(2.5, Math.pow(this._intensity, 0.6));

    tl.to(
      particle,
      {
        y: -100 * heightMod - Math.random() * (50 * heightMod),
        x:
          particle.x +
          (Math.random() - 0.5) * (60 * Math.sqrt(this._intensity)),
        rotation: particle.rotation + (Math.random() - 0.5),
        duration: duration,
        ease: "power1.out",
      },
      0,
    );

    // Scale Down & Fade Out
    tl.to(
      particle.scale,
      {
        x: 0,
        y: 0,
        duration: duration * 0.9,
        delay: duration * 0.1,
        ease: "circ.in",
      },
      0,
    );

    // Explicit Alpha Fade at end (separate from tint)
    tl.to(
      particle,
      {
        alpha: 0,
        duration: duration * 0.3,
        delay: duration * 0.7,
        ease: "none",
      },
      0,
    );

    // Color Interpolation
    if (this.options.colors && this.options.colors.length > 1) {
      const colors = this.options.colors;
      const stepTime = duration / (colors.length - 1);

      // Proxy 0->1
      const colorProxy = { val: 0 };

      for (let i = 0; i < colors.length - 1; i++) {
        const c1 = new Color(colors[i]);
        const c2 = new Color(colors[i + 1]);

        const startR = c1.red;
        const startG = c1.green;
        const startB = c1.blue;

        const endR = c2.red;
        const endG = c2.green;
        const endB = c2.blue;

        gsap.fromTo(
          colorProxy,
          { val: 0 },
          {
            val: 1,
            duration: stepTime,
            delay: i * stepTime,
            ease: "none",
            onUpdate: () => {
              const r = startR + (endR - startR) * colorProxy.val;
              const g = startG + (endG - startG) * colorProxy.val;
              const b = startB + (endB - startB) * colorProxy.val;
              // Verify values are valid 0-1 range
              particle.tint = new Color({
                r: Math.max(0, r),
                g: Math.max(0, g),
                b: Math.max(0, b),
              }).toNumber();
            },
          },
        );
      }
    }
  }

  private getParticle(): Sprite {
    let p = this.pool.pop();
    if (!p) {
      p = new Sprite(FireEffect.getCircleTexture());
      p.anchor.set(0.5);
    }
    return p;
  }

  private recycleParticle(p: Sprite) {
    gsap.killTweensOf(p);
    gsap.killTweensOf(p.scale);
    this.removeChild(p);
    this.pool.push(p);
  }

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private static getCircleTexture(): Texture {
    if (!FireEffect._circleTexture) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      FireEffect._circleTexture = Texture.from(canvas);
    }
    return FireEffect._circleTexture;
  }
}
