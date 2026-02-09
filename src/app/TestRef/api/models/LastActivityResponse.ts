export interface LastActivity {
  pick: number;
  field: number[];
  bomb_field: number[];
  amount: number;
  multiplier: number;
  next_multiplier: number[];
  prize_list: number[];
  bomb_count: number;
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
    balance: 12020234.23,
    currency: "IDR",
    last_activity: {
      pick: 2,
      field: [0, 3],
      bomb_field: [1, 3, 5, 23, 15],
      amount: 100,
      multiplier: 1.5,
      next_multiplier: [1.23],
      prize_list: [1.25, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000],
      bomb_count: 1,
      total_win: 150,
      is_settle: true,
      end_round: true,
    },
    last_bet: 100,
  },
};
