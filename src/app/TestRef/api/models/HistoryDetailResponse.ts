export interface MiniGameInfor {
    minigames: {
        pick: number;
        field: number[];
        bomb_field: number[] | null;
        amount: number;
        multiplier: number;
        next_multiplier: number[];
        bomb_count: number;
        total_win: number;
    }
    end_round: boolean;
}

export interface HistoryDetailData {
    txId: string;
    status: string;
    debitAmount: number;
    creditAmount: number;
    datetime: string;
    game_info: MiniGameInfor;
    balance: number;
}

export interface HistoryDetailApiResponse {
    data: HistoryDetailData[];
    error?: object | null;
}

export const mockHistoryDetailResponse: HistoryDetailApiResponse = {

    data: [
        {
            txId: "692eab503a2ef9b5c16be661",
            status: "lose",
            debitAmount: 400,
            creditAmount: 0,
            datetime: "2025-12-02T09:03:12.506Z",
            game_info: {
                minigames: {
                    pick: 5,
                    field: [
                        12,
                        18,
                        1,
                        15,
                        9
                    ],
                    bomb_field: [
                        9,
                        8,
                        5,
                        17,
                        22
                    ],
                    amount: 0.4,
                    multiplier: 0,
                    next_multiplier: [
                        0
                    ],
                    bomb_count: 5,
                    total_win: 0
                },
                end_round: true
            },
            balance: 3465467
        }
    ],
    error: null

};