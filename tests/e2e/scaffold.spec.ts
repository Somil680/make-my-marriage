import { expect, test } from "@playwright/test";

test("shows the project scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Make My Marriage" }),
  ).toBeVisible();
});
