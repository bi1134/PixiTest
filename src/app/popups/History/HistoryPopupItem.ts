import { FancyButton, Switcher } from "@pixi/ui";
import { BitmapText, Container, Graphics, Sprite, Text } from "pixi.js";
import { GlobalConfig } from "../../../config/GlobalConfig";
import {
  HistoryDetailApiResponse,
  mockHistoryDetailResponse,
} from "../../../api/models/HistoryDetailResponse";
import {
  formatFloatNumber,
  formatIntNumber,
} from "../../../utils/format-number";
import { HistoryResponseData } from "../../../api/models/HistoryResponse";
import { gameService } from "../../../api/services/GameService";
import { buttonAnimation } from "../../ui/ButtonAnimations";
import { GameStateManager } from "../../../manage_game_states/GameStateManager";
import { GetErrorMessage } from "../../../api/GetErrorMessage";

export type ItemHisotyPopupOptions = {
  betAmount: number;
  dateTime: string;
  profit: number;
  multiplier: number;
};

export class HisotryPopupItem extends Container {
  private readonly OFFSET = 10;
  private readonly TILE_OFFSET = 15;
  private readonly FONT_SIZE = 17;

  private bg: Graphics;

  // Top ui
  private bgItem: Sprite;
  private betAmount: BitmapText;
  private dateTimeText: Text;
  private profitText: BitmapText;
  private multiplier: Text;
  private expandSwitcher: Switcher;

  // Inner UI
  private readonly TILE_WIDTH = 110;
  private readonly TILE_HEIGHT = 90;
  private innerWrapper: Container;
  private textWrapper: Container;
  private idText: BitmapText;
  private copyIdButton: FancyButton;
  private betId: BitmapText;
  private board: Container;

  private loadingText: BitmapText;

  public onItemVisibleChange?: (state: boolean) => void;

  constructor() {
    super();

    this.sortableChildren = true;

    this.bgItem = Sprite.from("bg-title.png");

    this.betAmount = new BitmapText({
      text: "Taruhan: 2,000",
      anchor: { x: 0, y: 0.5 }, // Only center vertically
      style: {
        fontSize: this.FONT_SIZE,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "left",
      },
    });
    this.betAmount.position.set(this.OFFSET, this.bgItem.height * 0.3);

    this.dateTimeText = new Text({
      text: "12/02/2025, 10:55",
      anchor: { x: 0, y: 0.5 },
      style: {
        fontFamily: "Supercell-magic-webfont",
        fontSize: this.FONT_SIZE,
        fontWeight: "bold",
        fill: "#76859F",
        align: "left",
      },
    });
    this.dateTimeText.position.set(
      this.OFFSET,
      this.bgItem.height / 2 + this.betAmount.height / 2 + 5,
    );

    this.profitText = new BitmapText({
      text: "Rp 3,800",
      anchor: { x: 1, y: 0.5 }, // Right align
      style: {
        fontSize: this.FONT_SIZE,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        fill: "#5FFF44",
        align: "right",
      },
    });

    this.multiplier = new Text({
      text: "Mult.1,000.00x",
      anchor: { x: 1, y: 0.5 }, // Right align
      style: {
        fontFamily: "Supercell-magic-webfont",
        fontSize: this.FONT_SIZE,
        fontWeight: "bold",
        fill: "#76859F",
        align: "right",
      },
    });

    const sprite = Sprite.from("select_open.png");
    sprite.anchor = 0.5;
    const collapseSprite = Sprite.from("select.png");
    collapseSprite.scale.y = -1;
    collapseSprite.anchor = 0.5;
    this.expandSwitcher = new Switcher([sprite, collapseSprite]);
    this.expandSwitcher.position.set(
      this.bgItem.width - this.expandSwitcher.width / 2 - this.OFFSET,
      this.bgItem.height / 2,
    );
    this.expandSwitcher.onChange.connect(
      this.onExpandSwitcherChange.bind(this),
    );

    this.profitText.position.set(
      this.expandSwitcher.x - this.expandSwitcher.width / 2 - this.OFFSET,
      this.betAmount.y,
    );

    this.multiplier.position.set(
      this.expandSwitcher.x - this.expandSwitcher.width / 2 - this.OFFSET,
      this.dateTimeText.y,
    );

    // Inner UI
    this.idText = new BitmapText({
      text: "Bet ID: ",
      anchor: { x: 0, y: 0 },
      style: {
        fontSize: 20,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "center",
        letterSpacing: -1,
      },
    });
    this.betId = new BitmapText({
      text: "692e5fec4020c1ac83069397",
      anchor: { x: 0, y: 0 },
      style: {
        fontSize: 20,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "center",
        fill: "#4CADFE",
        letterSpacing: -1,
      },
    });
    this.betId.x = this.idText.x + this.idText.width + 10;
    this.copyIdButton = new FancyButton({
      defaultView: "copy-icon.png",
      animations: buttonAnimation,
    });
    this.copyIdButton.x = this.betId.x + this.betId.width + 15;
    this.copyIdButton.onPress.connect(async () => {
      const betIdText = this.betId.text;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(betIdText);
        } else {
          // Fallback for browsers that don't support clipboard API
          const textarea = document.createElement("textarea");
          textarea.value = betIdText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
      } catch (err) {
        console.error("Copy failed:", err);
      }
    });

    this.textWrapper = new Container();
    this.textWrapper.addChild(this.idText, this.betId, this.copyIdButton);
    this.textWrapper.pivot.set(this.textWrapper.width / 2, 0);
    this.textWrapper.position.set(this.bgItem.width / 2, this.OFFSET);

    this.board = new Container();
    this.initBoard();

    this.bg = new Graphics()
      .roundRect(0, 0, this.bgItem.width, 570)
      .fill({ color: "#535C6D" });
    this.bg.zIndex = -1;

    this.loadingText = new BitmapText({
      text: "LOADING...",
      anchor: 0.5,
      style: {
        fontFamily: "coccm-bitmap-3-normal.fnt",
        fontSize: 20,
        align: "center",
      },
    });

    this.loadingText.position.set(this.bg.width / 2, this.bg.height / 2);

    this.innerWrapper = new Container();
    this.innerWrapper.addChild(this.textWrapper, this.board, this.loadingText);
    this.innerWrapper.scale = 0.75;

    this.innerWrapper.position.set(
      (this.bgItem.width - this.innerWrapper.width) / 2,
      this.bgItem.height + 15,
    );

    this.addChild(
      this.bg,
      this.bgItem,
      this.betAmount,
      this.dateTimeText,
      this.profitText,
      this.multiplier,
      this.expandSwitcher,
      this.innerWrapper,
    );

    // Turn off visible for the first time
    this.bg.visible = false;
    this.innerWrapper.visible = false;
  }

  private initBoard() {
    for (let i = 0; i < GlobalConfig.TOTAL_ROWS; i++) {
      for (let j = 0; j < GlobalConfig.TOTAL_COLUMNS; j++) {
        const sprite = Sprite.from("crown_not_selected.png");

        sprite.position.set(
          j * (this.TILE_WIDTH + this.TILE_OFFSET),
          i * (this.TILE_HEIGHT + this.TILE_OFFSET),
        );

        this.board.addChild(sprite);
      }
    }

    this.board.position.set(
      (this.bgItem.width - this.board.width) / 2, // Center horizontally
      this.betId.y + this.betId.height + this.OFFSET,
    );
  }

  public setHistoryDetailData(response: HistoryResponseData) {
    // Bet id
    this.betId.text = response.bet_id;

    // Bet amount
    const betAmount = response.amount;
    if (Number.isInteger(betAmount))
      this.betAmount.text = `Taruhan: ${formatIntNumber(betAmount)}`;
    else this.betAmount.text = `Taruhan: ${formatFloatNumber(betAmount)}`;

    // Date time
    const dateTime = response.timestamp;
    const date = new Date(dateTime);

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);

    this.dateTimeText.text = formatted;

    // Profit text
    const sign = response.multiplier === 0 ? "-" : "";
    const profitNumber =
      response.multiplier === 0 ? response.amount : response.total_win;
    if (Number.isInteger(profitNumber))
      this.profitText.text = `${sign}Rp ${formatIntNumber(profitNumber)}`;
    else this.profitText.text = `${sign}Rp ${formatFloatNumber(profitNumber)}`;

    // Check status to fill color
    if (response.multiplier !== 0) this.profitText.style.fill = "#5FFF44";
    else this.profitText.style.fill = "#FFDE45";

    // Multiplier
    const muliplier = response.multiplier;
    if (Number.isInteger(muliplier))
      this.multiplier.text = `Mult.${formatIntNumber(muliplier)}x`;
    else this.multiplier.text = `Mult.${formatFloatNumber(muliplier)}x`;

    // Set board data
    this.setBoard(mockHistoryDetailResponse);
  }

  private setBoard(response: HistoryDetailApiResponse) {
    const bomb_field = response.data[0].game_info.minigames.bomb_field;
    const field = response.data[0].game_info.minigames.field;

    this.board.children.forEach((value, index) => {
      const sprite = value as Sprite;

      if (field.includes(index)) {
        if (bomb_field.includes(index))
          sprite.texture = Sprite.from("bomb_selected.png").texture;
        else sprite.texture = Sprite.from("crown_selected.png").texture;

        sprite.alpha = 1;
      } else {
        if (bomb_field.includes(index))
          sprite.texture = Sprite.from("bomb_not_selected.png").texture;
        else sprite.texture = Sprite.from("crown_not_selected.png").texture;

        sprite.alpha = 0.65;
      }
    });
  }

  public collapse() {
    if (this.expandSwitcher.active === 1) {
      this.expandSwitcher.switch(0);
      this.innerWrapper.visible = false;
      this.bg.visible = false;
    }
  }

  private onExpandSwitcherChange(state: number | boolean) {
    this.innerWrapper.visible = state as boolean;
    this.bg.visible = state as boolean;

    this.onItemVisibleChange?.(state as boolean);

    if (state) {
      // Send request to get detail
      this.updateLoadingTextVisible(true);

      GameStateManager.getInstance().freezeGame();
      gameService
        .postHistoryDetail(this.betId.text)
        .then((response: HistoryDetailApiResponse) => {
          GameStateManager.getInstance().unFreezeGame();

          if (response.data === null) {
            GetErrorMessage.showApiErrorPopup(response.error);
            return;
          }

          this.setBoard(response);
          this.updateLoadingTextVisible(false);
        })
        .catch((error: any) => {
          GetErrorMessage.showUnExpectedError(error);
        });
    }
  }

  private updateLoadingTextVisible(visible: boolean) {
    this.loadingText.visible = visible;

    this.board.visible = !visible;
  }
}
