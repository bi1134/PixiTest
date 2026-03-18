import { gsap } from "gsap";
import { Text } from "pixi.js";
import { BitmapLabel } from "../ui/BitmapLabel";

export class NumberAnimator {
    /**
     * Smoothly animates a numeric value and updates the target text component on every frame.
     * 
     * @param target The Pixi Text or BitmapLabel component to update.
     * @param startValue The numeric value to start animating from.
     * @param endValue The target numeric value to reach.
     * @param duration Duration in seconds.
     * @param prefix Optional string to prepend (e.g., "$", "RP ", "x").
     * @param suffix Optional string to append (e.g., "%", "x").
     * @param decimals The number of decimal places to format the number to.
     * @param options GSAP configuration overrides (e.g., ease, delay, onComplete).
     * @returns A GSAP Tween object that can be paused, killed, or awaited.
     */
    public static animate(
        target: BitmapLabel | Text,
        startValue: number,
        endValue: number,
        duration: number,
        prefix: string = "",
        suffix: string = "",
        decimals: number = 0,
        options?: gsap.TweenVars
    ) {
        const proxy = { val: startValue };

        // Default ease
        const tweenConfig: gsap.TweenVars = {
            val: endValue,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                const numValue = proxy.val;

                // Dynamically zoom precision as we get close to the target
                // If it's pure integers, it stays at 0.
                let currentDecimals = 0;
                if (decimals > 0 && (endValue % 1 !== 0 || startValue % 1 !== 0)) {
                    const remaining = Math.abs(endValue - numValue);
                    if (remaining < 0.1) {
                        currentDecimals = Math.min(decimals, 2);
                    } else if (remaining < 1.0) {
                        currentDecimals = Math.min(decimals, 1);
                    }
                }

                const formatted = numValue.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: currentDecimals,
                });
                target.text = `${prefix}${formatted}${suffix}`;
            },
            ...options
        };

        // Merge user onUpdate if provided
        if (options && options.onUpdate) {
            const userUpdate = options.onUpdate;
            const ourUpdate = tweenConfig.onUpdate as Function;
            tweenConfig.onUpdate = function() {
                ourUpdate.call(this);
                userUpdate.call(this);
            };
        }

        return gsap.to(proxy, tweenConfig);
    }
}
