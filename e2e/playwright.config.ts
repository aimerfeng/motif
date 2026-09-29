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
  // 一个进程负责全部服务：构建沙箱 → 构建站点 → 同时启动两者（见 support/start.ts）。
  webServer: {
    command: 'pnpm exec tsx e2e/support/start.ts',
    cwd: REPO_ROOT,
    url: E2E.webUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
})
