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
    temp = false;
    TOKEN = urlParams?.token;
  }

  useMock = temp;
  return { useMock: temp, token: urlParams?.token };
}

export function getBaseUrl(): string {
  // return "https://www.integration-api.net/games/minigames/";
  // return "https://mngs.nasisoto.org/games/minigames/";
  // return "https://backend.integration-api.net/games/minigames/";
  return "https://live.integration-api.net/games/minigames/";
}

export enum ApiRoute {
  LAST_ACTIVITY = "last-activity",
  BET = "bet",
  PICK = "pick",
  CASHOUT = "cashout",
  RESULT = "result",
  HISTORY = "history"
}
