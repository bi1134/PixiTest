export interface CashoutResponseData {
  pick: number;
  rank: number;
  suit: number;
  history_cards: string[];
  chance_up: number;
  chance_down: number;
  amount: number;
  multiplier: number;
  total_win: number;
  end_round: boolean;
}

export interface CashoutApiResponse {
  data: CashoutResponseData;
  error?: object;
}

export const mockCashoutResponse: CashoutApiResponse = {
  data: {
    pick: 1,
    rank: 10,
    suit: 3,
    history_cards: [
      "n-1-5-0.00",
      "l-3-10-1.06"
    ],
    chance_up: 30.77,
    chance_down: 76.92,
    amount: 1000,
    multiplier: 1.0616,
    total_win: 1060,
    end_round: true,
  },
};
