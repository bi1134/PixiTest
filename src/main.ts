import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { NextScreen } from "./app/screens/next/NextScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

import "@pixi/sound";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Explicitly load the SVN-Supercell Magic font using FontFace API
  const supercellFont = new FontFace(
    "SVN-Supercell Magic",
    "url('/fonts/SVN-Supercell%20Magic.otf')"
  );
  await supercellFont.load();
  document.fonts.add(supercellFont);

  // Wait for all fonts to be ready
  await document.fonts.ready;

  await engine.init({
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 200, minHeight: 200, letterbox: false },
  });

  userSettings.init();

  await engine.navigation.showScreen(LoadScreen);
  await engine.navigation.showScreen(NextScreen); // auto-routes to desktop or mobile
})();
