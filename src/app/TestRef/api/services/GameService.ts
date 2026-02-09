import { PlayerData } from "../../_player_data/PlayerData";
import { ApiClient } from "../ApiClient";
import { ApiRoute, getBaseUrl, getToken, TOKEN, useMock } from "../ApiRoute";
import {
  AutoBetApiResponse,
  mockAutoBetResponse,
} from "../models/AutobetResponse";
import { BetApiResponse, mockBetResponse } from "../models/BetResponse";
import {
  CashoutApiResponse,
  mockCashoutResponse,
} from "../models/CashoutResponse";
import { HistoryDetailApiResponse, mockHistoryDetailResponse } from "../models/HistoryDetailResponse";
import { HistoryApiResponse, mockHistoryResponse } from "../models/HistoryResponse";
import {
  LastActivityApiResponse,
  mockLastActivityResponse,
} from "../models/LastActivityResponse";
import { mockBombPickApiResponse, mockCrownPickApiResponse, PickApiResponse } from "../models/PickResponse";
import {
  mockResultResponse,
  ResultApiResponse,
} from "../models/ResultResponse";

export class GameService {
  public static lastActivity: LastActivityApiResponse = mockLastActivityResponse;
  public static history: HistoryApiResponse = mockHistoryResponse;
  private crown = 5;

  constructor(private api: ApiClient) { }

  public async postHistory(current_page: number, day_offset: number): Promise<HistoryApiResponse> {
    if (!useMock) {
      const response = await this.api.post<HistoryApiResponse>(`${ApiRoute.HISTORY}`, { token: TOKEN, current_page, day_offset });
      GameService.history = response;
      return response;
    }

    return Promise.resolve(mockHistoryResponse);
  }

  public async postHistoryDetail(bet_id: string): Promise<HistoryDetailApiResponse> {
    if (!useMock) {
      const response = await this.api.post<HistoryDetailApiResponse>(`${ApiRoute.HISTORY}/${bet_id}`, { token: TOKEN });
      return response;
    }

    return Promise.resolve(mockHistoryDetailResponse);
  }

  public async getLastActivity(): Promise<LastActivityApiResponse> {
    if (!useMock) {
      const response = await this.api.get<LastActivityApiResponse>(
        `${ApiRoute.LAST_ACTIVITY}`,
        { token: TOKEN },
      );
      GameService.lastActivity = response;

      // Initial player data (only if data is not null)
      if (response.data) {
        PlayerData.init(response.data.username, response.data.balance, response.data.currency);
      }

      return response;
    }

    // If useMock is true, throw or return a rejected promise to satisfy return type
    return Promise.resolve(mockLastActivityResponse);
  }

  public async postBet(amount: number, bomb_count: number): Promise<BetApiResponse> {
    if (!useMock) {
      const response = await this.api.post<BetApiResponse>(`${ApiRoute.BET}`, {
        token: TOKEN,
        amount: amount,
        bomb_count: bomb_count,
      });

      PlayerData.balance = response?.data?.balance;
      return response;
    }
    // Provide a mock response or rejected promise if needed
    return Promise.resolve(mockBetResponse);
  }

  public async postAutoBet(
    amount: number,
    bomb_count: number,
    pick_index: number[],
  ): Promise<AutoBetApiResponse> {
    if (!useMock) {
      const response = await this.api.post<AutoBetApiResponse>(`${ApiRoute.BET}`, {
        token: TOKEN,
        amount: amount,
        bomb_count: bomb_count,
        pick_index: pick_index,
      });

      PlayerData.balance = response?.data?.balance;
      return response;
    }

    return Promise.resolve(mockAutoBetResponse);
  }

  public postPick(pick_index: number[]): Promise<PickApiResponse> {
    if (!useMock) {
      return this.api.post<PickApiResponse>(`${ApiRoute.PICK}`, {
        token: TOKEN,
        pick_index: pick_index,
      });
    }

    if (this.crown--) {
      return Promise.resolve(mockCrownPickApiResponse);
    }
    else {
      this.crown = 5;
      return Promise.resolve(mockBombPickApiResponse);
    }
  }

  public postCashout(): Promise<CashoutApiResponse> {
    if (!useMock) {
      return this.api.post<CashoutApiResponse>(`${ApiRoute.CASHOUT}`, {
        token: TOKEN,
      });
    }
    return Promise.resolve(mockCashoutResponse);
  }

  public async postResult(): Promise<ResultApiResponse> {
    if (!useMock) {
      const response = await this.api.post<ResultApiResponse>(`${ApiRoute.RESULT}`, {
        token: TOKEN,
      });

      // Update balance whenever post result request
      PlayerData.balance = response?.data?.balance;
      return response;
    }

    return Promise.resolve(mockResultResponse);
  }
}

const apiClient = new ApiClient(getBaseUrl(), getToken().token);

export const gameService = new GameService(apiClient);
