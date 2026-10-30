import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["home", "demo", "research", "architecture", "engineering", "about"];
const SIZES = [["desktop", 1440, 900], ["tablet", 820, 1180], ["tablet-768", 768, 1024], ["phone", 390, 844], ["phone-375", 375, 812], ["phone-320", 320, 640]] as const;

for (const [name, w, h] of SIZES) for (const p of PAGES) {
  test(`${p} @ ${name}: axe clean, no horizontal page scroll`, async ({ page }, info) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`/#${p}`);
    await page.getByRole("main").waitFor();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `shots/${info.project.name}-${p}-${name}.png`, fullPage: true });
  });
}

test("navigation reaches every page and marks it current", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  for (const [label, heading] of [["Trading", /Order ticket/], ["Research", /Protocol and data/], ["Architecture", /Exchange pipeline/], ["Engineering", /Problems found/], ["Limits & credit", /Licensing/], ["Overview", /Hardening a C\+\+ exchange/]] as const) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
    await expect(page.getByRole("link", { name: label, exact: true }).first()).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
  }
});

test("phone menu: every page link is visible, reachable and the menu closes", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    const button = page.getByRole("button", { name: /Menu/ });
    await expect(nav).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    for (const [label, hash] of [["Trading", "demo"], ["Research", "research"], ["Architecture", "architecture"], ["Engineering", "engineering"], ["Limits & credit", "about"], ["Overview", "home"]] as const) {
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const links = await nav.getByRole("link").all();
      expect(links).toHaveLength(6);
      for (const l of links) { const b = (await l.boundingBox())!; expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x + b.width).toBeLessThanOrEqual(width); expect(b.height).toBeGreaterThanOrEqual(40); }
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${hash}$`));
      await expect(nav).toBeHidden();
    }
    await button.click();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
  }
});

test("phone: text tables become labelled cards and the architecture diagram becomes a stage list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/#architecture");
  await expect(page.getByRole("img", { name: /Exchange pipeline/ })).toBeHidden();
  await expect(page.locator(".flowlist li").first()).toContainText("Terminal app");
  await expect(page.locator(".flowlist li")).toHaveCount(20);
  const cell = page.locator("table.txt td[data-label]").first();
  await expect(cell).toHaveAttribute("data-label", "Origin");
  expect(await page.evaluate(() => [...document.querySelectorAll(".scroll")].every((s) => s.scrollWidth <= s.clientWidth + 1 || s.classList.contains("diagram")))).toBe(true);
});
