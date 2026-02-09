import { GameState, GuessAction } from "../screens/next/types/GameTypes";

export interface GameRoundResult {
  multiplier: number;
  isWin: boolean;
  timestamp: number;
  amount: number;
}

export interface CardHistoryData {
  rank: string;
  suit: string;
  action: GuessAction;
  multiplier: number;
}

export class GameData {
  private static _instance: GameData;

  public static readonly MIN_BET = 1000;
  public static readonly MAX_BET = 10000000;

  // Player info (synced from API)
  public username: string = "player";
  public currency: string = "IDR";
  public totalMoney: number = 4500000;

  public currentBet: number = 0.02;
  public history: GameRoundResult[] = [];

  // New State Management
  public currentState: GameState = GameState.NonBetting;
  public cardHistory: CardHistoryData[] = [];

  private constructor() { }

  public static get instance(): GameData {
    if (!GameData._instance) {
      GameData._instance = new GameData();
    }
    return GameData._instance;
  }

  /**
   * Initialize player data from API response (lastActivity)
   */
  public static initFromApi(username: string, balance: number, currency: string) {
    GameData.instance.username = username;
    GameData.instance.totalMoney = balance;
    GameData.instance.currency = currency;
  }

  public resetGameSession() {
    this.currentState = GameState.NonBetting;
    this.cardHistory = [];
  }

  public addCardHistory(rank: string, suit: string, action: GuessAction, multiplier: number) {
    this.cardHistory.push({ rank, suit, action, multiplier });
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
