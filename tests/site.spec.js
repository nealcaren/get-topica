const { test, expect } = require("@playwright/test");

function trackPageErrors(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("terminal tour renders without browser errors", async ({ page }) => {
  const errors = trackPageErrors(page);
  // reduced motion makes the replayed session render instantly (no per-char
  // typing, no sleeps), so the whole tour is on screen without a skip button.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#screen")).toContainText("AnalysisManifest");
  await expect(page.locator("#screen")).toContainText("list_models");
  expect(errors).toEqual([]);
});

test("full site filters the model roster and toggles its theme", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/site/");
  await page.locator("#theme").click();
  await page.locator("#legend .chip").nth(1).click();
  await expect(page.locator("#countNote")).not.toContainText("All 39");
  expect(errors).toEqual([]);
});

test("words-into-bins animation completes", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/bins/");
  await page.locator("#sp2").click();
  await page.locator("#play").click();
  await expect(page.locator("#cap")).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("legacy terminal URL redirects to the home page", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/terminal/");
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});
