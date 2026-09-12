import { expect, test, type Page } from "@playwright/test";

// The loop the product exists for: a brand books a creator, the creator delivers,
// the tracking link counts a click, and confirming delivery pays the creator.
// Each test starts with a fresh browser, so the demo seeds itself from scratch.

const drawer = (page: Page) => page.getByRole("dialog").last();

test("a brand books a creator, the creator delivers, and the post is paid", async ({ page }) => {
  await page.goto("/brand/creators");

  const card = page.locator("article").first();
  await expect(card).toBeVisible();
  const creatorName = (await card.getByRole("heading").innerText()).trim();
  const firstName = creatorName.split(" ")[0];

  await test.step("book the creator at the listed price", async () => {
    await card.getByRole("button", { name: "Book" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Your selection")).toBeVisible();
    await dialog.getByRole("button", { name: /Send invitation/ }).click();
    await expect(page.getByText(`Invitation sent to ${creatorName}`)).toBeVisible();
  });

  await test.step("open the new collaboration", async () => {
    await page.getByRole("button", { name: "View", exact: true }).click();
    await expect(drawer(page)).toContainText("Invitation sent");
  });

  await test.step("the creator accepts and submits a draft", async () => {
    await drawer(page).getByRole("button", { name: `Open as ${firstName}` }).click();
    await expect(drawer(page)).toContainText("Accept or decline");
    await drawer(page).getByRole("button", { name: "Accept invitation" }).click();
    await drawer(page).getByRole("button", { name: "Start from the brief" }).click();
    await expect(drawer(page).getByLabel("Your draft")).not.toBeEmpty();
    await drawer(page).getByRole("button", { name: "Send draft for review" }).click();
    await expect(drawer(page)).toContainText("Draft to review");
  });

  await test.step("the brand approves the draft", async () => {
    await drawer(page).getByRole("button", { name: "Open as Tallyfox" }).click();
    await drawer(page).getByRole("button", { name: "Approve draft" }).click();
    await expect(drawer(page)).toContainText("Waiting for publication");
  });

  let trackingPath = "";
  await test.step("the creator publishes and gets a tracking link", async () => {
    await drawer(page).getByRole("button", { name: `Open as ${firstName}` }).click();
    await drawer(page).getByRole("button", { name: "Use a sample link" }).click();
    await drawer(page).getByRole("button", { name: "Mark as published" }).click();
    await expect(drawer(page)).toContainText("Live");
    trackingPath = new URL(await drawer(page).locator("code").first().innerText()).pathname;
    expect(trackingPath).toMatch(/^\/r\//);
  });

  await test.step("opening the tracking link records a click", async () => {
    await page.goto(trackingPath);
    await expect(page.getByText("Click recorded")).toBeVisible();
    await expect(page.getByText("1 click on this link")).toBeVisible();
  });

  await test.step("the brand confirms delivery and the creator is paid", async () => {
    await page.goto("/brand/collaborations");
    await page.getByRole("button", { name: creatorName }).first().click();
    await expect(drawer(page)).toContainText("Confirm delivery");
    await drawer(page).getByRole("button", { name: "Confirm delivery and pay" }).click();
    await expect(drawer(page)).toContainText(`Paid`);
    await expect(drawer(page)).toContainText(creatorName);
    await expect(drawer(page).getByText("Clicks")).toBeVisible();
  });

  await test.step("the payment shows up in the creator's earnings", async () => {
    await page.goto("/creator/earnings");
    await expect(page.getByRole("heading", { level: 1, name: "Earnings" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Collaboration" }).first()).toBeVisible();
  });
});

test("a creator can decline an invitation and the budget is released", async ({ page }) => {
  await page.goto("/creator/collaborations");
  await page.getByRole("tab", { name: /Needs action/ }).click();
  await page.getByRole("button", { name: "Tallyfox" }).first().click();
  await expect(drawer(page)).toContainText("Accept or decline");
  await drawer(page).getByRole("button", { name: "Decline" }).click();
  await expect(drawer(page)).toContainText("Declined");
});
