import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    // Automated WebKit, not a real iPhone.
    { name: "desktop-webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
    // The narrowest phone the site supports, for the launch checks only (26 September 2026).
    { name: "narrow-320", testMatch: /launch\.spec\.ts/, use: { ...devices["Pixel 7"], viewport: { width: 320, height: 720 } } },
  ],
});
