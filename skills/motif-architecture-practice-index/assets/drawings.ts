/*
 * 平面图和剖面图：全部用米为单位的坐标现画成 SVG 路径，不用任何图片。
 * 笔分四种：cut（剖到的墙，最粗）、wall（隔墙、楼梯、家具轮廓）、fine（家具、铺装、植物）、mark（标记色）。
 * 每条路径只有一个子路径，这样逐笔画出时每一笔都从头画到尾。
 */

export type Pen = 'cut' | 'wall' | 'fine'

export interface Stroke {
  d: string
  pen: Pen
}

export interface Label {
  x: number
  y: number
  text: string
  anchor?: 'start' | 'middle' | 'end'
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface Drawing {
  kind: 'plan' | 'section'
  /** 图形本身的范围（不含页边、轴号）。 */
  box: Box
  strokes: Stroke[]
  /** 头顶上方的结构、天窗：虚线，淡入。 */
  hidden: string[]
  labels: Label[]
  /** 结构轴网：x 方向轴线（字母）和 y 方向轴线（数字）。 */
  axes?: { x: number[]; y: number[] }
  /** 剖切线 A–A：axis 为 'y' 表示一条 y = at 的水平剖切线（向北看），'x' 表示 x = at 的竖直剖切线（向东看）。 */
  cut?: { axis: 'x' | 'y'; at: number }
  entrance?: { x: number; y: number; dir: 'n' | 's' | 'e' | 'w' }
  /** 剖面的标高：x、SVG 坐标 y 与文字；side 为 'left' 时文字写在标高三角的左边。 */
  levels?: { x: number; y: number; text: string; side?: 'left' | 'right' }[]
}

const r2 = (v: number) => Math.round(v * 100) / 100

class Pad {
  strokes: Stroke[] = []
  hidden: string[] = []
  labels: Label[] = []

  path(pen: Pen, d: string) {
    this.strokes.push({ pen, d })
  }

  line(pen: Pen, x1: number, y1: number, x2: number, y2: number) {
    this.path(pen, `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`)
  }

  /** 折线：平铺的 x, y, x, y … */
  poly(pen: Pen, pts: number[], close = false) {
    let d = `M${r2(pts[0]!)} ${r2(pts[1]!)}`
    for (let i = 2; i < pts.length; i += 2) d += `L${r2(pts[i]!)} ${r2(pts[i + 1]!)}`
    this.path(pen, close ? `${d}Z` : d)
  }

  /** 矩形从上边中点起笔：逐笔画时接缝落在边中间，不会在角上留缺口。 */
  rect(pen: Pen, x: number, y: number, w: number, h: number) {
    this.path(pen, `M${r2(x + w / 2)} ${r2(y)}H${r2(x + w)}V${r2(y + h)}H${r2(x)}V${r2(y)}Z`)
  }

  circle(pen: Pen, cx: number, cy: number, r: number) {
    const a = `${r2(r)} ${r2(r)} 0 1 1`
    this.path(pen, `M${r2(cx + r)} ${r2(cy)}A${a} ${r2(cx - r)} ${r2(cy)}A${a} ${r2(cx + r)} ${r2(cy)}`)
  }

  /** 水平墙，在 gaps 的区间处断开（门洞、窗洞）。 */
  wallX(pen: Pen, y: number, x1: number, x2: number, gaps: [number, number][] = []) {
    let x = x1
    for (const [a, b] of [...gaps].sort((p, q) => p[0] - q[0])) {
      if (a > x) this.line(pen, x, y, a, y)
      x = Math.max(x, b)
    }
    if (x < x2) this.line(pen, x, y, x2, y)
  }

  wallY(pen: Pen, x: number, y1: number, y2: number, gaps: [number, number][] = []) {
    let y = y1
    for (const [a, b] of [...gaps].sort((p, q) => p[0] - q[0])) {
      if (a > y) this.line(pen, x, y, x, a)
      y = Math.max(y, b)
    }
    if (y < y2) this.line(pen, x, y, x, y2)
  }

  /** 平开门：门扇沿 u 方向（打开状态），弧线扫回到沿墙的 v 方向。 */
  door(hx: number, hy: number, r: number, u: [number, number], v: [number, number]) {
    const ax = hx + r * u[0]
    const ay = hy + r * u[1]
    const sweep = u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0
    this.line('wall', hx, hy, ax, ay)
    this.path('fine', `M${r2(ax)} ${r2(ay)}A${r2(r)} ${r2(r)} 0 0 ${sweep} ${r2(hx + r * v[0])} ${r2(hy + r * v[1])}`)
  }

  /** 楼梯：外框 + 踏步 + 上行箭头。 */
  stair(x: number, y: number, w: number, h: number, treads: number, along: 'x' | 'y') {
    this.rect('wall', x, y, w, h)
    for (let i = 1; i < treads; i++) {
      if (along === 'y') this.line('fine', x, y + (h * i) / treads, x + w, y + (h * i) / treads)
      else this.line('fine', x + (w * i) / treads, y, x + (w * i) / treads, y + h)
    }
    if (along === 'y') {
      const cx = x + w / 2
      const s = Math.min(w * 0.22, 0.6)
      this.line('fine', cx, y + h * 0.92, cx, y + h * 0.1)
      this.poly('fine', [cx - s, y + h * 0.1 + s, cx, y + h * 0.1, cx + s, y + h * 0.1 + s])
    } else {
      const cy = y + h / 2
      const s = Math.min(h * 0.22, 0.6)
      this.line('fine', x + w * 0.08, cy, x + w * 0.9, cy)
      this.poly('fine', [x + w * 0.9 - s, cy - s, x + w * 0.9, cy, x + w * 0.9 - s, cy + s])
    }
  }

  lift(x: number, y: number, w: number, h: number) {
    this.rect('wall', x, y, w, h)
    this.line('fine', x, y, x + w, y + h)
    this.line('fine', x + w, y, x, y + h)
  }

  tree(cx: number, cy: number, r: number) {
    this.circle('fine', cx, cy, r)
    this.line('fine', cx - r * 0.18, cy, cx + r * 0.18, cy)
    this.line('fine', cx, cy - r * 0.18, cx, cy + r * 0.18)
  }

  /** 45° 斜线填充（停机坪、地面）。 */
  hatch(x: number, y: number, w: number, h: number, s: number) {
    for (let c = x + y + s; c < x + w + y + h; c += s) {
      const x1 = Math.max(x, c - (y + h))
      const x2 = Math.min(x + w, c - y)
      if (x2 - x1 > 0.2) this.line('fine', x1, c - x1, x2, c - x2)
    }
  }

  hide(x1: number, y1: number, x2: number, y2: number) {
    this.hidden.push(`M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`)
  }

  hideRect(x: number, y: number, w: number, h: number) {
    this.hidden.push(`M${r2(x)} ${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}Z`)
  }

  label(x: number, y: number, text: string, anchor: Label['anchor'] = 'middle') {
    this.labels.push({ x, y, text, anchor })
  }
}

type PlanMeta = Pick<Drawing, 'box' | 'axes' | 'cut' | 'entrance'>

function plan(meta: PlanMeta, build: (p: Pad) => void): Drawing {
  const p = new Pad()
  build(p)
  return { kind: 'plan', strokes: p.strokes, hidden: p.hidden, labels: p.labels, ...meta }
}

/** 折线向两侧各偏移 d（栈道、小路），拐角取两段法线的平均。 */
function offset(pts: [number, number][], d: number): number[] {
  const out: number[] = []
  pts.forEach((pt, i) => {
    const a = pts[Math.max(0, i - 1)]!
    const b = pts[Math.min(pts.length - 1, i + 1)]!
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    out.push(pt[0] - (dy / len) * d, pt[1] + (dx / len) * d)
  })
  return out
}

/* ====================================================================
 * 平面图（单位：米，y 向南增大，北在上）
 * ==================================================================== */

const library = plan({ box: { x: 0, y: 0, w: 60, h: 42 }, axes: { x: [0, 11, 22, 42, 60], y: [0, 12, 28, 42] }, cut: { axis: 'y', at: 20 }, entrance: { x: 30, y: 42, dir: 'n' } }, (p) => {
  p.poly('cut', [26, 42, 0, 42, 0, 0, 60, 0, 60, 42, 34, 42])
  // 种着四棵椴树的阅览内院，玻璃墙
  p.rect('wall', 22, 12, 20, 16)
  p.rect('fine', 22.5, 12.5, 19, 15)
  p.tree(27, 16.5, 2.6)
  p.tree(37, 17, 2.4)
  p.tree(28.5, 24, 2.2)
  p.tree(37.5, 24.5, 2.6)
  // 北侧办公与走廊
  p.line('wall', 22, 0, 22, 9)
  p.line('wall', 42, 0, 42, 9)
  p.wallX('wall', 9, 22, 42, [[25, 26], [30, 31], [35, 36], [40, 41]])
  for (const x of [27, 32, 37]) p.line('wall', x, 0, x, 9)
  for (const x of [25, 30, 35, 40]) p.door(x, 9, 1, [0, -1], [1, 0])
  // 阅览室：书架、柱、阅览桌
  for (let i = 0; i < 6; i++) p.rect('fine', 2.5, 3 + i * 3.6, 7, 0.7)
  for (const y of [6, 13, 20]) p.rect('cut', 10.7, y - 0.3, 0.6, 0.6)
  for (const y of [4, 10, 16, 22]) p.rect('fine', 14, y, 5, 2.4)
  // 儿童馆
  p.wallX('wall', 30, 0, 22, [[14, 16]])
  p.door(14, 30, 2, [0, 1], [1, 0])
  p.rect('fine', 1, 31, 10, 0.7)
  p.circle('fine', 7, 36.5, 3.2)
  for (const [x, y] of [[15.5, 34], [18.5, 37.2], [14.8, 39.4]] as const) p.circle('fine', x, y, 0.9)
  // 档案库：密集架 + 档案阅览室
  p.wallX('wall', 18, 42, 60, [[50, 51.5]])
  p.door(50, 18, 1.5, [0, 1], [1, 0])
  for (let i = 0; i < 7; i++) p.rect('fine', 44.6 + i * 2, 2.5, 0.8, 12.5)
  p.rect('fine', 46, 21.5, 11, 3)
  p.wallX('wall', 28, 42, 60, [[42.8, 45.2]])
  // 门厅、楼梯、电梯、服务台；咖啡馆
  p.line('wall', 46, 28, 46, 35)
  p.stair(37, 31, 5, 9, 12, 'y')
  p.lift(31, 32.5, 3, 3)
  p.rect('fine', 24, 33, 5.5, 1.4)
  p.rect('fine', 47.5, 29.5, 7, 1.2)
  for (const x of [49, 52.5, 56]) for (const y of [34, 38]) p.circle('fine', x, y, 0.7)
  p.label(5.8, 24.9, 'Reading room')
  p.label(32, 21, 'Court')
  p.label(51, 16.6, 'Archive')
  p.label(27.5, 39.6, 'Foyer')
  p.label(53, 40.7, 'Café')
  p.label(7, 41, 'Children')
})

const kade = plan({ box: { x: -2, y: -4.2, w: 76, h: 32.6 }, axes: { x: [0, 21.6, 28.8, 43.2, 50.4, 72], y: [2.4, 16.4] }, cut: { axis: 'y', at: 9.6 }, entrance: { x: 25.2, y: 2.4, dir: 's' } }, (p) => {
  const bw = 7.2
  const cores = [3, 6]
  const north: [number, number][] = []
  const south: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const x = i * bw
    north.push(cores.includes(i) ? [x + 2.2, x + 5] : [x + 0.8, x + 1.8])
    south.push([x + 1, x + 6.2])
  }
  p.wallX('cut', 2.4, 0, 72, north)
  p.wallX('cut', 16.4, 0, 72, south)
  p.line('cut', 0, 2.4, 0, 16.4)
  p.line('cut', 72, 2.4, 72, 16.4)
  for (let i = 1; i < 10; i++) p.line('cut', i * bw, 2.4, i * bw, 16.4)
  // 外廊：每户门前放宽到 2.4 米
  const gallery = [0, 2.4, 0, 0.8]
  for (let i = 0; i < 10; i++) {
    const x = i * bw
    if (!cores.includes(i)) gallery.push(x + 0.2, 0.8, x + 0.2, 0, x + 3.2, 0, x + 3.2, 0.8)
  }
  gallery.push(72, 0.8, 72, 2.4)
  p.poly('wall', gallery)
  for (let i = 0; i < 10; i++) {
    const x = i * bw
    p.line('fine', x + 1, 16.25, x + 6.2, 16.25)
    p.line('fine', x + 1, 16.55, x + 6.2, 16.55)
    if (cores.includes(i)) {
      p.stair(x + 0.8, 4.2, 2.8, 8.6, 14, 'y')
      p.lift(x + 4.2, 4.2, 2.2, 2.2)
      continue
    }
    p.door(x + 0.8, 2.4, 1, [0, 1], [1, 0])
    p.poly('wall', [x + 2.2, 2.4, x + 2.2, 5.4, x + 4.6, 5.4])
    p.poly('wall', [x + 4.6, 2.4, x + 4.6, 8.2, x + 6.2, 8.2])
    p.rect('fine', x + 2.6, 2.8, 1.6, 0.8)
    p.rect('fine', x + 0.3, 7.2, 0.6, 3.2)
    p.rect('fine', x + 0.9, 12.4, 2.8, 0.9)
    p.circle('fine', x + 5.2, 12.2, 0.8)
    p.poly('fine', [x + 0.6, 16.4, x + 0.6, 18.2, x + 6.6, 18.2, x + 6.6, 16.4])
  }
  // 码头岸线与南侧花园
  p.line('fine', -2, -3.6, 74, -3.6)
  p.line('fine', -2, -4.2, 74, -4.2)
  p.line('fine', -2, 21, 74, 21)
  p.line('fine', -2, 22.4, 74, 22.4)
  for (const x of [5, 16, 27, 49, 60, 71]) p.tree(x, 25.6, 2.6)
  p.label(9, -1.9, 'Quay')
  p.label(38, 25.6, 'Garden')
})

const escola = plan({ box: { x: 0, y: 0, w: 64, h: 46 }, axes: { x: [2, 18, 24, 40, 46, 62], y: [0, 26, 30, 46] }, cut: { axis: 'y', at: 6 }, entrance: { x: 64, y: 28, dir: 'w' } }, (p) => {
  p.poly('cut', [64, 29.4, 64, 42, 26, 42, 26, 46, 0, 46, 0, 26, 2, 26, 2, 0, 18, 0, 18, 26, 24, 26, 24, 0, 40, 0, 40, 26, 46, 26, 46, 0, 62, 0, 62, 26, 64, 26, 64, 26.6])
  for (const x of [2, 24, 46]) {
    p.wallX('wall', 12, x, x + 16, [[x + 6, x + 7.2]])
    p.wallX('wall', 14, x, x + 16, [[x + 12.5, x + 14]])
    p.wallX('wall', 26, x, x + 16, [[x + 2, x + 3.4]])
    p.door(x + 2, 26, 1.4, [0, -1], [1, 0])
    p.door(x + 6, 12, 1.2, [0, -1], [1, 0])
    for (let k = 1; k < 5; k++) p.line('fine', x + k * 1.2, 12, x + k * 1.2, 13.4)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        p.rect('fine', x + 2.5 + c * 3, 3.6 + r * 3.2, 2, 1)
        p.rect('fine', x + 2.5 + c * 3, 17.4 + r * 3.2, 2, 1)
      }
    }
    for (const side of [x + 0.35, x + 15.65]) {
      p.line('fine', side, 2, side, 10)
      p.line('fine', side, 16, side, 24)
    }
  }
  // 两个种植内院
  p.tree(21, 5.5, 2.2)
  p.tree(21, 19.5, 2.4)
  p.tree(43, 8, 2.4)
  p.tree(43, 20, 2)
  p.rect('fine', 41.2, 12.2, 3.6, 4)
  // 顶光走廊
  for (const x of [4, 12, 20, 28, 44, 52, 59]) p.hideRect(x, 26.8, 2, 2.4)
  p.wallX('wall', 30, 0, 64, [[8, 9.6], [16, 17.6], [30, 31.2], [40, 41.2], [50, 51.2], [58, 59.2]])
  // 体育馆、厨房、教师室、图书角、办公
  p.rect('fine', 2.5, 32, 21, 12)
  p.line('fine', 13, 32, 13, 44)
  p.circle('fine', 13, 38, 2.4)
  for (const x of [36, 46, 54]) p.line('wall', x, 30, x, 42)
  p.rect('fine', 27, 40.2, 8, 0.9)
  p.rect('fine', 27, 31, 0.9, 6)
  p.rect('fine', 38.5, 34.5, 5, 2.4)
  for (let k = 0; k < 4; k++) p.line('fine', 47, 32 + k * 2.4, 53, 32 + k * 2.4)
  p.rect('fine', 56, 33, 2.6, 1.2)
  p.rect('fine', 60, 33, 2.6, 1.2)
  p.label(10, 9.2, 'Classroom')
  p.label(21, 12.6, 'Court')
  p.label(36, 28, 'Corridor')
  p.label(13, 45, 'Sports hall')
  p.label(31.5, 36, 'Kitchen')
})

const bath = plan({ box: { x: -3, y: 0, w: 54, h: 50 }, axes: { x: [0, 9.6, 19.2, 28.8, 38.4, 48], y: [0, 6, 36] }, cut: { axis: 'y', at: 17 }, entrance: { x: 0, y: 2.5, dir: 'e' } }, (p) => {
  p.poly('cut', [0, 4, 0, 36, 48, 36, 48, 0, 0, 0, 0, 1])
  p.line('fine', 1, 35.65, 47, 35.65)
  // 更衣、前台、桑拿
  p.wallX('wall', 6, 0, 48, [[10, 12], [36, 38]])
  p.line('wall', 12, 0, 12, 6)
  p.line('wall', 36, 0, 36, 6)
  for (let x = 14; x <= 33.3; x += 1.2) p.line('fine', x, 0, x, 2.2)
  p.rect('fine', 14, 3.4, 20, 0.8)
  p.poly('fine', [38, 4.6, 38, 1, 46.6, 1])
  p.poly('fine', [39.2, 4.6, 39.2, 2.2, 46.6, 2.2])
  p.path('fine', 'M3 4.2A4 4 0 0 1 9 4.2')
  // 25 米泳池、教学池、热水池
  p.rect('wall', 6, 11.5, 25, 12.5)
  for (let k = 1; k < 5; k++) p.line('fine', 6.8, 11.5 + k * 2.5, 30.2, 11.5 + k * 2.5)
  p.rect('wall', 35, 12, 9, 7)
  for (let k = 1; k <= 3; k++) p.line('fine', 35 + k * 0.7, 12, 35 + k * 0.7, 19)
  p.circle('wall', 39.5, 27.5, 2.4)
  p.circle('fine', 39.5, 27.5, 1.8)
  // 头顶的五道砖拱
  for (const x of [9.6, 19.2, 28.8, 38.4]) p.hide(x, 6, x, 36)
  // 河边平台与台阶
  p.poly('wall', [0, 36, 0, 41, 48, 41, 48, 36])
  for (const y of [41.9, 42.8, 43.7]) p.line('fine', 10, y, 38, y)
  p.path('fine', 'M-3 46.2C8 45.2 16 47.2 26 46.2S42 45.2 51 46.4')
  p.path('fine', 'M-3 48C9 47.2 18 48.8 28 48S44 47.2 51 48.2')
  p.label(14.4, 30, 'Pool hall')
  p.label(42.5, 4.1, 'Sauna')
  p.label(24, 38.6, 'Terrace')
  p.label(44, 49.6, 'River')
})

const hofje = plan({ box: { x: -2, y: 0, w: 48, h: 42 }, axes: { x: [0, 8, 19, 25, 36, 44], y: [0, 8, 28, 36] }, cut: { axis: 'y', at: 18 }, entrance: { x: 22, y: 36, dir: 'n' } }, (p) => {
  p.poly('cut', [25, 36, 44, 36, 44, 0, 0, 0, 0, 36, 19, 36])
  p.poly('cut', [19, 28, 8, 28, 8, 8, 36, 8, 36, 28, 25, 28])
  p.line('cut', 19, 28, 19, 36)
  p.line('cut', 25, 28, 25, 36)
  // 二十二户：北排十户，东西各五户，南排两户，另有一间公共客厅
  for (let k = 1; k < 10; k++) p.line('wall', k * 4.4, 0, k * 4.4, 8)
  for (const y of [13.6, 19.2, 24.8, 30.4]) {
    p.line('wall', 0, y, 8, y)
    p.line('wall', 36, y, 44, y)
  }
  p.line('wall', 8, 28, 8, 36)
  p.line('wall', 36, 28, 36, 36)
  p.line('wall', 13.5, 28, 13.5, 36)
  for (let k = 2; k <= 7; k++) p.rect('fine', k * 4.4 + 1, 8, 2.4, 1.3)
  for (const y of [8, 13.6, 19.2, 24.8]) {
    p.rect('fine', 8, y + 1.6, 1.3, 2.4)
    p.rect('fine', 34.7, y + 1.6, 1.3, 2.4)
  }
  for (const x of [8, 13.5]) p.rect('fine', x + 1.4, 26.7, 2.4, 1.3)
  // 花园：中心树、铺装圈、四块种植床、通往大门的小路
  p.tree(22, 18, 2.6)
  p.circle('fine', 22, 18, 3.8)
  p.line('fine', 21.4, 28, 21.4, 21.8)
  p.line('fine', 22.6, 28, 22.6, 21.8)
  for (const [x, y] of [[10, 10.5], [26, 10.5], [10, 20.5], [26, 20.5]] as const) {
    p.rect('fine', x, y, 8, 5)
    p.line('fine', x + 0.8, y + 1.7, x + 7.2, y + 1.7)
    p.line('fine', x + 0.8, y + 3.3, x + 7.2, y + 3.3)
  }
  p.rect('fine', 27.5, 31.4, 7, 1.4)
  p.line('fine', -2, 39.6, 46, 39.6)
  p.label(14, 18, 'Garden')
  p.label(30.5, 34.4, 'Common room')
  p.label(30.5, 41, 'Street')
})

const quinta = plan({ box: { x: 0, y: 0, w: 64, h: 44 }, cut: { axis: 'x', at: 26 }, entrance: { x: 32, y: 44, dir: 'n' } }, (p) => {
  p.poly('cut', [30, 44, 0, 44, 0, 0, 64, 0, 64, 44, 34, 44])
  // 五道干砌石挡土墙
  ;[6, 14, 22, 30, 38].forEach((y, i) => {
    const b = i % 2 ? 1.2 : -1.2
    p.path('wall', `M0 ${y}C18 ${r2(y + b)} 40 ${r2(y - b)} 64 ${r2(y + b * 0.4)}`)
    p.path('fine', `M0 ${r2(y + 0.7)}C18 ${r2(y + 0.7 + b)} 40 ${r2(y + 0.7 - b)} 64 ${r2(y + 0.7 + b * 0.4)}`)
    p.line('fine', 31.4, y + 0.35, 32.6, y + 0.35)
    p.stair(34.2, y - 1.2, 2, 2.4, 4, 'y')
  })
  // 泉水池、水渠、下池
  p.circle('wall', 32, 3, 2.6)
  p.circle('fine', 32, 3, 2)
  p.line('fine', 31.4, 5.6, 31.4, 40)
  p.line('fine', 32.6, 5.6, 32.6, 40)
  p.rect('wall', 28.5, 40, 7, 2.6)
  // 栗木花架与工具房
  for (let x = 40; x <= 56; x += 4) {
    p.rect('cut', x - 0.2, 15.2, 0.4, 0.4)
    p.rect('cut', x - 0.2, 20.4, 0.4, 0.4)
  }
  p.line('fine', 39.6, 15.6, 56.4, 15.6)
  p.line('fine', 39.6, 20.4, 56.4, 20.4)
  for (let x = 41; x < 56; x += 1) p.line('fine', x, 15.6, x, 20.4)
  p.rect('cut', 46, 24.2, 8, 4.4)
  // 软木栎、柑橘园、桃金娘
  p.tree(8, 10, 4.2)
  p.tree(55, 6.5, 4.6)
  p.tree(12, 25.5, 3.8)
  p.tree(54, 34, 3.4)
  for (let x = 4; x <= 24; x += 5) {
    p.tree(x, 33.8, 1.3)
    p.tree(x + 2.5, 41, 1.3)
  }
  for (const [x, y] of [[40, 33.6], [42.2, 35], [44.4, 33.4], [41.6, 31.8], [46.4, 35.2]] as const) p.circle('fine', x, y, 0.8)
  p.label(35.6, 3, 'Spring', 'start')
  p.label(30.6, 18, 'Rill', 'end')
  p.label(48, 12.7, 'Pergola')
  p.label(14, 36.2, 'Orchard')
})

const tidal = plan({ box: { x: -2, y: 0, w: 64, h: 44 }, cut: { axis: 'x', at: 30 } }, (p) => {
  // 外堤：堤顶两条边线、内外坡脚
  p.path('wall', 'M-2 7.6C14 6.4 30 8.8 46 7.2S58 6.6 62 7.4')
  p.path('wall', 'M-2 9.4C14 8.2 30 10.6 46 9S58 8.4 62 9.2')
  p.path('fine', 'M-2 3.2C16 2.4 32 4 48 2.8S58 2.6 62 3')
  p.path('fine', 'M-2 15C12 13.6 26 16.4 42 14.6S56 13.8 62 14.8')
  // 盐沼里的潮水坑与潮沟
  p.path('fine', 'M8 24C8 20 14 19 18 21S24 27 20 29 8 28 8 24Z')
  p.path('fine', 'M27 20C30 17 38 18 39 22S34 28 30 27 24 23 27 20Z')
  p.path('fine', 'M42 25C45 22 54 23 55 27S51 34 46 33 39 28 42 25Z')
  p.path('fine', 'M14 33C16 31 22 31 23 34S19 38 16 37 12 35 14 33Z')
  p.path('fine', 'M-2 38C6 36 10 31 16 30S26 34 32 32 42 37 50 36 60 39 62 38')
  p.path('wall', 'M-2 40.5C12 39.4 26 41.6 40 40.2S56 39.8 62 40.6')
  // 栈道与木板
  const walk: [number, number][] = [
    [14, 9.4],
    [15, 16],
    [26, 17.4],
    [33, 25],
    [43.6, 30.6],
  ]
  p.poly('wall', offset(walk, 0.9))
  p.poly('wall', offset(walk, -0.9))
  for (let i = 0; i < walk.length - 1; i++) {
    const [ax, ay] = walk[i]!
    const [bx, by] = walk[i + 1]!
    const len = Math.hypot(bx - ax, by - ay)
    const nx = -(by - ay) / len
    const ny = (bx - ax) / len
    for (let s = 2; s < len - 1; s += 2.4) {
      const cx = ax + ((bx - ax) * s) / len
      const cy = ay + ((by - ay) * s) / len
      p.line('fine', cx - nx * 0.9, cy - ny * 0.9, cx + nx * 0.9, cy + ny * 0.9)
    }
  }
  // 堤上的避风亭（桩基）和观鸟屋
  p.rect('cut', 8, 4.2, 8, 4.4)
  for (const x of [9.2, 12, 14.8]) for (const y of [5.2, 7.6]) p.circle('fine', x, y, 0.25)
  p.hideRect(7, 3.4, 10, 6)
  p.rect('cut', 43.6, 29.4, 5.4, 3.4)
  p.label(54, 5.2, 'Dike')
  p.label(52, 19.4, 'Salt marsh')
  p.label(46.3, 34.5, 'Hide')
  p.label(30, 43, 'Estuary')
})

const printworks = plan({ box: { x: 0, y: 0, w: 40, h: 26 }, axes: { x: [0, 8, 16, 24, 32, 40], y: [0, 6.5, 13, 19.5, 26] }, cut: { axis: 'x', at: 20 }, entrance: { x: 19.5, y: 26, dir: 'n' } }, (p) => {
  p.poly('cut', [21, 26, 40, 26, 40, 0, 0, 0, 0, 26, 18, 26])
  for (const x of [8, 16, 24, 32]) for (const y of [6.5, 13, 19.5]) p.rect('cut', x - 0.3, y - 0.3, 0.6, 0.6)
  for (const y of [3.25, 9.75, 16.25, 22.75]) p.hide(0, y, 40, y)
  // 独立的木盒子会议室
  const box = (x: number, y: number, w: number, h: number) => {
    p.poly('wall', [x + 2, y + h, x + w, y + h, x + w, y, x, y, x, y + h, x + 0.8, y + h])
    p.door(x + 0.8, y + h, 1.2, [0, -1], [1, 0])
    p.rect('fine', x + 1.4, y + 1.1, w - 2.8, Math.max(1, h - 3.2))
  }
  box(1.5, 1.5, 5.6, 4.4)
  box(25, 14.6, 5.8, 4.2)
  box(9.5, 17.5, 5, 6)
  // 工位组、长桌、书架、楼梯、茶水
  const desks = (x: number, y: number) => {
    p.rect('fine', x, y, 4.8, 1.6)
    p.line('fine', x + 1.6, y, x + 1.6, y + 1.6)
    p.line('fine', x + 3.2, y, x + 3.2, y + 1.6)
    p.line('fine', x, y + 0.8, x + 4.8, y + 0.8)
  }
  desks(9.6, 2.6)
  desks(17.6, 2.6)
  desks(25.6, 2.6)
  desks(17.6, 7.6)
  desks(33.2, 11.5)
  p.rect('fine', 9.6, 10.9, 12.8, 1.2)
  p.rect('fine', 0.5, 8, 0.7, 14)
  p.stair(34, 1.5, 4.4, 7.5, 12, 'y')
  p.rect('fine', 34.5, 22.6, 5, 0.9)
  p.rect('fine', 34.6, 18.6, 3.6, 1.2)
  for (const [x, y] of [[2, 24.4], [16.6, 24.6], [38.6, 15.6]] as const) p.circle('fine', x, y, 0.7)
  p.label(4.3, 7.2, 'Meeting')
  p.label(12, 14.7, 'Long table')
  p.label(36.8, 24.9, 'Kitchen')
})

const music = plan({ box: { x: 0, y: 0, w: 52, h: 36 }, axes: { x: [0, 9.6, 14, 38, 42.4, 52], y: [0, 24, 36] }, cut: { axis: 'y', at: 14 }, entrance: { x: 6.5, y: 36, dir: 'n' } }, (p) => {
  p.poly('cut', [9, 36, 52, 36, 52, 0, 0, 0, 0, 36, 4, 36])
  // 240 座音乐厅：舞台 + 弧形座位
  p.poly('cut', [20, 24, 14, 24, 14, 3, 38, 3, 38, 24, 32, 24])
  p.line('cut', 22.4, 24, 29.6, 24)
  p.rect('fine', 19, 4, 14, 3.4)
  p.path('fine', 'M19 7.4Q26 9.4 33 7.4')
  for (let r = 8; r <= 18.6; r += 1.5) {
    const a = Math.min(r * 0.78, 10.6)
    const y = 3.6 + Math.sqrt(r * r - a * a)
    p.path('fine', `M${r2(26 - a)} ${r2(y)}A${r2(r)} ${r2(r)} 0 0 0 ${r2(26 + a)} ${r2(y)}`)
  }
  // 两侧的琴房：盒中盒
  for (const [x0, cx] of [[0, 9.6], [42.4, 42.4]] as const) {
    const gaps: [number, number][] = []
    for (let k = 0; k < 6; k++) {
      const y0 = k * 4
      if (k > 0) p.line('wall', x0, y0, x0 + 9.6, y0)
      p.rect('fine', x0 + 0.5, y0 + 0.5, 8.6, 3)
      p.rect('fine', x0 === 0 ? 1.1 : x0 + 7.4, y0 + 1, 1.4, 0.6)
      gaps.push([y0 + 2.6, y0 + 3.5])
    }
    p.wallY('wall', cx, 0, 24, gaps)
  }
  p.line('wall', 0, 24, 14, 24)
  p.line('wall', 38, 24, 52, 24)
  // 沿街门厅
  p.stair(44, 26.4, 4.6, 6.4, 10, 'y')
  p.path('fine', 'M30 33.6H38V30.4')
  p.rect('fine', 14, 33.4, 10, 0.8)
  p.label(26, 5.7, 'Stage')
  p.label(24, 29.6, 'Foyer')
  p.label(34, 31.8, 'Café')
})

const lindenhof = plan({ box: { x: 0, y: 0, w: 43.2, h: 29.6 }, axes: { x: [0, 10.8, 21.6, 32.4, 43.2], y: [8, 18] }, cut: { axis: 'x', at: 13.5 } }, (p) => {
  const hw = 5.4
  const houses = Array.from({ length: 8 }, (_, i) => i * hw)
  p.wallX('cut', 8, 0, 43.2, houses.map((x): [number, number] => [x + 0.6, x + 1.6]))
  p.wallX('cut', 18, 0, 43.2, houses.map((x): [number, number] => [x + 0.8, x + 4.6]))
  p.line('cut', 0, 8, 0, 18)
  p.line('cut', 43.2, 8, 43.2, 18)
  for (let k = 1; k < 8; k++) {
    p.line('cut', k * hw, 8, k * hw, 18)
    p.line('fine', k * hw, 18, k * hw, 28)
  }
  // 共用的后院墙，带长凳壁龛
  const rear = [0, 28]
  for (const x of houses) rear.push(x + 1.4, 28, x + 1.4, 28.8, x + 4, 28.8, x + 4, 28)
  rear.push(43.2, 28)
  p.poly('wall', rear)
  p.line('fine', 0, 18, 0, 28)
  p.line('fine', 43.2, 18, 43.2, 28)
  p.line('fine', 0, 4, 43.2, 4)
  houses.forEach((x, i) => {
    p.line('fine', x + 0.8, 17.65, x + 4.6, 17.65)
    p.line('fine', x + 0.6, 4, x + 0.6, 8)
    p.line('fine', x + 1.6, 4, x + 1.6, 8)
    p.door(x + 0.6, 8, 1, [0, 1], [1, 0])
    // 两户把楼梯挪到了后面，一户在后院加了工作间
    const moved = i === 1 || i === 4
    p.stair(moved ? x + 0.3 : x + 3.5, moved ? 12.6 : 9.2, 1.6, 4.6, 9, 'y')
    p.rect('fine', moved ? x + 2.5 : x + 0.3, 15.8, 2.6, 0.6)
    if (i === 6) p.rect('wall', x + 0.6, 23.4, 4.2, 3.6)
    else p.tree(x + 2.7, 24.6, 2.1)
  })
  p.label(16.2, 2, 'Street')
  p.label(13.5, 20.2, 'Gardens')
})

const fire = plan({ box: { x: 0, y: 0, w: 46, h: 34.4 }, axes: { x: [0, 6.5, 13, 19.5, 26, 40], y: [0, 22] }, cut: { axis: 'y', at: 5 }, entrance: { x: 30.8, y: 22, dir: 'n' } }, (p) => {
  const bays = [0, 1, 2, 3].map((i): [number, number] => [i * 6.5 + 0.75, i * 6.5 + 5.75])
  p.poly('cut', [0, 22, 0, 0, 40, 0, 40, 22])
  p.wallX('cut', 22, 0, 40, [...bays, [30, 31.6]])
  for (const [a, b] of bays) p.line('fine', a, 21.6, b, 21.6)
  p.wallY('cut', 26, 0, 22, [[10, 11.2]])
  p.door(26, 10, 1.2, [1, 0], [0, 1])
  for (let i = 0; i < 4; i++) {
    const x = i * 6.5 + 1.2
    p.rect('fine', x, 4, 4.1, 12.5)
    p.line('fine', x, 7, x + 4.1, 7)
  }
  // 班组用房：更衣、值班、健身；滑杆
  p.wallX('wall', 8, 26, 40, [[29, 30.2]])
  p.line('wall', 33, 0, 33, 8)
  p.wallX('wall', 15, 26, 40, [[36, 37.2]])
  p.rect('fine', 26.4, 1, 0.6, 6.4)
  for (let k = 1; k < 6; k++) p.line('fine', 26.4, 1 + k * 1.07, 27, 1 + k * 1.07)
  p.circle('cut', 28, 17.4, 0.2)
  p.circle('fine', 28, 17.4, 0.8)
  p.rect('fine', 35, 17, 4, 3.4)
  // 训练塔
  p.rect('cut', 40, 2, 6, 6)
  p.stair(41, 3, 4, 4, 6, 'x')
  // 出车坪
  p.hatch(0.4, 22.6, 25.2, 9, 1.6)
  p.label(13, 18.6, 'Vehicle bays')
  p.label(33, 11.6, 'Crew')
  p.label(43, 9.6, 'Tower')
  p.label(9.75, 33.4, 'Apron')
})

const atelier = plan({ box: { x: 0, y: 0, w: 22, h: 16 }, axes: { x: [0, 8, 15, 22], y: [0, 16] }, cut: { axis: 'y', at: 7.4 }, entrance: { x: 9.8, y: 16, dir: 'n' } }, (p) => {
  // 50 厘米夯土墙：内外两条线
  p.poly('cut', [10.6, 16, 22, 16, 22, 0, 0, 0, 0, 16, 9, 16])
  p.poly('wall', [10.6, 15.5, 21.5, 15.5, 21.5, 0.5, 0.5, 0.5, 0.5, 15.5, 9, 15.5])
  p.line('wall', 9, 15.5, 9, 16)
  p.line('wall', 10.6, 15.5, 10.6, 16)
  p.wallY('wall', 8, 0.5, 15.5, [[3, 4], [11.6, 12.6]])
  p.wallY('wall', 15, 0.5, 15.5, [[2, 3], [12, 13]])
  p.wallX('wall', 8, 15, 21.5, [[16, 17]])
  // 无花果树下的内院
  p.rect('wall', 8, 5, 7, 6)
  p.rect('fine', 8.3, 5.3, 6.4, 5.4)
  p.tree(11.5, 8, 2.4)
  // 窑、工作台、拉坯机、卧室、厨房
  p.circle('cut', 18.5, 4, 1.1)
  p.circle('fine', 18.5, 4, 1.7)
  p.rect('fine', 1.2, 1.6, 1, 4.6)
  p.rect('fine', 1.2, 9.4, 1, 4.6)
  p.circle('fine', 5, 3.6, 0.6)
  p.circle('fine', 5, 10, 0.6)
  p.rect('fine', 3.6, 12.6, 3, 1.8)
  p.rect('fine', 9.4, 1.2, 3.2, 2.4)
  p.rect('fine', 20.5, 9, 0.7, 5.5)
  p.circle('fine', 17.6, 11.6, 1)
  p.label(4.6, 6.8, 'Studio')
  p.label(18.5, 6.7, 'Kiln')
  p.label(17.8, 14.4, 'Kitchen')
})

export const PLANS = { '064': library, '061': kade, '058': escola, '055': bath, '052': hofje, '049': quinta, '046': tidal, '043': printworks, '040': music, '037': lindenhof, '034': fire, '031': atelier } as const satisfies Record<string, Drawing>

/* ====================================================================
 * 剖面图（单位：米；数据里的标高 e 向上为正，SVG 里 y = -e）
 * ==================================================================== */

interface Block {
  x: number
  w: number
  /** 自下而上的层高。 */
  levels: number[]
  roof: 'flat' | 'pitched' | 'mono' | 'saw' | 'vault' | 'shell'
  n?: number
  rise?: number
  base?: number
  /** 户间墙的间距（纵剖时切到的分户墙）。 */
  bays?: number
  piles?: boolean
  /** 左右外墙是否开窗（和别的体块共用的墙不开）。 */
  glazed?: [boolean, boolean]
}

interface SectionSpec {
  w: number
  blocks: Block[]
  /** 自定义地形：平铺的 x, e。 */
  ground?: number[]
  /** 嵌进地面的水池：x、宽、深。 */
  dips?: [number, number, number][]
  basements?: [number, number, number][]
  /** 树：x、高度、基底标高（缺省取地面）。 */
  trees?: [number, number, number?][]
  people?: [number, number?][]
  water?: [number, number, number, string][]
  /** 标高标记：x、标高、文字写在哪一侧；缺省用层数最多的体块。 */
  marks?: [number, number, ('left' | 'right')?][]
  extra?: (p: Pad, Y: (e: number) => number) => void
}

const Y = (e: number) => -e

function section(spec: SectionSpec): Drawing {
  const p = new Pad()
  const x0 = -5
  const x1 = spec.w + 5
  const profile: number[] = []
  if (spec.ground) profile.push(...spec.ground)
  else {
    profile.push(x0, 0)
    for (const [dx, dw, dd] of [...(spec.dips ?? [])].sort((a, b) => a[0] - b[0])) profile.push(dx, 0, dx, -dd, dx + dw, -dd, dx + dw, 0)
    profile.push(x1, 0)
  }
  const groundAt = (x: number) => {
    for (let i = 0; i < profile.length - 2; i += 2) {
      const ax = profile[i]!
      const bx = profile[i + 2]!
      if (x >= ax && x <= bx && bx > ax) return profile[i + 1]! + ((profile[i + 3]! - profile[i + 1]!) * (x - ax)) / (bx - ax)
    }
    return 0
  }
  const svgProfile: number[] = []
  for (let i = 0; i < profile.length; i += 2) svgProfile.push(profile[i]!, Y(profile[i + 1]!))
  p.poly('cut', svgProfile)
  // 地面以下的斜线
  const skip = [...(spec.dips ?? []), ...(spec.basements ?? [])]
  for (let x = x0 + 1.2; x < x1; x += 1.5) {
    if (skip.some(([dx, dw]) => x > dx - 0.2 && x < dx + dw + 1.4)) continue
    const e = groundAt(x)
    p.line('fine', x, Y(e) + 0.2, x - 1, Y(e) + 1.2)
  }
  for (const [dx, dw] of spec.dips ?? []) p.line('fine', dx + 0.3, Y(-0.3), dx + dw - 0.3, Y(-0.3))
  for (const [bx, bw, bd] of spec.basements ?? []) p.rect('cut', bx, 0, bw, bd)

  let main: Block | undefined
  let maxTop = 0
  for (const b of spec.blocks) {
    if (!main || b.levels.length > main.levels.length) main = b
    const base = b.base ?? 0
    const tops: number[] = []
    let e = base
    for (const h of b.levels) {
      e += h
      tops.push(e)
    }
    const top = e
    if (base > 0) p.line('cut', b.x, Y(base), b.x + b.w, Y(base))
    for (const t of tops.slice(0, -1)) p.line('cut', b.x, Y(t), b.x + b.w, Y(t))
    const glazed = b.glazed ?? [true, true]
    ;[b.x, b.x + b.w].forEach((side, s) => {
      const gaps: [number, number][] = []
      if (glazed[s]) {
        let lv = base
        for (const h of b.levels) {
          if (h > 2.2) gaps.push([lv + Math.min(0.9, h * 0.25), lv + h - 0.5])
          lv += h
        }
      }
      let from = base
      for (const [a, c] of gaps) {
        p.line('cut', side, Y(from), side, Y(a))
        // 窗：玻璃一条细线，窗台和过梁各一小段粗线
        p.line('fine', side, Y(a), side, Y(c))
        p.line('cut', side - 0.3, Y(a), side + 0.3, Y(a))
        p.line('cut', side - 0.3, Y(c), side + 0.3, Y(c))
        from = c
      }
      p.line('cut', side, Y(from), side, Y(top))
    })
    if (b.bays) for (let x = b.x + b.bays; x < b.x + b.w - 0.1; x += b.bays) p.line('wall', x, Y(base), x, Y(top))
    if (b.piles) for (const x of [b.x + 0.4, b.x + b.w / 2, b.x + b.w - 0.4]) p.line('wall', x, Y(base), x, Y(groundAt(x) - 1.2))
    let rise = 0
    switch (b.roof) {
      case 'flat':
        p.poly('cut', [b.x, Y(top + 0.7), b.x, Y(top), b.x + b.w, Y(top), b.x + b.w, Y(top + 0.7)])
        rise = 0.7
        break
      case 'pitched':
        rise = b.rise ?? Math.min(b.w * 0.42, 5.5)
        p.poly('cut', [b.x - 0.5, Y(top - 0.35), b.x + b.w / 2, Y(top + rise), b.x + b.w + 0.5, Y(top - 0.35)])
        p.line('cut', b.x, Y(top), b.x + b.w, Y(top))
        break
      case 'mono':
        rise = b.rise ?? 1.8
        p.poly('cut', [b.x - 0.4, Y(top - 0.1), b.x + b.w + 0.4, Y(top + rise + 0.1)])
        p.line('cut', b.x + b.w, Y(top), b.x + b.w, Y(top + rise))
        break
      case 'saw': {
        const n = b.n ?? 3
        const tw = b.w / n
        rise = b.rise ?? tw * 0.4
        const pts = [b.x, Y(top)]
        for (let i = 1; i <= n; i++) pts.push(b.x + i * tw, Y(top + rise), b.x + i * tw, Y(top))
        p.poly('cut', pts)
        for (let i = 1; i <= n; i++) p.line('fine', b.x + i * tw - 0.35, Y(top + 0.2), b.x + i * tw - 0.35, Y(top + rise - 0.3))
        break
      }
      case 'vault': {
        const n = b.n ?? 3
        const s = b.w / n
        const r = s * 0.62
        rise = r - Math.sqrt(r * r - (s * s) / 4)
        for (let i = 0; i < n; i++) p.path('cut', `M${r2(b.x + i * s)} ${r2(Y(top))}A${r2(r)} ${r2(r)} 0 0 1 ${r2(b.x + (i + 1) * s)} ${r2(Y(top))}`)
        p.line('fine', b.x, Y(top), b.x + b.w, Y(top))
        break
      }
      case 'shell': {
        rise = b.rise ?? b.w * 0.14
        const r = (b.w * b.w) / 4 / (2 * rise) + rise / 2
        p.path('cut', `M${r2(b.x)} ${r2(Y(top))}A${r2(r)} ${r2(r)} 0 0 1 ${r2(b.x + b.w)} ${r2(Y(top))}`)
        p.path('fine', `M${r2(b.x + 0.8)} ${r2(Y(top - 0.4))}A${r2(r)} ${r2(r)} 0 0 1 ${r2(b.x + b.w - 0.8)} ${r2(Y(top - 0.4))}`)
        break
      }
    }
    maxTop = Math.max(maxTop, top + rise)
  }

  for (const [x, h, base] of spec.trees ?? []) {
    const e = base ?? groundAt(x)
    p.line('fine', x, Y(e), x, Y(e + h * 0.45))
    p.circle('fine', x, Y(e + h * 0.68), h * 0.3)
    p.circle('fine', x + h * 0.15, Y(e + h * 0.5), h * 0.19)
    maxTop = Math.max(maxTop, e + h * 0.98)
  }
  for (const [x, base] of spec.people ?? []) {
    const e = base ?? groundAt(x)
    p.circle('fine', x, Y(e + 1.62), 0.13)
    p.line('fine', x, Y(e + 1.46), x, Y(e + 0.86))
    p.poly('fine', [x - 0.2, Y(e), x, Y(e + 0.86), x + 0.18, Y(e)])
    p.poly('fine', [x - 0.24, Y(e + 0.96), x, Y(e + 1.36), x + 0.22, Y(e + 1.0)])
  }
  for (const [a, b, e, text] of spec.water ?? []) {
    p.line('fine', a, Y(e), b, Y(e))
    p.line('fine', a + 0.8, Y(e) + 0.32, b - 0.8, Y(e) + 0.32)
    p.label(b, Y(e) - 0.7, text, 'end')
  }
  spec.extra?.(p, Y)

  let levels: Drawing['levels']
  if (spec.marks) levels = spec.marks.map(([x, e, side]) => ({ x, y: Y(e), text: `+${e.toFixed(2)}`, side }))
  else if (main) {
    const base = main.base ?? 0
    const es = [base]
    for (const h of main.levels) es.push(es[es.length - 1]! + h)
    levels = es.map((e) => ({ x: spec.w + 1.6, y: Y(e), text: `+${e.toFixed(2)}` }))
  }
  const depth = Math.max(1.6, ...skip.map(([, , d]) => d + 0.6))
  const top = Math.max(maxTop, ...profile.filter((_, i) => i % 2 === 1)) + 1.4
  return {
    kind: 'section',
    box: { x: x0, y: Y(top), w: x1 - x0 + 4.5, h: top + depth },
    strokes: p.strokes,
    hidden: p.hidden,
    labels: p.labels,
    levels,
  }
}

export const SECTIONS = {
  '064': section({
    w: 60,
    blocks: [
      { x: 0, w: 22, levels: [6.2], roof: 'saw', n: 3, rise: 2.4 },
      { x: 42, w: 18, levels: [3.8, 3.6], roof: 'flat' },
    ],
    basements: [[42, 18, 3.4]],
    trees: [[27.5, 9.5], [36.5, 8.4]],
    people: [[6], [14.5], [31], [50.5]],
    extra: (p, y) => {
      for (let x = 2.5; x < 10; x += 3.6) p.rect('fine', x, y(2.2), 0.7, 2.2)
      for (let x = 44; x < 58; x += 2) p.rect('fine', x, 0.7, 0.8, 2.3)
    },
  }),
  '061': section({
    w: 72,
    blocks: [{ x: 0, w: 72, levels: [3.6, 2.9, 2.9, 2.9, 2.9, 2.9, 2.9], roof: 'flat', bays: 7.2 }],
    trees: [[10, 4.6, 21], [31, 4, 21], [55, 5, 21]],
    people: [[4], [40], [66], [20, 21]],
  }),
  '058': section({
    w: 64,
    blocks: [
      { x: 2, w: 16, levels: [4], roof: 'pitched', rise: 4.2 },
      { x: 24, w: 16, levels: [4], roof: 'pitched', rise: 4.2 },
      { x: 46, w: 16, levels: [4], roof: 'pitched', rise: 4.2 },
    ],
    trees: [[21, 7], [43, 7.6]],
    people: [[8], [12.5], [30], [34], [55]],
  }),
  '055': section({
    w: 48,
    blocks: [{ x: 0, w: 48, levels: [6.4], roof: 'vault', n: 5 }],
    dips: [[6, 25, 2], [35, 9, 1.2]],
    people: [[3], [33.2], [46]],
    extra: (p, y) => {
      for (const x of [9.6, 19.2, 28.8, 38.4]) p.rect('cut', x - 0.3, y(6.4), 0.6, 6.4)
    },
  }),
  '052': section({
    w: 44,
    blocks: [
      { x: 0, w: 8, levels: [3, 2.6], roof: 'pitched', rise: 4 },
      { x: 36, w: 8, levels: [3, 2.6], roof: 'pitched', rise: 4 },
    ],
    trees: [[22, 8.6]],
    people: [[15], [28.5]],
    extra: (p, y) => {
      p.rect('fine', 10, y(0.6), 8, 0.6)
      p.rect('fine', 26, y(0.6), 8, 0.6)
    },
  }),
  '049': section({
    w: 44,
    blocks: [],
    ground: [-5, 10, 6, 10, 6, 8, 14, 8, 14, 6, 22, 6, 22, 4, 30, 4, 30, 2, 38, 2, 38, 0, 49, 0],
    trees: [[3, 7.6], [11, 4.6], [25, 8], [33.4, 3.2], [41, 3.4], [45.4, 3]],
    people: [[20.6], [41.8]],
    marks: [[-3, 10], [9, 8], [17, 6], [27.6, 4], [35, 2], [46, 0]],
  }),
  '046': section({
    w: 44,
    blocks: [
      { x: 7, w: 4, levels: [3], roof: 'mono', rise: 0.8, base: 7.9, piles: true },
      { x: 31, w: 3.4, levels: [2.4], roof: 'flat', base: 2.9, piles: true },
    ],
    ground: [-5, 1.2, 2, 1.2, 8, 7.4, 12.6, 7.4, 18.6, 1.8, 30, 1.2, 37, 0.3, 41, -0.6, 49, -1.4],
    water: [
      [18.3, 49, 2.1, 'MHW +2.10'],
      [14.7, 49, 5.4, 'Storm +5.40'],
    ],
    people: [[8.9, 7.9], [23.4, 2.2]],
    marks: [[11.8, 7.4], [-2.4, 1.2]],
    extra: (p, y) => {
      // 栈道：从堤脚伸进盐沼，桥面在平均高潮位附近
      p.line('wall', 18.2, y(2.2), 31, y(2.2))
      for (let x = 19.6; x < 31; x += 2.8) p.line('fine', x, y(2.2), x, y(0.6))
    },
  }),
  '043': section({
    w: 26,
    blocks: [{ x: 0, w: 26, levels: [5.4], roof: 'saw', n: 4, rise: 2.4 }],
    people: [[5], [12.2], [21]],
    extra: (p, y) => {
      p.rect('wall', 14.6, y(3), 5.8, 3)
      p.poly('fine', [2.6, y(0), 2.6, y(0.75), 7.4, y(0.75), 7.4, y(0)])
      p.poly('fine', [22.4, y(0), 22.4, y(0.75), 25.2, y(0.75), 25.2, y(0)])
    },
  }),
  '040': section({
    w: 52,
    blocks: [
      { x: 0, w: 14, levels: [3.6, 3.4, 3.4], roof: 'flat', glazed: [true, false] },
      { x: 14, w: 24, levels: [10.4], roof: 'shell', rise: 2.6, glazed: [false, false] },
      { x: 38, w: 14, levels: [3.6, 3.4, 3.4], roof: 'flat', glazed: [false, true] },
    ],
    people: [[26, 0.9], [6], [45], [30.5, 0.4]],
    extra: (p, y) => {
      p.rect('fine', 19, y(0.9), 14, 0.9)
      for (const [x, e] of [[0.6, 3.6], [0.6, 7], [42.6, 3.6], [42.6, 7]] as const) p.rect('fine', x, y(e + 2.7), 8.6, 2.6)
    },
  }),
  '037': section({
    w: 30,
    blocks: [{ x: 8, w: 10, levels: [2.9, 2.8, 2.6], roof: 'pitched', rise: 4.6 }],
    trees: [[24.6, 8.4]],
    people: [[2.2], [21]],
    extra: (p, y) => {
      p.rect('cut', 27.8, y(2.2), 0.4, 2.2)
      p.line('fine', 4, y(0), 4, y(1.1))
      p.stair(14.3, y(2.9), 1.6, 2.9, 7, 'y')
    },
  }),
  '034': section({
    w: 46,
    blocks: [
      { x: 0, w: 26, levels: [7.4], roof: 'flat', glazed: [true, false] },
      { x: 26, w: 14, levels: [3.7, 3.5], roof: 'flat', glazed: [false, false] },
      { x: 40, w: 6, levels: [3.7, 3.1, 3.1, 3.1, 3.1, 3.1, 3.1], roof: 'flat', glazed: [false, true] },
    ],
    people: [[28.5], [33], [21.5]],
    extra: (p, y) => {
      p.poly('fine', [3, y(0.8), 3, y(3.4), 5.4, y(3.8), 9.2, y(3.8), 9.2, y(3.3), 15, y(3.3), 15, y(0.8)])
      p.circle('fine', 5, y(0.55), 0.55)
      p.circle('fine', 12.6, y(0.55), 0.55)
      p.line('wall', 28, y(0), 28, y(7.2))
    },
  }),
  '031': section({
    w: 22,
    blocks: [
      { x: 0, w: 8, levels: [3.8], roof: 'flat' },
      { x: 15, w: 7, levels: [3.4], roof: 'flat' },
    ],
    trees: [[11.5, 6.4]],
    people: [[4.2], [12.8]],
    extra: (p, y) => {
      p.poly('cut', [19, y(3.4), 19, y(6.4), 20.2, y(6.4), 20.2, y(3.4)])
      p.circle('fine', 18.5, y(0.9), 0.9)
      p.poly('fine', [1.2, y(0), 1.2, y(0.9), 3.6, y(0.9), 3.6, y(0)])
    },
  }),
} as const satisfies Record<string, Drawing>
