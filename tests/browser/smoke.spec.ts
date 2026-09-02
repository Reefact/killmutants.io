import { expect, test } from "@playwright/test";
import { PAGES } from "./support/pages";

for (const { locale, home, version } of PAGES) {
  test.describe(`locale: ${locale}`, () => {
    for (const [name, path] of [
      ["home", home],
      ["version", version],
    ] as const) {
      test(`${name} loads with no console errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator("header .brand")).toBeVisible();
        expect(errors).toEqual([]);
      });
    }

    test("the brand mark links back to this locale's home page", async ({ page }) => {
      await page.goto(version);
      await page.locator("header .brand").click();
      await expect(page).toHaveURL(new URL(home, page.url()).toString());
    });

    test("the GitHub link leaves the site in a new tab", async ({ page }) => {
      await page.goto(home);
      const github = page.locator("header nav a", { hasText: "GitHub" });
      await expect(github).toHaveAttribute("target", "_blank");
      await expect(github).toHaveAttribute("rel", /noopener/);
      await expect(github).toHaveAttribute("href", "https://github.com/Reefact/kill-mutants");
    });

    test("the language selector stays reachable at a narrow (320px) viewport", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(version);

      const brand = page.locator("header .brand");
      const summary = page.locator(".language-selector summary");
      const [brandBox, summaryBox] = await Promise.all([brand.boundingBox(), summary.boundingBox()]);

      expect(brandBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(summaryBox!.x + summaryBox!.width).toBeLessThanOrEqual(320);
      // Nav wraps below the brand at this width rather than overlapping it.
      expect(summaryBox!.y).toBeGreaterThanOrEqual(brandBox!.y + brandBox!.height);

      await summary.click();
      await expect(page.locator(".language-selector a")).toBeVisible();
    });
  });
}
