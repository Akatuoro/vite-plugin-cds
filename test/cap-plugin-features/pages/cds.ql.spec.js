import { expect, test } from '@playwright/test'

test('cds.ql', async ({ page }) => {
    await page.goto('/cds.ql')

    await expect(page.getByRole('heading', { name: 'cds.ql' })).toBeVisible()

    const repl = page.locator('#repl')
    await expect(repl).toContainText('Hitchhiker')
    await expect(repl).toContainText('LOTR')
    await expect(repl).toContainText('LOTR 2')
})
