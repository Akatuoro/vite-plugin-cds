import { expect, test } from '@playwright/test'

test('parallel requests', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Feature only works in Chromium based browsers')

    await page.goto('/parallel-requests')

    await expect(page.getByRole('heading', { name: 'parallel-requests' })).toBeVisible()

    const insert = page.locator('#insert')
    await expect(insert).toContainText('Result insert:')
    await expect(insert).toContainText('createdBy')
    await expect(insert).toContainText('alice')

    const insertAndUpdate = page.locator('#insertAndUpdate')
    await expect(insertAndUpdate).toContainText('Result insertAndUpdate:')
    await expect(insertAndUpdate).toContainText('updatedBy')
    await expect(insertAndUpdate).toContainText('bob')
    await expect(insertAndUpdate).toContainText(/alice.*bob.*ceric/s)
})
