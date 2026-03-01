import { expect, test } from '@playwright/test'


test('CAP in the Browser', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'CAP in the Browser' })).toBeVisible()

    const modelOutput = page.locator('#compiled')
    await expect(modelOutput).toContainText('Compiled:')
    await expect(modelOutput).toContainText('Books')
    await expect(modelOutput).toContainText('name')

    const odataOutput = page.locator('#odata')
    await expect(odataOutput).toContainText('OData Response:')
    await expect(odataOutput).toContainText('"title": "LOTR"')

    const workerOutput = page.locator('#worker-compiled')
    await expect(workerOutput).toContainText('Worker Compiled:')
    await expect(workerOutput).toContainText('Books')
    await expect(workerOutput).toContainText('name')
})
