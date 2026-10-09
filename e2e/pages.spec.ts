import { expect, test } from '@playwright/test'

test('文档页列出各章节，通用 Skill 可以直接复制', async ({ page }) => {
  await page.goto('/docs')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('文档')
  await expect(page.getByRole('heading', { level: 2, name: '把效果交给 agent' })).toBeVisible()
  await expect(page.locator('#skills').getByRole('button', { name: '设计总控' })).toBeVisible()
})

test('不存在的条目和地址返回带站点外壳的 404', async ({ page }) => {
  for (const path of ['/market/no-such-item', '/no/such/page']) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('这里什么都没有')
    await expect(page.getByRole('link', { name: '去市场看看' })).toBeVisible()
  }
})
