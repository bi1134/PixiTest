import { GuessAction } from "../types/GameTypes";
import { NextGameLogic } from "./NextGameLogic";

export class MultiplierManager {
    private _currentMultiplier: number = 1.0; // Default start
    private _baseMultiplier: number = 1.0;

    private _comboCount: number = 0;
    private _comboDirection: 'High' | 'Low' | null = null;
    private _comboTier: number = 0; // Escalating tier (0, 1, 2, ...)
    private _currentComboBonus: number = 0; // Bonus for current tier
    private readonly COMBO_TARGET = 3;

    // Fixed combo bonus checkpoints - escalating rewards
    private readonly COMBO_BONUSES = [
        1.0,    // Tier 0: First combo → +1x
        2.0,    // Tier 1: Second combo → +2x
        5.0,    // Tier 2: Third combo → +5x
        10.0,   // Tier 3: Fourth combo → +10x
        25.0,   // Tier 4: Fifth combo → +25x
        50.0,   // Tier 5: Sixth combo → +50x
        100.0,  // Tier 6+: Max bonus → +100x
    ];

    constructor() {
        this.reset();
    }

    public get comboCount() { return this._comboCount; }
    public get comboBonus() { return this._currentComboBonus; }
    public get comboTier() { return this._comboTier; }
    public get currentMultiplier(): number {
        return parseFloat(this._currentMultiplier.toFixed(2));
    }

    /**
     * Full reset - on loss or cashout
     */
    public reset() {
        this._currentMultiplier = this._baseMultiplier;
        this._comboCount = 0;
        this._comboDirection = null;
        this._comboTier = 0;
        this._currentComboBonus = this.getBonusForTier(0);
    }

    /**
     * Partial reset - on direction change (keeps tier/bonus, resets counter)
     */
    public resetCounter() {
        this._comboCount = 0;
        this._comboDirection = null;
    }

    public setMultiplier(value: number) {
        this._currentMultiplier = value;
    }

    private isHighGroup(action: GuessAction): boolean {
        return action === GuessAction.Higher ||
            action === GuessAction.HigherOrEqual ||
            action === GuessAction.Equal;
    }

    private isLowGroup(action: GuessAction): boolean {
        return action === GuessAction.Lower ||
            action === GuessAction.LowerOrEqual ||
            action === GuessAction.Equal;
    }

    private getActionDirection(action: GuessAction): 'High' | 'Low' | 'Neutral' {
        if (action === GuessAction.Equal) return 'Neutral';
        if (this.isHighGroup(action)) return 'High';
        if (this.isLowGroup(action)) return 'Low';
        return 'Neutral';
    }

    public calculateMultiplier(rank: string, action: GuessAction): number {
        const winProbPercent = NextGameLogic.getWinProbability(rank, action);
        if (winProbPercent <= 0) return 0; // Loss certain

        const probability = winProbPercent / 100;
        const fairMultiplier = 1 / probability;
        let actualMultiplier = fairMultiplier * 0.98;

        if (actualMultiplier < 1.0) {
            actualMultiplier = 1.0;
        }

        return actualMultiplier;
    }

    public getNextMultiplier(rank: string, action: GuessAction): number {
        const factor = this.calculateMultiplier(rank, action);
        return parseFloat((this._currentMultiplier * factor).toFixed(2));
    }

    /**
     * Get fixed bonus for a given tier from the predefined list
     */
    private getBonusForTier(tier: number): number {
        if (tier >= this.COMBO_BONUSES.length) {
            return this.COMBO_BONUSES[this.COMBO_BONUSES.length - 1]; // Max bonus
        }
        return this.COMBO_BONUSES[tier];
    }

    /**
     * Start a new combo - sets the bonus for current tier
     */
    public startCombo() {
        this._currentComboBonus = this.getBonusForTier(this._comboTier);
        this._comboCount = 0;
    }

    public applyWin(rank: string, action: GuessAction) {
        const factor = this.calculateMultiplier(rank, action);

        // Combo Logic
        const actionDir = this.getActionDirection(action);

        if (this._comboDirection === null) {
            // Start new streak
            if (actionDir !== 'Neutral') {
                this._comboDirection = actionDir;
                this._comboCount = 1;
                // Set bonus for this combo at current tier
                if (this._currentComboBonus === 0) {
                    this._currentComboBonus = this.getBonusForTier(this._comboTier);
                }
            } else {
                this._comboCount = 1;
            }
        } else {
            // Existing Streak - check if same direction
            let matches = false;
            if (this._comboDirection === 'High' && this.isHighGroup(action)) matches = true;
            else if (this._comboDirection === 'Low' && this.isLowGroup(action)) matches = true;

            if (matches) {
                this._comboCount++;
            } else {
                // Direction change - reset counter, keep tier
                this._comboCount = 1;
                this._comboDirection = actionDir !== 'Neutral' ? actionDir : null;
                // Recalculate bonus for new direction at same tier
                this._currentComboBonus = this.getBonusForTier(this._comboTier);
            }
        }

        // Apply base multiplier
        const prevMult = this._currentMultiplier;
        this._currentMultiplier *= factor;

        console.log(`[Combo] Action: ${action}, Factor: ${factor.toFixed(2)}, Prev: ${prevMult.toFixed(2)}, After factor: ${this._currentMultiplier.toFixed(2)}, Counter: ${this._comboCount}/${this.COMBO_TARGET}`);

        // Check if combo completed
        if (this._comboCount >= this.COMBO_TARGET) {
            // Add combo bonus
            const bonusApplied = this._currentComboBonus;
            this._currentMultiplier += this._currentComboBonus;

            // Advance to next tier
            this._comboTier++;

            // Reset counter for next combo
            this._comboCount = 0;

            // Calculate new bonus for next tier
            this._currentComboBonus = this.getBonusForTier(this._comboTier);

            console.log(`[Combo] ✅ Tier ${this._comboTier - 1} complete! Bonus added: +${bonusApplied.toFixed(2)}x, Final mult: ${this._currentMultiplier.toFixed(2)}x, Next tier bonus: ${this._currentComboBonus.toFixed(2)}x`);
        }
    }

    /**
     * Returns data for the Combo Text prompt.
     * Shows current tier bonus that will be added on completion
     */
    public getComboPrompt(_rank: string, _currentMultiplier: number): { actionLabel: string, remaining: number, comboBonus: number } {

        const targetDir = this._comboDirection || 'High';

        let remaining = this.COMBO_TARGET - this._comboCount;
        if (remaining <= 0) remaining = 3;

        // Show the bonus for current tier
        const bonusToShow = this._currentComboBonus > 0
            ? this._currentComboBonus
            : this.getBonusForTier(this._comboTier);

        return {
            actionLabel: targetDir,
            remaining: remaining,
            comboBonus: bonusToShow
        };
    }
}


