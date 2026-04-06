import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, schema } from "../../apps/api/src/db/index.js";
import { buildTestApp, loginAsAdmin, type TestApp } from "./test-server.js";

describe("permissions in auth responses", () => {
  let testApp: TestApp;
  let adminToken: string;

  beforeAll(async () => {
    testApp = await buildTestApp();
    adminToken = await loginAsAdmin(testApp.app);
  }, 30_000);

  afterAll(async () => {
    await testApp.cleanup();
  }, 10_000);

  it("login response includes permissions array for admin", async () => {
    const res = await testApp.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "admin", password: "Adminpass1" },
    });
    const body = JSON.parse(res.body);
    expect(body.user.permissions).toBeDefined();
    expect(body.user.permissions).toContain("users:manage");
    expect(body.user.permissions).toContain("tools:use");
    expect(body.user.permissions).toContain("files:all");
  });

  it("login response includes permissions array for user role", async () => {
    // Create a non-admin user
    await testApp.app.inject({
      method: "POST",
      url: "/api/auth/register",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { username: "permtest", password: "TestPass1", role: "user" },
    });
    db.update(schema.users)
      .set({ mustChangePassword: false })
      .where(eq(schema.users.username, "permtest"))
      .run();

    const res = await testApp.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "permtest", password: "TestPass1" },
    });
    const body = JSON.parse(res.body);
    expect(body.user.permissions).toContain("tools:use");
    expect(body.user.permissions).toContain("files:own");
    expect(body.user.permissions).not.toContain("users:manage");
    expect(body.user.permissions).not.toContain("files:all");
  });

  it("session response includes permissions array", async () => {
    const res = await testApp.app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const body = JSON.parse(res.body);
    expect(body.user.permissions).toBeDefined();
    expect(body.user.permissions).toContain("users:manage");
  });

  it("login response includes teamName", async () => {
    const res = await testApp.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "admin", password: "Adminpass1" },
    });
    const body = JSON.parse(res.body);
    expect(body.user.teamName).toBeDefined();
    expect(typeof body.user.teamName).toBe("string");
  });
});
