import { expect, test } from "@playwright/test";

test("dashboard works independently and saves a validated alert", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Portfolio overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Market assistant" }),
  ).toHaveCount(0);
  const response = await page.request.post("/api/chat", {
    data: { question: "Germany" },
  });
  expect(response.status()).toBe(404);
  await page.screenshot({
    path: "test-results/dashboard-executive.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Analyst deep-dive" }).click();
  await page.getByRole("button", { name: /^Germany:/ }).click();
  await page
    .getByRole("combobox", { name: "Reporting period" })
    .selectOption("2026-03");
  await page
    .getByRole("combobox", { name: "Product", exact: true })
    .selectOption("veltrix");
  await expect(
    page.getByRole("heading", { name: "Veltrix overview" }),
  ).toBeVisible();
  const alerts = page.getByRole("region", { name: "Alert thresholds" });
  await alerts.getByText("Configure an alert", { exact: true }).click();
  await alerts.getByLabel("Alert name").fill("Watch European markets");
  await alerts.getByLabel("Apply to").selectOption("region");
  await alerts
    .getByRole("combobox", { name: "Region", exact: true })
    .selectOption("eu");
  await alerts.getByRole("button", { name: "Save alert" }).click();
  await expect(alerts.getByRole("status")).toHaveText(
    "Alert saved in this browser.",
  );
  await page.reload();
  await expect(
    alerts.getByText("Watch European markets", { exact: true }),
  ).toBeVisible();
});

test("dashboard URL history, heat-map selection and comparisons persist", async ({
  page,
}) => {
  await page.goto("/?mode=analyst");
  const germany = page.getByRole("button", { name: /^Germany:/ });
  await germany.focus();
  await germany.press("Enter");
  await page.getByLabel("Reporting period").selectOption("2026-03");
  await expect(page).toHaveURL(/period=2026-03/);
  await expect(page.getByLabel("Reporting period")).toHaveValue("2026-03");
  await page.goBack();
  await expect(page.getByLabel("Reporting period")).toHaveValue("2026-05");
  await page.goForward();
  await expect(page.getByLabel("Reporting period")).toHaveValue("2026-03");
  const cell = page.getByRole("button", { name: /Germany, Mar 2026:/ });
  await cell.focus();
  await cell.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Reporting period")).toHaveValue("2026-04");
  await page.getByLabel("Add comparison").selectOption("market:us");
  await page.reload();
  await expect(page.getByLabel("Reporting period")).toHaveValue("2026-04");
  await expect(
    page.getByRole("button", { name: "Remove United States from comparison" }),
  ).toBeVisible();
});
