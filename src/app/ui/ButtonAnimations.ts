import { Button } from "@pixi/ui";
import { animate } from "motion";

export const buttonAnimation = {
  onPress: {
    start: (button: Button) => {
      animate(button, { scale: 0.9 }, { duration: 0.1 });
    },
    end: (button: Button) => {
      animate(button, { scale: 1 }, { duration: 0.1, ease: "backOut" });
    },
  },
  onHover: {
    start: (button: Button) => {
      animate(button, { scale: 1.05 }, { duration: 0.1 });
    },
    end: (button: Button) => {
      animate(button, { scale: 1 }, { duration: 0.1 });
    },
  },
};
