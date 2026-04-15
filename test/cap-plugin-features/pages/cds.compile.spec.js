import { expect, test } from '@playwright/test'

test('cds.compile', async ({ page }) => {
    await page.goto('/cds.compile')

    await expect(page.getByRole('heading', { name: 'cds.compile' })).toBeVisible()

    const modelOutput = page.locator('#compiled-model')
    await expect(modelOutput).toContainText('Compiled:')
    await expect(modelOutput).toContainText('MyEntity')
    await expect(modelOutput).toContainText('"kind": "entity"')
    await expect(modelOutput).toContainText('name')
})
