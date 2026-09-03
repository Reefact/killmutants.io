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

    test("the header's GitHub link leaves the site in a new tab", async ({ page }) => {
      // /version, not home: the home page hides the header's GitHub link
      // (`githubLink={false}`) since it already has its own "Star on GitHub"
      // button — see the next test.
      await page.goto(version);
      // Desktop viewport (the default here): the desktop copy of the nav is the
      // one in the accessibility tree — see Header.astro's top-of-file comment
      // on why the header carries two copies (`.nav-desktop`/`.nav-mobile`).
      const github = page.locator("header .nav-desktop a", { hasText: "GitHub" });
      await expect(github).toHaveAttribute("target", "_blank");
      await expect(github).toHaveAttribute("rel", /noopener/);
      await expect(github).toHaveAttribute("href", "https://github.com/Reefact/kill-mutants");
    });

    test("the home page's header has no GitHub link, only the hero's CTA button", async ({ page }) => {
      await page.goto(home);
      // `.nav-links` is the header's own GitHub-link block — distinct from
      // `.language-selector`, which is also a <nav> and stays either way.
      await expect(page.locator("header .nav-links")).toHaveCount(0);

      const cta = page.locator(".btn-primary");
      await expect(cta).toHaveAttribute("target", "_blank");
      await expect(cta).toHaveAttribute("rel", /noopener/);
      await expect(cta).toHaveAttribute("href", "https://github.com/Reefact/kill-mutants");
    });

    test("the language selector stays reachable at a narrow (320px) viewport", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(version);

      // At this width the mobile copy of the nav is the one in the accessibility
      // tree (see Header.astro's top-of-file comment).
      const brand = page.locator("header .brand");
      const summary = page.locator(".nav-mobile .language-selector summary");
      const [brandBox, summaryBox] = await Promise.all([brand.boundingBox(), summary.boundingBox()]);

      expect(brandBox).not.toBeNull();
      expect(summaryBox).not.toBeNull();
      expect(summaryBox!.x + summaryBox!.width).toBeLessThanOrEqual(320);
      // The language selector stays on the brand's row (right-aligned) at this width;
      // the nav links (GitHub, ...) are what wraps below instead.
      expect(summaryBox!.x).toBeGreaterThanOrEqual(brandBox!.x + brandBox!.width);

      await summary.click();
      await expect(page.locator(".nav-mobile .language-selector a")).toBeVisible();
    });
  });
}
