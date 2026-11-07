import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { scrollToCard } from './support/market'

interface CatalogFile {
  items: { manifest: { slug: string; status: string; title: { 'zh-CN': string; en: string }; presets: unknown[] }; build: unknown }[]
}

const catalogPath = fileURLToPath(new URL('../packages/registry/generated/catalog.json', import.meta.url))
const published = (JSON.parse(readFileSync(catalogPath, 'utf8')) as CatalogFile).items.filter((item) => item.manifest.status === 'published' && item.build)

test('市场列出所有已发布条目，并能切换到英文', async ({ page }) => {
  await page.goto('/market')
  // 按层级和分类分组；每组离视口近了才把骨架换成卡片，一路滚下去全部出现。
  await expect(page.getByTestId('market-catalog')).toBeVisible()
  await expect(page.locator('[data-testid^="card-"]').first()).toBeVisible()
  for (const item of published) await scrollToCard(page, item.manifest.slug)

  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en\/market$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Market')
})

test('左侧目录：点层级跳到那一段，滚动时当前分类跟着高亮', async ({ page }) => {
  await page.goto('/market')
  const rail = page.getByRole('navigation', { name: '目录' }).first()
  await rail.getByRole('button', { name: /^视觉效果/ }).click()
  await expect(page.getByRole('heading', { level: 2, name: /^视觉效果/ })).toBeInViewport()
  // 目录接手导航后展开这一层级的分类，正在看的那一类标成当前位置。
  await expect(rail.locator('[aria-current="location"]').first()).toBeVisible()
  await expect(page).toHaveURL(/\/market$/)
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
