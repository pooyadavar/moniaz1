import type { ImageCropPercent } from "../types/question";
import { cropImageFromPercent } from "./cropImage";

type RawCrop =
  | ImageCropPercent
  | [number, number, number, number]
  | string
  | null
  | undefined;

export interface ResolvedImageCrop {
  percent: ImageCropPercent | null;
  preview: string | null;
}

const isDataUrl = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("data:image");

const isPercentCrop = (value: unknown): value is ImageCropPercent =>
  typeof value === "object" &&
  value !== null &&
  Number.isFinite(Number((value as ImageCropPercent).x)) &&
  Number.isFinite(Number((value as ImageCropPercent).y)) &&
  Number.isFinite(Number((value as ImageCropPercent).width)) &&
  Number.isFinite(Number((value as ImageCropPercent).height));

const isPixelBbox = (value: unknown): value is [number, number, number, number] =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((n) => Number.isFinite(Number(n)));

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const pixelBboxToPercent = (
  bbox: [number, number, number, number],
  imageWidth: number,
  imageHeight: number,
): ImageCropPercent => {
  const [x1, y1, x2, y2] = bbox;
  const x = clampPercent((x1 / imageWidth) * 100);
  const y = clampPercent((y1 / imageHeight) * 100);
  const width = clampPercent(((x2 - x1) / imageWidth) * 100);
  const height = clampPercent(((y2 - y1) / imageHeight) * 100);

  return {
    x,
    y,
    width: Math.max(0, Math.min(100 - x, width)),
    height: Math.max(0, Math.min(100 - y, height)),
  };
};

const getImageDimensions = (imageSrc: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = imageSrc;
  });

export const resolveImageCrop = async (
  pagePreviewUrl: string,
  rawCrop: RawCrop,
): Promise<ResolvedImageCrop> => {
  if (!rawCrop) {
    return { percent: null, preview: null };
  }

  if (isDataUrl(rawCrop)) {
    return { percent: null, preview: rawCrop };
  }

  if (isPixelBbox(rawCrop)) {
    const { width, height } = await getImageDimensions(pagePreviewUrl);
    const percent = pixelBboxToPercent(rawCrop, width, height);
    const preview = await cropImageFromPercent(pagePreviewUrl, percent);
    return { percent, preview };
  }

  if (isPercentCrop(rawCrop)) {
    const percent: ImageCropPercent = {
      x: clampPercent(Number(rawCrop.x)),
      y: clampPercent(Number(rawCrop.y)),
      width: Math.max(0, Math.min(100 - rawCrop.x, Number(rawCrop.width))),
      height: Math.max(0, Math.min(100 - rawCrop.y, Number(rawCrop.height))),
    };
    const preview = await cropImageFromPercent(pagePreviewUrl, percent);
    return { percent, preview };
  }

  return { percent: null, preview: null };
};
