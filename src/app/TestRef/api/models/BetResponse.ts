export interface BetResponseData {
  username: string;
  balance: number;
  currency: string;
  pick: number;
  field: number[];
  bomb_field: number[] | null;
  amount: number;
  multiplier: number;
  next_multiplier: number[];
  prize_list: number[];
  bomb_count: number;
  total_win: number;
  end_round: boolean;
}

export interface BetApiResponse {
  data: BetResponseData;
  error?: object;
}

export const mockBetResponse: BetApiResponse = {
  data: {
    username: "vinh_player",
    balance: 1000123,
    currency: "IDR",
    pick: 0,
    field: [],
    bomb_field: null,
    amount: 1,
    multiplier: 0,
    next_multiplier: [],
    prize_list: [1.25, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000],
    bomb_count: 5,
    total_win: 0,
    end_round: false,
  },
};
