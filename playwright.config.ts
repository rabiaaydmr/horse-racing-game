import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const port = isCI ? 4173 : 5173

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Tolerate anti-aliasing noise in the visual tests, nothing more.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? 'html' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // Dev server locally for a fast feedback loop, the production build on CI.
    command: isCI ? 'npm run preview' : 'npm run dev',
    port,
    env: { E2E: '1' },
    reuseExistingServer: !isCI,
  },
})
