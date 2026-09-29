import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { E2E } from './support/env'

/** 本地用已安装的 Edge（真实 GPU，不下载 Playwright 自带浏览器）；CI 用 Chrome。 */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const desktopChannel = process.env.E2E_CHANNEL ?? (process.env.CI ? 'chrome' : 'msedge')

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results',
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  use: {
    baseURL: E2E.webUrl,
    locale: 'zh-CN',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: desktopChannel, viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @motif/preview dev',
      cwd: REPO_ROOT,
      url: `${E2E.previewUrl}/runtime.html`,
      env: { MOTIF_PREVIEW_PORT: String(E2E.previewPort) },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // 生产构建 + next start：Next 16 不允许同一目录再起一个 dev 服务，而且这样测的就是上线后的行为。
      command: `pnpm --filter @motif/web exec next build && pnpm --filter @motif/web exec next start -p ${E2E.webPort}`,
      cwd: REPO_ROOT,
      url: E2E.webUrl,
      env: { NEXT_PUBLIC_MOTIF_PREVIEW_URL: E2E.previewUrl, MOTIF_NEXT_DIST: '.next-e2e' },
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
})
