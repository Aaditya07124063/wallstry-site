import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["home", "demo", "research", "architecture", "engineering", "about"];
const SIZES = [["desktop", 1440, 900], ["tablet", 820, 1180], ["phone", 390, 844]] as const;

for (const [name, w, h] of SIZES) for (const p of PAGES) {
  test(`${p} @ ${name}: axe clean, no horizontal page scroll`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`/#${p}`);
    await page.getByRole("main").waitFor();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `shots/${p}-${name}.png`, fullPage: true });
  });
}

test("navigation reaches every page and marks it current", async ({ page }) => {
  await page.goto("/");
  for (const [label, heading] of [["Trading", /Order ticket/], ["Research", /Protocol and data/], ["Architecture", /Exchange pipeline/], ["Engineering", /Problems found/], ["Limits & credit", /Licensing/], ["Overview", /Hardening a C\+\+ exchange/]] as const) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
    await expect(page.getByRole("link", { name: label, exact: true }).first()).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
  }
});
