import { expect, test } from "@playwright/test";

// Anyone opening the live link must be able to use both sides without an account.

test("the landing page leads into either side of the demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("B2B LinkedIn Creator Marketplace");

  await page.getByRole("link", { name: "Try the demo" }).first().click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByRole("link", { name: /I'm a brand/ }).click();
  await expect(page).toHaveURL(/\/brand/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tallyfox");

  await page.getByRole("group", { name: "View the demo as" }).getByRole("link", { name: "Creator" }).click();
  await expect(page).toHaveURL(/\/creator/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Good to see you");
});

test("the marketplace filters, sorts and shortlists", async ({ page }) => {
  await page.goto("/brand/creators");
  const cards = page.locator("article");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();

  await page.getByLabel("Search creators").fill("finance");
  await expect(cards).not.toHaveCount(total);

  await page.getByLabel("Search creators").clear();
  await page.getByRole("button", { name: /^Industry/ }).click();
  await page.getByRole("checkbox", { name: "Sales" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByText(/creators?$/).first()).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(cards).toHaveCount(total);

  const first = cards.first();
  const name = (await first.getByRole("heading").innerText()).trim();
  await first.getByRole("button", { name: `Save ${name} to your shortlist` }).click();
  await page.getByRole("tab", { name: /Shortlist/ }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
});

test("results and billing show the seeded campaign data", async ({ page }) => {
  await page.goto("/brand/results");
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  await expect(page.getByText("Attribution by creator")).toBeVisible();
  await expect(page.getByText("Est. reach")).toBeVisible();

  await page.goto("/brand/billing");
  await expect(page.getByText("Available balance")).toBeVisible();
  await page.getByRole("button", { name: "Add budget" }).click();
  await page.getByRole("button", { name: "Add €5,000" }).click();
  await expect(page.getByText("added to your balance")).toBeVisible();
});
