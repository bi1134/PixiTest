export interface GameRoundResult {
  multiplier: number;
  isWin: boolean;
  timestamp: number;
  amount: number;
}

export class GameData {
  private static _instance: GameData;

  public totalMoney: number = 1000;
  public currentBet: number = 0.02;
  public history: GameRoundResult[] = [];

  private constructor() { }

  public static get instance(): GameData {
    if (!GameData._instance) {
      GameData._instance = new GameData();
    }
    return GameData._instance;
  }

  public addRoundResult(multiplier: number, isWin: boolean, amount: number) {
    const result: GameRoundResult = {
      multiplier,
      isWin,
      timestamp: Date.now(),
      amount,
    };
    this.history.push(result);

    // Update money logic could go here or be handled by the controller
    if (isWin) {
      this.totalMoney += amount * multiplier;
    } else {
      // Money already deducted on bet start
      // this.totalMoney -= amount;
    }
  }
}
