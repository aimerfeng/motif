import { expect, test } from '@playwright/test'
import { scrollToCard } from './support/market'

test('市场的筛选来自链接，首屏就是筛好的结果', async ({ page }) => {
  await page.goto('/market?kind=component&category=button')
  await expect(page.getByRole('tab', { name: /功能组件/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('card-hold-button')).toBeVisible()
  await expect(page.getByTestId('card-mesh-gradient')).toHaveCount(0)

  await page.getByRole('searchbox').fill('长按')
  await expect(page).toHaveURL(/q=%E9%95%BF%E6%8C%89/)
  await expect(page.getByTestId('card-hold-button')).toBeVisible()
  await page.getByRole('button', { name: '清除筛选' }).first().click()
  await expect(page).not.toHaveURL(/kind=|q=/)
  await scrollToCard(page, 'mesh-gradient')
})

test('换语言时保留筛选和调好的参数', async ({ page }) => {
  await page.goto('/market?kind=effect')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/market\?kind=effect$/)
  await expect(page.getByRole('tab', { name: /Effects/ })).toHaveAttribute('aria-selected', 'true')

  await page.context().clearCookies()
  await page.goto('/market/border-beam')
  await page.getByTestId('tune-panel').getByTestId('presets').getByRole('button', { name: '极光' }).click()
  await expect(page).toHaveURL(/#v=/)
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/market\/border-beam#v=/)
  await expect(page.getByTestId('presets').getByRole('button', { name: 'Aurora' })).toHaveAttribute('aria-pressed', 'true')
})
