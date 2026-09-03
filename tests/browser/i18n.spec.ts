import { expect, test } from "@playwright/test";
import { PAGES } from "./support/pages";

/** The language selector's one job: move to the same page, in the other language,
 *  never off it and never to the home page of that language by accident. */
for (const { locale, home, version } of PAGES) {
  const other = PAGES.find((page) => page.locale !== locale)!;

  test.describe(`locale: ${locale}`, () => {
    test("switches the home page to the other language, staying on the home page", async ({ page }) => {
      await page.goto(home);
      // Default (desktop) viewport: the desktop copy of the nav is the one in
      // the accessibility tree — see Header.astro's top-of-file comment on why
      // the header carries two copies (`.nav-desktop`/`.nav-mobile`).
      await page.locator(".nav-desktop .language-selector summary").click();
      await page.locator(".nav-desktop .language-selector a").click();
      await expect(page).toHaveURL(new URL(other.home, page.url()).toString());
    });

    test("switches /version to the other language, staying on /version", async ({ page }) => {
      await page.goto(version);
      // Default (desktop) viewport: the desktop copy of the nav is the one in
      // the accessibility tree — see Header.astro's top-of-file comment on why
      // the header carries two copies (`.nav-desktop`/`.nav-mobile`).
      await page.locator(".nav-desktop .language-selector summary").click();
      await page.locator(".nav-desktop .language-selector a").click();
      await expect(page).toHaveURL(new URL(other.version, page.url()).toString());
    });
  });
}
