import { z } from "zod";
import { createToolRoute } from "../tool-factory.js";
import sharp from "sharp";
import type { FastifyInstance } from "fastify";

const settingsSchema = z.object({
  width: z.number().min(1).max(4096).optional(),
  height: z.number().min(1).max(4096).optional(),
  extractFrame: z.number().min(0).optional(),
  optimize: z.boolean().default(false),
});

export function registerGifTools(app: FastifyInstance) {
  createToolRoute(app, {
    toolId: "gif-tools",
    settingsSchema,
    process: async (inputBuffer, settings, filename) => {
      if (settings.extractFrame !== undefined) {
        // Extract a single frame from animated GIF
        const image = sharp(inputBuffer, { page: settings.extractFrame });

        if (settings.width || settings.height) {
          image.resize(settings.width, settings.height, { fit: "inside" });
        }

        const buffer = await image.png().toBuffer();
        const outName = filename.replace(/\.gif$/i, "") + `_frame${settings.extractFrame}.png`;
        return { buffer, filename: outName, contentType: "image/png" };
      }

      // Process animated GIF (preserve animation)
      const image = sharp(inputBuffer, { animated: true });

      if (settings.width || settings.height) {
        image.resize(settings.width, settings.height, { fit: "inside" });
      }

      if (settings.optimize) {
        // Reduce colors for optimization
        image.gif({ effort: 10 });
      }

      const buffer = await image.gif().toBuffer();
      return { buffer, filename, contentType: "image/gif" };
    },
  });
}
