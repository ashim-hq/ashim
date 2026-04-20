/**
 * Worker pool for offloading CPU-bound image processing from the main event loop.
 *
 * Uses Piscina (backed by worker_threads) so Sharp operations don't block
 * HTTP request handling, SSE streams, or health checks.
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Piscina from "piscina";
import { loadEnv, resolveWorkerThreads } from "./env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const maxThreads = resolveWorkerThreads(loadEnv());

let pool: Piscina | null = null;

export function getWorkerPool(): Piscina {
  if (!pool) {
    pool = new Piscina({
      filename: resolve(__dirname, "image-worker.ts"),
      // Inherit tsx loader flags from the main process so .ts files work in workers
      execArgv: [...process.execArgv],
      maxThreads,
      idleTimeout: 30000,
    });
  }
  return pool;
}

export async function shutdownWorkerPool(): Promise<void> {
  if (pool) {
    await pool.destroy();
    pool = null;
  }
}
