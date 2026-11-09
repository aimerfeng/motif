import { useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useRef, useState, type SyntheticEvent } from 'react'
import { Kanban, defaults, type KanbanColumn, type KanbanFeature, type KanbanOwner } from './kanban-board'

const FONT = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"

const COLUMNS: KanbanColumn[] = [
  { id: 'backlog', name: 'Backlog', color: '#6B7280' },
  { id: 'progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'review', name: 'Review', color: '#38BDF8' },
  { id: 'done', name: 'Done', color: '#10B981' },
]

const OWNERS: KanbanOwner[] = [
  { name: 'Mara Okafor', initials: 'MO', color: '#a78bfa' },
  { name: 'Theo Lindqvist', initials: 'TL', color: '#38bdf8' },
  { name: 'Priya Raman', initials: 'PR', color: '#fb7185' },
  { name: 'Jonas Weber', initials: 'JW', color: '#34d399' },
]

// 起止日期相对今天，任何一天打开演示都像一个正在进行的迭代
const PLAN: { id: string; name: string; column: string; from: number; to: number; owner: number }[] = [
  { id: 'csv', name: 'CSV import for contacts', column: 'backlog', from: 6, to: 24, owner: 1 },
  { id: 'offline', name: 'Offline drafts on mobile', column: 'backlog', from: 10, to: 38, owner: 2 },
  { id: 'retention', name: 'Audit log retention settings', column: 'backlog', from: 14, to: 30, owner: 3 },
  { id: 'invoices', name: 'Usage-based invoices', column: 'progress', from: -12, to: 9, owner: 0 },
  { id: 'search', name: 'Search ranking v2', column: 'progress', from: -8, to: 12, owner: 1 },
  { id: 'saml', name: 'SSO with SAML', column: 'progress', from: -5, to: 16, owner: 3 },
  { id: 'webhooks', name: 'Webhook retries with backoff', column: 'review', from: -16, to: 2, owner: 2 },
  { id: 'onboarding', name: 'Onboarding checklist copy', column: 'review', from: -9, to: 1, owner: 0 },
  { id: 'postgres', name: 'Postgres 17 upgrade', column: 'done', from: -40, to: -18, owner: 3 },
  { id: 'limits', name: 'Rate limit headers', column: 'done', from: -30, to: -12, owner: 1 },
  { id: 'digest', name: 'Weekly push digest', column: 'done', from: -26, to: -6, owner: 2 },
]

const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)

function initialData(): KanbanFeature[] {
  const today = new Date()
  return PLAN.map((task) => ({ id: task.id, name: task.name, column: task.column, startAt: addDays(today, task.from), endAt: addDays(today, task.to), owner: OWNERS[task.owner] }))
}

const orderOf = (data: KanbanFeature[]) => data.map((item) => `${item.column}:${item.id}`).join(',')

// ---- 自动播放：虚拟指针把「Search ranking v2」拖进 Review 顶部，再拖回 In Progress 原位，一轮 8 秒 ----

type Point = { x: number; y: number }
type Drag = { card: string; to: string; slot: number; down: number; up: number }

const CYCLE = 8
const DRAGS: Drag[] = [
  { card: 'search', to: 'review', slot: 0, down: 0.6, up: 2.5 },
  { card: 'search', to: 'progress', slot: 1, down: 4.6, up: 6.5 },
]
const POINTER_ID = 9

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

function fire(target: EventTarget, type: 'pointerdown' | 'pointermove' | 'pointerup', point: Point) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, clientX: point.x, clientY: point.y, pointerId: POINTER_ID, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }),
  )
}

const centerOf = (rect: DOMRect): Point => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

/** 目标列里第 slot 张卡片的位置（不计被拖的那张）。 */
function slotPoint(board: Element, card: string, slot: number): Point {
  const bounds = board.getBoundingClientRect()
  const x = bounds.left + bounds.width / 2
  const cards = Array.from(board.querySelectorAll<HTMLElement>('[data-kanban-card]'))
    .filter((element) => element.dataset.kanbanCard !== card)
    .map((element) => element.getBoundingClientRect())
  const first = cards[0]
  const last = cards.at(-1)
  if (!first || !last) return { x, y: bounds.top + 72 }
  if (slot <= 0) return { x, y: first.top + 10 }
  const above = cards[slot - 1]
  const below = cards[slot]
  if (!above || !below) return { x, y: last.bottom + 24 }
  return { x, y: (centerOf(above).y + centerOf(below).y) / 2 }
}

export function Demo(props: Partial<typeof defaults>) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [data, setData] = useState(initialData)
  const [initial] = useState(() => orderOf(data))
  const [manual, setManual] = useState(false)
  const dataRef = useRef(data)
  dataRef.current = data
  const live = useRef<{ cycle: number; stages: ('idle' | 'held' | 'done')[]; from: Point; to: Point; pointer: Point | null; rest: Point | null }>({
    cycle: -1,
    stages: DRAGS.map(() => 'idle'),
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
    pointer: null,
    rest: null,
  })

  useFrameLoop(
    host,
    ({ time, delta }) => {
      const box = frame.current
      if (manual || !box) return
      const state = live.current
      const cycle = Math.floor(time / CYCLE)
      const t = time - cycle * CYCLE
      if (cycle !== state.cycle) {
        state.cycle = cycle
        state.stages = DRAGS.map(() => 'idle')
        // 两次拖动之后顺序本来就回到了开头；万一没回来，在这里复位
        if (orderOf(dataRef.current) !== initial) setData(initialData())
      }

      let held: Point | null = null
      DRAGS.forEach((drag, index) => {
        const stage = state.stages[index]
        if (stage === 'idle' && t >= drag.up) state.stages[index] = 'done'
        if (stage === 'idle' && t >= drag.down && t < drag.up) {
          const card = box.querySelector(`[data-kanban-card="${drag.card}"]`)
          const board = box.querySelector(`[data-kanban-board="${drag.to}"]`)
          if (!card || !board) return
          state.from = centerOf(card.getBoundingClientRect())
          state.to = slotPoint(board, drag.card, drag.slot)
          fire(card, 'pointerdown', state.from)
          state.stages[index] = 'held'
        }
        if (state.stages[index] !== 'held') return
        if (t < drag.up) {
          const p = ease(clamp01((t - drag.down - 0.12) / (drag.up - drag.down - 0.45)))
          const point = { x: state.from.x + (state.to.x - state.from.x) * p, y: state.from.y + (state.to.y - state.from.y) * p - Math.sin(p * Math.PI) * 28 }
          fire(window, 'pointermove', point)
          held = point
        } else {
          fire(window, 'pointermove', state.to)
          fire(window, 'pointerup', state.to)
          state.stages[index] = 'done'
        }
      })
      state.pointer = held

      // 没拖的时候，指针慢慢停到下一张要拖的卡片上
      const next = DRAGS.find((_, index) => state.stages[index] === 'idle') ?? DRAGS[0]!
      const resting = box.querySelector(`[data-kanban-card="${next.card}"]`)
      const target = held ?? (resting ? centerOf(resting.getBoundingClientRect()) : null)
      if (!target) return
      const rest = state.rest ?? target
      const blend = held || !state.rest ? 1 : 1 - Math.exp(-delta * 7)
      state.rest = { x: rest.x + (target.x - rest.x) * blend, y: rest.y + (target.y - rest.y) * blend }
      const pointer = cursor.current
      if (!pointer) return
      const bounds = box.getBoundingClientRect()
      pointer.style.transform = `translate(${(state.rest.x - bounds.left).toFixed(1)}px, ${(state.rest.y - bounds.top).toFixed(1)}px) scale(${held ? 0.9 : 1})`
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  // 用户一碰看板就停掉自动播放，从当前画面接手
  const takeOver = (event: SyntheticEvent) => {
    if (manual || !event.nativeEvent.isTrusted) return
    const state = live.current
    if (state.pointer) fire(window, 'pointerup', state.pointer)
    state.pointer = null
    setManual(true)
  }

  const shipped = data.filter((item) => item.column === 'done').length

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground" style={{ fontFamily: FONT }}>
      <div className="mx-auto flex h-full min-h-[520px] max-w-[1400px] flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Larkspur · Sprint 24</p>
            <h2 className="mt-1 font-semibold text-lg tracking-tight">Release board</h2>
          </div>
          <p className="text-muted-foreground text-xs">
            <span className="text-foreground tabular-nums">{shipped}</span> of <span className="tabular-nums">{data.length}</span> shipped
            <span className="hidden md:inline"> · Drag a card, or focus it and press space.</span>
          </p>
        </div>
        <div ref={frame} className="relative min-h-0 flex-1" onKeyDownCapture={takeOver} onPointerDownCapture={takeOver}>
          <Kanban {...props} columns={COLUMNS} data={data} onDataChange={setData} />
          {!manual && !reduced && (
            <div ref={cursor} aria-hidden className="pointer-events-none absolute top-0 left-0 z-[60] drop-shadow-[0_2px_4px_rgb(0_0_0/0.45)]">
              <svg className="-translate-x-[3px] -translate-y-[2px] block" fill="none" height="20" viewBox="0 0 20 20" width="20">
                <path d="M3 2.5v13.2l3.6-3.4 2.3 5.3 2.4-1-2.3-5.2H14L3 2.5Z" fill="#fff" stroke="#111" strokeLinejoin="round" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
