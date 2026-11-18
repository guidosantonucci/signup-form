import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;
// Optional: run against a locally installed Chrome instead of Playwright's bundled Chromium.
const chromeLaunch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Cross-browser: the same suite runs on all three engines.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: chromeLaunch } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node server.js',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
