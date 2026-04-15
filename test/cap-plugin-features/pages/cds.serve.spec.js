import { expect, test } from '@playwright/test'

test('cds.serve', async ({ page }) => {
    await page.goto('/cds.serve')

    await expect(page.getByRole('heading', { name: 'cds.serve' })).toBeVisible()

    const log = page.locator('#log')
    await expect(log).toContainText('successfully deployed to in-memory database')
    await expect(log).toContainText('cds.served in')
})
