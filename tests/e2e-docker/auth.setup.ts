import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "..", "..", "test-results", ".auth", "analytics-user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin");
  await page.getByRole("button", { name: /login/i }).click();

  // Wait for login to complete — page leaves "/login"
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });

  // If we landed on the consent page, accept or decline it
  if (page.url().includes("/analytics-consent")) {
    const acceptBtn = page.getByRole("button", { name: /sure, sounds good/i });
    await acceptBtn.waitFor({ state: "visible", timeout: 15_000 });
    await acceptBtn.click();
    // Consent page does window.location.href = "/" (full reload)
    await page.waitForURL("/", { timeout: 30_000 });
  }

  // At this point we should be on the home page
  await expect(page).toHaveURL("/");
  mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
