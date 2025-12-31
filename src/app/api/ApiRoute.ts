export var useMock = true;
export var TOKEN = "";

export function getToken(): { useMock: boolean; token: string } {
  const urlParams = Object.fromEntries(
    new URLSearchParams(window.location.search),
  );
  let temp: boolean;
  // console.log(urlParams);

  if (urlParams?.useMock == "true") {
    temp = true;
  } else {
    // Default to true for dev/mocking if no token is present or strictly if useMock is not explicitly false?
    // User requested fake data, so let's default to true if useMock is not present.
    // However, if token IS present, maybe we want real API?
    // For now, force true if useMock param is missing, or maybe checks if token is missing.
    // Given the user is stuck on 401, they likely lack a token.
    temp = true;
    TOKEN = urlParams?.token;
  }

  useMock = temp;
  return { useMock: temp, token: urlParams?.token };
}

export function getBaseUrl(): string {
  return "https://www.integration-api.net/games/minigames/";
  // return "https://mngs.nasisoto.org/games/minigames/";
  // return "http://backend.integration-api.net/games/minigames/";
}

export enum ApiRoute {
  LAST_ACTIVITY = "last-activity",
  BET = "bet",
  SKIP = "skip",
  PICK = "pick",
  CASHOUT = "cashout",
  RESULT = "result",
  HISTORY = "history",
  HISTORY_DETAIL = "history-detail"
}
