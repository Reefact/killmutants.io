import { expect, test, type Page } from "@playwright/test";

/**
 * The hero artwork used to be one hand-made 1440px JPEG, and `object-fit: cover`
 * meant a 2560x1440 screen painted it 3361px wide — a 2.3x enlargement of an
 * already lossy file, which is what made it look the way it did. These lock in
 * the three properties that fixed it. They are page-level, not locale-level (the
 * artwork is the same in both), so unlike the other specs they iterate the two
 * *pages* that carry artwork rather than the two locales.
 */
const ARTWORK = [
  { page: "the home hero", path: "/" },
  { page: "the /version banner", path: "/version/" },
] as const;

/** What the browser actually resolved out of `<picture>`, srcset and `sizes`. */
async function resolved(page: Page) {
  return page.evaluate(() => {
    const img = document.querySelector<HTMLImageElement>("picture.hero-bg img");
    if (img === null) throw new Error("no hero artwork on this page");

    const widest = (type: string) => {
      const source = img.closest("picture")!.querySelector(`source[type="${type}"]`);
      if (source === null) return null;
      const candidates = source
        .getAttribute("srcset")!
        .split(",")
        .map((candidate) => candidate.trim().split(/\s+/))
        .map(([url, descriptor]) => ({ url, width: Number.parseInt(descriptor, 10) }));
      return candidates.reduce((a, b) => (b.width > a.width ? b : a));
    };

    const avif = widest("image/avif")!;
    return {
      currentSrc: img.currentSrc,
      widestUrl: new URL(avif.url, location.href).href,
      widestWidth: avif.width,
      // With `w` descriptors a browser reports the *density-corrected* natural
      // width — which is exactly the width `sizes` resolved to, i.e. the width
      // it decided the artwork is painted at. That is the number under test.
      askedFor: img.naturalWidth,
    };
  });
}

for (const { page: label, path } of ARTWORK) {
  test.describe(label, () => {
    test("is served in a modern format, not the JPEG left for browsers without one", async ({ page }) => {
      await page.goto(path);
      expect((await resolved(page)).currentSrc).toMatch(/\.avif$/);
    });

    test("gives a large screen the artwork at its full resolution", async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.goto(path);

      const { currentSrc, widestUrl } = await resolved(page);
      expect(currentSrc).toBe(widestUrl);
    });
  });
}

test("the home hero is sized for what `cover` paints, not for the viewport's width", async ({ page }) => {
  // The hero's box is as wide as the viewport but a whole viewport tall, and the
  // artwork is far wider than it is tall — so `cover` fills the box by height and
  // spills well past both edges. A plain `sizes="100vw"` would ask for 2560 here
  // and hand back a variant the browser then has to enlarge; the point is that it
  // asks for the ~3361 it genuinely paints.
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto("/");

  const { askedFor } = await resolved(page);
  expect(askedFor).toBeGreaterThan(2560);
});

test("a modest window is not force-fed the largest variant", async ({ page }) => {
  // The other half of the same bargain: the width ladder exists so a small
  // window pays for a small file. (The /version banner is the honest place to
  // assert this — it is only 300px tall, so `cover` scales it by width and the
  // window's own size is what decides. The home hero's full-height box asks for
  // ~2.3x the window's width, which reaches the top of the ladder early.)
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/version/");

  const { currentSrc, widestUrl } = await resolved(page);
  expect(currentSrc).not.toBe(widestUrl);
});
