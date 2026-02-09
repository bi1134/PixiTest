export interface HistoryResponseData {
    bet_id: string;
    amount: number;
    total_win: number;
    multiplier: number;
    timestamp: number;
}

export interface HistoryApiResponse {
    data: HistoryResponseData[];
    current_page: number;
    total_page: number;
    error?: object | null;
}

export const mockHistoryResponse: HistoryApiResponse = {
    data: [
        {
            bet_id: "69096def892661919f097b48",
            amount: 100,
            total_win: 50000,
            multiplier: 500.23,
            timestamp: 1762225668100
        },
        {
            bet_id: "69096e23892661919f097b60",
            amount: 100,
            total_win: 1000,
            multiplier: 10,
            timestamp: 1762225707605
        },
        {
            bet_id: "69096e14892661919f097b5b",
            amount: 100,
            total_win: 0,
            multiplier: 0,
            timestamp: 1762225684918
        },
        {
            bet_id: "69096e0d892661919f097b57",
            amount: 100,
            total_win: 200,
            multiplier: 20,
            timestamp: 1762225679004
        },
        {
            bet_id: "69096e0b892661919f097b53",
            amount: 100,
            total_win: 5000,
            multiplier: 5000,
            timestamp: 1762225676415
        },
        {
            bet_id: "69096e08892661919f097b4f",
            amount: 100,
            total_win: 40,
            multiplier: 40,
            timestamp: 1762225673817
        },
        {
            bet_id: "69087b9d892661919f097b20",
            amount: 100,
            total_win: 917,
            multiplier: 9.17,
            timestamp: 1762163620923
        },
        {
            bet_id: "69087a97892661919f097b13",
            amount: 100,
            total_win: 199,
            multiplier: 1.99,
            timestamp: 1762163359429
        },
    ],
    current_page: 1,
    total_page: 20,
    error: null
}