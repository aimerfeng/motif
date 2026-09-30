import { expect, test } from '@playwright/test'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

const clipboard = (page: import('@playwright/test').Page) => page.evaluate(() => navigator.clipboard.readText())

test('市场按层级和分类筛选，筛选状态写进链接', async ({ page }) => {
  await page.goto('/market')
  await page.getByRole('tab', { name: /功能组件/ }).click()
  await expect(page).toHaveURL(/kind=component/)
  await expect(page.getByTestId('card-dock')).toBeVisible()
  await expect(page.getByTestId('card-mesh-gradient')).toHaveCount(0)

  await page.getByRole('group', { name: '分类' }).getByRole('button', { name: '按钮', exact: true }).click()
  await expect(page).toHaveURL(/category=button/)
  await expect(page.getByTestId('card-hold-button')).toBeVisible()
  await expect(page.getByTestId('card-dock')).toHaveCount(0)

  await page.reload()
  await expect(page.getByTestId('card-hold-button')).toBeVisible()
  await expect(page.getByTestId('card-dock')).toHaveCount(0)
})

test('每张卡片都能直接复制 Skill，筛选栏能复制通用 Skill', async ({ page }) => {
  await page.goto('/market')
  const card = page.getByTestId('card-mesh-gradient')
  await card.hover()
  await card.getByRole('button', { name: '复制 Skill' }).click()
  await expect(card.getByRole('button', { name: '已复制' })).toBeVisible()
  expect(await clipboard(page)).toContain('name: motif-mesh-gradient')

  await page.getByRole('tab', { name: /视觉效果/ }).click()
  await page.getByRole('group', { name: '分类' }).getByRole('button', { name: '背景', exact: true }).click()
  await page.getByTestId('general-skills').getByRole('button', { name: '背景' }).click()
  await expect(page.getByTestId('general-skills').getByRole('button', { name: '已复制' })).toBeVisible()
  expect(await clipboard(page)).toContain('name: motif-backgrounds')
})

test('详情页复制的 Skill 带着调好的参数', async ({ page }) => {
  await page.goto('/market/border-beam')
  await page.getByTestId('tune-panel').getByLabel('光束长度').fill('240')
  await page.getByTestId('quick-actions').getByRole('button', { name: '复制 Skill' }).click()
  await expect(page.getByTestId('quick-actions').getByRole('button', { name: '已复制' })).toBeVisible()
  const text = await clipboard(page)
  expect(text).toContain('name: motif-border-beam')
  expect(text).toContain('| `size` | 240 | 160 |')
})

test('旧的 Skills 页面转到市场', async ({ page }) => {
  await page.goto('/skills')
  await expect(page).toHaveURL(/\/market$/)
})
