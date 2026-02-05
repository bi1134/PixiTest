export function resize(
  w: number,
  h: number,
  minWidth: number,
  minHeight: number,
  letterbox: boolean,
) {
  const aspectRatio = 720 / 1560;
  let canvasWidth = w;
  let canvasHeight = h;

  if (letterbox) {
    if (w / h < aspectRatio) {
      canvasWidth = Math.min(w, minWidth);
      canvasHeight = Math.min(h, canvasWidth / 720 * 1560);
    } else {
      if (h > 1280) {
        // Seperate logic for height > 1280 on tablets devices
        let newMinHeight = Math.min(h, 1560);
        canvasHeight = Math.min(h, newMinHeight);
        canvasWidth = Math.min(w, canvasHeight / newMinHeight * 720);
      }
      else {
        canvasHeight = Math.min(h, 1280);
        canvasWidth = Math.min(w, canvasHeight / 1280 * 720);
      }
    }

    // Still scale game with 1280 height to keep aspect ratio 9:16
    const scaleX = canvasWidth < minWidth ? minWidth / canvasWidth : 1;
    const scaleY = canvasHeight < minHeight ? minHeight / canvasHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = Math.floor(canvasWidth * scale);
    const height = Math.floor(canvasHeight * scale);

    return {
      width: width,
      height: height,
      cssWidth: canvasWidth,
      cssHeight: canvasHeight
    };
  }

  const scaleX = canvasWidth < minWidth ? minWidth / canvasWidth : 1;
  const scaleY = canvasHeight < minHeight ? minHeight / canvasHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = Math.floor(canvasWidth * scale);
  const height = Math.floor(canvasHeight * scale);

  return { width, height };
}