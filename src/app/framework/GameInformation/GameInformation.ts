import { Container, Sprite } from "pixi.js";
import { Character } from "../../ui/Character";
import { LayoutHelper } from "../../utils/LayoutHelper";
import { PredictionContainer } from "./PredictionContainer";
import { Label } from "../../ui/Label";


export class GameInformation extends Container {
    public knightCharacter: Character;

    private infoBoard: Sprite;
    private profitBoard: Sprite;

    private AdditionalInfoLabel: Label;

    private higherMultiplier: PredictionContainer;
    private lowerMultiplier: PredictionContainer;


    constructor() {
        super();

        this.infoBoard = Sprite.from("Panel-info.png");
        this.addChild(this.infoBoard);


        this.knightCharacter = new Character();
        this.addChild(this.knightCharacter);
        this.knightCharacter.visible = true; // explicitly visible

        this.profitBoard = Sprite.from("Tray-Profit.png");
        this.addChild(this.profitBoard);

        this.AdditionalInfoLabel = new Label({
            text: "Additional Info",
            style: {
                fontFamily: "SVN-Supercell Magic", // Consistent font
                fontSize: 15,
                align: "center",
                fill: "#ffffffff",
                padding: 80, // Prevent clipping
            }
        });
        this.addChild(this.AdditionalInfoLabel);

        this.higherMultiplier = new PredictionContainer("higher");
        this.addChild(this.higherMultiplier);

        this.lowerMultiplier = new PredictionContainer("lower");
        this.addChild(this.lowerMultiplier);

    }

    public updatePredictions(highData: number, lowData: number) {
        this.higherMultiplier.setMultiplier(highData);
        this.lowerMultiplier.setMultiplier(lowData);
    }

    public resize(width: number, height: number, padding: number, inputContainerY: number, inputContainerHeight: number) {

        //background board
        this.infoBoard.x = width / 2 - this.infoBoard.width / 2;
        this.infoBoard.y = 0;

        //profit board
        this.profitBoard.x = width / 2 - this.profitBoard.width / 2;
        this.profitBoard.y = this.infoBoard.y + this.infoBoard.height / 2 + this.profitBoard.height / 1.5;

        // Stabilize Knight Position:
        // Use fixed offsets instead of dynamic character width/height which change with animation/loading
        const knightOffsetX = 80; // Approximated stable offset
        const knightOffsetY = 30; // Approximated stable offset

        this.knightCharacter.scale.set(0.85);

        this.knightCharacter.x = this.profitBoard.x + this.profitBoard.width - knightOffsetX - padding * 3;
        // Align feet (0,0) relative to board center/bottom. 
        // Previously: profitBoard.y + height/2. assuming height ~100 -> +50.
        this.knightCharacter.y = this.profitBoard.y + this.profitBoard.height / 2 + knightOffsetY;

        this.AdditionalInfoLabel.x = this.infoBoard.x + this.AdditionalInfoLabel.width / 2 + padding * 2.5;
        this.AdditionalInfoLabel.y = this.profitBoard.y - this.AdditionalInfoLabel.height - padding / 2;

        LayoutHelper.scaleToWidth(this.higherMultiplier, this.profitBoard.width * 0.45, true);
        //prediction container
        this.higherMultiplier.x = this.profitBoard.x + 22;
        this.higherMultiplier.y = this.profitBoard.y + 10;

        LayoutHelper.scaleToWidth(this.lowerMultiplier, this.profitBoard.width * 0.45, true);
        //prediction container
        this.lowerMultiplier.x = this.profitBoard.x + this.profitBoard.width - this.lowerMultiplier.width - 22;
        this.lowerMultiplier.y = this.profitBoard.y + 10;
    }
}
