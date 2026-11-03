import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("analyst view has no automated WCAG A/AA violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?mode=analyst");
  await expect(
    page.getByRole("heading", { name: "Forecast variance by market" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Market performance", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  const results = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({
        target,
        failureSummary,
      })),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile layout contains tables without overflowing the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?mode=analyst&market=de&period=2026-03");
  await expect(
    page.getByRole("heading", { name: "Forecast variance by market" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Product performance/ }),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});
