import { expect, test } from '@playwright/test'

/* 排行榜（docs/decisions/0010 第 4 节）：真实的使用会进榜，榜单能按时间、类型和层级切换。 */

test('看过的条目出现在本周榜上，榜单的切换写进链接', async ({ page }) => {
  // 浏览量由页面在浏览器里上报（sendBeacon）：先开始等，再打开页面，免得上报比等待先到。
  const reported = page.waitForResponse((response) => response.url().endsWith('/api/stats') && response.status() === 204)
  await page.goto('/market/globe')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('发光地球')
  await reported

  await page.goto('/rank')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('排行榜')
  await expect(page.locator('main a[href$="/market/globe"]').first()).toBeVisible()

  await page.getByRole('navigation', { name: '榜单' }).getByRole('link', { name: '收藏最多' }).click()
  await expect(page).toHaveURL(/board=favorite/)
  await page.getByRole('navigation', { name: '时间范围' }).getByRole('link', { name: '全部' }).click()
  await expect(page).toHaveURL(/period=all/)
  await expect(page).toHaveURL(/board=favorite/)
})

test('市场可以按本周热门排序', async ({ page }) => {
  await page.goto('/market')
  await page.getByRole('combobox', { name: '排序' }).selectOption('hot')
  await expect(page).toHaveURL(/sort=hot/)
  await expect(page.getByTestId('market-catalog')).toBeVisible()
})
