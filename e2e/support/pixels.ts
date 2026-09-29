import type { Locator, Page } from '@playwright/test'

/** 截图后在页面里解码，返回亮度的标准差。纯色（空白画面）接近 0。 */
export async function lumaStdDev(page: Page, target: Locator): Promise<number> {
  const png = (await target.screenshot()).toString('base64')
  return page.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let sum = 0
    let sumSq = 0
    const n = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!
      sum += y
      sumSq += y * y
    }
    const mean = sum / n
    return Math.sqrt(Math.max(0, sumSq / n - mean * mean))
  }, png)
}
