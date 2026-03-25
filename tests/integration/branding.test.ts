/**
 * Integration tests for the Logo Branding API.
 *
 * POST   /api/v1/settings/logo — Upload logo (admin only)
 * GET    /api/v1/settings/logo — Serve custom logo as PNG (public)
 * DELETE /api/v1/settings/logo — Remove custom logo (admin only)
 */

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildTestApp, createMultipartPayload, loginAsAdmin, type TestApp } from "./test-server.js";

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

// Helper: create a small test PNG
async function makeTestPng(width = 10, height = 10): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } },
  })
    .png()
    .toBuffer();
}

// Helper: create a test JPEG
async function makeTestJpeg(width = 10, height = 10): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 0, g: 255, b: 0 } },
  })
    .jpeg()
    .toBuffer();
}

// Helper: create a simple SVG buffer
function makeTestSvg(): Buffer {
  return Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="blue" width="64" height="64"/></svg>',
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/v1/settings/logo
// ═══════════════════════════════════════════════════════════════════════════
describe("POST /api/v1/settings/logo", () => {
  it("uploads a PNG logo and stores it", async () => {
    const png = await makeTestPng();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.png", contentType: "image/png", content: png },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });

  it("uploads a JPEG and converts to PNG", async () => {
    const jpeg = await makeTestJpeg();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.jpg", contentType: "image/jpeg", content: jpeg },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(200);

    // Verify it was converted — GET should return PNG
    const getRes = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(getRes.headers["content-type"]).toBe("image/png");
  });

  it("uploads an SVG and converts to PNG", async () => {
    const svg = makeTestSvg();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.svg", contentType: "image/svg+xml", content: svg },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(200);
  });

  it("rejects files over 500KB", async () => {
    // Create an image that's just over 500KB but under the multipart limit (10MB)
    // A 500x500 uncompressed PNG with 4 channels is ~1MB
    const largePng = await sharp({
      create: {
        width: 500,
        height: 500,
        channels: 4,
        background: { r: 128, g: 64, b: 32, alpha: 1 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();

    // Ensure it's actually over 500KB
    expect(largePng.length).toBeGreaterThan(500 * 1024);

    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "big.png", contentType: "image/png", content: largePng },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/500KB/i);
  });

  it("rejects non-image files", async () => {
    const { body, contentType } = createMultipartPayload([
      {
        name: "file",
        filename: "data.txt",
        contentType: "text/plain",
        content: Buffer.from("not an image"),
      },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/image/i);
  });

  it("requires admin role", async () => {
    // Register a non-admin user
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { username: "branduser", password: "Testpass1", role: "user" },
    });

    // Login as non-admin
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "branduser", password: "Testpass1" },
    });

    // Clear mustChangePassword
    const { token } = JSON.parse(loginRes.body);
    await app.inject({
      method: "POST",
      url: "/api/auth/change-password",
      headers: { authorization: `Bearer ${token}` },
      payload: { currentPassword: "Testpass1", newPassword: "Newpass123" },
    });

    // Login again with new password
    const loginRes2 = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "branduser", password: "Newpass123" },
    });
    const userToken = JSON.parse(loginRes2.body).token;

    const png = await makeTestPng();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.png", contentType: "image/png", content: png },
    ]);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${userToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    expect(res.statusCode).toBe(403);
  });

  it("resizes large images to max 128x128", async () => {
    const png = await makeTestPng(256, 256);
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "big-logo.png", contentType: "image/png", content: png },
    ]);

    await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    // Fetch and check dimensions
    const getRes = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const metadata = await sharp(getRes.rawPayload).metadata();
    expect(metadata.width).toBeLessThanOrEqual(128);
    expect(metadata.height).toBeLessThanOrEqual(128);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/v1/settings/logo
// ═══════════════════════════════════════════════════════════════════════════
describe("GET /api/v1/settings/logo", () => {
  it("returns 404 when no custom logo is set", async () => {
    // First delete any existing logo
    await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
    });

    expect(res.statusCode).toBe(404);
  });

  it("returns the logo with image/png content-type after upload", async () => {
    // Upload a logo first
    const png = await makeTestPng();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.png", contentType: "image/png", content: png },
    ]);

    await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    // Verify it's valid PNG data
    const metadata = await sharp(res.rawPayload).metadata();
    expect(metadata.format).toBe("png");
  });

  it("works without authentication (public path)", async () => {
    // Upload a logo first (as admin)
    const png = await makeTestPng();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.png", contentType: "image/png", content: png },
    ]);

    await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    // GET without any auth header
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /api/v1/settings/logo
// ═══════════════════════════════════════════════════════════════════════════
describe("DELETE /api/v1/settings/logo", () => {
  it("removes the custom logo", async () => {
    // Upload first
    const png = await makeTestPng();
    const { body, contentType } = createMultipartPayload([
      { name: "file", filename: "logo.png", contentType: "image/png", content: png },
    ]);

    await app.inject({
      method: "POST",
      url: "/api/v1/settings/logo",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": contentType,
      },
      payload: body,
    });

    // Delete
    const delRes = await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(delRes.statusCode).toBe(200);
    expect(JSON.parse(delRes.body)).toEqual({ ok: true });

    // Verify logo is gone
    const getRes = await app.inject({
      method: "GET",
      url: "/api/v1/settings/logo",
    });

    expect(getRes.statusCode).toBe(404);
  });

  it("requires admin role", async () => {
    // Login as non-admin (created in earlier test)
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "branduser", password: "Newpass123" },
    });
    const userToken = JSON.parse(loginRes.body).token;

    const res = await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${userToken}` },
    });

    expect(res.statusCode).toBe(403);
  });

  it("returns ok even if no logo exists (idempotent)", async () => {
    // Ensure no logo exists
    await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    // Delete again
    const res = await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/logo",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });
});
