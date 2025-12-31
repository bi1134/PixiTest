import { ApiClient } from "../ApiClient";
import { ApiRoute, getBaseUrl, getToken } from "../ApiRoute";
import { BetApiResponse, mockBetResponse } from "../models/BetResponse";
import { CashoutApiResponse, mockCashoutResponse } from "../models/CashoutResponse";
import { LastActivityApiResponse, mockLastActivityResponse } from "../models/LastActivityResponse";
import { mockPickResponse, PickApiResponse } from "../models/PickResponse";
import { HistoryApiResponse, mockHistoryResponse } from "../models/HistoryResponse";
import { HistoryDetailApiResponse, mockHistoryDetailResponse } from "../models/HistoryDetailResponse";
import { ResultApiResponse, mockResultResponse } from "../models/ResultResponse";

export class GameService {
  public static async lastActivity(): Promise<LastActivityApiResponse> {
    const res = await ApiClient.get(ApiRoute.LAST_ACTIVITY);

    if (res.useMock) {
      return this.mockDelay(mockLastActivityResponse);
    }
    return res.data;
  }

  public static async bet(
    amount: number,
    action: string = "start"
  ): Promise<BetApiResponse> {
    const body = {
      amount: amount,
      action: action,
    };
    const res = await ApiClient.post(ApiRoute.BET, body);
    if (res.useMock) {
      return this.mockDelay(mockBetResponse);
    }
    return res.data;
  }

  public static async skip(action: string = "skip"): Promise<PickApiResponse> {
    const body = {
      action: action,
    };
    const res = await ApiClient.post(ApiRoute.PICK, body);
    if (res.useMock) {
      return this.mockDelay(mockPickResponse);
    }
    return res.data;
  }

  public static async pick(action: string): Promise<PickApiResponse> {
    const body = {
      action: action,
    };
    const res = await ApiClient.post(ApiRoute.PICK, body);
    if (res.useMock) {
      return this.mockDelay(mockPickResponse);
    }
    return res.data;
  }

  public static async cashout(): Promise<CashoutApiResponse> {
    const res = await ApiClient.post(ApiRoute.CASHOUT, {});
    if (res.useMock) {
      return this.mockDelay(mockCashoutResponse);
    }
    return res.data;
  }

  public static async result(): Promise<ResultApiResponse> {
    const res = await ApiClient.post(ApiRoute.RESULT, {});
    if (res.useMock) {
      return this.mockDelay(mockResultResponse);
    }
    return res.data;
  }

  public static async history(): Promise<HistoryApiResponse> {
    const res = await ApiClient.post(ApiRoute.HISTORY, {});
    if (res.useMock) {
      return this.mockDelay(mockHistoryResponse);
    }
    return res.data;
  }

  public static async historyDetail(txId: string): Promise<HistoryDetailApiResponse> {
    const res = await ApiClient.post(`${ApiRoute.HISTORY}/${txId}`, {});
    if (res.useMock) {
      return this.mockDelay(mockHistoryDetailResponse);
    }
    return res.data;
  }

  private static mockDelay<T>(data: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 500);
    });
  }
}
