import { GuessAction } from "../types/GameTypes";
import { NextGameLogic } from "./NextGameLogic";

export class MultiplierManager {
    private _currentMultiplier: number = 1.0; // Default start
    private _baseMultiplier: number = 1.0;

    constructor() {
        this.reset();
    }

    public reset() {
        this._currentMultiplier = this._baseMultiplier;
    }

    public get currentMultiplier(): number {
        // Keep 2 decimal places for display, but logic might want more precision internally?
        // User said "currentMultiplier *= actualMultiplier".
        // It's better to keep high precision internally and only round for display if needed.
        // But the previous getter rounded to 2.
        // Let's return fixed 2 for display consistency, but beware of drift if we used this for calculation.
        // We use _currentMultiplier for calc, so it's fine.
        return parseFloat(this._currentMultiplier.toFixed(2));
    }

    /**
     * Calculates the fair multiplier based on win probability.
     * fairMultiplier = 1 / probabilityOfWinning
     * actualMultiplier = fairMultiplier * 0.98 (2% house edge)
     * The multiplier must never decrease after a win.
     */
    public calculateMultiplier(rank: string, action: GuessAction): number {
        const winProbPercent = NextGameLogic.getWinProbability(rank, action);

        // Handle edge cases where probability is 0 (should shouldn't happen in valid moves) or 100
        if (winProbPercent <= 0) return 0; // Loss certain, or invalid

        const probability = winProbPercent / 100;
        const fairMultiplier = 1 / probability;

        // Apply house edge
        let actualMultiplier = fairMultiplier * 0.98;

        // "The multiplier must never decrease after a win."
        // If probability is 100% (1.0), fair is 1.0, actual is 0.98.
        // We must ensure actualMultiplier >= 1.0
        if (actualMultiplier < 1.0) {
            actualMultiplier = 1.0;
        }

        return actualMultiplier;
    }

    // Getting the NEXT total multiplier (prediction)
    public getNextMultiplier(rank: string, action: GuessAction): number {
        const factor = this.calculateMultiplier(rank, action);
        // Returns what the multiplier WOULD be
        return parseFloat((this._currentMultiplier * factor).toFixed(2));
    }

    public applyWin(rank: string, action: GuessAction) {
        const factor = this.calculateMultiplier(rank, action);
        this._currentMultiplier *= factor;
    }
}
