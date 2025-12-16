import { Container, Graphics, Sprite, Texture, Text } from "pixi.js";
import { Label } from "../ui/Label";
import { CustomDropdownBox } from "./CustomDropDownBox";

export class HistoryItem extends CustomDropdownBox {
  constructor(title: string, data: any) {
    // --- 1. Create the Header Container ---
    const header = new Container();

    // Background Sprite (like the Select box)
    const bg = Sprite.from("select.png");
    bg.width = 320; // Set a fixed width or match parent
    bg.height = 50;
    header.addChild(bg);

    // Title Label
    const label = new Label({
      text: title,
      style: { fill: 0xffffff, fontSize: 20, fontWeight: "bold" },
    });
    label.anchor.set(0, 0.5);
    label.x = 20;
    label.y = bg.height / 2;
    header.addChild(label);

    // Arrow Icon (Optional, visual cue)
    const arrow = new Text({
      text: "▼",
      style: { fill: 0x999999, fontSize: 14 },
    });
    arrow.anchor.set(0.5);
    arrow.x = bg.width - 25;
    arrow.y = bg.height / 2;
    header.addChild(arrow);

    // --- 2. Call Parent Constructor with Header ---
    super(header);

    // --- 3. Create Content Body ---
    const content = new Container();

    // Background for the dropdown details (optional)
    // const contentBg = new Graphics().roundRect(0, 0, bg.width, 150, 4).fill(0x222222);
    // content.addChild(contentBg);

    // Info Rows
    let yPos = 10;
    const addRow = (key: string, value: string) => {
      const rowContainer = new Container();

      const keyText = new Label({
        text: key,
        style: { fill: 0xaaaaaa, fontSize: 16 },
      });
      keyText.x = 20;

      const valText = new Label({
        text: value,
        style: { fill: 0xffffff, fontSize: 16, fontWeight: "bold" },
      });
      valText.x = 120; // Fixed col width

      rowContainer.addChild(keyText, valText);
      rowContainer.y = yPos;
      content.addChild(rowContainer);
      yPos += 25;
    };

    // Use the passed 'data' to populate
    addRow("Time:", data.time || "12:30 PM");
    addRow("Bet ID:", data.id || "#123456");
    addRow("Amount:", `$${data.amount || "100"}`);
    addRow("Multiplier:", `${data.multiplier || "2.5"}x`);
    addRow("Profit:", `+$${data.profit || "150"}`);
    addRow("Result:", data.result || "Win");

    // Add a separator line
    const line = new Graphics()
      .moveTo(10, yPos + 5)
      .lineTo(bg.width - 10, yPos + 5)
      .stroke({ width: 1, color: 0x444444 });
    content.addChild(line);
    yPos += 20;

    // View Details Button (Example of interactive child)
    const btnContainer = new Container();
    const btnBg = new Graphics().roundRect(0, 0, 100, 30, 4).fill(0xec1561);
    const btnLabel = new Label({
      text: "Replay",
      style: { fill: 0xffffff, fontSize: 14 },
    });
    btnLabel.anchor.set(0.5);
    btnLabel.x = 50;
    btnLabel.y = 15;

    btnContainer.addChild(btnBg);
    btnContainer.addChild(btnLabel);

    btnContainer.x = bg.width / 2 - 50;
    btnContainer.y = yPos;
    content.addChild(btnContainer);

    // Final bounds check
    content.getLocalBounds();
    // Create an invisible hit area or rect to ensure height is captured including the button
    const spacer = new Graphics()
      .rect(0, 0, 1, btnContainer.y + btnContainer.height + 15)
      .fill({ alpha: 0 });
    content.addChild(spacer);

    // --- 4. Set Content ---
    this.setContent(content);
  }
}
