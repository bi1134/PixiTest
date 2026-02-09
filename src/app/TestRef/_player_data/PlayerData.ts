export class PlayerData {
    public static readonly MIN_BET = 100;
    public static readonly MAX_BET = 10_000_000;

    public static username: string = "player"; // Default value for test
    public static balance: number = 10_000_000;
    public static currency: string = "IDR";

    public static init(username: string, balance: number, currency: string) {
        PlayerData.username = username;
        PlayerData.balance = balance;
        PlayerData.currency = currency;
    }
}