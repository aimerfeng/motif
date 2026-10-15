import { expect, test } from '@playwright/test'

/*
 * 只存在浏览器里的小功能：主题、收藏、最近看过、排序、调参提示。
 * 每个测试都是新的浏览器上下文，localStorage 从空开始。
 */

test('明暗切换立即生效，刷新后还在', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  // 首屏的海报在浅色主题里也保持暗色。
  await expect(page.locator('section[data-theme="dark"]').first()).toBeVisible()
})

test('在卡片上收藏，市场里只看收藏', async ({ page }) => {
  await page.goto('/market')
  const card = page.getByTestId('market-grid').locator('[data-testid^="card-"]').first()
  const slug = ((await card.getAttribute('data-testid')) ?? '').replace('card-', '')
  await card.hover()
  await card.getByRole('button', { name: '收藏' }).click()
  await expect(card.getByRole('button', { name: '取消收藏' })).toBeVisible()

  await page.getByRole('button', { name: /^只看收藏/ }).click()
  await expect(page.getByTestId('result-count')).toHaveText('1 个结果')
  await expect(page.getByTestId(`card-${slug}`)).toBeVisible()

  // 详情页上的收藏按钮读的是同一份收藏。
  await page.goto(`/market/${slug}`)
  await expect(page.getByRole('button', { name: '已收藏' })).toBeVisible()
})

test('看过的条目出现在市场顶上的「最近看过」里', async ({ page }) => {
  await page.goto('/market/border-beam')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('边框光束')
  await page.goto('/market/mesh-gradient')
  await page.goto('/market')
  const recent = page.getByTestId('recent-items')
  await expect(recent).toBeVisible()
  // 最近看的排在最前面。
  await expect(recent.getByRole('link').first()).toHaveAttribute('href', /\/market\/mesh-gradient$/)
  await expect(recent.getByRole('link').nth(1)).toHaveAttribute('href', /\/market\/border-beam$/)
})

test('按「最新」排序写进链接', async ({ page }) => {
  await page.goto('/market')
  await page.getByRole('combobox', { name: '排序' }).selectOption('new')
  await expect(page).toHaveURL(/sort=new/)
  await page.reload()
  await expect(page.getByRole('combobox', { name: '排序' })).toHaveValue('new')
})

test('调参面板的提示只出现一次', async ({ page }) => {
  await page.goto('/market/border-beam')
  const tips = page.getByTestId('tune-tips')
  await expect(tips).toBeVisible()
  await tips.getByRole('button', { name: '知道了' }).click()
  await expect(tips).toBeHidden()
  await page.reload()
  await expect(page.getByTestId('tune-panel')).toBeVisible()
  await expect(tips).toBeHidden()
})
