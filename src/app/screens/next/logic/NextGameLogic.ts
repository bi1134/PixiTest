import { GuessAction, GuessResult } from "../types/GameTypes";
import { CardSuit } from "../../../ui/Card";

export class NextGameLogic {
  // Determine the action for the "Higher" button based on current rank
  public static getHighAction(rank: string): GuessAction {
    if (rank === "A") return GuessAction.Higher; // Strict >
    if (rank === "K") return GuessAction.Equal; // Equal
    return GuessAction.HigherOrEqual; // Inclusive >=
  }

  // Determine the action for the "Lower" button based on current rank
  public static getLowAction(rank: string): GuessAction {
    if (rank === "A") return GuessAction.Equal; // Equal
    if (rank === "K") return GuessAction.Lower; // Strict <
    return GuessAction.LowerOrEqual; // Inclusive <=
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
      highDesc: "Higher or equal",
      lowTitle: "Lo",
      lowDesc: "Lower or equal",
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
}
