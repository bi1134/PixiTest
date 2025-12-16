export class LayoutHelper {
  public static centerX(
    element: any,
    containerWidth: number,
    padding: number = 0,
    condition: boolean = true,
  ) {
    if (condition) {
      element.x = containerWidth / 2 - element.width / 2 - padding;
    } else {
      element.x = containerWidth / 2;
    }
  }

  public static centerY(
    element: any,
    containerHeight: number,
    padding: number = 0,
    condition: boolean = true,
  ) {
    if (condition) {
      element.y = containerHeight / 2 - element.height / 2 - padding;
    } else {
      element.y = containerHeight / 2;
    }
  }

  public static placeBelow(
    target: any,
    reference: any,
    padding: number,
    condition: boolean = true,
  ) {
    if (condition) target.y = reference.y + reference.height + padding;
    else target.y = reference.y + reference.height / 2 + padding;
  }

  public static setPositionX(element: any, x: number) {
    element.x = x;
  }

  public static setPositionY(element: any, y: number) {
    element.y = y;
  }
  public static scaleToWidth(
    element: any,
    width: number,
    maintainAspect = true,
  ) {
    if (maintainAspect) {
      // Cache the original width the first time
      if (!element._originalWidth) {
        element._originalWidth = element.width;
      }

      const ratio = width / element._originalWidth;
      element.scale.set(ratio);
    } else {
      element.width = width;
    }
  }

  public static scaleToHeight(
    element: any,
    height: number,
    maintainAspect = true,
  ) {
    if (maintainAspect) {
      // Cache the original width the first time
      if (!element._originalHeight) {
        element._originalHeight = element.height;
      }

      const ratio = height / element._originalHeight;
      element.scale.set(ratio);
    } else {
      element.width = height;
    }
  }
}
