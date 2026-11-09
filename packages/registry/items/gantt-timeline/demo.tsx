import { useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_STATUSES, GanttChart, defaults, type GanttChartFeature, type GanttChartMarker, type GanttChartProps, type GanttStatus } from './gantt-timeline'

type Owner = { name: string; initials: string; from: string; to: string }

const OWNERS: Owner[] = [
  { name: 'Mara Okafor', initials: 'MO', from: '#6366f1', to: '#a855f7' },
  { name: 'Theo Lindqvist', initials: 'TL', from: '#0ea5e9', to: '#14b8a6' },
  { name: 'Priya Raman', initials: 'PR', from: '#f43f5e', to: '#f97316' },
  { name: 'Jonas Weber', initials: 'JW', from: '#10b981', to: '#65a30d' },
]

const [PLANNED, IN_PROGRESS, DONE] = DEFAULT_STATUSES as [GanttStatus, GanttStatus, GanttStatus]

// 任务相对今天的起止天数，这样任何一天打开演示，今天标线都落在任务中间
const PLAN: { id: string; name: string; group: string; from: number; to: number; status: GanttStatus; owner: number }[] = [
  { id: 'invoices', name: 'Usage-based invoices', group: 'Billing', from: -44, to: -8, status: DONE, owner: 0 },
  { id: 'tax', name: 'Tax rules for EU', group: 'Billing', from: -10, to: 14, status: IN_PROGRESS, owner: 2 },
  { id: 'proration', name: 'Seat proration', group: 'Billing', from: -26, to: 3, status: IN_PROGRESS, owner: 0 },
  { id: 'dunning', name: 'Dunning emails', group: 'Billing', from: 18, to: 46, status: PLANNED, owner: 3 },
  { id: 'offline', name: 'Offline drafts', group: 'Mobile app', from: -56, to: -20, status: DONE, owner: 1 },
  { id: 'digest', name: 'Push digest', group: 'Mobile app', from: -18, to: 8, status: IN_PROGRESS, owner: 1 },
  { id: 'widget', name: 'Home screen widget', group: 'Mobile app', from: 6, to: 38, status: PLANNED, owner: 2 },
  { id: 'postgres', name: 'Postgres 17 upgrade', group: 'Platform', from: -50, to: -24, status: DONE, owner: 3 },
  { id: 'audit', name: 'Audit log export', group: 'Platform', from: -16, to: 10, status: IN_PROGRESS, owner: 3 },
  { id: 'limits', name: 'Rate limit dashboard', group: 'Platform', from: 4, to: 30, status: PLANNED, owner: 1 },
  { id: 'scim', name: 'SSO with SCIM', group: 'Platform', from: 26, to: 70, status: PLANNED, owner: 0 },
]

const MARKERS: { id: string; label: string; at: number; className: string }[] = [
  { id: 'pricing', label: 'Pricing launch', at: -30, className: 'bg-emerald-100 text-emerald-900' },
  { id: 'freeze', label: 'Beta freeze', at: 24, className: 'bg-sky-100 text-sky-900' },
  { id: 'ga', label: 'v3.4 GA', at: 52, className: 'bg-violet-100 text-violet-900' },
]

type Feature = GanttChartFeature & { owner: number }

const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)

// ---- 自动播放：一只虚拟指针拖动「Tax rules」整体后移，再从右端拉长「Seat proration」，然后各自拖回原处 ----

const MOVED = 'tax'
const RESIZED = 'proration'
const CYCLE = 8
/** 各刻度下拖动的天数：日刻度一列就是一天，挪少一点才留在画面里。 */
const AMOUNTS: Record<string, { move: number; grow: number; pxPerDay: number }> = {
  daily: { move: 3, grow: 4, pxPerDay: 50 },
  monthly: { move: 12, grow: 10, pxPerDay: 150 / 30.4 },
  quarterly: { move: 21, grow: 18, pxPerDay: 100 / 30.4 },
}

type Target = 'move' | 'resize'
type Script = { move: number; grow: number; from: Target; to: Target; blend: number; pressed: boolean }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

function scripted(time: number, move: number, grow: number): Script {
  const t = ((time % CYCLE) + CYCLE) % CYCLE
  const seg = (start: number, end: number) => ease(clamp01((t - start) / (end - start)))
  const moved = move * (seg(0.4, 1.6) - seg(4.4, 5.6))
  const grown = grow * (seg(2.5, 3.5) - seg(6.5, 7.4))
  const travel: [number, number, Target, Target][] = [
    [2.0, 2.5, 'move', 'resize'],
    [3.9, 4.4, 'resize', 'move'],
    [6.0, 6.5, 'move', 'resize'],
    [7.4, 8.0, 'resize', 'move'],
  ]
  let from: Target = 'move'
  let to: Target = 'move'
  let blend = 0
  for (const [start, end, a, b] of travel) {
    if (t >= start && t < end) {
      from = a
      to = b
      blend = seg(start, end)
    }
  }
  if ((t >= 2.5 && t < 3.9) || (t >= 6.5 && t < 7.4)) from = to = 'resize'
  const pressed = (t >= 0.4 && t < 1.6) || (t >= 2.5 && t < 3.5) || (t >= 4.4 && t < 5.6) || (t >= 6.5 && t < 7.4)
  return { move: moved, grow: grown, from, to, blend, pressed }
}

function Avatar({ owner }: { owner: Owner }) {
  return (
    <span
      aria-label={owner.name}
      className="grid size-4 shrink-0 place-items-center rounded-full font-semibold text-[7px] text-white"
      role="img"
      style={{ backgroundImage: `linear-gradient(135deg, ${owner.from}, ${owner.to})` }}
    >
      {owner.initials}
    </span>
  )
}

export function Demo(props: GanttChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const range = props.range ?? defaults.range
  const zoom = props.zoom ?? defaults.zoom
  const amounts = AMOUNTS[range] ?? AMOUNTS.monthly!

  const [today] = useState(() => addDays(new Date(), 0))
  const base = useMemo<Feature[]>(
    () => PLAN.map((task) => ({ id: task.id, name: task.name, group: task.group, startAt: addDays(today, task.from), endAt: addDays(today, task.to), status: task.status, owner: task.owner })),
    [today],
  )
  const [markers, setMarkers] = useState<GanttChartMarker[]>(() => MARKERS.map((marker) => ({ id: marker.id, label: marker.label, date: addDays(today, marker.at), className: marker.className })))

  const [auto, setAuto] = useState({ move: 0, grow: 0 })
  const [manual, setManual] = useState<Feature[] | null>(null)
  const script = useRef<Script>(scripted(0, amounts.move, amounts.grow))

  const autoFeatures = useMemo(
    () =>
      base.map((feature) => {
        if (feature.id === MOVED) return { ...feature, startAt: addDays(feature.startAt, auto.move), endAt: addDays(feature.endAt, auto.move) }
        if (feature.id === RESIZED) return { ...feature, endAt: addDays(feature.endAt, auto.grow) }
        return feature
      }),
    [base, auto],
  )
  const features = manual ?? autoFeatures
  const shown = useRef(features)
  shown.current = features

  /** 虚拟指针贴着任务条：移动时在条的中间，改工期时在右端。 */
  const placeCursor = () => {
    const box = frame.current
    const pointer = cursor.current
    if (!box || !pointer) return
    const bounds = box.getBoundingClientRect()
    const bar = (id: string) => box.querySelector(`[aria-roledescription="draggable"][data-feature-id="${id}"]`)?.closest('[data-roadmap-ui="gantt-feature"]')?.getBoundingClientRect()
    const moved = bar(MOVED)
    const resized = bar(RESIZED)
    if (!moved || !resized) return
    const { move, grow, from, to, blend, pressed } = script.current
    const pxPerDay = amounts.pxPerDay * (zoom / 100)
    const anchor = (target: Target) =>
      target === 'move'
        ? { x: moved.left + moved.width / 2 + (move - Math.round(move)) * pxPerDay, y: moved.top + moved.height * 0.6 }
        : { x: resized.right - 4 + (grow - Math.round(grow)) * pxPerDay, y: resized.top + resized.height * 0.6 }
    const a = anchor(from)
    const b = anchor(to)
    const x = a.x + (b.x - a.x) * blend - bounds.left
    const y = a.y + (b.y - a.y) * blend - bounds.top
    pointer.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${pressed ? 0.88 : 1})`
    pointer.dataset.mode = from === 'resize' && to === 'resize' ? 'resize' : 'pointer'
  }

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, amounts.move, amounts.grow)
      script.current = next
      const move = Math.round(next.move)
      const grow = Math.round(next.grow)
      setAuto((prev) => (prev.move === move && prev.grow === grow ? prev : { move, grow }))
      placeCursor()
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  // 任务条重新排版后再贴一次，免得指针落后一帧
  useLayoutEffect(() => {
    if (!manual) placeCursor()
  })

  // 用户一碰甘特图就停掉自动播放，从当前画面接手
  const takeOver = () => {
    if (!manual) setManual(shown.current)
  }

  const handleMove = useCallback((id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return
    setManual((prev) => (prev ?? shown.current).map((feature) => (feature.id === id ? { ...feature, startAt, endAt } : feature)))
  }, [])

  const handleAddItem = useCallback((date: Date) => {
    setManual((prev) => {
      const list = prev ?? shown.current
      return [...list, { id: `task-${list.length + 1}`, name: 'Untitled task', group: 'Platform', startAt: date, endAt: addDays(date, 14), status: PLANNED, owner: list.length % OWNERS.length }]
    })
  }, [])

  const handleCreateMarker = useCallback((date: Date) => {
    setMarkers((prev) => [...prev, { id: `marker-${prev.length + 1}-${date.getTime()}`, label: 'Checkpoint', date, className: 'bg-amber-100 text-amber-900' }])
  }, [])

  const handleRemoveMarker = useCallback((id: string) => setMarkers((prev) => prev.filter((marker) => marker.id !== id)), [])

  const renderFeature = useCallback(
    (feature: GanttChartFeature) => {
      const owner = OWNERS[features.find((item) => item.id === feature.id)?.owner ?? 0] ?? OWNERS[0]!
      return (
        <>
          <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: feature.status.color }} />
          <p className="flex-1 truncate text-xs">{feature.name}</p>
          <Avatar owner={owner} />
        </>
      )
    },
    [features],
  )

  const statusColors = props.statusColors ?? defaults.statusColors
  const counts = DEFAULT_STATUSES.map((status) => features.filter((feature) => feature.status.id === status.id).length)

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="mx-auto flex h-full min-h-[560px] max-w-[1600px] flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Halcyon · Release 3.4</p>
            <h2 className="mt-1 font-semibold text-lg tracking-tight">Product roadmap</h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-xs">
            {DEFAULT_STATUSES.map((status, index) => (
              <span className="inline-flex items-center gap-1.5" key={status.id}>
                <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: statusColors[index] ?? status.color }} />
                {status.name}
                <span className="text-foreground tabular-nums">{counts[index]}</span>
              </span>
            ))}
            <span className="hidden text-muted-foreground/80 md:inline">Drag a bar to reschedule, or its edges to change the dates.</span>
          </div>
        </div>
        <div ref={frame} className="relative min-h-0 flex-1 overflow-hidden rounded-xl border" onKeyDownCapture={takeOver} onPointerDownCapture={takeOver}>
          <GanttChart
            {...props}
            className="rounded-none"
            features={features}
            markers={markers}
            onAddItem={handleAddItem}
            onCreateMarker={handleCreateMarker}
            onMove={handleMove}
            onRemoveMarker={handleRemoveMarker}
            renderFeature={renderFeature}
          />
          {!manual && !reduced && (
            <div ref={cursor} aria-hidden className="group/cursor pointer-events-none absolute top-0 left-0 z-40 drop-shadow-[0_2px_4px_rgb(0_0_0/0.45)]" data-mode="pointer">
              <svg className="-translate-x-[3px] -translate-y-[2px] block group-data-[mode=resize]/cursor:hidden" fill="none" height="20" viewBox="0 0 20 20" width="20">
                <path d="M3 2.5v13.2l3.6-3.4 2.3 5.3 2.4-1-2.3-5.2H14L3 2.5Z" fill="#fff" stroke="#111" strokeLinejoin="round" strokeWidth="1.2" />
              </svg>
              <svg className="-translate-x-1/2 -translate-y-1/2 hidden group-data-[mode=resize]/cursor:block" fill="none" height="20" viewBox="0 0 20 20" width="20">
                <path d="M8.6 4h2.8v4.2h2.1V5.6L18 10l-4.5 4.4v-2.6h-2.1V16H8.6v-4.2H6.5v2.6L2 10l4.5-4.4v2.6h2.1V4Z" fill="#fff" stroke="#111" strokeLinejoin="round" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
