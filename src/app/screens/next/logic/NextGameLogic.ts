import { GuessAction, GuessResult } from "../types/GameTypes";
import { CardSuit } from "../../../ui/Card";

export class NextGameLogic {
  // Determine the action for the "Higher" button based on current rank
  public static getHighAction(rank: string): GuessAction {
    if (rank === "A") return GuessAction.Higher; // Strict >
    if (rank === "K") return GuessAction.Equal; // Equal (for K this is the High button visually)
    return GuessAction.HigherOrEqual; // Inclusive >= (Mid cards)
  }

  // Determine the action for the "Lower" button based on current rank
  public static getLowAction(rank: string): GuessAction {
    if (rank === "A") return GuessAction.Equal; // Equal (for A this is the Low button visually)
    if (rank === "K") return GuessAction.Lower; // Strict <
    return GuessAction.LowerOrEqual; // Inclusive <= (Mid cards)
  }

  // Get display labels for UI buttons
  public static getLabelData(rank: string) {
    if (rank === "A") {
      return {
        highTitle: "Hi",
        highDesc: "Higher",
        lowTitle: "Eq",
        lowDesc: "Equal",
      };
    }
    if (rank === "K") {
      return {
        highTitle: "Eq",
        highDesc: "Equal",
        lowTitle: "Lo",
        lowDesc: "Lower",
      };
    }
    return {
      highTitle: "Hi",
      highDesc: "Higher or Equal",
      lowTitle: "Lo",
      lowDesc: "Lower or Equal",
    };
  }

  // Generate a new random card
  public static generateNextCard() {
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

    const nextRank = ranks[Math.floor(Math.random() * ranks.length)];
    const nextSuit = suits[Math.floor(Math.random() * suits.length)];
    const nextNumeric = ranks.indexOf(nextRank);

    return { rank: nextRank, suit: nextSuit, numeric: nextNumeric };
  }

  // Evaluate the result of a guess
  public static evaluateGuess(
    prevNumeric: number,
    nextNumeric: number,
    action: GuessAction,
  ): GuessResult {
    if (action === GuessAction.Skip) return GuessResult.Skip;

    switch (action) {
      case GuessAction.Higher: // Strict >
        return nextNumeric > prevNumeric ? GuessResult.Win : GuessResult.Lose;

      case GuessAction.Lower: // Strict <
        return nextNumeric < prevNumeric ? GuessResult.Win : GuessResult.Lose;

      case GuessAction.Equal: // Strict ==
        return nextNumeric === prevNumeric ? GuessResult.Win : GuessResult.Lose;

      case GuessAction.HigherOrEqual: // Inclusive >=
        return nextNumeric >= prevNumeric ? GuessResult.Win : GuessResult.Lose;

      case GuessAction.LowerOrEqual: // Inclusive <=
        return nextNumeric <= prevNumeric ? GuessResult.Win : GuessResult.Lose;

      default:
        return GuessResult.Lose;
    }
  }

  // Calculate probability of winning (0-100) for a given rank and action
  public static getWinProbability(rank: string, action: GuessAction): number {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const rankIndex = ranks.indexOf(rank);
    const total = 13;
    let prob = 0;

    if (rank === "A") {
      if (action === GuessAction.Higher || action === GuessAction.HigherOrEqual) {
        // High Button -> Strict Higher (> A) for A
        prob = (total - 1) / total;
      } else {
        // Low Button -> Equal (== A)
        prob = 1 / total;
      }
    } else if (rank === "K") {
      if (action === GuessAction.Higher || action === GuessAction.HigherOrEqual || action === GuessAction.Equal) {
        // High Button -> Equal (== K)
        prob = 1 / total;
      } else {
        // Low Button -> Strict Lower (< K)
        prob = (total - 1) / total;
      }
    } else {
      // Mid cards - Inclusive Logic
      if (action === GuessAction.HigherOrEqual) {
        // >= Rank
        // Ranks >= current: (total - rankIndex)
        prob = (total - rankIndex) / total;
      } else if (action === GuessAction.LowerOrEqual) {
        // <= Rank
        // Ranks <= current: (rankIndex + 1)
        prob = (rankIndex + 1) / total;
      } else if (action === GuessAction.Higher) {
        // Fallback for strict (should not be called by UI but good for safety)
        prob = (total - rankIndex - 1) / total;
      } else if (action === GuessAction.Lower) {
        // Fallback for strict
        prob = rankIndex / total;
      }
    }

    return prob * 100;
  }
}
