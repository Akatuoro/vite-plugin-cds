import { defineConfig } from '@playwright/test'

const url = 'http://localhost:4183'
export default defineConfig({
    testDir: './playwright',
    use: { baseURL: url },
    webServer: {
        url,
        command: 'npm run start -- --port 4183',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
