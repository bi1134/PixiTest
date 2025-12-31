export interface BetResponseData {
  username: string;
  balance: number;
  currency: string;
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

export interface BetApiResponse {
  data: BetResponseData;
  error?: object;
}

export const mockBetResponse: BetApiResponse = {
  data: {
    username: "vinh_player",
    balance: 10098280.5,
    currency: "IDR",
    pick: 0,
    rank: 5,
    suit: 1,
    history_cards: ["n-1-5-0.00"],
    chance_up: 69.23,
    chance_down: 38.46,
    amount: 1000,
    multiplier: 0,
    total_win: 0,
    end_round: false,
  },
};
