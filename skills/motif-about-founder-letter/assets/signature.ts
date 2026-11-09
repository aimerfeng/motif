/**
 * 手写签名：一套极简的连笔字形（只覆盖签名用到的字母），按笔顺排成点列，
 * 再用 Catmull-Rom 平滑成三次贝塞尔。每一笔单独成一条 path，组件按笔画长度依次「写」出来。
 *
 * 字形坐标 y 轴向上：基线 0，x 高 1，升部约 2.1，降部约 -0.6。
 * 换签名就改 SIGNATURES 里的单词和收笔；新字母照现有字形的格式补进 LOWER / UPPER。
 */

type Pt = readonly [number, number]
type Glyph = { w: number; p: readonly Pt[]; dot?: Pt }

const LOWER: Record<string, Glyph> = {
  a: { w: 0.92, p: [[0, 0.12], [0.42, 0.72], [0.62, 0.97], [0.36, 1.0], [0.12, 0.7], [0.1, 0.28], [0.28, 0.03], [0.52, 0.22], [0.64, 0.68], [0.7, 0.98], [0.66, 0.4], [0.7, 0.05], [0.92, 0.14]] },
  r: { w: 0.8, p: [[0, 0.12], [0.18, 0.66], [0.28, 0.98], [0.4, 0.82], [0.56, 0.96], [0.58, 0.6], [0.58, 0.25], [0.64, 0.03], [0.8, 0.14]] },
  i: { w: 0.55, p: [[0, 0.12], [0.2, 0.62], [0.3, 0.98], [0.26, 0.5], [0.27, 0.1], [0.4, 0.02], [0.55, 0.14]], dot: [0.46, 1.5] },
  n: { w: 0.86, p: [[0, 0.12], [0.12, 0.62], [0.17, 0.98], [0.15, 0.5], [0.13, 0.02], [0.2, 0.52], [0.36, 0.93], [0.52, 0.98], [0.6, 0.72], [0.58, 0.3], [0.63, 0.03], [0.86, 0.14]] },
  d: { w: 0.94, p: [[0, 0.12], [0.42, 0.74], [0.6, 0.97], [0.36, 1.0], [0.12, 0.7], [0.1, 0.28], [0.28, 0.03], [0.52, 0.24], [0.66, 0.8], [0.76, 1.6], [0.82, 2.08], [0.76, 1.55], [0.68, 0.8], [0.65, 0.3], [0.72, 0.04], [0.94, 0.14]] },
  e: { w: 0.76, p: [[0, 0.14], [0.34, 0.38], [0.6, 0.68], [0.54, 0.95], [0.34, 0.94], [0.2, 0.64], [0.2, 0.24], [0.38, 0.02], [0.6, 0.04], [0.76, 0.16]] },
  l: { w: 0.78, p: [[0, 0.14], [0.5, 0.85], [0.8, 1.5], [0.86, 1.98], [0.7, 2.2], [0.5, 1.95], [0.36, 1.3], [0.3, 0.5], [0.36, 0.06], [0.58, 0.03], [0.78, 0.17]] },
}

const UPPER: Record<string, Glyph> = {
  M: {
    w: 1.5,
    p: [[-0.12, 0.2], [0.02, 0.05], [0.12, 0.5], [0.3, 1.5], [0.42, 2.0], [0.48, 1.6], [0.44, 0.6], [0.4, 0.04], [0.48, 0.9], [0.66, 1.75], [0.78, 1.9], [0.84, 1.4], [0.8, 0.5], [0.78, 0.04], [0.88, 0.9], [1.06, 1.7], [1.18, 1.8], [1.24, 1.3], [1.18, 0.4], [1.24, 0.04], [1.5, 0.14]],
  },
  L: {
    w: 1.15,
    p: [[0.2, 1.2], [0.64, 1.84], [0.92, 2.14], [0.8, 2.26], [0.56, 2.02], [0.42, 1.3], [0.3, 0.55], [0.12, 0.08], [-0.08, -0.02], [-0.12, 0.14], [0.1, 0.14], [0.5, 0.0], [0.86, 0.02], [1.15, 0.14]],
  },
}

type Spec = {
  words: string[]
  /** 斜度：x += y * slant */
  slant: number
  /** 小写字母的横向、纵向缩放：签得越快越扁越窄 */
  lower: [number, number]
  upper: number
  gap: number
  /** 基线整体上扬的角度（弧度），手写很少是水平的 */
  rise: number
  /** 收笔：拿到整段宽度，返回一笔或几笔（同一坐标系） */
  finish: (width: number, lastExit: Pt) => { join?: Pt[]; strokes: Pt[][] }
}

const SIGNATURES: Record<string, Spec> = {
  // 端正的全名，下面一道轻轻的底线。
  script: {
    words: ['Mara', 'Lindell'],
    slant: 0.3,
    lower: [1, 1],
    upper: 1,
    gap: 0.45,
    rise: -0.035,
    finish: (w) => ({ strokes: [[[0.2, -0.36], [w * 0.3, -0.56], [w * 0.75, -0.6], [w + 0.15, -0.38], [w + 0.45, -0.1]]] }),
  },
  // 签得很快：小写压扁成波浪，最后一笔甩出去再兜回名字底下。
  quick: {
    words: ['Mara', 'Lindell'],
    slant: 0.44,
    lower: [0.62, 0.66],
    upper: 1.18,
    gap: 0.3,
    rise: -0.05,
    finish: (w, [x, y]) => ({
      join: [[x + 0.5, y + 0.18], [w + 0.9, 0.5], [w + 1.15, 0.2], [w + 0.6, -0.42], [w * 0.55, -0.72], [0.6, -0.58], [-0.3, -0.24], [-0.38, 0.04]],
      strokes: [],
    }),
  },
  // 只签首字母：大写 M、L 各带一个句点，底下一道中间打个小圈的长线。
  initials: {
    words: ['M', 'L'],
    slant: 0.3,
    lower: [1, 1],
    upper: 1.3,
    gap: 0.55,
    rise: -0.03,
    finish: (w, [x, y]) => ({
      join: [[x + 0.35, y + 0.12]],
      strokes: [
        [[2.1, 0.04], [2.2, 0.12]],
        [[w + 0.55, 0.04], [w + 0.65, 0.12]],
        [[-0.5, -0.42], [w * 0.28, -0.68], [w * 0.5, -0.66], [w * 0.64, -0.38], [w * 0.56, -0.16], [w * 0.4, -0.3], [w * 0.48, -0.66], [w * 0.8, -0.8], [w + 0.8, -0.66], [w + 1.15, -0.44]],
      ],
    }),
  },
}

export type SignatureStroke = { d: string; length: number }
export type SignatureArt = { viewBox: string; width: number; height: number; strokes: SignatureStroke[] }

/** Catmull-Rom → 三次贝塞尔，同时用折线近似出长度（用来按长度分配书写时间）。 */
function smooth(pts: readonly Pt[]): SignatureStroke {
  if (pts.length === 1) {
    const [x, y] = pts[0]!
    return { d: `M${x.toFixed(2)} ${y.toFixed(2)}l0.01 0`, length: 0.4 }
  }
  let d = `M${pts[0]![0].toFixed(2)} ${pts[0]![1].toFixed(2)}`
  let length = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
    let prev = p1
    for (let s = 1; s <= 8; s++) {
      const t = s / 8
      const u = 1 - t
      const x = u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0]
      const y = u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]
      length += Math.hypot(x - prev[0], y - prev[1])
      prev = [x, y]
    }
  }
  return { d, length }
}

const cache = new Map<string, SignatureArt>()

export function signatureArt(style: string): SignatureArt {
  const hit = cache.get(style)
  if (hit) return hit
  const spec = SIGNATURES[style] ?? SIGNATURES.script!
  const raw: Pt[][] = []
  const dots: Pt[] = []
  let x = 0
  let lastExit: Pt = [0, 0]
  for (const [wi, word] of spec.words.entries()) {
    if (wi > 0) x += spec.gap
    const stroke: Pt[] = []
    for (const ch of word) {
      const upper = UPPER[ch]
      const g = upper ?? LOWER[ch]
      if (!g) continue
      const [sx, sy] = upper ? [spec.upper, spec.upper] : spec.lower
      for (const [px, py] of g.p) stroke.push([x + px * sx, py * sy])
      if (g.dot) dots.push([x + g.dot[0] * sx, g.dot[1] * sy])
      x += g.w * sx
    }
    raw.push(stroke)
    lastExit = stroke[stroke.length - 1] ?? lastExit
  }
  const fin = spec.finish(x, lastExit)
  if (fin.join) raw[raw.length - 1]!.push(...fin.join)
  raw.push(...fin.strokes)
  // i 的点最后补上：先写完整个名字再回头点。
  for (const [dx, dy] of dots) raw.push([[dx - 0.05, dy - 0.03], [dx + 0.07, dy + 0.05]])

  const S = 20
  const cos = Math.cos(spec.rise)
  const sin = Math.sin(spec.rise)
  const map = ([px, py]: Pt): Pt => {
    const sxp = (px + py * spec.slant) * S
    const syp = -py * S
    return [sxp * cos - syp * sin, sxp * sin + syp * cos]
  }
  const placed = raw.map((s) => s.map(map))
  const all = placed.flat()
  const pad = 4
  const minX = Math.min(...all.map((p) => p[0])) - pad
  const maxX = Math.max(...all.map((p) => p[0])) + pad
  const minY = Math.min(...all.map((p) => p[1])) - pad
  const maxY = Math.max(...all.map((p) => p[1])) + pad
  const shifted = placed.map((s) => s.map(([px, py]): Pt => [px - minX, py - minY]))
  const art: SignatureArt = {
    viewBox: `0 0 ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}`,
    width: maxX - minX,
    height: maxY - minY,
    strokes: shifted.map(smooth),
  }
  cache.set(style, art)
  return art
}
