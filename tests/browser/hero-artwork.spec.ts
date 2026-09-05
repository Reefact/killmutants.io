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

test("a narrow window is sized for what `cover` paints, not for its own width", async ({ page }) => {
  // `cover` fills the box by whichever axis runs out first. A phone-width window
  // is far narrower than the artwork is wide, so the artwork is scaled to the
  // box's *height* and spills past both edges — the /version banner is 300px tall
  // against a 1774x887 original, so it is painted 600px wide on a 375px screen.
  // A plain `sizes="100vw"` would ask for 375 and hand back a variant the browser
  // then has to enlarge; the point is that it asks for the 600 it truly paints.
  //
  // (The same arithmetic on a wide desktop resolves the other way — there the box
  // is proportionally wider than the artwork, `cover` scales it by width, and
  // 100vw *is* the answer. Which is why this asserts on the narrow case: it is
  // the one where the two readings differ.)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/version/");

  const { askedFor } = await resolved(page);
  expect(askedFor).toBeGreaterThan(375);
});

test("the home hero keeps up with a window tall enough to stretch it", async ({ page }) => {
  // The hero is `flex: 1` in a `min-height: 100vh` column, so it absorbs the
  // height the rest of the page leaves — it does not stop at some figure
  // measured once on a laptop. A tall window stretches it to 1220px and more,
  // and `cover` then paints the artwork wider than 2800px. This is the case a
  // fixed `boxHeight` got wrong while every ordinary viewport still looked
  // right, so it is the one worth pinning down.
  await page.setViewportSize({ width: 500, height: 2000 });
  await page.goto("/");

  const { askedFor } = await resolved(page);
  const painted = await page.evaluate(() => {
    const img = document.querySelector<HTMLImageElement>("picture.hero-bg img")!;
    const box = img.getBoundingClientRect();
    return Math.max(box.width, (box.height * img.naturalWidth) / img.naturalHeight);
  });

  expect(askedFor).toBeGreaterThanOrEqual(painted);
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
