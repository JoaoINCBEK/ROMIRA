import { defineConfig, devices } from '@playwright/test';

// Os testes rodam sobre a versão compilada (npm run build + preview)
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    {
      name: 'iphone',
      use: { ...devices['iPhone 13'], browserName: 'chromium', defaultBrowserType: 'chromium' },
    },
  ],
});
