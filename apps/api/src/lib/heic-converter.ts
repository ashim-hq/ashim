import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Find the HEIF decode command. macOS (Homebrew) provides `heif-dec`,
 * while Linux packages provide `heif-convert`. Both accept the same
 * `<input> <output>` argument syntax.
 */
let cachedDecodeCmd: string | null = null;

async function findDecodeCmd(): Promise<string> {
  if (cachedDecodeCmd) return cachedDecodeCmd;
  for (const cmd of ["heif-convert", "heif-dec"]) {
    try {
      await execFileAsync(cmd, ["--version"], { timeout: 5_000 });
      cachedDecodeCmd = cmd;
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error("No HEIF decoder found. Install libheif-examples (Linux) or libheif (macOS).");
}

/**
 * Decode a HEIC/HEIF buffer to PNG using the system HEIF decoder CLI.
 * This is needed because Sharp's bundled libheif does not include the
 * HEVC decoder required for true HEIC files (iPhone photos).
 */
export async function decodeHeic(buffer: Buffer): Promise<Buffer> {
  const cmd = await findDecodeCmd();
  const id = randomUUID();
  const inputPath = join(tmpdir(), `heic-in-${id}.heic`);
  const outputPath = join(tmpdir(), `heic-out-${id}.png`);

  try {
    await writeFile(inputPath, buffer);
    await execFileAsync(cmd, [inputPath, outputPath], { timeout: 30_000 });
    return await readFile(outputPath);
  } finally {
    await rm(inputPath, { force: true }).catch(() => {});
    await rm(outputPath, { force: true }).catch(() => {});
  }
}

/**
 * Encode a PNG/JPEG buffer to HEIC using the system `heif-enc` CLI tool.
 * Uses x265 (HEVC) compression for true HEIC output.
 */
export async function encodeHeic(buffer: Buffer, quality = 80): Promise<Buffer> {
  const id = randomUUID();
  const inputPath = join(tmpdir(), `heic-in-${id}.png`);
  const outputPath = join(tmpdir(), `heic-out-${id}.heic`);

  try {
    await writeFile(inputPath, buffer);
    await execFileAsync("heif-enc", ["-q", String(quality), "-o", outputPath, inputPath], {
      timeout: 30_000,
    });
    return await readFile(outputPath);
  } finally {
    await rm(inputPath, { force: true }).catch(() => {});
    await rm(outputPath, { force: true }).catch(() => {});
  }
}
