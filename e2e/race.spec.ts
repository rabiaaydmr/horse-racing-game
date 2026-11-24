import { expect, test, type Page } from '@playwright/test'

/** `?speed=` makes the simulation run faster, so a whole program fits in a test. */
const FAST = '/?speed=20'

function ui(page: Page) {
  return {
    generate: page.getByTestId('generate-button'),
    toggle: page.getByTestId('toggle-button'),
    horseRows: page.getByTestId('horse-row'),
    lanes: page.getByTestId('track-lane'),
    firstHorse: page.getByTestId('lane-horse').first(),
    caption: page.getByTestId('track-caption'),
    programRounds: page.getByTestId('program-panel').getByTestId('round-table'),
    resultRounds: page.getByTestId('results-panel').getByTestId('round-table'),
  }
}

async function progressOf(page: Page): Promise<number> {
  return Number(await ui(page).firstHorse.getAttribute('data-progress'))
}

test('shows 20 horses and nothing to start yet', async ({ page }) => {
  await page.goto('/')
  const { horseRows, toggle, programRounds } = ui(page)

  await expect(horseRows).toHaveCount(20)
  await expect(toggle).toBeDisabled()
  await expect(programRounds).toHaveCount(0)
})

test('Generate creates a six-round program with ten horses per round', async ({ page }) => {
  await page.goto('/')
  const { generate, toggle, programRounds, lanes, caption } = ui(page)

  await generate.click()

  await expect(programRounds).toHaveCount(6)
  for (const round of await programRounds.all()) {
    await expect(round.locator('tbody tr')).toHaveCount(10)
  }
  await expect(programRounds.first()).toContainText('1st Lap - 1200m')
  await expect(programRounds.last()).toContainText('6th Lap - 2200m')
  await expect(lanes).toHaveCount(10)
  await expect(caption).toHaveText('1st Lap - 1200m')
  await expect(toggle).toBeEnabled()
})

test('Start runs the rounds one at a time and fills in the results as they end', async ({
  page,
}) => {
  await page.goto(FAST)
  const { generate, toggle, resultRounds, caption } = ui(page)

  await generate.click()
  await toggle.click()

  // The first result appears on its own, before the later rounds have been run.
  await expect(resultRounds).toHaveCount(1)
  await expect(resultRounds.first()).toContainText('1st Lap - 1200m')
  await expect(resultRounds.first().locator('tbody tr')).toHaveCount(10)

  await expect(resultRounds).toHaveCount(6, { timeout: 20_000 })
  await expect(resultRounds.last()).toContainText('6th Lap - 2200m')
  await expect(caption).toHaveText('6th Lap - 2200m')
  await expect(toggle).toBeDisabled()
})

test('horses move during a race; Pause freezes them and Resume continues', async ({ page }) => {
  await page.goto('/')
  const { generate, toggle } = ui(page)

  await generate.click()
  expect(await progressOf(page)).toBe(0)

  await toggle.click()
  await expect(toggle).toHaveText('Pause')
  await expect.poll(() => progressOf(page)).toBeGreaterThan(0.05)

  await toggle.click()
  await expect(toggle).toHaveText('Resume')
  const pausedAt = await progressOf(page)
  // Proving that nothing moves needs a real wait; there is no event to wait for.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(400)
  expect(await progressOf(page)).toBe(pausedAt)

  await toggle.click()
  await expect.poll(() => progressOf(page)).toBeGreaterThan(pausedAt)
})

test('generating again discards the previous results', async ({ page }) => {
  await page.goto(FAST)
  const { generate, toggle, resultRounds } = ui(page)

  await generate.click()
  await toggle.click()
  await expect(resultRounds).toHaveCount(1)

  await generate.click()

  await expect(resultRounds).toHaveCount(0)
  await expect(toggle).toHaveText('Start')
})
