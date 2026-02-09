export interface PickResponseData {
  pick: number;
  field: number[];
  bomb_field?: number[] | null;
  amount: number;
  multiplier: number;
  next_multiplier: number[];
  prize_list: number[];
  bomb_count: number;
  total_win: number;
  end_round: boolean;
}

export interface PickApiResponse {
  data: PickResponseData;
  error?: object;
}

export const mockBombPickApiResponse: PickApiResponse = {
  data: {
    pick: 1,
    field: [3],
    bomb_field: null, // [2, 3, 5, 22, 1],
    amount: 1123,
    multiplier: 2.31,
    next_multiplier: [1.47],
    prize_list: [1.25, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000],
    bomb_count: 24,
    total_win: 2559,
    end_round: true,
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
