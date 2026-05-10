import { test, expect } from "@playwright/test";

test.describe("Note app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("front page can be opened", async ({ page }) => {
    await expect(page.getByText("Fullstack Notes")).toBeVisible();
    await expect(
      page.getByText("Notes app, Department of Computer Science, University of Helsinki 2026"),
    ).toBeVisible();
  });
});
