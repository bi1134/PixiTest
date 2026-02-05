import { GuessAction } from "../types/GameTypes";
import { NextGameLogic } from "./NextGameLogic";

export class MultiplierManager {
    private _currentMultiplier: number = 1.0; // Default start
    private _baseMultiplier: number = 1.0;

    private _comboCount: number = 0;
    private _comboDirection: 'High' | 'Low' | null = null;
    private readonly COMBO_TARGET = 3;

    constructor() {
        this.reset();
    }

    public get comboCount() { return this._comboCount; }
    public get currentMultiplier(): number {
        return parseFloat(this._currentMultiplier.toFixed(2));
    }

    public reset() {
        this._currentMultiplier = this._baseMultiplier;
        this._comboCount = 0;
        this._comboDirection = null;
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

    public applyWin(rank: string, action: GuessAction) {
        const factor = this.calculateMultiplier(rank, action);

        // Combo Logic
        const actionDir = this.getActionDirection(action);

        if (this._comboDirection === null) {
            // Start Streak
            if (actionDir !== 'Neutral') {
                this._comboDirection = actionDir;
                this._comboCount = 1;
            } else {
                this._comboCount = 1;
                // Direction remains null until explicit High/Low
            }
        } else {
            // Existing Streak
            let matches = false;
            // Equal counts for both if we are already in a streak
            if (this._comboDirection === 'High' && this.isHighGroup(action)) matches = true;
            else if (this._comboDirection === 'Low' && this.isLowGroup(action)) matches = true;

            if (matches) {
                this._comboCount++;
            } else {
                // Reset and start new?
                this._comboCount = 1;
                this._comboDirection = actionDir !== 'Neutral' ? actionDir : null;
            }
        }

        // Apply Bonus if target reached
        let bonus = 1.0;
        if (this._comboCount >= this.COMBO_TARGET) {
            bonus = 2.0;
        }

        this._currentMultiplier *= (factor * bonus);
    }

    /**
     * Returns data for the Combo Text prompt.
     * "2 more High to get 15.5x"
     */
    public getComboPrompt(rank: string, currentMultiplier: number): { actionLabel: string, remaining: number, predictedTotal: number } {

        const targetDir = this._comboDirection || 'High';

        let remaining = this.COMBO_TARGET - this._comboCount;

        if (remaining <= 0) remaining = 3;

        // Calculate hypothetical multiplier
        const avgFactor = 2.0;
        const bonus = 2.0;

        const predictedTotal = currentMultiplier * Math.pow(avgFactor, remaining) * bonus;

        return {
            actionLabel: targetDir,
            remaining: remaining,
            predictedTotal: parseFloat(predictedTotal.toFixed(2))
        };
    }
}
