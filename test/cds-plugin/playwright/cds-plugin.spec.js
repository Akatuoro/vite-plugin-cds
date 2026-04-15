import { expect, test } from '@playwright/test'

test('renders compiled CDS model in browser', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'CDS Plugin Test' })).toBeVisible()

    const modelOutput = page.locator('#app pre')
    await expect(modelOutput).toContainText('CDS Model:')
    await expect(modelOutput).toContainText('Books')
    await expect(modelOutput).toContainText('title')
})
