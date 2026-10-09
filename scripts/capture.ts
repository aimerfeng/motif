/**
 * 为市场条目生成海报和循环视频，并跑视觉质量闸门。
 *
 *   pnpm capture                 # 全部条目
 *   pnpm capture mesh-gradient   # 指定条目
 *   pnpm capture --gates-only    # 只跑闸门，不写媒体文件
 *
 * 每次运行把沙箱和所选条目构建到独立的临时目录、用随机端口起服务，多个进程可以同时跑。
 * 沙箱在手动时钟下逐帧推进（见 apps/preview/src/runtime/clock.ts），每一帧都可复现。
 * 海报与视频写到 apps/web/public/media/<slug>/，报告写到 .data/capture/<slug>.json。
 */
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { chromium, type Browser, type Page } from '@playwright/test'
import * as esbuild from 'esbuild'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'
import { buildVendorInto, captureHostOptions, runtimeOptions, writeRuntimeHtml } from '@motif/preview/build'
import { startPreviewServer } from '@motif/preview/server'
import { buildItem, ITEMS_DIR, loadItemSource, loadSourceRecords, REPO_ROOT, type CatalogItem } from '@motif/registry'
import { defaultsOf } from '@motif/schema'
import { readdir } from 'node:fs/promises'
import type { CaptureMountOptions } from '../apps/preview/src/capture/host.ts'

const run = promisify(execFile)
const args = process.argv.slice(2)
const gatesOnly = args.includes('--gates-only')
const onlySlugs = args.filter((arg) => !arg.startsWith('--'))

const FPS = 30
const FADE = 0.5
/** 海报的输出像素尺寸（16:10）；循环视频是它的一半。 */
const POSTER = { width: 1280, height: 800 }
const MEDIA_DIR = path.join(REPO_ROOT, 'apps/web/public/media')
const REPORT_DIR = path.join(REPO_ROOT, '.data/capture')

interface ItemReport {
  slug: string
  pass: boolean
  problems: string[]
  fps: number
  slowFrames: number
  mountMs: number
  posterStdDev: number
  motionPixels: number | null
  reducedMotionPixels: number | null
  seconds: number
}

// ---- 图像工具 ----

/** 亮度（Rec. 709）的标准差：画面接近纯色时趋近 0，用来判断海报是不是空白。 */
async function lumaStdDev(png: Buffer): Promise<number> {
  // sharp 的 stats() 统计的是输入图像，不受管线里的 toColourspace 影响（读到的是红色通道）：
  // 浅色暖调的海报红色通道几乎全是 255，会被误判为空白。所以在原始像素上按 Rec. 709 自己算亮度。
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = info.width * info.height
  let sum = 0
  let squares = 0
  for (let i = 0; i < data.length; i += info.channels) {
    const luma = 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!
    sum += luma
    squares += luma * luma
  }
  const mean = sum / pixels
  return Math.sqrt(Math.max(squares / pixels - mean * mean, 0))
}

/** 两帧之间明显变化（灰度差 > 8）的像素数。 */
async function changedPixels(a: Buffer, b: Buffer): Promise<number> {
  const [ra, rb] = await Promise.all([sharp(a).greyscale().raw().toBuffer(), sharp(b).greyscale().raw().toBuffer()])
  let count = 0
  for (let i = 0; i < ra.length; i++) if (Math.abs(ra[i]! - rb[i]!) > 8) count++
  return count
}

// ---- 浏览器页面：按设备像素比缓存（zoom 通过缩小 CSS 视口、提高像素比实现，画面更满且依然清晰） ----

const pages = new Map<number, Page>()
let browser: Browser
let baseUrl = ''

async function pageFor(deviceScaleFactor: number): Promise<Page> {
  let page = pages.get(deviceScaleFactor)
  if (!page) {
    const context = await browser.newContext({ viewport: POSTER, deviceScaleFactor })
    page = await context.newPage()
    await page.goto(`${baseUrl}/capture.html`)
    pages.set(deviceScaleFactor, page)
  }
  return page
}

async function mount(page: Page, item: CatalogItem, clock: 'real' | 'manual', css: { width: number; height: number }): Promise<number> {
  await page.setViewportSize(css)
  const options: CaptureMountOptions = {
    module: { kind: 'url', url: item.build!.js },
    styles: { kind: 'url', url: item.build!.css },
    exportName: item.manifest.demo.export,
    theme: item.manifest.demo.theme,
    props: defaultsOf(item.manifest.params),
    clock,
  }
  // 以 JSON 字符串传入：props 的递归类型会让 Playwright 的 evaluate 泛型展开过深。
  return page.evaluate((json) => window.motifCapture.mount(JSON.parse(json) as CaptureMountOptions), JSON.stringify(options))
}

/** 从 fromFrame 开始按 30fps 推进到 toSeconds 秒。逐帧推进是必须的：物理模拟和 useFrameLoop 的单帧步长有上限。 */
async function stepTo(page: Page, fromFrame: number, toSeconds: number, onFrame?: (frame: number) => Promise<void>): Promise<void> {
  const last = Math.round(toSeconds * FPS)
  for (let frame = fromFrame; frame <= last; frame++) {
    await page.evaluate((ms) => window.motifCapture.advance(ms), (frame * 1000) / FPS)
    if (onFrame) await onFrame(frame)
  }
}

/**
 * 整页类条目：把沙箱里最大的可滚动容器滚到进度 progress（0–1，两端缓入缓出）。
 * Playwright 可以直接在不透明源的 iframe 里执行脚本。
 */
async function scrollSandbox(page: Page, progress: number): Promise<void> {
  const frame = page.frames().find((candidate) => candidate.url().includes('/runtime.html'))
  if (!frame) return
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2
  await frame.evaluate((p) => {
    const scrollers = [document.scrollingElement, ...Array.from(document.querySelectorAll<HTMLElement>('*'))].filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(element).overflowY),
    )
    const target = scrollers.sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
    if (target) target.scrollTop = p * (target.scrollHeight - target.clientHeight)
  }, eased)
}

async function encodeLoop(framesDir: string, outDir: string, loopSeconds: number) {
  if (!ffmpegPath) throw new Error('ffmpeg-static has no binary for this platform')
  // 无缝循环：取 [FADE, loop+FADE] 这一段，最后 FADE 秒与开头 [0, FADE] 交叉淡化，结尾正好接回开头。
  const filter = [
    '[0:v]split[s1][s2]',
    `[s1]trim=start=${FADE}:end=${loopSeconds + FADE},setpts=PTS-STARTPTS[body]`,
    `[s2]trim=start=0:end=${FADE},setpts=PTS-STARTPTS[head]`,
    `[body][head]xfade=transition=fade:duration=${FADE}:offset=${loopSeconds - FADE},scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p[v]`,
  ].join(';')
  const input = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.jpg'), '-filter_complex', filter, '-map', '[v]', '-an']
  // 只出 H.264：所有现代浏览器都能播，而且在这类画面上比 VP9 更小（实测全部条目 18.5 MB 对 23 MB）。
  await run(ffmpegPath, [...input, '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart', path.join(outDir, 'loop.mp4')])
}

async function captureItem(item: CatalogItem): Promise<ItemReport> {
  const started = performance.now()
  const { manifest } = item
  const slug = manifest.slug
  const problems = item.findings.filter((finding) => finding.level === 'error').map((finding) => `[${finding.rule}] ${finding.message}`)
  const posterTime = manifest.capture?.posterTime ?? 2.4
  const loopSeconds = manifest.capture?.loop ?? 4
  const zoom = manifest.capture?.zoom ?? 1
  const animated = manifest.a11y.reducedMotion !== 'not-animated'
  // CSS 视口按 zoom 缩小，像素比放大：海报输出 1280×800，视频输出 640×400。
  const cssSize = { width: Math.round(POSTER.width / zoom), height: Math.round(POSTER.height / zoom) }
  const posterPage = await pageFor(zoom)
  const loopPage = await pageFor(zoom / 2)

  const consoleErrors: string[] = []
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  }
  posterPage.on('console', onConsole)
  loopPage.on('console', onConsole)

  // 1. 真实时钟：能挂载、没有错误、帧率。
  const mountMs = await mount(posterPage, item, 'real', cssSize)
  await posterPage.waitForTimeout(1200)
  const { fps, slowFrames } = await posterPage.evaluate(() => window.motifCapture.measure(1500))
  if (fps < 55) problems.push(`fps ${fps} < 55`)
  const realErrors = await posterPage.evaluate(() => window.motifCapture.errors())

  // 2. 减少动态效果：static 条目在 1 秒和 3 秒的画面应当相同。
  let reducedMotionPixels: number | null = null
  if (manifest.a11y.reducedMotion === 'static') {
    await loopPage.emulateMedia({ reducedMotion: 'reduce' })
    await mount(loopPage, item, 'manual', cssSize)
    let a: Buffer | null = null
    let b: Buffer | null = null
    await stepTo(loopPage, 0, 3, async (frame) => {
      if (frame === FPS) a = await loopPage.screenshot()
      if (frame === FPS * 3) b = await loopPage.screenshot()
    })
    reducedMotionPixels = await changedPixels(a!, b!)
    if (reducedMotionPixels > 40) problems.push(`still moves under reduced motion (${reducedMotionPixels} px changed)`)
    await loopPage.emulateMedia({ reducedMotion: null })
  }

  // 3. 海报。
  await mount(posterPage, item, 'manual', cssSize)
  await stepTo(posterPage, 0, posterTime)
  const posterPng = await posterPage.screenshot()
  const posterStdDev = await lumaStdDev(posterPng)
  if (posterStdDev < 3) problems.push(`poster looks blank (luma σ ${posterStdDev.toFixed(1)})`)

  // 4. 循环视频的帧，同时检查画面确实在动。
  let motionPixels: number | null = null
  const framesDir = await mkdtemp(path.join(tmpdir(), `motif-${slug}-`))
  try {
    if (loopSeconds > 0) {
      await mount(loopPage, item, 'manual', cssSize)
      const probes: Buffer[] = []
      // 探测帧取互不成整数倍的时刻，并且任意两帧有差异就算在动：周期正好整除间隔的动画不会被误判为静止。
      const probeFrames = new Set([0.06, 0.37, 0.61, 0.89].map((fraction) => Math.round(FPS * loopSeconds * fraction)))
      const lastFrame = Math.round((loopSeconds + FADE) * FPS)
      await stepTo(loopPage, 0, loopSeconds + FADE, async (frame) => {
        if (manifest.capture?.scroll) await scrollSandbox(loopPage, frame / lastFrame)
        const jpeg = await loopPage.screenshot({ type: 'jpeg', quality: 92 })
        await writeFile(path.join(framesDir, `f${String(frame).padStart(4, '0')}.jpg`), jpeg)
        if (probeFrames.has(frame)) probes.push(jpeg)
      })
      if (probes.length >= 2) {
        let most = 0
        for (let a = 0; a < probes.length; a++) for (let b = a + 1; b < probes.length; b++) most = Math.max(most, await changedPixels(probes[a]!, probes[b]!))
        motionPixels = most
      }
      if (animated && motionPixels !== null && motionPixels < 50) problems.push(`barely moves (${motionPixels} px changed between probes)`)
    }

    const sandboxErrors = [...realErrors, ...(await posterPage.evaluate(() => window.motifCapture.errors())), ...(await loopPage.evaluate(() => window.motifCapture.errors()))]
    for (const error of new Set([...sandboxErrors, ...consoleErrors])) problems.push(`error: ${error}`)

    if (!gatesOnly) {
      const outDir = path.join(MEDIA_DIR, slug)
      await rm(outDir, { recursive: true, force: true })
      await mkdir(outDir, { recursive: true })
      await sharp(posterPng).resize(960, 600).webp({ quality: 82, effort: 6 }).toFile(path.join(outDir, 'poster.webp'))
      // 市场卡片在普通屏幕上只有 300–450 px 宽：小图给它用（srcset），省掉大半流量。
      await sharp(posterPng).resize(480, 300).webp({ quality: 80, effort: 6 }).toFile(path.join(outDir, 'poster-sm.webp'))
      if (loopSeconds > 0) await encodeLoop(framesDir, outDir, loopSeconds)
    }
  } finally {
    await rm(framesDir, { recursive: true, force: true })
    posterPage.off('console', onConsole)
    loopPage.off('console', onConsole)
  }

  return {
    slug,
    pass: problems.length === 0,
    problems,
    fps,
    slowFrames,
    mountMs,
    posterStdDev: Math.round(posterStdDev * 10) / 10,
    motionPixels,
    reducedMotionPixels,
    seconds: Math.round((performance.now() - started) / 100) / 10,
  }
}

// ---- 主流程：只构建所选条目，其他条目（包括别人正在写的半成品）不影响这次运行 ----

const dist = await mkdtemp(path.join(tmpdir(), 'motif-capture-'))
const vendor = await buildVendorInto(dist)
await writeRuntimeHtml(vendor, dist)
await Promise.all([esbuild.build(runtimeOptions(dist)), esbuild.build(captureHostOptions(dist))])
await mkdir(path.join(dist, 'items'), { recursive: true })

const slugs = onlySlugs.length > 0 ? onlySlugs : (await readdir(ITEMS_DIR, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
const sources = await loadSourceRecords()
const reports: ItemReport[] = []
const built: CatalogItem[] = []
for (const slug of slugs) {
  try {
    const item = await buildItem(await loadItemSource(path.join(ITEMS_DIR, slug)), sources, { outDir: path.join(dist, 'items'), urlBase: '/items/' })
    if (item.build) built.push(item)
    else reports.push({ slug, pass: false, problems: item.findings.map((f) => `[${f.rule}] ${f.file ? `${f.file}: ` : ''}${f.message}`), fps: 0, slowFrames: 0, mountMs: 0, posterStdDev: 0, motionPixels: null, reducedMotionPixels: null, seconds: 0 })
  } catch (error) {
    reports.push({ slug, pass: false, problems: [`load: ${error instanceof Error ? error.message : String(error)}`], fps: 0, slowFrames: 0, mountMs: 0, posterStdDev: 0, motionPixels: null, reducedMotionPixels: null, seconds: 0 })
  }
}

const server = await startPreviewServer({ host: '127.0.0.1', port: Number(process.env.MOTIF_CAPTURE_PORT ?? 0), noCache: true, root: dist })
baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
browser = await chromium.launch({ channel: process.env.E2E_CHANNEL ?? 'msedge' })

try {
  for (const item of built) {
    try {
      reports.push(await captureItem(item))
    } catch (error) {
      reports.push({ slug: item.manifest.slug, pass: false, problems: [error instanceof Error ? error.message : String(error)], fps: 0, slowFrames: 0, mountMs: 0, posterStdDev: 0, motionPixels: null, reducedMotionPixels: null, seconds: 0 })
    }
  }
} finally {
  await browser.close()
  server.close()
  await rm(dist, { recursive: true, force: true })
}

await mkdir(REPORT_DIR, { recursive: true })
for (const report of reports) {
  const mark = report.pass ? '✓' : '✖'
  console.log(`${mark} ${report.slug.padEnd(24)} ${String(report.fps).padStart(3)} fps  σ ${String(report.posterStdDev).padStart(5)}  motion ${String(report.motionPixels ?? '-').padStart(6)}  ${report.seconds}s`)
  for (const problem of report.problems) console.log(`    ${problem}`)
  await writeFile(path.join(REPORT_DIR, `${report.slug}.json`), `${JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 2)}\n`)
}
const failed = reports.filter((report) => !report.pass)
console.log(`\n${reports.length - failed.length}/${reports.length} passed`)
if (failed.length > 0) process.exitCode = 1
