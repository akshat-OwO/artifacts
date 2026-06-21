import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

const DEFAULT_LUMINANCE_THRESHOLD = 0.5;
const MAX_SAMPLE_SIZE = 64;

export type ImageAppearance = "dark" | "light";

const toLinearRgb = (channel: number): number => {
  const normalizedChannel = channel / 255;

  return normalizedChannel <= 0.040_45
    ? normalizedChannel / 12.92
    : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
};

/**
 * Measures an image's average relative luminance using the sRGB transfer curve.
 * The source must be canvas-readable, so cross-origin URLs need suitable CORS headers.
 */
export const detectImageLuminance = (
  image: HTMLImageElement,
  fallback: ImageAppearance = "light",
  threshold = DEFAULT_LUMINANCE_THRESHOLD
): ImageAppearance => {
  if (threshold < 0 || threshold > 1) {
    return fallback;
  }

  try {
    const scale = Math.min(
      1,
      MAX_SAMPLE_SIZE / image.naturalWidth,
      MAX_SAMPLE_SIZE / image.naturalHeight
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return fallback;
    }

    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    let weightedLuminance = 0;
    let totalAlpha = 0;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3] / 255;
      if (alpha === 0) {
        continue;
      }

      const red = toLinearRgb(data[index]);
      const green = toLinearRgb(data[index + 1]);
      const blue = toLinearRgb(data[index + 2]);
      weightedLuminance +=
        (0.2126 * red + 0.7152 * green + 0.0722 * blue) * alpha;
      totalAlpha += alpha;
    }

    if (totalAlpha === 0) {
      return fallback;
    }

    return weightedLuminance / totalAlpha >= threshold ? "light" : "dark";
  } catch {
    return fallback;
  }
};
