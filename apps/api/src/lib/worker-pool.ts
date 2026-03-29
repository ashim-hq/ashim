/**
 * Worker pool for offloading CPU-bound image processing from the main event loop.
 *
 * Uses Piscina (backed by worker_threads) so Sharp operations don't block
 * HTTP request handling, SSE streams, or health checks.
 */
import { availableParallelism } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Piscina from "piscina";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Size the pool: leave 1 thread for the event loop, min 1 worker
const maxThreads = Math.max(1, Math.min(availableParallelism() - 1, 4));

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
