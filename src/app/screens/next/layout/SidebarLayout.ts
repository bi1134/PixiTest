import { Input, FancyButton } from "@pixi/ui";
import { Container, Graphics, Sprite } from "pixi.js";
import { Label } from "../../../ui/Label";
import { Button } from "../../../ui/Button";
import { LayoutHelper } from "../../../utils/LayoutHelper";

export class SidebarLayout extends Container {
  public box!: Graphics;
  public amountContainer!: Container;
  public title!: Label;
  public inputBox!: Input;
  public higherLowerContainer!: Container;
  public higherButton!: FancyButton;
  public lowerButton!: FancyButton;
  public skipBetContainer!: Container;
  public skipButton!: FancyButton;
  public betButton!: FancyButton;

  constructor(width: number, height: number) {
    super();
    this.createLayout(width, height);
  }

  private createLayout(width: number, height: number) {
    this.box = new Graphics().rect(0, 0, width / 4, height).fill("#444449");
    this.addChild(this.box);

    // amount section
    this.amountContainer = new Container();
    this.addChild(this.amountContainer);

    //the input box
    const sprite = Sprite.from("input.png");
    sprite.width = this.box.width;

    this.title = new Label({
      text: "Amount",
      style: { fill: "#b2b2b2ff", fontSize: 35, fontFamily: "Arial" },
    });
    this.amountContainer.addChild(this.title);

    this.inputBox = new Input({
      bg: sprite,
      placeholder: "0.02",
      padding: 11,
      textStyle: { fill: "white" },
      cleanOnFocus: true,
    });
    this.amountContainer.addChild(this.inputBox);

    // set the default value initially
    this.inputBox.value = "0.02";

    // buttons
    this.higherLowerContainer = new Container();
    this.addChild(this.higherLowerContainer);

    this.higherButton = new Button({
      text: "Higher or Equal \n 111%",
      width: this.box.width / 2,
      height: 75,
    });
    this.lowerButton = new Button({
      text: "Lower or Equal \n 111%",
      width: this.box.width / 2,
      height: 75,
    });

    this.higherLowerContainer.addChild(this.higherButton, this.lowerButton);

    this.skipBetContainer = new Container();
    this.addChild(this.skipBetContainer);

    this.skipButton = new Button({
      text: "Skip >>",
      width: this.box.width,
      height: 75,
    });
    this.betButton = new Button({
      text: "Bet",
      width: this.box.width,
      height: 90,
    });

    this.skipBetContainer.addChild(this.skipButton, this.betButton);
  }

  public resize(width: number, height: number, padding: number) {
    const sidebarWidth = width; // Width passed here is already the sidebar width
    const sidebarHeight = height;

    // sidebar box
    this.box.setSize(sidebarWidth, sidebarHeight);

    // --- amount container ---
    LayoutHelper.setPositionX(this.title, this.title.width / 2 + padding);
    this.title.y = this.title.height / 2 + padding;

    LayoutHelper.scaleToWidth(this.inputBox, sidebarWidth - padding * 2, false);
    LayoutHelper.centerX(this.inputBox, sidebarWidth);
    LayoutHelper.placeBelow(this.inputBox, this.title, 0 - padding);

    // --- higher/lower container ---
    LayoutHelper.scaleToWidth(this.higherButton, sidebarWidth / 2.25 - padding);
    this.higherButton.height = this.inputBox.height * 1.75;
    LayoutHelper.setPositionX(
      this.higherButton,
      this.higherButton.width / 2 + padding,
    );
    this.higherButton.y = 0;

    LayoutHelper.scaleToWidth(this.lowerButton, sidebarWidth / 2.25 - padding);
    this.lowerButton.height = this.inputBox.height * 1.75;
    LayoutHelper.setPositionX(
      this.lowerButton,
      sidebarWidth - this.lowerButton.width / 2 - padding,
    );
    this.lowerButton.y = 0;

    // --- skip/bet container ---
    LayoutHelper.scaleToWidth(
      this.skipButton,
      sidebarWidth + padding * 2,
      false,
    );
    LayoutHelper.scaleToWidth(
      this.betButton,
      sidebarWidth + padding * 2,
      false,
    );
    LayoutHelper.centerX(this.skipButton, sidebarWidth, 0, false);
    LayoutHelper.centerX(this.betButton, sidebarWidth, 0, false);
    this.skipButton.y = -padding;
    LayoutHelper.placeBelow(this.betButton, this.skipButton, padding);

    // --- container positioning ---
    this.amountContainer.x = 0;
    this.amountContainer.y = 0;

    this.higherLowerContainer.x = 0;
    this.higherLowerContainer.y =
      this.amountContainer.y +
      this.amountContainer.height +
      this.higherLowerContainer.height / 2 +
      padding * 2;

    this.skipBetContainer.x = 0;
    this.skipBetContainer.y =
      this.higherLowerContainer.y + this.higherLowerContainer.height;
  }
}
