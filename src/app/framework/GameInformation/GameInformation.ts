import { Container } from "pixi.js";
import { KnightCharacter } from "../../ui/KnightCharacter";



export class GameInformation extends Container {
    public knightCharacter: KnightCharacter;

    constructor() {
        super();



        this.knightCharacter = new KnightCharacter();
        this.addChild(this.knightCharacter);
        this.knightCharacter.visible = true; // explicitly visible
    }

    public resize(width: number, height: number, padding: number, inputContainerY: number, inputContainerHeight: number) {
        this.knightCharacter.scale.set(0.75);
        this.knightCharacter.x = width / 2;
        // Position relative to input container passed from parent
        this.knightCharacter.y = (inputContainerY + height) + inputContainerHeight / 2 - padding * 2 - height;
    }
}
