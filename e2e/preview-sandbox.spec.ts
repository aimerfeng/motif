import { expect, test } from '@playwright/test'
import { lumaStdDev } from './support/pixels'

test.describe('预览沙箱', () => {
  test('预编译条目、内联代码都能在不透明源 iframe 里挂载，共用同一份 React', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`${message.text()} @ ${message.location().url}`)
    })

    await page.goto('/lab/preview')

    for (const id of ['motion-card', 'three-spin', 'paper-gradient', 'inline-code']) {
      await expect(page.getByTestId(`case-${id}`), id).toHaveAttribute('data-status', 'mounted')
    }

    // 渲染错误要回传给 host，而不是静默失败。
    await expect(page.getByTestId('case-broken')).toHaveAttribute('data-status', 'error')
    await expect(page.getByTestId('status-broken')).toContainText('intentional render failure')

    // 沙箱真的是不透明源：拿不到 host 的 DOM。
    const motionFrame = page.frameLocator('[data-testid="case-motion-card"] iframe')
    const origin = await motionFrame.locator('body').evaluate(() => window.origin)
    expect(origin).toBe('null')

    // hooks 能用 = 沙箱里只有一份 React（两份 React 会抛 Invalid hook call）。
    const button = motionFrame.getByTestId('motion-box')
    await expect(button).toContainText('Motif · 0')
    await button.click()
    await expect(button).toContainText('Motif · 1')

    // WebGL 条目画出了东西，不是空白。
    await page.waitForTimeout(500)
    for (const id of ['three-spin', 'paper-gradient']) {
      const deviation = await lumaStdDev(page, page.locator(`[data-testid="case-${id}"] iframe`))
      expect(deviation, `${id} 不应是空白画面`).toBeGreaterThan(4)
    }

    expect(consoleErrors.filter((text) => !text.includes('intentional render failure'))).toEqual([])
  })
})
