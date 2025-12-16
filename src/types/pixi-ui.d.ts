declare module "@pixi/ui" {
  import { Container } from "pixi.js";

  export class FancyButton extends Container {
    constructor(options?: any);
    onPress: { connect: (callback: () => void) => void };
    text: string | any;
    width: number;
    height: number;
    anchor: number | { x: number; y: number };
  }
}
