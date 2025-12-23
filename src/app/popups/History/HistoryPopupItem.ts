import { FancyButton, Switcher } from "@pixi/ui";
import { BitmapText, Container, Graphics, Sprite, Text } from "pixi.js";
import { buttonAnimation } from "../../ui/ButtonAnimations";

// --- Mock / Stub Types ---
interface HistoryResponseData {
  bet_id: string;
  amount: number;
  timestamp: string;
  multiplier: number;
  total_win: number;
}

interface HistoryDetailApiResponse {
  data: any;
}

// --- Helper ---
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

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

  // Layout Constants
  private itemWidth: number;
  private readonly ITEM_HEIGHT = 80;

  private bg: Graphics;

  // Top ui
  private bgItem: Container; // Changed from Sprite to Container to support Graphics fallback
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

  constructor(width: number = 600) {
    super();

    this.itemWidth = width;

    this.sortableChildren = true;

    // Use Graphics for background to ensure visibility/size
    this.bgItem = new Graphics()
      .roundRect(0, 0, this.itemWidth, this.ITEM_HEIGHT, 15)
      .fill({ color: 0x2A2E37 }); // Dark grey bg

    this.betAmount = new BitmapText({
      text: "Taruhan: 2,000",
      anchor: { x: 0, y: 0.5 }, // Only center vertically
      style: {
        fontSize: this.FONT_SIZE,
        fontFamily: "coccm-bitmap-3-normal.fnt",
        align: "left",
      },
    });
    this.betAmount.position.set(this.OFFSET, this.ITEM_HEIGHT * 0.3);

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
      this.ITEM_HEIGHT / 2 + this.betAmount.height / 2 + 5,
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

    const sprite = Sprite.from("expand-button.png");
    sprite.anchor = 0.5;
    const collapseSprite = Sprite.from("expand-button.png");
    collapseSprite.scale.y = -1;
    collapseSprite.anchor = 0.5;
    this.expandSwitcher = new Switcher([sprite, collapseSprite]);

    // Position switcher based on FIXED width
    this.expandSwitcher.position.set(
      this.itemWidth - this.expandSwitcher.width / 2 - this.OFFSET,
      this.ITEM_HEIGHT / 2,
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
    this.textWrapper.position.set(this.itemWidth / 2, this.OFFSET);

    this.board = new Container();
    this.initBoard();

    this.bg = new Graphics()
      .roundRect(0, 0, this.itemWidth, 570)
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

    // Center pivot based on the known content width
    this.innerWrapper.pivot.set(this.itemWidth / 2, 0);

    this.innerWrapper.scale = 0.75;

    this.innerWrapper.position.set(
      this.itemWidth / 2,
      this.ITEM_HEIGHT + 15,
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
    // Hardcoded mock values instead of GlobalConfig
    const TOTAL_ROWS = 5;
    const TOTAL_COLUMNS = 6;

    for (let i = 0; i < TOTAL_ROWS; i++) {
      for (let j = 0; j < TOTAL_COLUMNS; j++) {
        // Try/catch regarding sprite loading if assets missing? 
        // Assuming assets exist, just config is missing.
        const sprite = Sprite.from("crown_not_selected.png");

        sprite.position.set(
          j * (this.TILE_WIDTH + this.TILE_OFFSET),
          i * (this.TILE_HEIGHT + this.TILE_OFFSET),
        );

        this.board.addChild(sprite);
      }
    }

    this.board.position.set(
      (this.itemWidth - this.board.width) / 2, // Center horizontally
      this.betId.y + this.betId.height + this.OFFSET,
    );
  }

  public setHistoryDetailData(response: HistoryResponseData) {
    // Bet id
    this.betId.text = response.bet_id;

    // Bet amount
    const betAmount = response.amount;
    this.betAmount.text = `Taruhan: ${formatNumber(betAmount)}`;

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

    this.profitText.text = `${sign}Rp ${formatNumber(profitNumber)}`;

    // Check status to fill color
    if (response.multiplier !== 0) this.profitText.style.fill = "#5FFF44";
    else this.profitText.style.fill = "#FFDE45";

    // Multiplier
    const muliplier = response.multiplier;
    this.multiplier.text = `Mult.${formatNumber(muliplier)}x`;

    // Set board data - Mock or Skip
    // this.setBoard(null); // Skipping for now as we don't have mock data
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
      // Mock Data: Bypass API request
      this.updateLoadingTextVisible(false); // Hide loading immediately

      // You can just call setBoard with mock data if you want the grid
      // this.setBoard(mockHistoryDetailResponse); 

      // Or just ensure the container is ready (black lines were added in init)

      /*
      // API CALL COMMENTED OUT
      GameStateManager.getInstance().freezeGame();
      gameService
        .postHistoryDetail(this.betId.text)
        .then((response: HistoryDetailApiResponse) => { ... })
      */
    }
  }

  private updateLoadingTextVisible(visible: boolean) {
    this.loadingText.visible = visible;

    this.board.visible = !visible;
  }
}
