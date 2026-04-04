import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildTestApp, loginAsAdmin, type TestApp } from "./test-server.js";

describe("Lite variant", () => {
  let testApp: TestApp;
  let app: TestApp["app"];
  let adminToken: string;

  beforeAll(async () => {
    process.env.STIRLING_VARIANT = "lite";
    testApp = await buildTestApp();
    app = testApp.app;
    adminToken = await loginAsAdmin(app);
  }, 30_000);

  afterAll(async () => {
    delete process.env.STIRLING_VARIANT;
    await testApp.cleanup();
  }, 10_000);

  describe("GET /api/v1/settings", () => {
    it("includes variant and variantUnavailableTools", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/settings",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.variant).toBe("lite");
      expect(body.variantUnavailableTools).toEqual([
        "remove-background",
        "upscale",
        "blur-faces",
        "erase-object",
        "ocr",
      ]);
    });
  });
});
