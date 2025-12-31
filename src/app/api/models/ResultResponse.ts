export interface ResultResponseData {
  username: string;
  balance: number;
  currency: string;
  bonus_event: number | null;
}

export interface ResultApiResponse {
  data: ResultResponseData;
  error?: object;
}

export const mockResultResponse: ResultApiResponse = {
  data: {
    username: "vinh_player",
    balance: 1000123,
    currency: "IDR",
    bonus_event: null,
  },
};
