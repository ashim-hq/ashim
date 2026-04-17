import { expect, test as setup } from "@playwright/test";
import { authFile } from "../../playwright.docker.config";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin");
  await page.getByRole("button", { name: /login/i }).click();
  await page.waitForURL("/", { timeout: 30_000 });
  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: authFile });
});
