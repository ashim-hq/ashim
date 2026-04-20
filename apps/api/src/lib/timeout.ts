import { env } from "../config.js";

type ToolCategory = "sharp" | "ai_cpu" | "ai_gpu" | "external" | "python";

const TIMEOUT_RATES: Record<ToolCategory, number> = {
  sharp: 2,
  ai_cpu: 30,
  ai_gpu: 5,
  external: 10,
  python: 15,
};

export function computeTimeout(megapixels: number, category: ToolCategory, fileCount = 1): number {
  if (env.PROCESSING_TIMEOUT_S > 0) {
    return env.PROCESSING_TIMEOUT_S * 1000;
  }
  const perFile = Math.max(60_000, megapixels * TIMEOUT_RATES[category] * 1000);
  return perFile * fileCount;
}

export function computeExternalToolTimeout(megapixels: number): number {
  if (env.PROCESSING_TIMEOUT_S > 0) {
    return env.PROCESSING_TIMEOUT_S * 1000;
  }
  return Math.max(60_000, megapixels * TIMEOUT_RATES.external * 1000);
}
