import { expect, test } from "@playwright/test";

test("dashboard → streamed answer → source citation → saved alert", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Portfolio overview" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/executive-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Analyst deep-dive" }).click();
  await page.getByRole("button", { name: /^Germany:/ }).click();
  await expect(page).toHaveURL(/market=de/);
  await page.getByLabel("Reporting period").selectOption("2026-03");
  await page
    .getByRole("combobox", { name: "Product", exact: true })
    .selectOption("veltrix");
  await expect(
    page.getByRole("heading", { name: "Veltrix overview" }),
  ).toBeVisible();

  await page
    .getByRole("textbox", { name: "Ask about your markets" })
    .fill("Why did Germany's revenue dip?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).toBeVisible();
  await expect(
    page.getByText("High confidence", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Germany · Veltrix · Mar 2026/ })
    .click();
  await expect(page).toHaveURL(/period=2026-03/);
  await expect(
    page.getByRole("combobox", { name: "Market", exact: true }),
  ).toHaveValue("de");
  await expect(
    page.getByRole("combobox", { name: "Product", exact: true }),
  ).toHaveValue("veltrix");
  await page.screenshot({
    path: "test-results/cited-answer.png",
    fullPage: true,
  });

  const alerts = page.getByRole("region", { name: "Alert thresholds" });
  await alerts.getByText("Configure an alert", { exact: true }).click();
  await alerts.getByLabel("Alert name").fill("Markets below forecast");
  await alerts.getByLabel("Apply to").selectOption("region");
  await alerts
    .getByRole("combobox", { name: "Region", exact: true })
    .selectOption("eu");
  await alerts.getByRole("button", { name: "Save alert" }).click();
  await expect(
    alerts.getByText("Markets below forecast", { exact: true }),
  ).toBeVisible();
  await expect(alerts.getByRole("status")).toHaveText(
    "Alert saved in this browser.",
  );
  await page.reload();
  await expect(
    alerts.getByText("Markets below forecast", { exact: true }),
  ).toBeVisible();
});

test("URL history, heat-map keyboard selection and comparison follow the view", async ({
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

for (const scenario of [
  {
    name: "uncertainty",
    question: "What's driving the forecast miss?",
    expected: "Directional interpretation.",
  },
  {
    name: "abstention",
    question: "Forecast next year",
    expected: "Cannot answer from the provided data.",
  },
  { name: "error", question: "force error", expected: "Retry question" },
]) {
  test(`chat handles ${scenario.name}`, async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Ask about your markets" })
      .fill(scenario.question);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator(".assistant-message").last()).toContainText(
      scenario.expected,
    );
    await expect(
      page.getByRole("button", { name: "Send message" }),
    ).toBeVisible();
    if (scenario.name === "error")
      await expect(
        page.locator(".assistant-message").last().getByRole("alert"),
      ).toBeVisible();
  });
}

test("stopping a response keeps partial content without attaching confidence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Ask about your markets" })
    .fill("full summary");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".answer-text")).not.toHaveText(
    "Reading the evidence…",
  );
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(
    page.getByText("Stopped · Partial answer, not verified."),
  ).toBeVisible();
  await expect(page.locator(".answer-evidence")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retry question" }),
  ).toBeVisible();
});
