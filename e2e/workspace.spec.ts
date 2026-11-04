import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 320 },
  { width: 768, height: 900 },
]) {
  test(`workspace menu stays visible while scrolling at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?mode=analyst");
    await expect(
      page.getByRole("heading", { name: "Forecast variance by market" }),
    ).toBeVisible();

    const menu = page.getByRole("complementary", {
      name: "Workspace navigation",
    });
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
    await expect
      .poll(async () => (await menu.boundingBox())?.y)
      .toBeCloseTo(0, 0);
    expect((await menu.boundingBox())?.height).toBe(viewport.height);

    await menu.getByRole("link", { name: "Overview", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Portfolio overview" }),
    ).toBeInViewport();
  });
}
