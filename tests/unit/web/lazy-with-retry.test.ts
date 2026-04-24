// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/stores/connection-store", () => ({
  useConnectionStore: { getState: () => ({ setDisconnected: vi.fn() }) },
}));

import { retryDynamicImport } from "@/lib/lazy-with-retry";

describe("retryDynamicImport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves on first success", async () => {
    const mod = { default: () => null };
    const importFn = vi.fn().mockResolvedValue(mod);
    const result = await retryDynamicImport(importFn);
    expect(result).toBe(mod);
    expect(importFn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and resolves on eventual success", async () => {
    const mod = { default: () => null };
    const importFn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch dynamically imported module"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch dynamically imported module"))
      .mockResolvedValue(mod);
    const promise = retryDynamicImport(importFn, 3, 100);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe(mod);
    expect(importFn).toHaveBeenCalledTimes(3);
  });

  it("rejects after all retries exhausted", async () => {
    const err = new TypeError("Failed to fetch dynamically imported module");
    const importFn = vi.fn().mockRejectedValue(err);
    const promise = retryDynamicImport(importFn, 3, 100);
    promise.catch(() => {});
    await vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow("Failed to fetch dynamically imported module");
    expect(importFn).toHaveBeenCalledTimes(3);
  });

  it("retries CSS preload errors", async () => {
    const mod = { default: () => null };
    const importFn = vi
      .fn()
      .mockRejectedValueOnce(
        new TypeError("Unable to preload CSS for /assets/tool-page-DDbXBANV.css"),
      )
      .mockResolvedValue(mod);
    const promise = retryDynamicImport(importFn, 3, 100);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe(mod);
    expect(importFn).toHaveBeenCalledTimes(2);
  });

  it("only retries chunk-related errors, not other errors", async () => {
    const err = new Error("Some other error");
    const importFn = vi.fn().mockRejectedValue(err);
    await expect(retryDynamicImport(importFn, 3, 100)).rejects.toThrow("Some other error");
    expect(importFn).toHaveBeenCalledTimes(1);
  });
});
