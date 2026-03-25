import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type ProgressCallback, runPythonWithProgress } from "./bridge.js";

export interface OcrOptions {
  engine?: "tesseract" | "paddleocr";
  language?: string;
}

export interface OcrResult {
  text: string;
  engine: string;
}

export async function extractText(
  inputBuffer: Buffer,
  outputDir: string,
  options: OcrOptions = {},
  onProgress?: ProgressCallback,
): Promise<OcrResult> {
  const inputPath = join(outputDir, "input_ocr.png");

  await writeFile(inputPath, inputBuffer);
  const { stdout } = await runPythonWithProgress("ocr.py", [inputPath, JSON.stringify(options)], {
    onProgress,
  });

  const result = JSON.parse(stdout);
  if (!result.success) {
    throw new Error(result.error || "OCR failed");
  }

  return {
    text: result.text,
    engine: result.engine,
  };
}
