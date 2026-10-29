import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (e) => { throw e; });
  await page.goto("/#demo");
});

test("simulation status is visible and never claims real data or the C++ engine", async ({ page }) => {
  await expect(page.getByText("SIMULATION", { exact: true })).toBeVisible();
  await expect(page.getByRole("note").first()).toContainText("not the C++ exchange and not market data");
  await expect(page.getByText("SYNTHETIC").first()).toBeVisible();
});

test("full trade lifecycle: buy, position, partial sell, realized P&L, executions", async ({ page }) => {
  await page.getByRole("button", { name: "Send simulated order" }).click();
  await expect(page.getByRole("status")).toContainText("Filled");
  await expect(page.getByRole("table", { name: "Positions" }).getByRole("row", { name: /AAPL/ })).toBeVisible();
  await page.getByRole("radio", { name: "Sell" }).check({ force: true });
  await page.getByRole("textbox", { name: "Shares" }).fill("5");
  await page.getByRole("button", { name: "Send simulated order" }).click();
  await expect(page.getByRole("status")).toContainText("SELL 5 AAPL");
  await page.getByRole("tab", { name: /Executions/ }).click();
  await expect(page.getByRole("table", { name: /executions/ }).getByRole("row")).not.toHaveCount(1);
  await expect(page.getByLabel("Account summary")).toContainText("Realized P&L");
});

test("rejections surface in pre-trade check, feedback and order history", async ({ page }) => {
  await page.getByRole("radio", { name: "Sell" }).check({ force: true });
  await expect(page.getByText(/Would be rejected: Long-only/)).toBeVisible();
  await page.getByRole("button", { name: "Send simulated order" }).click();
  await expect(page.getByRole("status")).toContainText("Rejected");
  await page.getByRole("tab", { name: /Orders/ }).click();
  await expect(page.locator(".badge.rejected")).toHaveCount(2); // feedback panel + order row
});

test("symbol switch, timeframe, replay and reset behave", async ({ page }) => {
  await page.getByRole("radio", { name: "TSLA" }).check({ force: true });
  await expect(page.getByRole("heading", { name: /TSLA/ }).first()).toBeVisible();
  await page.getByRole("radio", { name: "5D" }).check({ force: true });
  await expect(page.getByTestId("ohlc")).toContainText("5 days");
  await page.getByRole("button", { name: "Next day" }).click();
  await expect(page.getByText(/day 201 of/)).toBeVisible();
  await page.getByRole("button", { name: "Auto-play" }).click();
  await expect(page.getByText(/Replaying/)).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText(/day 200 of/)).toBeVisible();
});

test("crosshair follows the pointer over the candlestick chart", async ({ page }) => {
  const svg = page.getByRole("img", { name: /candlestick/ });
  const before = await page.getByTestId("ohlc").innerText();
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + 100);
  await expect(page.locator(".xh")).toHaveCount(1);
  expect(await page.getByTestId("ohlc").innerText()).not.toBe(before);
});

test("determinism: same session gives identical book after reload", async ({ page }) => {
  const read = () => page.locator(".ladder").innerText();
  const a = await read();
  await page.reload();
  expect(await read()).toBe(a);
});

for (const [name, w, h] of [["desktop", 1440, 900], ["tablet", 820, 1180], ["phone", 390, 844]] as const) {
  test(`layout at ${name}: no horizontal page scroll, key panels reachable`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/#demo");
    for (const n of ["Order ticket", "Simulated order book", "Watchlist"]) await expect(page.getByRole("heading", { name: new RegExp(n) })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `shots/trading-${name}.png`, fullPage: true });
  });
}

test("capture: active session with fills and rejections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Send simulated order" }).click();
  await page.getByRole("button", { name: "Next day" }).click();
  await page.getByRole("button", { name: "Next day" }).click();
  await page.getByRole("radio", { name: "Limit (IOC)" }).check({ force: true });
  await page.getByRole("textbox", { name: "Limit price" }).fill("1");
  await page.getByRole("button", { name: "Send simulated order" }).click();
  await page.getByRole("tab", { name: /Orders/ }).click();
  await page.screenshot({ path: "shots/trading-active.png", fullPage: true });
});
