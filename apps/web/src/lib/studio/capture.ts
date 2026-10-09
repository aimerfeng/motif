import type { CaptureRequest, Screenshot } from '@motif/agent'
import type { Browser } from '@playwright/test'

/*
 * agent 的 look_at_preview：在无头浏览器里打开预览沙箱的截图宿主（capture.html，和生成市场海报同一个），
 * 用手动时钟逐帧推进到指定时刻再截图，所以截到的就是那一刻确定的画面。
 * 需要服务器上有浏览器：开发模式默认用本机的 Edge / Chrome，生产环境要显式设置 MOTIF_CAPTURE_CHANNEL。
 */

declare global {
  interface Window {
    motifCapture: { mount(options: unknown): Promise<number>; advance(ms: number): Promise<void>; errors(): string[] }
  }
}

const PREVIEW_BASE = process.env.NEXT_PUBLIC_MOTIF_PREVIEW_URL ?? 'http://127.0.0.1:4100'
const FPS = 30
const SIZES = { component: { width: 960, height: 600 }, page: { width: 1280, height: 800 } }

function channel(): string | null {
  const value = process.env.MOTIF_CAPTURE_CHANNEL?.trim()
  if (value) return value === 'off' ? null : value
  if (process.env.NODE_ENV !== 'development') return null
  return process.platform === 'win32' ? 'msedge' : 'chrome'
}

export function captureAvailable(): boolean {
  return channel() !== null
}

// 浏览器常驻，每次截图开一个新的上下文。页面和接口路由分开打包，挂在 globalThis 上共用一个。
const shared = ((globalThis as { __motifCapture?: { browser: Promise<Browser> | null } }).__motifCapture ??= { browser: null })

function launch(): Promise<Browser> {
  shared.browser ??= (async () => {
    // Playwright 不经过 Next 打包，运行时从工作区的 node_modules 加载。
    const { chromium } = (await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ '@playwright/test')) as typeof import('@playwright/test')
    const name = channel()!
    const browser = await chromium.launch(name === 'chromium' ? {} : { channel: name })
    browser.on('disconnected', () => {
      shared.browser = null
    })
    return browser
  })().catch((error: unknown) => {
    shared.browser = null
    throw error
  })
  return shared.browser
}

export async function capturePreview(request: CaptureRequest): Promise<Screenshot[]> {
  const browser = await launch()
  const context = await browser.newContext({ viewport: request.page ? SIZES.page : SIZES.component, deviceScaleFactor: 1 })
  try {
    const page = await context.newPage()
    await page.goto(`${PREVIEW_BASE}/capture.html`)
    const options = {
      module: { kind: 'code', code: request.build.js },
      styles: { kind: 'text', text: request.build.css },
      exportName: request.exportName,
      theme: request.theme,
      props: request.props,
      clock: 'manual',
    }
    await page.evaluate((json) => window.motifCapture.mount(JSON.parse(json)), JSON.stringify(options))

    // 逐帧推进：物理模拟和 useFrameLoop 的单帧步长有上限，一步跳到目标时刻会和真实播放不一样。
    const shots: Screenshot[] = []
    let frame = 0
    for (const time of [...request.times].sort((a, b) => a - b)) {
      for (const last = Math.round(time * FPS); frame <= last; frame++) await page.evaluate((ms) => window.motifCapture.advance(ms), (frame * 1000) / FPS)
      const image = await page.screenshot({ type: 'jpeg', quality: 72 })
      shots.push({ time, mediaType: 'image/jpeg', data: image.toString('base64') })
    }
    const errors = await page.evaluate(() => window.motifCapture.errors())
    if (errors.length > 0 && shots.length === 0) throw new Error(errors.join('\n'))
    return shots
  } finally {
    await context.close()
  }
}
