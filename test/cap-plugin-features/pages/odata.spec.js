import { expect, test } from '@playwright/test'

test('odata', async ({ page }) => {
    await page.goto('/odata')

    await expect(page.getByRole('heading', { name: 'odata' })).toBeVisible()

    await expect(page.locator('#served')).toContainText('Application started')

    const odata = page.locator('#odata')
    await expect(odata).toContainText('OData Response for /browse/Books:')
    await expect(odata).toContainText('Wuthering Heights')
})
