import { MANIFEST_PATH, printManifest } from '@motif/agent/client'
import type { ItemSource } from '@motif/schema'

/*
 * 工作台每一轮的改动：哪些文件变了、加减了几行，以及单个文件的逐行差异（给用户看 agent 改了什么）。
 * 行级 diff 用 Myers 算法（O((N+M)·D)）；两边都很长又几乎全变了时，不算细节，直接当整份替换。
 */

export type DiffLine = { kind: 'same' | 'add' | 'del'; text: string }
export interface Hunk {
  /** 这一段在旧文件、新文件里的起始行号（从 1 开始）。 */
  oldStart: number
  newStart: number
  lines: DiffLine[]
}
export interface FileChange {
  path: string
  status: 'added' | 'removed' | 'modified'
  added: number
  removed: number
}

const MAX_LINES = 6000
const CONTEXT = 3

function splitLines(text: string): string[] {
  if (text === '') return []
  const lines = text.split(/\r?\n/)
  if (lines.at(-1) === '') lines.pop()
  return lines
}

/** 逐行对比两段文本，返回按顺序排列的相同、新增、删除的行。 */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = splitLines(before)
  const b = splitLines(after)
  // 公共前缀和后缀先拿掉：agent 的改动通常集中在一小段，这样 Myers 只处理中间。
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }
  const head: DiffLine[] = a.slice(0, start).map((text) => ({ kind: 'same', text }))
  const tail: DiffLine[] = a.slice(endA).map((text) => ({ kind: 'same', text }))
  const middleA = a.slice(start, endA)
  const middleB = b.slice(start, endB)
  return [...head, ...myers(middleA, middleB), ...tail]
}

function myers(a: string[], b: string[]): DiffLine[] {
  const n = a.length
  const m = b.length
  if (n === 0) return b.map((text) => ({ kind: 'add', text }))
  if (m === 0) return a.map((text) => ({ kind: 'del', text }))
  if (n + m > MAX_LINES) return [...a.map((text): DiffLine => ({ kind: 'del', text })), ...b.map((text): DiffLine => ({ kind: 'add', text }))]

  const max = n + m
  const offset = max
  const v = new Int32Array(2 * max + 2)
  const trace: Int32Array[] = []
  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!) ? v[offset + k + 1]! : v[offset + k - 1]! + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) break outer
    }
  }

  // 从终点沿着每一步的选择往回走，得到编辑序列。
  const lines: DiffLine[] = []
  let x = n
  let y = m
  for (let d = trace.length - 1; d >= 0; d--) {
    const previous = trace[d]!
    const k = x - y
    const prevK = k === -d || (k !== d && previous[offset + k - 1]! < previous[offset + k + 1]!) ? k + 1 : k - 1
    const prevX = previous[offset + prevK]!
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      lines.push({ kind: 'same', text: a[x - 1]! })
      x--
      y--
    }
    if (d > 0) {
      if (x === prevX) lines.push({ kind: 'add', text: b[y - 1]! })
      else lines.push({ kind: 'del', text: a[x - 1]! })
    }
    x = prevX
    y = prevY
  }
  return lines.reverse()
}

/** 把逐行结果切成带上下文的片段（每处改动前后各留 3 行，挨得近的并成一段），像 git diff 那样。 */
export function toHunks(lines: DiffLine[]): Hunk[] {
  // 每一行在旧文件、新文件里的行号。
  const positions: { old: number; new: number }[] = []
  let oldLine = 1
  let newLine = 1
  for (const line of lines) {
    positions.push({ old: oldLine, new: newLine })
    if (line.kind !== 'add') oldLine++
    if (line.kind !== 'del') newLine++
  }
  const ranges: [number, number][] = []
  lines.forEach((line, index) => {
    if (line.kind === 'same') return
    const from = Math.max(0, index - CONTEXT)
    const to = Math.min(lines.length - 1, index + CONTEXT)
    const last = ranges.at(-1)
    if (last && from <= last[1] + 1) last[1] = Math.max(last[1], to)
    else ranges.push([from, to])
  })
  return ranges.map(([from, to]) => ({ oldStart: positions[from]!.old, newStart: positions[from]!.new, lines: lines.slice(from, to + 1) }))
}

/** 条目里每个文件的文本：清单按 agent 和编辑器里看到的格式打印。 */
function filesOf(item: ItemSource): Map<string, string> {
  return new Map([[MANIFEST_PATH, printManifest(item.manifest)], ...Object.entries(item.files)])
}

/** 两个版本之间改了哪些文件、各加减了几行。 */
export function itemChanges(before: ItemSource, after: ItemSource): FileChange[] {
  const old = filesOf(before)
  const next = filesOf(after)
  const changes: FileChange[] = []
  for (const path of new Set([...old.keys(), ...next.keys()])) {
    const a = old.get(path)
    const b = next.get(path)
    if (a === b) continue
    const lines = lineDiff(a ?? '', b ?? '')
    changes.push({
      path,
      status: a === undefined ? 'added' : b === undefined ? 'removed' : 'modified',
      added: lines.filter((line) => line.kind === 'add').length,
      removed: lines.filter((line) => line.kind === 'del').length,
    })
  }
  // 清单排最前，其他按路径。
  return changes.sort((x, y) => (x.path === MANIFEST_PATH ? -1 : y.path === MANIFEST_PATH ? 1 : x.path.localeCompare(y.path)))
}

/** 一个文件在两个版本之间的差异片段。 */
export function fileDiff(before: ItemSource, after: ItemSource, path: string): Hunk[] {
  return toHunks(lineDiff(filesOf(before).get(path) ?? '', filesOf(after).get(path) ?? ''))
}
