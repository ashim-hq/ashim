import type { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { env } from "../config.js";

export async function registerUpload(app: FastifyInstance): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
      files: env.MAX_BATCH_SIZE,
    },
  });
}
