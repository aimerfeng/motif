/**
 * 生成分享链接用的默认配图 apps/web/public/og.jpg（1200×630）：一面倾斜的海报墙，左下角是站名和一句话。
 * 用站点自己的展示字体和条目海报，在浏览器里排版后截图。海报更新后重新运行：pnpm og
 */
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const WEB = path.join(ROOT, 'apps/web')
// 字体是站点的依赖，从站点的目录解析。
const font = createRequire(path.join(WEB, 'package.json')).resolve('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')
const SLUGS = ['fluid-simulation', 'style-synthwave', 'globe', 'liquid-metal', 'gem-smoke', 'god-rays', 'hero-dithering-orb', 'metaballs', 'mobile-app-landing', 'flip-grid', 'mesh-gradient', 'warp']

const tiles = SLUGS.map((slug) => `<img src="${pathToFileURL(path.join(WEB, `public/media/${slug}/poster-sm.webp`)).href}" alt="">`).join('')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Bricolage; src: url(${pathToFileURL(font).href}) format('woff2'); font-weight: 200 800; }
html, body { margin: 0; width: 1200px; height: 630px; background: #0d0e12; overflow: hidden; }
.grid { position: absolute; inset: -40px -60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; transform: rotate(-6deg) scale(1.08); opacity: .55; }
.grid img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 14px; }
.shade { position: absolute; inset: 0; background: radial-gradient(120% 100% at 0% 100%, rgba(13,14,18,.96) 30%, rgba(13,14,18,.55) 70%, rgba(13,14,18,.2)); }
.text { position: absolute; left: 72px; bottom: 72px; color: #f3f3f7; font-family: Bricolage, sans-serif; }
.mark { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; opacity: .85; }
.mark span { color: #c9c6ff; margin-left: 10px; }
h1 { margin: 18px 0 0; font-size: 76px; line-height: .98; font-weight: 700; letter-spacing: -0.045em; }
p { margin: 20px 0 0; font-size: 26px; color: rgba(243,243,247,.72); }
</style></head><body>
<div class="grid">${tiles}</div><div class="shade"></div>
<div class="text"><div class="mark">Motif<span>母题</span></div><h1>Beautiful motion,<br>ready to take home</h1><p>UI components, motion and shaders · tune them live · open source</p></div>
</body></html>`

const page = path.join(tmpdir(), 'motif-og.html')
await writeFile(page, html)
const browser = await chromium.launch({ channel: process.env.MOTIF_CAPTURE_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chrome') })
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await tab.goto(pathToFileURL(page).href, { waitUntil: 'networkidle' })
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: path.join(WEB, 'public/og.jpg'), type: 'jpeg', quality: 86 })
} finally {
  await browser.close()
}
console.log('wrote apps/web/public/og.jpg')
