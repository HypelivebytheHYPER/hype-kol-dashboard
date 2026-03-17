import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "https://hype-kol-dashboard.vercel.app",
    headless: true,
    screenshot: "only-on-failure",
    // Wait for network to be idle before asserting
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
