import { defineConfig } from '@playwright/test'

const url = 'http://localhost:4188'
export default defineConfig({
    testDir: '../cap-plugin/playwright',
    use: { baseURL: url },
    webServer: {
        url,
        command: 'npm run start -- --port 4188',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
