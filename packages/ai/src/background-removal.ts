import { runPythonScript } from "./bridge.js";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface RemoveBackgroundOptions {
  model?: "u2net" | "isnet";
}

export async function removeBackground(
  inputBuffer: Buffer,
  outputDir: string,
  options: RemoveBackgroundOptions = {},
): Promise<Buffer> {
  const inputPath = join(outputDir, "input_bg.png");
  const outputPath = join(outputDir, "output_bg.png");

  await writeFile(inputPath, inputBuffer);
  const { stdout } = await runPythonScript("remove_bg.py", [
    inputPath,
    outputPath,
    JSON.stringify(options),
  ]);

  const result = JSON.parse(stdout);
  if (!result.success) {
    throw new Error(result.error || "Background removal failed");
  }

  return readFile(outputPath);
}
