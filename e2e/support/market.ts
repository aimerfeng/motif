import { expect, type Locator, type Page } from '@playwright/test'

/** 市场的卡片滚动到附近才渲染（每批 24 张）：一直往下滚，直到要找的卡片出现。 */
export async function scrollToCard(page: Page, slug: string): Promise<Locator> {
  const card = page.getByTestId(`card-${slug}`)
  await expect(async () => {
    if ((await card.count()) === 0) await page.evaluate(() => window.scrollBy(0, 2500))
    await expect(card).toBeVisible({ timeout: 500 })
  }).toPass({ timeout: 30_000 })
  return card
}
