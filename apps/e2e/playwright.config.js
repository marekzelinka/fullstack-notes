import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter client dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter server exec node src/index.js",
      port: 3001,
      env: {
        NODE_ENV: "test",
        SECRET_KEY: "test-secret-only-for-local-and-ci",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
