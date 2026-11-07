import { expect, type Locator, type Page } from '@playwright/test'

/**
 * 市场的卡片滚动到附近才渲染（平铺时每批 24 张，分组目录里每组先是骨架）：一直往下滚，直到要找的卡片出现。
 * 分组目录里精选的条目会出现两次（「精选」和它的分类），取第一张。
 */
export async function scrollToCard(page: Page, slug: string): Promise<Locator> {
  const card = page.getByTestId(`card-${slug}`).first()
  await expect(async () => {
    if ((await card.count()) === 0) await page.evaluate(() => window.scrollBy(0, 2500))
    await expect(card).toBeVisible({ timeout: 500 })
  }).toPass({ timeout: 30_000 })
  return card
}
