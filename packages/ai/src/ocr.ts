import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { type ProgressCallback, parseStdoutJson, runPythonWithProgress } from "./bridge.js";

export type OcrQuality = "fast" | "balanced" | "best";

export interface OcrOptions {
  quality?: OcrQuality;
  language?: string;
  enhance?: boolean;
  /** @deprecated Use quality instead. Kept for backward compat. */
  engine?: "tesseract" | "paddleocr";
}

export interface OcrResult {
  text: string;
  engine?: string;
}

export async function extractText(
  inputBuffer: Buffer,
  outputDir: string,
  options: OcrOptions = {},
  onProgress?: ProgressCallback,
): Promise<OcrResult> {
  const inputPath = join(outputDir, "input_ocr.png");

  // Convert any input format (HEIC, AVIF, WebP, TIFF, etc.) to PNG
  // so Tesseract and PaddleOCR can read it reliably.
  const pngBuffer = await sharp(inputBuffer).png().toBuffer();
  await writeFile(inputPath, pngBuffer);

  const meta = await sharp(inputBuffer).metadata();
  const megapixels = ((meta.width ?? 0) * (meta.height ?? 0)) / 1_000_000;
  const timeout = Math.max(600_000, megapixels * 30 * 1000);

  const { stdout } = await runPythonWithProgress("ocr.py", [inputPath, JSON.stringify(options)], {
    onProgress,
    timeout,
  });

  const result = parseStdoutJson(stdout);
  if (!result.success) {
    throw new Error(result.error || "OCR failed");
  }

  return {
    text: result.text,
    engine: result.engine,
  };
}
