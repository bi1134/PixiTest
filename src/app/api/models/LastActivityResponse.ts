export interface LastActivity {
  pick: number;
  rank: number;
  suit: number;
  history_cards: string[];
  chance_up: number;
  chance_down: number;
  amount: number;
  multiplier: number;
  total_win: number;
  is_settle: boolean;
  end_round: boolean;
}

export interface LastActivityResponseData {
  username: string;
  balance: number;
  currency: string;
  last_activity: LastActivity;
  last_bet: number;
}

export interface LastActivityApiResponse {
  data: LastActivityResponseData;
  error?: object;
}

export const mockLastActivityResponse: LastActivityApiResponse = {
  data: {
    username: "vinh_player",
    balance: 12020234,
    currency: "IDR",
    last_activity: {
      pick: 2,
      rank: 10,
      suit: 3,
      history_cards: ["n-1-5-0.00", "l-3-10-1.06"],
      chance_up: 30.77,
      chance_down: 76.92,
      amount: 100,
      multiplier: 1.5,
      total_win: 150,
      is_settle: true,
      end_round: true,
    },
    last_bet: 100,
  },
};
