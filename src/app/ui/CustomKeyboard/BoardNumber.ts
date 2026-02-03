import { Container } from "pixi.js";
import { CustomNumber } from "./CustomNumber";

export class BoardNumber extends Container {
    public onKeyPressed?: (value: number) => void;

    constructor() {
        super();

        this.init();
    }

    private init() {
        let num = 1;

        for (let i = 0; i < 4; i++) { // 4 rows 
            for (let j = 0; j < 3; j++) { // 3 columns
                const number = new CustomNumber(num++);
                number.position.set(j * (number.width + 8), i * (number.height + 4));

                this.handleInteractable(number);


                this.addChild(number);
            }
        }
    }

    private handleInteractable(number: CustomNumber) {
        number.interactive = true; // Enable interact

        number.onpointerover = () => number.tint = '#C8C8C8';

        number.onpointerout = () => number.tint = 'white';

        // Handle pointer down event
        number.onpointerdown = () => {
            // Hosting event make this button stateless
            this.onKeyPressed?.(number.value);
        };
    }
}
