import { defineConfig } from '@playwright/test'

const url = 'http://localhost:4189'
export default defineConfig({
    testDir: '../cap-plugin-features/pages',
    use: { baseURL: url, trace: 'on' },
    reporter: [['list'], ['html']],
    webServer: {
        url,
        command: 'npm run start -- --port 4189',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
