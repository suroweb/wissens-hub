import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  reporter: [['json', { outputFile: 'test-results.json' }], ['list']],

  use: {
    ignoreHTTPSErrors: true,
    channel: 'msedge',
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    launchOptions: {
      args: [
        // Allow SharePoint (public origin) to access localhost dev server
        '--disable-features=BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults',
        '--allow-insecure-localhost',
      ],
    },
  },

  projects: [
    {
      name: 'msedge',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
