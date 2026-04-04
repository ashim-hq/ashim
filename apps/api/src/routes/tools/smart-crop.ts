import type { FastifyInstance } from "fastify";
import sharp from "sharp";
import { z } from "zod";
import { createToolRoute } from "../tool-factory.js";

const settingsSchema = z.object({
  mode: z.enum(["attention", "content"]).default("attention"),
  // Attention mode: resize to target dimensions using subject detection
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  // Content mode: trim uniform borders, optionally pad to square
  threshold: z.number().int().min(0).max(255).default(30),
  padToSquare: z.boolean().default(false),
  padColor: z.string().default("#ffffff"),
  targetSize: z.number().int().positive().optional(),
});

/**
 * Smart crop with two modes:
 * - "attention": Sharp's entropy/saliency detection to crop to the most interesting region
 * - "content": Trims uniform-color borders (like GIMP's "Crop to Content"),
 *    optionally pads to a square at a target size
 */
export function registerSmartCrop(app: FastifyInstance) {
  createToolRoute(app, {
    toolId: "smart-crop",
    settingsSchema,
    process: async (inputBuffer, settings, filename) => {
      let result: Buffer;

      if (settings.mode === "content") {
        // Crop to content: trim uniform borders
        const pipeline = sharp(inputBuffer).trim({ threshold: settings.threshold });
        let trimmed = await pipeline.toBuffer({ resolveWithObject: true });

        if (settings.padToSquare || settings.targetSize) {
          const meta = await sharp(trimmed.data).metadata();
          const w = meta.width ?? 1;
          const h = meta.height ?? 1;
          const target = settings.targetSize || Math.max(w, h);
          const padR = Math.round(parseInt(settings.padColor.slice(1, 3), 16));
          const padG = Math.round(parseInt(settings.padColor.slice(3, 5), 16));
          const padB = Math.round(parseInt(settings.padColor.slice(5, 7), 16));

          trimmed = await sharp(trimmed.data)
            .resize({
              width: target,
              height: target,
              fit: "contain",
              background: { r: padR, g: padG, b: padB, alpha: 1 },
            })
            .toBuffer({ resolveWithObject: true });
        }

        result = trimmed.data;
      } else {
        // Attention mode: resize to target using subject detection
        const w = settings.width ?? 1080;
        const h = settings.height ?? 1080;
        result = await sharp(inputBuffer)
          .resize(w, h, {
            fit: "cover",
            position: sharp.strategy.attention,
          })
          .png()
          .toBuffer();
      }

      const outputFilename = `${filename.replace(/\.[^.]+$/, "")}_smartcrop.png`;
      return { buffer: result, filename: outputFilename, contentType: "image/png" };
    },
  });
}
