import { defineConfig } from '@playwright/test'

const url = 'http://localhost:4184'
export default defineConfig({
    testDir: './playwright',
    use: { baseURL: url },
    webServer: {
        url,
        command: 'npm run start -- --port 4184',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
