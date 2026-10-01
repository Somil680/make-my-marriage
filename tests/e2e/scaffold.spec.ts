import { expect, test } from "@playwright/test";

test("landing page includes the full design and working section links", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("beautifully together");
  await expect(page.locator("main > section")).toHaveCount(11);
  await page.evaluate(() => document.fonts.ready);
  for (const link of await page.locator('a[href^="#"]').all()) {
    const target = await link.getAttribute("href");
    await expect(page.locator(target!)).toHaveCount(1);
  }
  await expect(page.locator("header").getByRole("link", { name: "Plan Your Wedding", exact: true })).toHaveAttribute("href", "/signup");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("landing-desktop.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("guest filtering and sample RSVP work without submitting real data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Filter Pending" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Verma Household");
  await page.getByRole("button", { name: "Show All" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  const trigger = page.getByRole("button", { name: "Try RSVP", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("checkbox", { name: "Rajesh", exact: true }).uncheck();
  await dialog.getByRole("button", { name: "Preview response" }).click();
  await expect(dialog.getByRole("status")).toContainText("3 attending, 1 declining. No real RSVP was sent.");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

for (const width of [320, 390, 768]) {
  test(`responsive navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Features", exact: true }).click();
    await expect(page).toHaveURL(/#features$/);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const overflow = await page.locator('main h1, main h2, header a, header button').evaluateAll(elements => elements.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(element => element.textContent));
    expect(overflow).toEqual([]);
    await page.goto("/");
    await page.screenshot({ path: testInfo.outputPath(`landing-mobile-${width}.png`), fullPage: true });
  });
}
