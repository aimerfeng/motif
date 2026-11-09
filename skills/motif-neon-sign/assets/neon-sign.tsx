// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Meng To
// Source: https://github.com/MengTo/threeui/blob/68802d5/src/shaders/neuform-isolated/sources/glassblown-neon.html
// Modified by Motif; see the item's provenance.
import { cn, useCanvasSize, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { useEffect, useRef, type CSSProperties } from 'react'
import { GLYPHS, type Glyph, type GlyphTube } from './glyphs'

/* @motif:defaults */
export const defaults = {
  text: 'GLASS/BLOWN',
  tubeColor: '#ff2a96',
  glow: 1,
  electrodes: true,
  wallColor: '#090909',
  flicker: 1,
  breath: 1,
  lineGap: 0.46,
}
/* @motif:end */

export type NeonSignProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

const P = Math.PI
const MINGAP = 0.17
/** 一行字母比最宽的一行少太多时不再两端对齐（字距会拉得很开），改成居中。 */
const MAXGAP = 0.36
const SPILL_S = 0.34
const BLOOM_S = 0.5
/** 上游 Neuform 展示页的看板：最宽 1040px、16:9。 */
const BOARD_W = 1040
const BOARD_H = 585

interface Item {
  g: Glyph
  ox: number
  oy: number
  s: number
}

interface Electrode {
  x: number
  y: number
  a: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Palette {
  spill: string
  bloom: string
  bloomHot: string
  core: string
  coreMid: string
  coreHot: string
  glass: string
  glassInner: string
  spec: string
  tip: string
  tipRing: string
  tipShine: string
  stem: string
  foot: string
  cap: string
  capRing: string
  arc0: string
  arc1: string
  arc2: string
  glow: number
}

interface Baked {
  base: HTMLCanvasElement
  lit: HTMLCanvasElement
  dirty: Rect
}

type Rgb = [number, number, number]

function parseHex(hex: string): Rgb {
  const value = hex.replace('#', '')
  const n = Number.parseInt(value.slice(0, 6), 16)
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [255, 42, 150]
}

/** 霓虹总是在发光：把颜色的最亮通道拉到 255，暗色或灰色也会变成能亮起来的灯管色。 */
function luminous(hex: string): Rgb {
  const [r, g, b] = parseHex(hex)
  const max = Math.max(r, g, b)
  if (max < 1) return [255, 255, 255]
  const k = 255 / max
  return [r * k, g * k, b * k]
}

/** t > 0 向白色混合，t < 0 向黑色混合。上游的每个颜色都是灯管粉在不同明度上的一档。 */
function shade([r, g, b]: Rgb, t: number, alpha = 1): string {
  const target = t >= 0 ? 255 : 0
  const k = Math.abs(t)
  const mix = (c: number) => Math.round(c + (target - c) * k)
  return `rgba(${mix(r)},${mix(g)},${mix(b)},${alpha})`
}

function makePalette(tubeColor: string, glow: number): Palette {
  const c = luminous(tubeColor)
  return {
    spill: shade(c, -0.08),
    bloom: shade(c, 0),
    bloomHot: shade(c, 0.24),
    core: shade(c, 0),
    coreMid: shade(c, 0.48),
    coreHot: shade(c, 0.93),
    glass: shade(c, -0.76),
    glassInner: shade(c, -0.84),
    spec: shade(c, 0.9, 0.52),
    tip: shade(c, -0.8),
    tipRing: shade(c, 0.5, 0.2),
    tipShine: shade(c, 0.75, 0.14),
    stem: shade(c, -0.93),
    foot: shade(c, -0.96),
    cap: shade(c, -0.91),
    capRing: shade(c, 0.3, 0.3),
    arc0: shade(c, 0.86, 0.95),
    arc1: shade(c, 0.2, 0.62),
    arc2: shade(c, 0, 0),
    glow,
  }
}

/** 文案按「/」分行，未收录的字符直接略过。 */
function parseLines(text: string): Glyph[][] {
  return text
    .toUpperCase()
    .split('/')
    .map((line) => Array.from(line.trim()).flatMap((ch) => (GLYPHS[ch] ? [GLYPHS[ch]] : [])))
    .filter((line) => line.length > 0)
}

function mk(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

function ctx2d(c: HTMLCanvasElement) {
  return c.getContext('2d')!
}

function emit(x: CanvasRenderingContext2D, sp: GlyphTube, ox: number, oy: number, s: number) {
  for (const c of sp.c) {
    if (c[0] === 'M') x.moveTo(ox + c[1] * s, oy + c[2] * s)
    else if (c[0] === 'L') x.lineTo(ox + c[1] * s, oy + c[2] * s)
    else if (c[0] === 'Q') x.quadraticCurveTo(ox + c[1] * s, oy + c[2] * s, ox + c[3] * s, oy + c[4] * s)
    else if (c[0] === 'R') x.arcTo(ox + c[1] * s, oy + c[2] * s, ox + c[3] * s, oy + c[4] * s, c[5] * s)
    else if (c[0] === 'E') x.ellipse(ox + c[1] * s, oy + c[2] * s, c[3] * s, c[4] * s, 0, c[5], c[6], Boolean(c[7]))
  }
}

function trace(x: CanvasRenderingContext2D, items: Item[]) {
  x.beginPath()
  for (const it of items) for (const sp of it.g.sub) emit(x, sp, it.ox, it.oy, it.s)
}

function endsOf(sp: GlyphTube): [number, number][] {
  if (sp.closed || sp.c.length === 0) return []
  const a = sp.c[0]!
  const last = sp.c[sp.c.length - 1]!
  let b: [number, number] | null = null
  if (last[0] === 'L' || last[0] === 'M') b = [last[1], last[2]]
  else if (last[0] === 'Q') b = [last[3], last[4]]
  else if (last[0] === 'E') b = [last[1] + last[3] * Math.cos(last[6]), last[2] + last[4] * Math.sin(last[6])]
  const out: [number, number][] = [[a[1], a[2]]]
  if (b) out.push(b)
  return out
}

function scaleItems(items: Item[], k: number): Item[] {
  return items.map((it) => ({ g: it.g, ox: it.ox * k, oy: it.oy * k, s: it.s * k }))
}

function strokePass(x: CanvasRenderingContext2D, items: Item[], w: number, blur: number, col: string, alpha = 1, additive = true) {
  x.save()
  x.lineCap = 'round'
  x.lineJoin = 'round'
  if (blur > 0.25) x.filter = `blur(${blur.toFixed(2)}px)`
  if (additive) x.globalCompositeOperation = 'lighter'
  x.globalAlpha = Math.min(1, alpha)
  x.lineWidth = w
  x.strokeStyle = col
  trace(x, items)
  x.stroke()
  x.restore()
}

function buildSpill(items: Item[], cap: number, W: number, H: number, pal: Palette) {
  const c = mk(W * SPILL_S, H * SPILL_S)
  const x = ctx2d(c)
  const it = scaleItems(items, SPILL_S)
  const k = cap * SPILL_S
  strokePass(x, it, k * 0.62, k * 0.3, pal.spill, 0.115 * pal.glow)
  strokePass(x, it, k * 0.42, k * 0.11, pal.spill, 0.2 * pal.glow)
  return c
}

function buildBloom(items: Item[], tube: number, W: number, H: number, pal: Palette) {
  const c = mk(W * BLOOM_S, H * BLOOM_S)
  const x = ctx2d(c)
  const it = scaleItems(items, BLOOM_S)
  const t = tube * BLOOM_S
  strokePass(x, it, t * 2.6, t * 1.75, pal.bloom, 0.3 * pal.glow)
  strokePass(x, it, t * 1.34, t * 0.58, pal.bloomHot, 0.48 * pal.glow)
  return c
}

function paintCore(x: CanvasRenderingContext2D, items: Item[], tube: number, pal: Palette) {
  strokePass(x, items, tube * 0.88, tube * 0.1, pal.core, 1)
  strokePass(x, items, tube * 0.54, tube * 0.06, pal.coreMid, 1)
  strokePass(x, items, tube * 0.24, tube * 0.035, pal.coreHot, 1)
}

function buildSpec(items: Item[], tube: number, W: number, H: number, pal: Palette) {
  const c = mk(W, H)
  const x = ctx2d(c)
  x.save()
  x.translate(-tube * 0.02, -tube * 0.25)
  x.lineCap = 'round'
  x.lineJoin = 'round'
  x.lineWidth = tube * 0.17
  x.strokeStyle = pal.spec
  x.filter = `blur(${(tube * 0.11).toFixed(2)}px)`
  trace(x, items)
  x.stroke()
  x.restore()
  x.globalCompositeOperation = 'destination-in'
  x.lineCap = 'round'
  x.lineJoin = 'round'
  x.lineWidth = tube * 0.66
  x.strokeStyle = '#fff'
  trace(x, items)
  x.stroke()
  return c
}

function tips(x: CanvasRenderingContext2D, items: Item[], tube: number, dpr: number, pal: Palette) {
  x.save()
  x.globalCompositeOperation = 'source-over'
  for (const it of items) {
    for (const sp of it.g.sub) {
      for (const [ex, ey] of endsOf(sp)) {
        const px = it.ox + ex * it.s
        const py = it.oy + ey * it.s
        x.beginPath()
        x.arc(px, py, tube * 0.47, 0, P * 2)
        x.fillStyle = pal.tip
        x.fill()
        x.lineWidth = dpr
        x.strokeStyle = pal.tipRing
        x.stroke()
        x.beginPath()
        x.arc(px - tube * 0.06, py - tube * 0.1, tube * 0.2, 0, P * 2)
        x.fillStyle = pal.tipShine
        x.fill()
      }
    }
  }
  x.restore()
}

function electrodes(x: CanvasRenderingContext2D, list: Electrode[], tube: number, dpr: number, pal: Palette) {
  x.save()
  for (const { x: cx, y: cy, a } of list) {
    const sx = cx + Math.cos(a) * tube * 1.55
    const sy = cy + Math.sin(a) * tube * 1.55
    x.beginPath()
    x.moveTo(cx, cy)
    x.lineTo(sx, sy)
    x.lineCap = 'round'
    x.lineWidth = tube * 0.46
    x.strokeStyle = pal.stem
    x.stroke()
    x.beginPath()
    x.arc(sx, sy, tube * 0.4, 0, P * 2)
    x.fillStyle = pal.foot
    x.fill()
    x.beginPath()
    x.arc(cx, cy, tube * 0.8, 0, P * 2)
    x.fillStyle = pal.cap
    x.fill()
    x.lineWidth = 1.4 * dpr
    x.strokeStyle = pal.capRing
    x.stroke()
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, tube * 1.25)
    g.addColorStop(0, pal.arc0)
    g.addColorStop(0.24, pal.arc1)
    g.addColorStop(1, pal.arc2)
    x.globalCompositeOperation = 'lighter'
    x.beginPath()
    x.arc(cx, cy, tube * 1.25, 0, P * 2)
    x.fillStyle = g
    x.fill()
    x.globalCompositeOperation = 'source-over'
  }
  x.restore()
}

/** 电极装在每行灯管的起点和终点：行首第一根非闭合灯管的起点、行尾最后一根的终点，朝字形外侧伸出。 */
function lineElectrodes(row: Item[]): Electrode[] {
  const out: Electrode[] = []
  const place = (it: Item, [px, py]: [number, number]) => {
    const dx = px - it.g.w / 2
    const dy = (py - 0.5) * 1.6
    const a = Math.hypot(dx, dy) < 0.05 ? -P / 2 : Math.atan2(dy, dx)
    out.push({ x: it.ox + px * it.s, y: it.oy + py * it.s, a })
  }
  const first = row.find((it) => it.g.sub.some((sp) => endsOf(sp).length > 0))
  const last = [...row].reverse().find((it) => it.g.sub.some((sp) => endsOf(sp).length > 0))
  if (first) place(first, endsOf(first.g.sub.find((sp) => endsOf(sp).length > 0)!)[0]!)
  if (last) {
    const ends = endsOf([...last.g.sub].reverse().find((sp) => endsOf(sp).length > 0)!)
    const end = ends[ends.length - 1]!
    if (last !== first || ends.length > 1) place(last, end)
  }
  return out
}

function layout(lines: Glyph[][], W: number, H: number, dpr: number, lineGap: number) {
  let blockW = 0
  const measured = lines.map((gl) => {
    const sum = gl.reduce((total, g) => total + g.w, 0)
    const natural = sum + (gl.length - 1) * MINGAP
    blockW = Math.max(blockW, natural)
    return { gl, sum, natural }
  })
  const blockH = lines.length + (lines.length - 1) * lineGap
  const boxW = Math.max(1, Math.min(W - 32 * dpr, BOARD_W * dpr))
  const boxH = Math.max(1, Math.min(H - 32 * dpr, BOARD_H * dpr))
  // Neuform 展示页给文字留的边距（上游原页面是 0.12 / 0.18）。
  const cap = Math.max(6 * dpr, Math.min((boxW * 0.8) / blockW, (boxH * 0.72) / blockH))
  const tube = cap * 0.105
  const x0 = (W - blockW * cap) / 2
  const y0 = (H - blockH * cap) / 2

  const rows: Item[][] = []
  measured.forEach((line, i) => {
    let gap = line.gl.length > 1 ? (blockW - line.sum) / (line.gl.length - 1) : 0
    let pen = x0
    if (line.gl.length < 2 || gap > MAXGAP) {
      gap = MINGAP
      pen = x0 + ((blockW - line.natural) * cap) / 2
    }
    const top = y0 + i * (1 + lineGap) * cap
    const row: Item[] = []
    for (const g of line.gl) {
      row.push({ g, ox: pen, oy: top, s: cap })
      pen += g.w * cap + gap * cap
    }
    rows.push(row)
  })

  // 上游让第二行倒数第二个字母（BLOWN 的 W）接触不良；推广为最后一行倒数第二个有灯管的字形。
  const lastRow = (rows[rows.length - 1] ?? []).filter((it) => it.g.sub.length > 0)
  const flick = lastRow[Math.max(0, lastRow.length - 2)] ?? null
  return { items: rows.flat(), rows, flick, cap, tube }
}

function bake(lines: Glyph[][], W: number, H: number, dpr: number, lineGap: number, withElectrodes: boolean, pal: Palette): Baked {
  const L = layout(lines, W, H, dpr, lineGap)
  const { items, flick, cap, tube } = L
  const steady = items.filter((it) => it !== flick)
  const one = flick ? [flick] : []
  const temp: HTMLCanvasElement[] = []
  const keep = (c: HTMLCanvasElement) => (temp.push(c), c)

  const base = mk(W, H)
  const b = ctx2d(base)
  b.globalCompositeOperation = 'lighter'
  b.drawImage(keep(buildSpill(steady, cap, W, H, pal)), 0, 0, W, H)
  b.drawImage(keep(buildBloom(steady, tube, W, H, pal)), 0, 0, W, H)
  b.globalCompositeOperation = 'source-over'

  const tl = keep(mk(W, H))
  const t = ctx2d(tl)
  strokePass(t, items, tube, 0, pal.glass, 1, false)
  strokePass(t, items, tube * 0.7, 0, pal.glassInner, 1, false)
  paintCore(t, steady, tube, pal)
  t.globalCompositeOperation = 'lighter'
  t.drawImage(keep(buildSpec(items, tube, W, H, pal)), 0, 0)
  t.globalCompositeOperation = 'source-over'
  tips(t, items, tube, dpr, pal)
  if (withElectrodes) electrodes(t, L.rows.flatMap(lineElectrodes), tube, dpr, pal)
  b.drawImage(tl, 0, 0)

  const lit = mk(W, H)
  const w = ctx2d(lit)
  let dirty: Rect = { x: 0, y: 0, w: 0, h: 0 }
  if (flick) {
    w.globalCompositeOperation = 'lighter'
    w.drawImage(keep(buildSpill(one, cap, W, H, pal)), 0, 0, W, H)
    w.drawImage(keep(buildBloom(one, tube, W, H, pal)), 0, 0, W, H)
    w.globalCompositeOperation = 'source-over'
    paintCore(w, one, tube, pal)
    w.globalCompositeOperation = 'destination-out'
    for (const sp of flick.g.sub) {
      for (const [ex, ey] of endsOf(sp)) {
        w.beginPath()
        w.arc(flick.ox + ex * flick.s, flick.oy + ey * flick.s, tube * 0.47, 0, P * 2)
        w.fill()
      }
    }
    w.globalCompositeOperation = 'source-over'
    const pad = cap * 1.35
    const bx = flick.ox - pad
    const by = flick.oy - pad
    dirty = { x: Math.max(0, Math.floor(bx)), y: Math.max(0, Math.floor(by)), w: 0, h: 0 }
    dirty.w = Math.max(0, Math.min(W - dirty.x, Math.ceil(flick.g.w * cap + pad * 2)))
    dirty.h = Math.max(0, Math.min(H - dirty.y, Math.ceil(cap + pad * 2)))
  }
  // 临时画布立刻释放位图，频繁调参时不堆内存。
  for (const c of temp) c.width = c.height = 0
  return { base, lit, dirty }
}

// —— 闪烁：上游的「变压器接触不良」事件序列，节奏取 Neuform 展示页的版本 ——
interface FlickerEvent {
  t0: number
  dur: number
  segs: { d: number; v: number }[]
}

interface FlickerState {
  seed: number
  ev: FlickerEvent | null
  rate: number
}

function frnd(st: FlickerState) {
  st.seed = (st.seed * 1103515245 + 12345) >>> 0
  return st.seed / 4294967296
}

function nextEvent(st: FlickerState, after: number): FlickerEvent {
  const segs: { d: number; v: number }[] = []
  const n = 1 + (frnd(st) < 0.42 ? 1 : 0)
  for (let i = 0; i < n; i++) {
    segs.push({ d: 0.2 + frnd(st) * 0.26, v: 0.22 + frnd(st) * 0.4 })
    segs.push({ d: 0.24 + frnd(st) * 0.34, v: 1 })
  }
  const total = segs.reduce((sum, s) => sum + s.d, 0)
  return { t0: after + (1.25 + frnd(st) * 1.75) / st.rate, dur: total, segs }
}

function level(st: FlickerState, t: number, rate: number) {
  if (rate <= 0) return 1
  if (!st.ev || st.rate !== rate) {
    const first = !st.ev
    st.rate = rate
    st.ev = nextEvent(st, first ? 0.55 : t)
  }
  while (t > st.ev.t0 + st.ev.dur) st.ev = nextEvent(st, st.ev.t0 + st.ev.dur)
  if (t < st.ev.t0) return 1
  let u = t - st.ev.t0
  let prev = 1
  for (const s of st.ev.segs) {
    if (u < s.d) {
      let p = u / s.d
      p = p * p * (3 - 2 * p)
      return prev + (s.v - prev) * p
    }
    u -= s.d
    prev = s.v
  }
  return 1
}

// —— 呼吸：Neuform 展示页的 sf-neon-type-breathe 关键帧，按帧时钟逐帧求值 ——
const BREATH_PERIOD = 5.6
const BREATH_KEYS = [
  { at: 0, y: 3, s: 0.988, o: 0.88 },
  { at: 0.45, y: -3, s: 1, o: 1 },
  { at: 0.68, y: 0, s: 0.996, o: 0.96 },
  { at: 1, y: 3, s: 0.988, o: 0.88 },
]

/** cubic-bezier(0.22, 1, 0.36, 1)：二分求 x 对应的参数 t，再取 y。 */
function easeOut(x: number) {
  const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (bez(mid, 0.22, 0.36) < x) lo = mid
    else hi = mid
  }
  return bez((lo + hi) / 2, 1, 1)
}

function breathAt(time: number) {
  const p = (((time % BREATH_PERIOD) + BREATH_PERIOD) % BREATH_PERIOD) / BREATH_PERIOD
  let i = 0
  while (i < BREATH_KEYS.length - 2 && p >= BREATH_KEYS[i + 1]!.at) i++
  const a = BREATH_KEYS[i]!
  const b = BREATH_KEYS[i + 1]!
  const e = easeOut((p - a.at) / (b.at - a.at))
  return { y: a.y + (b.y - a.y) * e, s: a.s + (b.s - a.s) * e, o: a.o + (b.o - a.o) * e }
}

/** 手工弯制的霓虹灯管字：玻璃管、电极、层叠辉光和墙面溢光，整体缓慢呼吸，其中一个字母像变压器接触不良一样闪烁。 */
export function NeonSign({ className, style, ...props }: NeonSignProps) {
  const options = { ...defaults, ...props }
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bakedRef = useRef<Baked | null>(null)
  const bakeKey = useRef('')
  const composed = useRef(false)
  const lastF = useRef(-1)
  const lastTime = useRef(0)
  const flicker = useRef<FlickerState>({ seed: 0x1981, ev: null, rate: 0 })

  const compose = (f: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const baked = bakedRef.current
    if (!canvas || !ctx || !baked) return
    const { base, lit, dirty } = baked
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    if (dirty.w > 0 && composed.current) {
      // 只有闪烁的那个字母在变：重画它周围的一块就够了。
      ctx.clearRect(dirty.x, dirty.y, dirty.w, dirty.h)
      ctx.drawImage(base, dirty.x, dirty.y, dirty.w, dirty.h, dirty.x, dirty.y, dirty.w, dirty.h)
      if (f > 0.002) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = f
        ctx.drawImage(lit, dirty.x, dirty.y, dirty.w, dirty.h, dirty.x, dirty.y, dirty.w, dirty.h)
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(base, 0, 0)
      if (f > 0.002) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = f
        ctx.drawImage(lit, 0, 0)
      }
      composed.current = true
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    lastF.current = f
  }

  const currentLevel = (time: number) => (reducedRef.current ? 1 : level(flicker.current, time, optionsRef.current.flicker))

  /** 灯管、辉光、电极都烘焙成两张位图（常亮部分 + 闪烁字母），每帧只做合成。 */
  const rebake = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const o = optionsRef.current
    const { width: W, height: H, dpr } = size.current
    const key = [W, H, dpr, o.text, o.tubeColor, o.glow, o.electrodes, o.lineGap].join('|')
    if (key === bakeKey.current && bakedRef.current) return
    bakeKey.current = key
    const lines = parseLines(o.text)
    const previous = bakedRef.current
    if (previous) previous.base.width = previous.base.height = previous.lit.width = previous.lit.height = 0
    bakedRef.current = null
    composed.current = false
    if (!lines.length || W < 2 || H < 2) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    bakedRef.current = bake(lines, W, H, dpr, o.lineGap, o.electrodes, makePalette(o.tubeColor, o.glow))
    compose(currentLevel(lastTime.current))
  }
  const rebakeRef = useRef(rebake)
  rebakeRef.current = rebake

  const size = useCanvasSize(canvasRef, { maxDpr: 1.5, onResize: () => rebakeRef.current() })

  useEffect(() => rebakeRef.current(), [options.text, options.tubeColor, options.glow, options.electrodes, options.lineGap])

  useEffect(
    () => () => {
      const baked = bakedRef.current
      bakedRef.current = null
      if (baked) baked.base.width = baked.base.height = baked.lit.width = baked.lit.height = 0
    },
    [],
  )

  useFrameLoop(
    hostRef,
    ({ time }) => {
      lastTime.current = time
      const canvas = canvasRef.current
      if (!canvas) return
      const f = currentLevel(time)
      if (!composed.current || Math.abs(f - lastF.current) > 0.008) compose(f)
      const k = reducedRef.current ? 0 : optionsRef.current.breath
      if (k > 0) {
        const b = breathAt(time)
        canvas.style.transform = `translate3d(0, ${(b.y * k).toFixed(2)}px, 0) scale(${(1 - (1 - b.s) * k).toFixed(4)})`
        canvas.style.opacity = String(Math.max(0, 1 - (1 - b.o) * k).toFixed(3))
      } else {
        canvas.style.transform = ''
        canvas.style.opacity = ''
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const label = options.text
    .split('/')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)} style={{ background: options.wallColor, ...style }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 block size-full"
        style={{ transformOrigin: '50% 52%', willChange: 'transform, opacity' }}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
