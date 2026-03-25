import type { FastifyInstance } from "fastify";
import sharp from "sharp";
import { z } from "zod";
import { createToolRoute } from "../tool-factory.js";

const settingsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/**
 * Smart crop using Sharp's attention-based strategy.
 * Uses entropy/saliency detection to find the most interesting region.
 * No Python needed.
 */
export function registerSmartCrop(app: FastifyInstance) {
  createToolRoute(app, {
    toolId: "smart-crop",
    settingsSchema,
    process: async (inputBuffer, settings, filename) => {
      const result = await sharp(inputBuffer)
        .resize(settings.width, settings.height, {
          fit: "cover",
          position: sharp.strategy.attention,
        })
        .png()
        .toBuffer();

      const outputFilename = `${filename.replace(/\.[^.]+$/, "")}_smartcrop.png`;
      return { buffer: result, filename: outputFilename, contentType: "image/png" };
    },
  });
}
