export interface PickResponseData {
  pick: number;
  rank?: number;
  suit?: number;
  history_cards?: string[];
  chance_up?: number;
  chance_down?: number;
  amount: number;
  multiplier: number;
  total_win: number;
  end_round: boolean;
  field?: number[];
  bomb_field?: number | null;
  next_multiplier?: number[];
  prize_list?: number[];
  bomb_count?: number;
}

export interface PickApiResponse {
  data: PickResponseData;
  error?: object;
}

export const mockPickResponse: PickApiResponse = {
  data: {
    pick: 1,
    rank: 10,
    suit: 3,
    history_cards: [
      "n-1-5-0.00",
      "s-2-4-0.00",
      "s-3-3-0.00",
      "s-2-9-0.00",
      "s-2-7-0.00",
      "s-3-11-0.00",
      "s-4-6-0.00",
      "s-4-13-0.00",
      "l-3-10-1.06"
    ],
    chance_up: 30.77,
    chance_down: 76.92,
    amount: 1000,
    multiplier: 1.0616,
    total_win: 1060,
    end_round: false,
  },
};

export const mockCrownPickApiResponse: PickApiResponse = {
  data: {
    pick: 1,
    field: [3],
    bomb_field: null,
    amount: 1123,
    multiplier: 2.31,
    next_multiplier: [1.47],
    prize_list: [1.25, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000],
    bomb_count: 22,
    total_win: 2559,
    end_round: false,
  },
};
