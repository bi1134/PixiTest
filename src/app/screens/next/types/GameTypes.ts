export enum GuessAction {
  Higher = "Higher", // Strictly higher
  Lower = "Lower", // Strictly lower
  Equal = "Equal", // Strictly equal
  HigherOrEqual = "HigherOrEqual",
  LowerOrEqual = "LowerOrEqual",
  Skip = "Skip",
  Start = "Start",
}

export enum GuessResult {
  Win = "Win",
  Lose = "Lose",
  Skip = "Skip",
}

export enum GameState {
  NonBetting = "NonBetting",
  Betting = "Betting",
}
