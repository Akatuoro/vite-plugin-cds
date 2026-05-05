import { defineConfig } from '@playwright/test'
import path from 'path'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const relative = (from, to) => path.relative(from, to)

const url = 'http://localhost:4185'
export const createConfig = (importer = import.meta.url, prod = false) => {
    const importerDir = path.dirname(fileURLToPath(importer))

    return defineConfig({
        testDir: path.relative(importerDir, path.join(__dirname, './pages')),
        use: { baseURL: url, trace: 'on' },
        reporter: [['list'], ['html', { outputFolder: path.join(importerDir, 'playwright-report') }]],
        outputDir: path.join(importerDir, 'test-results'),
        webServer: {
            url,
            command: prod ?
                'npx vite build && npx vite preview --port 4185' :
                'npx vite --port 4185',
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
        },
    })
}

export default createConfig()
