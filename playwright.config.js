import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the built site served by `vite preview`.
// CI: `npm run build && npx playwright install --with-deps && npm run test:e2e`.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:4173",
    // Feature-flow tests are not consent-dialog tests. Start from an explicit
    // privacy-safe choice so the modal cannot cover controls under test; cookie
    // localization and behavior remain covered by the dedicated i18n suite.
    storageState: {
      cookies: [],
      origins: [{
        origin: "http://localhost:4173",
        localStorage: [{ name: "ac_cookie_consent", value: "denied" }],
      }],
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Start the preview server unless an external E2E_BASE_URL is provided.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run preview -- --port 4173", url: "http://localhost:4173", reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
});
