export interface AutoBetResponseData {
  username: string;
  balance: number;
  currency: string;
  pick: number;
  field: number[];
  bomb_field?: number[] | null;
  amount: number;
  multiplier: number;
  next_multiplier: number[],
  bomb_count: number;
  total_win: number;
  end_round: boolean;
}

// Response chung cho API bet
export interface AutoBetApiResponse {
  data: AutoBetResponseData;
  error?: object;
}

export const mockAutoBetResponse: AutoBetApiResponse = {
  data: {
    username: "vinh_player",
    balance: 1000123,
    currency: "IDR",
    pick: 1,
    field: [24],
    bomb_field: null,
    amount: 1000,
    multiplier: 2.65,
    next_multiplier: [1.24],
    bomb_count: 24,
    total_win: 2650,
    end_round: true,
  },
};
