import { runPythonScript } from "./bridge.js";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function inpaint(
  inputBuffer: Buffer,
  maskBuffer: Buffer,
  outputDir: string,
): Promise<Buffer> {
  const inputPath = join(outputDir, "input_inpaint.png");
  const maskPath = join(outputDir, "mask_inpaint.png");
  const outputPath = join(outputDir, "output_inpaint.png");

  await writeFile(inputPath, inputBuffer);
  await writeFile(maskPath, maskBuffer);

  const { stdout } = await runPythonScript("inpaint.py", [
    inputPath,
    maskPath,
    outputPath,
  ]);

  const result = JSON.parse(stdout);
  if (!result.success) {
    throw new Error(result.error || "Inpainting failed");
  }

  return readFile(outputPath);
}
