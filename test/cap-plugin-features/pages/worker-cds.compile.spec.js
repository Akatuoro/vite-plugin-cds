import { expect, test } from '@playwright/test'

test('worker cds.compile', async ({ page }) => {
    await page.goto('/worker-cds.compile')

    await expect(page.getByRole('heading', { name: 'worker cds.compile' })).toBeVisible()

    const output = page.locator('#app pre')
    await expect(output).toContainText('Worker Compiled:')
    await expect(output).toContainText('Browser')
    await expect(output).toContainText('"kind": "entity"')
})
