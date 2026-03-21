import sharp from "sharp";

export interface SmartCropOptions {
  width: number;
  height: number;
}

/**
 * Smart crop using Sharp's entropy-based attention cropping.
 * No Python needed — uses Sharp's built-in saliency detection.
 */
export async function smartCrop(
  inputBuffer: Buffer,
  options: SmartCropOptions,
): Promise<Buffer> {
  return sharp(inputBuffer)
    .resize(options.width, options.height, {
      fit: "cover",
      position: sharp.strategy.attention,
    })
    .toBuffer();
}
