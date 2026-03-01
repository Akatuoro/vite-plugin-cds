import { expect, test } from '@playwright/test'

test('cds.services', async ({ page }) => {
    await page.goto('/cds.services')

    await expect(page.getByRole('heading', { name: 'cds.services' })).toBeVisible()

    const repl = page.locator('#repl')
    await expect(repl).toContainText('Eldorado')
    await expect(repl).toContainText('ENTITY_IS_READ_ONLY')
    await expect(repl).toContainText('"code":"ASSERT"')
})
