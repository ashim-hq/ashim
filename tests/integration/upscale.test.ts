/**
 * Integration tests for the upscale tool (/api/v1/tools/upscale).
 *
 * This tool requires the Python sidecar (Real-ESRGAN). Tests accept both
 * 200 (sidecar running) and 501 (not installed) for the processing path
 * while fully testing validation paths.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildTestApp, createMultipartPayload, loginAsAdmin, type TestApp } from "./test-server.js";

const FIXTURES = join(__dirname, "..", "fixtures");
const PNG = readFileSync(join(FIXTURES, "test-200x150.png"));
const JPG = readFileSync(join(FIXTURES, "test-100x100.jpg"));
const HEIC = readFileSync(join(FIXTURES, "test-200x150.heic"));
const TINY = readFileSync(join(FIXTURES, "test-1x1.png"));

let testApp: TestApp;
let app: TestApp["app"];
let adminToken: string;

beforeAll(async () => {
  testApp = await buildTestApp();
  app = testApp.app;
  adminToken = await loginAsAdmin(app);
}, 30_000);

afterAll(async () => {
  await testApp.cleanup();
}, 10_000);

describe("Upscale", () => {
  // ── Processing (AI-dependent) ────────────────────────────────────

  it("route exists and responds to POST", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("accepts default settings (2x scale)", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      const result = JSON.parse(res.body);
      expect(result.downloadUrl).toBeDefined();
      expect(result.processedSize).toBeGreaterThan(0);
      expect(result.width).toBeDefined();
      expect(result.height).toBeDefined();
      expect(result.method).toBeDefined();
    }

    if (res.statusCode === 501) {
      const result = JSON.parse(res.body);
      expect(result.code).toBe("FEATURE_NOT_INSTALLED");
    }
  }, 60_000);

  it("accepts explicit scale factor", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      {
        name: "settings",
        content: JSON.stringify({ scale: 4 }),
      },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("accepts model and faceEnhance options", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      {
        name: "settings",
        content: JSON.stringify({
          scale: 2,
          model: "auto",
          faceEnhance: true,
        }),
      },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("accepts denoise and format options", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      {
        name: "settings",
        content: JSON.stringify({
          scale: 2,
          denoise: 30,
          format: "png",
          quality: 90,
        }),
      },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("accepts scale as a string (coerced to number)", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      {
        name: "settings",
        content: JSON.stringify({ scale: "2" }),
      },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("processes JPEG input", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "photo.jpg", contentType: "image/jpeg", content: JPG },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("handles HEIC input", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "photo.heic", contentType: "image/heic", content: HEIC },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 501]).toContain(res.statusCode);
  }, 60_000);

  it("handles 1x1 pixel input", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "tiny.png", contentType: "image/png", content: TINY },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([200, 422, 501]).toContain(res.statusCode);
  }, 60_000);

  // ── Validation (always testable) ─────────────────────────────────

  it("rejects requests without a file", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([400, 501]).toContain(res.statusCode);
    if (res.statusCode === 400) {
      const result = JSON.parse(res.body);
      expect(result.error).toMatch(/no image/i);
    }
  });

  it("rejects invalid settings JSON", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      { name: "settings", content: "not valid json{{{" },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      body,
    });

    expect([400, 501]).toContain(res.statusCode);
    if (res.statusCode === 400) {
      const result = JSON.parse(res.body);
      expect(result.error).toMatch(/json/i);
    }
  });

  it("rejects unauthenticated requests", async () => {
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "test.png", contentType: "image/png", content: PNG },
      { name: "settings", content: JSON.stringify({}) },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/tools/upscale",
      headers: { "content-type": contentType },
      body,
    });

    expect(res.statusCode).toBe(401);
  });
});
