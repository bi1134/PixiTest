import { GuessAction } from "../types/GameTypes";
import { NextGameLogic } from "./NextGameLogic";

export class MultiplierManager {
    private _currentMultiplier: number = 0.75; // Default start
    private _baseMultiplier: number = 0.75;

    constructor() {
        this.reset();
    }

    public reset() {
        this._currentMultiplier = this._baseMultiplier;
    }

    public get currentMultiplier(): number {
        return parseFloat(this._currentMultiplier.toFixed(2));
    }

    /**
     * Calculates the potential increment based on win probability.
     * Formula: Increment = (100 - WinProbability%) * 0.01
     * Example: 90% Win Chance -> (100 - 90) * 0.01 = 0.1 increment
     * Example: 10% Win Chance -> (100 - 10) * 0.01 = 0.9 increment
     */
    public calculateIncrement(rank: string, action: GuessAction): number {
        const winProb = NextGameLogic.getWinProbability(rank, action);
        if (winProb === 0) return 0; // Should not happen for valid moves

        const risk = 100 - winProb;
        return risk * 0.01;
    }

    public getNextMultiplier(rank: string, action: GuessAction): number {
        const inc = this.calculateIncrement(rank, action);
        return parseFloat((this._currentMultiplier + inc).toFixed(2));
    }

    public applyWin(rank: string, action: GuessAction) {
        const inc = this.calculateIncrement(rank, action);
        this._currentMultiplier += inc;
        // Keep precise, but getter rounds it
    }
}
