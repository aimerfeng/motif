import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

interface CatalogFile {
  items: { manifest: { slug: string; status: string; title: { 'zh-CN': string; en: string }; presets: unknown[] }; build: unknown }[]
}

const catalogPath = fileURLToPath(new URL('../packages/registry/generated/catalog.json', import.meta.url))
const published = (JSON.parse(readFileSync(catalogPath, 'utf8')) as CatalogFile).items.filter((item) => item.manifest.status === 'published' && item.build)

test('市场列出所有已发布条目，并能切换到英文', async ({ page }) => {
  await page.goto('/market')
  const grid = page.getByTestId('market-grid')
  for (const item of published) await expect(grid.getByTestId(`card-${item.manifest.slug}`)).toBeVisible()

  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en\/market$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Market')
})

for (const item of published) {
  test(`详情页实时预览：${item.manifest.slug}`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`${message.text()} @ ${message.location().url}`)
    })
    page.on('pageerror', (error) => errors.push(String(error)))

    await page.goto(`/market/${item.manifest.slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.manifest.title['zh-CN'])
    const frame = page.locator(`iframe[title="${item.manifest.title['zh-CN']}"]`)
    await expect(frame).toHaveAttribute('data-preview-state', 'mounted')

    // 切换预设只发新的 props，预览保持挂载状态。
    if (item.manifest.presets.length > 0) {
      await page.getByTestId('tune-panel').getByTestId('presets').getByRole('button').nth(1).click()
      await page.waitForTimeout(300)
      await expect(frame).toHaveAttribute('data-preview-state', 'mounted')
    }
    expect(errors).toEqual([])
  })
}
