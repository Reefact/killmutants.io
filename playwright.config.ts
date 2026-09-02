import { defineConfig, devices } from "@playwright/test";

/**
 * Renders the built site in a real browser — the one thing the build and the
 * type-checker cannot tell us: a page that only breaks once it runs (a layout that
 * overflows the viewport, a hover state that hides its own label, a language link
 * that goes nowhere). See ADR-style reasoning in justdummies.io's own
 * check-in-browser.sh: Playwright over Selenium for auto-waiting assertions (no
 * hand-written sleeps), one API across browsers, and a trace viewer for CI failures.
 *
 * `webServer` serves the already-built `dist/` rather than rebuilding — `pnpm build`
 * is expected to have run first, same as CI does it. Plain `serve` rather than
 * `astro preview`: Astro 7's preview server daemonizes itself and its launching
 * process exits immediately, which Playwright reads as "the server crashed".
 */
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",

  use: {
    baseURL: "http://localhost:4321",
    trace: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npx serve -l 4321 dist",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
