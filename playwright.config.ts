import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);
// Optional local/CI browser paths when the bundled browser cannot be downloaded in that environment.
// Unset by default, so normal development keeps Playwright's version-matched browsers.
const chromiumLaunch = process.env.DERMAL_CHROMIUM_EXECUTABLE ? { executablePath: process.env.DERMAL_CHROMIUM_EXECUTABLE } : {};
const webkitLaunch = process.env.DERMAL_WEBKIT_EXECUTABLE ? { executablePath: process.env.DERMAL_WEBKIT_EXECUTABLE } : {};

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: chromiumLaunch } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], launchOptions: chromiumLaunch } },
    // Automated WebKit, not a real iPhone.
    { name: "desktop-webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 }, launchOptions: webkitLaunch } },
    // The narrowest phone the site supports, for the launch checks only (26 September 2026).
    { name: "narrow-320", testMatch: /launch\.spec\.ts/, use: { ...devices["Pixel 7"], viewport: { width: 320, height: 720 }, launchOptions: chromiumLaunch } },
  ],
});
