import { Container } from 'pixi.js';

declare module '@pixi/ui' {
    export class FancyButton extends Container {
        constructor(options?: any);
        onPress: any;
        onHover: any;
        onDown: any;
        onU: any;
        onOut: any;
        onUp: any;
        enabled: boolean;
        public options: any;
        [key: string]: any;
    }

    export class Input extends Container {
        constructor(options?: any);
        value: string;
        onEnter: any;
        onChange: any;
        [key: string]: any;
    }

    export class CircularProgressBar extends Container {
        constructor(options?: any);
        progress: number;
        [key: string]: any;
    }

    export class Slider extends Container {
        constructor(options?: any);
        value: number;
        onUpdate: any;
        onChange: any;
        [key: string]: any;
    }

    export class List extends Container {
        constructor(options?: any);
        // List specific methods might be needed but for now extending Container covers basic usage
        [key: string]: any;
    }

    export enum ProgressBarType {

    }
}
