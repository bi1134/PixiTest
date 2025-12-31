export enum GlobalConfig {
  // Game specific configs can go here if needed
}

export const ERROR_MESSAGE: Map<string, { title: string; message: string }> =
  new Map([
    [
      "InvalidApiKey",
      {
        title: "Authentication Error",
        message: "API key is required or API key not found.",
      },
    ],
    [
      "InvalidPlayerToken",
      {
        title: "Session Error",
        message: "Player token is required or not found.",
      },
    ],
    [
      "InvalidRequest",
      {
        title: "Request Error",
        message: "Request is required or not found.",
      },
    ],
    [
      "InsufficientBalance",
      {
        title: "Insufficient Fund",
        message: "Balance is not enough for doing bet.",
      },
    ],
    [
      "PlayerNotExist",
      {
        title: "Player Error",
        message: "Player does not exist.",
      },
    ],
    [
      "BetNotFound",
      {
        title: "Bet Error",
        message: "Invalid Bet Id.",
      },
    ],
    [
      "ConnectionTimeout",
      {
        title: "Connection Error",
        message: "Error on connection.",
      },
    ],
    [
      "GameNotFound",
      {
        title: "Game Error",
        message: "Invalid game id or not found.",
      },
    ],
    [
      "RetryApiRequest",
      {
        title: "System Error",
        message: "There is client having a issue on code.",
      },
    ],
    [
      "InvalidSignature",
      {
        title: "Security Error",
        message: "Signature not match.",
      },
    ],
    [
      "GameMaintenance",
      {
        title: "Maintenance",
        message: "Game is current off.",
      },
    ],
  ]);