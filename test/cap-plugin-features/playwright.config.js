import { defineConfig } from '@playwright/test'

const url = 'http://localhost:4185'
export default defineConfig({
    testDir: './pages',
    use: { baseURL: url },
    webServer: {
        url,
        command: 'npm run start -- --port 4185',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
