export enum CustomKeyboardUnit {
    CURRENCY = "CURRENCY",
    NUMBER_OF_GAMES = "NUMBER_OF_BET",
    STOP_ON_LOSS = "STOP_ON_LOSS",
    STOP_ON_WIN = "STOP_ON_WIN",
}

export const displayUnitMap: Record<CustomKeyboardUnit, string> = {
    [CustomKeyboardUnit.CURRENCY]: "RP ",
    [CustomKeyboardUnit.NUMBER_OF_GAMES]: "",
    [CustomKeyboardUnit.STOP_ON_LOSS]: "%",
    [CustomKeyboardUnit.STOP_ON_WIN]: "%",
};
