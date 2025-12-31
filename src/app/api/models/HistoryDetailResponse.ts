export interface MiniGameInfor {
    minigames: {
        pick: number;
        rank: number;
        suit: number;
        history_cards: string[];
        chance_up: number;
        chance_down: number;
        amount: number;
        multiplier: number;
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
            debitAmount: 1000,
            creditAmount: 0,
            datetime: "2025-12-02T09:03:12.506Z",
            game_info: {
                minigames: {
                    pick: 8,
                    rank: 10,
                    suit: 3,
                    history_cards: [
                        "n-1-5-0.00",      // Start: 5 Diamonds
                        "h-2-8-1.20",      // Higher: 8 Clubs (Win)
                        "l-3-4-1.50",      // Lower: 4 Hearts (Win)
                        "s-2-9-1.50",      // Skip: 9 Clubs
                        "h-1-10-1.95",     // Higher: 10 Diamonds (Win)
                        "s-4-6-1.95",      // Skip: 6 Spades
                        "l-2-2-2.50",      // Lower: 2 Clubs (Win)
                        "h-1-3-0.00"       // Higher: 3 Diamonds (Lose - example)
                    ],
                    chance_up: 30.77,
                    chance_down: 76.92,
                    amount: 1000,
                    multiplier: 0,
                    total_win: 0
                },
                end_round: true
            },
            balance: 3465467
        }
    ],
    error: null
};