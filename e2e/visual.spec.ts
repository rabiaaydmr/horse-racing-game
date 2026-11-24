import { expect, test, type Page } from '@playwright/test'

/**
 * Visual regression tests: each state is compared with a stored screenshot.
 * The game is random, so Math.random is replaced by a seeded generator before
 * the app loads; every run then draws the same horses and the same program.
 *
 * Update the stored screenshots after an intended design change with:
 *   npx playwright test visual --update-snapshots
 */
async function makeRandomRepeatable(page: Page) {
  await page.addInitScript(() => {
    let state = 2026
    Math.random = () => {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })
}

test.beforeEach(async ({ page }) => {
  await makeRandomRepeatable(page)
})

test('initial screen', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('horse-row')).toHaveCount(20)

  await expect(page).toHaveScreenshot('initial.png')
})

test('program generated, horses on the start line', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('generate-button').click()
  await expect(page.getByTestId('track-lane')).toHaveCount(10)

  await expect(page).toHaveScreenshot('program-generated.png')
})

test('all rounds finished', async ({ page }) => {
  await page.goto('/?speed=50')
  await page.getByTestId('generate-button').click()
  await page.getByTestId('toggle-button').click()
  await expect(page.getByTestId('results-panel').getByTestId('round-table')).toHaveCount(6, {
    timeout: 20_000,
  })

  await expect(page).toHaveScreenshot('finished.png')
})
