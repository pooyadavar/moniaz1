import type { ImageCropPercent } from "../types/question";
import { expandCropWithPadding } from "./cropPadding";

export const cropImageFromPercent = (
  imageSrc: string,
  crop: ImageCropPercent,
  withPadding = true,
): Promise<string> => {
  const effectiveCrop = withPadding ? expandCropWithPadding(crop) : crop;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const x = Math.max(0, Math.min(100, effectiveCrop.x));
      const y = Math.max(0, Math.min(100, effectiveCrop.y));
      const width = Math.max(0, Math.min(100 - x, effectiveCrop.width));
      const height = Math.max(0, Math.min(100 - y, effectiveCrop.height));
      const sourceX = (x / 100) * image.naturalWidth;
      const sourceY = (y / 100) * image.naturalHeight;
      const sourceWidth = (width / 100) * image.naturalWidth;
      const sourceHeight = (height / 100) * image.naturalHeight;

      canvas.width = Math.max(1, sourceWidth);
      canvas.height = Math.max(1, sourceHeight);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context is not available."));
        return;
      }

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      resolve(canvas.toDataURL("image/jpeg"));
    };
    image.onerror = () => reject(new Error("Image could not be loaded for cropping."));
    image.src = imageSrc;
  });
};
