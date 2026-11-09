import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { DetailAnycast, DetailOrigin, DetailPop, DetailShield } from './details'
import { NetworkMap } from './network-map'
import { Balloon, BrandMark, Button, Command, DimLine, Heading, Icon, Label, Sheet } from './parts'
import { cliName } from './theme'
import { Topology } from './topology'

const NAV = ['Network', 'Pricing', 'Docs', 'Changelog']

/* ---------- 导航 ---------- */

export function Header({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const toggle = useRef<HTMLButtonElement>(null)
  // 收起菜单时把焦点还给菜单按钮：被点的链接随菜单一起卸载，焦点不能掉回页面开头。
  const close = () => {
    setOpen(false)
    toggle.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-30 border-b border-hair bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1304px] items-center justify-between gap-6 px-4 @3xl:px-8">
        <a href="#" onClick={(e) => e.preventDefault()} className="bp-focus min-w-0" aria-label={`${brand} home`}>
          <BrandMark name={brand} />
        </a>
        <nav className="hidden items-center gap-7 @4xl:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item} href="#" onClick={(e) => e.preventDefault()} className="bp-focus text-[14px] text-ink-soft transition-colors duration-150 hover:text-ink">
              {item}
            </a>
          ))}
          <a href="#" onClick={(e) => e.preventDefault()} className="bp-focus inline-flex items-center gap-2 text-[14px] text-ink-soft transition-colors duration-150 hover:text-ink">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden />
            Status
          </a>
        </nav>
        <div className="hidden items-center gap-2 @4xl:flex">
          <a href="#" onClick={(e) => e.preventDefault()} className="bp-focus px-3 text-[14px] text-ink-soft transition-colors duration-150 hover:text-ink">
            Sign in
          </a>
          <Button className="h-9 px-4 text-[12px]">Deploy free</Button>
        </div>
        <button
          ref={toggle}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className="bp-focus grid size-10 shrink-0 place-items-center border border-hair text-ink @4xl:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} className="size-5" />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={menuId}
            key="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-b border-hair bg-paper px-4 pb-5 @4xl:hidden"
          >
            {[...NAV, 'Status', 'Sign in'].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  close()
                }}
                className="bp-focus block border-b border-faint py-3 text-[15px] text-ink"
              >
                {item}
              </a>
            ))}
            <Button className="mt-4 w-full" onClick={close}>
              Deploy free
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

/* ---------- 首屏：一张图纸 ---------- */

function TitleBlock({ brand }: { brand: string }) {
  const cell = 'flex min-w-0 flex-col gap-1.5 px-3 py-2.5'
  const value = 'font-bp-mono text-[12px] whitespace-nowrap text-ink'
  return (
    <div className="grid grid-cols-3 border border-rule bg-paper/60">
      <div className={cn(cell, 'col-span-3 border-b border-hair')}>
        <Label>Project</Label>
        <span className={cn(value, 'truncate')}>{brand} edge network</span>
      </div>
      <div className={cn(cell, 'border-r border-hair')}>
        <Label>Dwg no.</Label>
        <span className={value}>KS-001</span>
      </div>
      <div className={cn(cell, 'border-r border-hair')}>
        <Label>Scale</Label>
        <span className={value}>1 : 1 ms</span>
      </div>
      <div className={cell}>
        <Label>Sheet</Label>
        <span className={value}>1 of 6</span>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-bp-mono text-[11px] tracking-[0.06em] text-ink-soft uppercase">
      <span className="inline-flex items-center gap-2">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <circle cx="6" cy="6" r="3.8" className="fill-paper stroke-ink" strokeWidth="1.6" />
        </svg>
        Request
      </span>
      <span className="inline-flex items-center gap-2">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
          <rect x="2.6" y="2.6" width="6.8" height="6.8" transform="rotate(45 6 6)" className="fill-ink" />
        </svg>
        Response
      </span>
      <span className="inline-flex items-center gap-2">
        <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden>
          <path d="M0 6h24" className="stroke-ink" strokeWidth="1.3" strokeDasharray="5 4" />
        </svg>
        Cache miss to origin
      </span>
    </div>
  )
}

const PARTS = ['Anycast IP', 'Edge PoP', 'Regional shield', 'Your origin']

export function Hero({ brand, headline, speed, showDimensions }: { brand: string; headline: string; speed: number; showDimensions: boolean }) {
  const cli = cliName(brand)
  return (
    <section className="relative px-4 pt-5 pb-8 @3xl:px-8 @3xl:pt-6 @3xl:pb-7" aria-labelledby="bp-hero-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_28%_18%,transparent_35%,var(--paper-deep)_130%)] opacity-70" aria-hidden />
      <div className="relative mx-auto max-w-[1240px] border border-rule">
        {/* 图框分区编号：上边 1–6，左边 A–D */}
        <div className="hidden h-5 grid-cols-6 border-b border-hair @4xl:grid" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className="grid place-items-center border-r border-hair font-bp-mono text-[10px] text-ink-muted last:border-r-0">
              {n}
            </span>
          ))}
        </div>
        <div className="absolute top-5 bottom-0 left-0 hidden w-5 grid-rows-4 border-r border-hair @4xl:grid" aria-hidden>
          {['A', 'B', 'C', 'D'].map((n) => (
            <span key={n} className="grid place-items-center border-b border-hair font-bp-mono text-[10px] text-ink-muted last:border-b-0">
              {n}
            </span>
          ))}
        </div>

        <div className="grid gap-10 px-5 py-8 @3xl:px-10 @4xl:pl-14 @6xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @6xl:gap-12">
          <div className="flex min-w-0 flex-col">
            <Label>Dwg KS-001 · Edge topology · Rev C</Label>
            <Heading level={1} id="bp-hero-title" className="mt-6">
              {headline}
            </Heading>
            {/* 单栏（@4xl–@6xl）时段落和按钮并排：不然右半张图纸是空的，请求路径图也被挤到首屏以下。 */}
            <div className="mt-6 grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] @4xl:items-end @4xl:gap-10 @6xl:grid-cols-1 @6xl:gap-8">
              <p className="max-w-xl text-pretty text-[17px] leading-relaxed text-ink-soft">
                {brand} runs your functions, cache and TLS in 212 cities. 97 of 100 requests are answered at the edge; the rest take a private backbone to your origin.
              </p>
              <div className="flex flex-col gap-3 @lg:flex-row @4xl:flex-col @6xl:flex-row">
                <Button>
                  Deploy free <Icon name="arrow" />
                </Button>
                <Command command={`npx ${cli} deploy`} className="min-w-0 @lg:max-w-sm @lg:flex-1 @4xl:max-w-none @4xl:flex-none @6xl:flex-1" />
              </div>
            </div>
            <div className="min-h-10 flex-1 @6xl:min-h-8" aria-hidden />
            <dl className="grid grid-cols-3 border-y border-hair">
              {[
                ['Cities', '212'],
                ['p50 to users', '11 ms'],
                ['Origin offload', '94%'],
              ].map(([term, detail], i) => (
                <div key={term} className={cn('flex min-w-0 flex-col justify-between gap-2 py-3.5', i > 0 && 'border-l border-hair pl-3 @lg:pl-4')}>
                  <dt className="leading-none">
                    <Label className="block text-[10px] leading-[1.4] @lg:text-[11px]">{term}</Label>
                  </dt>
                  <dd className="bp-display text-[22px] leading-none text-ink tabular-nums @lg:text-[26px]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="flex min-w-0 flex-col gap-5">
            <div className="-mx-3 min-w-0 @2xl:mx-0">
              <Topology speed={speed} showDimensions={showDimensions} />
            </div>
            <figcaption className="grid gap-5 border-t border-hair pt-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,300px)] @3xl:items-start">
              <div className="flex flex-col gap-3.5">
                <Legend />
                <ol className="grid grid-cols-2 gap-x-5 gap-y-2 text-[13px] text-ink-soft">
                  {PARTS.map((part, i) => (
                    <li key={part} className="flex items-center gap-2.5">
                      <Balloon n={i + 1} />
                      {part}
                    </li>
                  ))}
                </ol>
              </div>
              <TitleBlock brand={brand} />
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

/* ---------- 实时指标跑马灯 ---------- */

function wave(step: number, seed: number) {
  return Math.sin(step * 0.71 + seed * 1.9) * 0.6 + Math.sin(step * 0.23 + seed * 4.1) * 0.4
}

const METRICS: { label: string; value: (step: number) => string; width: string }[] = [
  { label: 'Requests / s', value: (s) => (4_812_330 + Math.round(wave(s, 1) * 61_000)).toLocaleString('en-US'), width: '9ch' },
  { label: 'Cache hit', value: (s) => `${(97.4 + wave(s, 2) * 0.2).toFixed(1)}%`, width: '5ch' },
  { label: 'p50 to users', value: (s) => `${11 + Math.round(wave(s, 3))} ms`, width: '5ch' },
  { label: 'p99', value: (s) => `${61 + Math.round(wave(s, 4) * 3)} ms`, width: '5ch' },
  { label: 'Cities online', value: () => '212/212', width: '7ch' },
  { label: 'Egress', value: (s) => `${(38.2 + wave(s, 5) * 0.6).toFixed(1)} Tbps`, width: '9ch' },
  { label: 'TLS handshakes / s', value: (s) => `${391 + Math.round(wave(s, 6) * 9)}K`, width: '4ch' },
  { label: 'WAF blocks / s', value: (s) => (12_904 + Math.round(wave(s, 7) * 420)).toLocaleString('en-US'), width: '6ch' },
]

export function Ticker() {
  const host = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLSpanElement>(null)
  const values = useRef<(HTMLSpanElement | null)[]>([])
  const half = useRef(0)
  const lastStep = useRef(-1)
  // 自己的时钟：鼠标停在跑马灯上、或者按了暂停，就不再前进（WCAG 2.2.2：自动滚动和更新的内容要能停下）。
  const clock = useRef(0)
  const hovered = useRef(false)
  const [paused, setPaused] = useState(false)

  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const measure = () => {
      half.current = el.scrollWidth / 2
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 数值每半秒变一次（时间来自帧循环，截图时也可复现），位移每帧都走。
  useFrameLoop(
    host,
    ({ delta }) => {
      const still = paused || hovered.current
      if (!still) clock.current += delta
      const time = clock.current
      const x = half.current > 0 ? (time * 38) % half.current : 0
      if (track.current) track.current.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`
      dot.current?.style.setProperty('opacity', still || time % 1.4 < 0.9 ? '1' : '0.25')
      const step = Math.floor(time * 2)
      if (step === lastStep.current) return
      lastStep.current = step
      values.current.forEach((el, i) => {
        if (el) el.textContent = METRICS[i % METRICS.length]!.value(step)
      })
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const copy = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {METRICS.map((metric, i) => (
        <span key={metric.label} className="flex items-center gap-2.5 px-6 font-bp-mono text-[12px] tracking-[0.06em] whitespace-nowrap uppercase">
          <span className="text-ink-muted">{metric.label}</span>
          <span
            ref={(el) => {
              values.current[(hidden ? METRICS.length : 0) + i] = el
            }}
            className="inline-block text-ink tabular-nums"
            style={{ minWidth: metric.width }}
          >
            {metric.value(0)}
          </span>
          <svg viewBox="0 0 10 10" className="ml-6 size-2.5 text-rule" aria-hidden>
            <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
      ))}
    </div>
  )

  return (
    <section
      ref={host}
      aria-label="Live network metrics"
      className="relative flex min-w-0 items-stretch border-y border-rule bg-paper"
      onPointerEnter={() => {
        hovered.current = true
      }}
      onPointerLeave={() => {
        hovered.current = false
      }}
    >
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        className="bp-focus z-10 flex shrink-0 items-center gap-2 border-r border-rule bg-paper px-4 font-bp-mono text-[12px] tracking-[0.1em] text-ink uppercase transition-colors duration-150 hover:bg-faint @3xl:px-8"
      >
        <span ref={dot} className={cn('size-2 rounded-full', paused ? 'border border-ink' : 'bg-ink')} aria-hidden />
        {/* 两个词叠在同一格里，切换时按钮宽度不变，跑马灯不会跳 */}
        <span className="grid">
          <span className={cn('[grid-area:1/1]', paused && 'invisible')}>Live</span>
          <span className={cn('[grid-area:1/1]', !paused && 'invisible')}>Paused</span>
        </span>
        <span className="sr-only">{paused ? ', resume metrics' : ', pause metrics'}</span>
        <svg viewBox="0 0 10 10" className="size-2 text-ink-muted" aria-hidden>
          {paused ? <path d="M2 1l7 4-7 4z" fill="currentColor" /> : <path d="M2.5 1v8M7.5 1v8" stroke="currentColor" strokeWidth="1.6" />}
        </svg>
      </button>
      <div className="min-w-0 flex-1 overflow-hidden py-3.5">
        <div ref={track} className="flex w-max will-change-transform">
          {copy(false)}
          {copy(true)}
        </div>
      </div>
    </section>
  )
}

/* ---------- 请求路径分解 ---------- */

const DETAILS: { code: string; name: string; title: string; body: string; spec: string; drawing: ReactNode }[] = [
  {
    code: 'A',
    name: 'Anycast',
    title: 'One address, announced everywhere',
    body: 'Every city announces the same IP. The internet’s own routing hands each user to the nearest PoP, so there is no region to pick and nothing to fail over.',
    spec: '1 IP · 212 cities',
    drawing: <DetailAnycast />,
  },
  {
    code: 'B',
    name: 'Edge PoP',
    title: 'Your code runs beside the cache',
    body: 'Functions start in an isolate in under half a millisecond and read the cache on the same machine. No warm pool to pay for, no cold-start tax.',
    spec: '0.4 ms cold start',
    drawing: <DetailPop />,
  },
  {
    code: 'C',
    name: 'Shield',
    title: 'Misses collapse before your origin',
    body: 'A miss asks one of 14 regional shields first. A page that goes viral costs one origin fetch per region, not one per city.',
    spec: '14 shields',
    drawing: <DetailShield />,
  },
  {
    code: 'D',
    name: 'Origin',
    title: 'Your servers see clean traffic',
    body: 'What reaches you arrives over our backbone with mutual TLS. Lock the firewall to our published ranges and close everything else.',
    spec: '−94% origin requests',
    drawing: <DetailOrigin />,
  },
]

export function HowItWorks({ showDimensions }: { showDimensions: boolean }) {
  return (
    <Sheet code="KS-002" title="Request path, detailed" labelledBy="bp-path-title">
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl:items-end">
        <Heading id="bp-path-title">Most requests never leave the first building they reach</Heading>
        <p className="max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
          A request lands on the closest PoP, runs your code there and is answered from cache 97 times in 100. The other three take the long way, which is still shorter than the
          public internet.
        </p>
      </div>
      {/* 四列要等到 @7xl：再早切，每张细部图不到 220px 宽，图里的标注字会小于 10px。 */}
      <div className="mt-12 grid border-t border-l border-hair @2xl:grid-cols-2 @7xl:grid-cols-4">
        {DETAILS.map((detail) => (
          <article key={detail.code} className="flex min-w-0 flex-col border-r border-b border-hair">
            <div className="flex items-center justify-between border-b border-faint px-4 py-2.5">
              <Label className="text-ink-soft">Detail {detail.code}</Label>
              <Label>{detail.name}</Label>
            </div>
            {/* 宽卡片里图也不放到 320px 以上：线宽固定，放太大会显得线细字粗。 */}
            <div className="px-4 pt-5">
              <div className="mx-auto max-w-[320px]">{detail.drawing}</div>
            </div>
            <div className="flex flex-1 flex-col px-4 pt-5 pb-5">
              <h3 className="bp-display text-[19px] leading-snug text-ink">{detail.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">{detail.body}</p>
              <div className="mt-auto pt-6">
                {showDimensions ? (
                  <DimLine label={detail.spec} />
                ) : (
                  <span className="font-bp-mono text-[11px] tracking-[0.08em] text-ink-soft uppercase">{detail.spec}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {showDimensions ? <DimLine label="31 ms p50 worldwide, user to first byte" className="mt-6" /> : null}
    </Sheet>
  )
}

/* ---------- 网络与延迟 ---------- */

export function Network({ speed, showDimensions }: { speed: number; showDimensions: boolean }) {
  return (
    <Sheet code="KS-003" title="Network and latency" labelledBy="bp-network-title">
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl:items-end">
        <Heading id="bp-network-title">212 cities, measured from the user’s side</Heading>
        <p className="max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
          Medians come from real-user timing in browsers and apps, not from probes parked in data centres. Pick a region to zoom the map.
        </p>
      </div>
      <div className="mt-10">
        <NetworkMap speed={speed} showDimensions={showDimensions} />
      </div>
    </Sheet>
  )
}

/* ---------- 按量计价 ---------- */

const BOM = [
  { item: 'Requests', unit: 'per million', included: '10 M', rate: '$0.30' },
  { item: 'CPU time', unit: 'per million CPU-ms', included: '30 M', rate: '$0.02' },
  { item: 'Egress', unit: 'per GB', included: '1 TB', rate: '$0.010' },
  { item: 'KV reads', unit: 'per million', included: '10 M', rate: '$0.20' },
  { item: 'TLS, DDoS, WAF rules', unit: 'unmetered', included: 'All', rate: '$0' },
  { item: 'Regions', unit: 'unmetered', included: '212 cities', rate: '$0' },
]

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

function Slider({ label, value, min, max, step, display, valueText, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; valueText: string; onChange: (value: number) => void }) {
  const id = useId()
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[14px] text-ink-soft">
          {label}
        </label>
        <output htmlFor={id} className="font-bp-mono text-[14px] text-ink tabular-nums">
          {display}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={valueText} onChange={(e) => onChange(Number(e.target.value))} className="bp-range mt-1.5" />
      <div className="bp-ruler mx-[6px]" aria-hidden />
    </div>
  )
}

export function Pricing() {
  const [requests, setRequests] = useState(420)
  const [cpu, setCpu] = useState(3)
  const [egress, setEgress] = useState(18)
  const requestCost = Math.max(0, requests - 10) * 0.3
  const cpuMs = requests * cpu
  const cpuCost = Math.max(0, cpuMs - 30) * 0.02
  const egressGb = egress * 1000
  const egressCost = Math.max(0, egressGb - 1000) * 0.01
  const total = requestCost + cpuCost + egressCost
  const lines = [
    { name: 'Requests', qty: `${Math.max(0, requests - 10).toLocaleString('en-US')} M × $0.30`, cost: requestCost },
    { name: 'CPU time', qty: `${Math.max(0, cpuMs - 30).toLocaleString('en-US')} M ms × $0.02`, cost: cpuCost },
    { name: 'Egress', qty: `${Math.max(0, egressGb - 1000).toLocaleString('en-US')} GB × $0.01`, cost: egressCost },
  ]
  return (
    <Sheet code="KS-004" title="Bill of materials" labelledBy="bp-pricing-title">
      <div className="grid gap-6 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl:items-end">
        <Heading id="bp-pricing-title">Pay for requests and bytes. Seats and regions are free.</Heading>
        <p className="max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
          Every account gets every city, TLS and DDoS mitigation from the first deploy. The meter starts after the monthly allowance and only counts the lines below.
        </p>
      </div>
      <div className="mt-12 grid gap-10 @5xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @5xl:gap-12">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Usage prices per meter</caption>
          <thead>
            <tr className="border-y border-rule">
              {['No.', 'Item', 'Included / mo', 'Then'].map((head, i) => (
                <th key={head} scope="col" className={cn('py-2.5 font-normal', i === 0 && 'hidden w-10 @lg:table-cell', i >= 2 && 'text-right', i === 2 && 'pr-4')}>
                  <Label className="whitespace-nowrap">{head}</Label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOM.map((row, i) => (
              <tr key={row.item} className="border-b border-hair">
                <td className="hidden py-3.5 align-top font-bp-mono text-[12px] text-ink-muted tabular-nums @lg:table-cell">{String(i + 1).padStart(2, '0')}</td>
                <th scope="row" className="py-3 pr-3 align-top font-normal">
                  <span className="block text-[15px] text-ink">{row.item}</span>
                  <span className="mt-0.5 block font-bp-mono text-[11px] text-ink-muted">{row.unit}</span>
                </th>
                <td className="py-3.5 pr-4 text-right align-top font-bp-mono text-[13px] whitespace-nowrap text-ink-soft">{row.included}</td>
                <td className="py-3.5 text-right align-top font-bp-mono text-[13px] whitespace-nowrap text-ink">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="relative border border-rule bg-paper-deep/30 p-5 @3xl:p-7">
          <div className="flex items-center justify-between">
            <Label className="text-ink-soft">Estimate · monthly</Label>
            <Label className="hidden @lg:inline">Same rate in every city</Label>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            <Slider label="Requests" value={requests} min={0} max={2000} step={10} display={`${requests.toLocaleString('en-US')} M`} valueText={`${requests} million requests`} onChange={setRequests} />
            <Slider label="CPU per request" value={cpu} min={1} max={20} step={1} display={`${cpu} ms`} valueText={`${cpu} milliseconds of CPU per request`} onChange={setCpu} />
            <Slider label="Egress" value={egress} min={0} max={100} step={1} display={`${egress} TB`} valueText={`${egress} terabytes of egress`} onChange={setEgress} />
          </div>
          <dl className="mt-7 flex flex-col gap-2 border-t border-hair pt-4 font-bp-mono text-[12px]">
            {lines.map((line) => (
              <div key={line.name} className="flex items-baseline gap-2">
                <dt className="shrink-0 text-ink-soft">{line.name}</dt>
                <span className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-hair" aria-hidden />
                <dd className="flex shrink-0 items-baseline gap-3">
                  <span className="hidden text-ink-muted @lg:inline">{line.qty}</span>
                  <span className="text-ink tabular-nums">{usd(line.cost)}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-rule pt-4">
            <Label>Total before tax</Label>
            <p className="bp-display text-[34px] leading-none text-ink tabular-nums" aria-live="polite">
              {usd(total)}
              <span className="ml-1.5 font-bp-mono text-[13px] font-normal tracking-normal text-ink-muted">/ mo</span>
            </p>
          </div>
        </div>
      </div>
    </Sheet>
  )
}

/* ---------- 文档预告 ---------- */

type Token = [string, 'key' | 'op' | 'str' | 'head' | 'val']

const CONFIG: { tokens: Token[]; note?: number }[] = [
  { tokens: [['name', 'key'], ['   = ', 'op'], ['"orders-api"', 'str']] },
  { tokens: [['origin', 'key'], [' = ', 'op'], ['"api.internal:8443"', 'str']] },
  { tokens: [] },
  { tokens: [['[cache]', 'head']], note: 1 },
  { tokens: [['default_ttl', 'key'], [' = ', 'op'], ['"5m"', 'str']] },
  { tokens: [['stale_while_revalidate', 'key'], [' = ', 'op'], ['"1h"', 'str']] },
  { tokens: [] },
  { tokens: [['[[routes]]', 'head']], note: 2 },
  { tokens: [['match', 'key'], [' = ', 'op'], ['"/v1/orders/*"', 'str']] },
  { tokens: [['cache', 'key'], [' = ', 'op'], ['false', 'val']] },
  { tokens: [] },
  { tokens: [['[[routes]]', 'head']] },
  { tokens: [['match', 'key'], ['  = ', 'op'], ['"/v1/eu/*"', 'str']] },
  { tokens: [['region', 'key'], [' = ', 'op'], ['"eu-only"', 'str']], note: 3 },
]

const TOKEN_CLASS: Record<Token[1], string> = {
  key: 'text-ink-soft',
  op: 'text-ink-muted',
  str: 'text-ink',
  head: 'text-ink font-bold',
  val: 'text-ink underline decoration-hair underline-offset-4',
}

const NOTES = [
  'Cached in all 212 PoPs and refreshed in the background for an hour after it expires.',
  'Order writes skip the cache but still run at the edge, next to the user.',
  'Requests under /v1/eu are only ever served from the 44 PoPs in the EU.',
]

const DOCS = [
  ['Quickstart: an API at the edge', '4 min'],
  ['Cache rules and purge by tag', '7 min'],
  ['Edge function runtime API', 'Reference'],
  ['Moving off a legacy CDN without downtime', '12 min'],
]

export function Docs({ brand }: { brand: string }) {
  const file = `${cliName(brand)}.toml`
  return (
    <Sheet code="KS-005" title="Configuration" labelledBy="bp-docs-title">
      <div className="grid gap-12 @5xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <Heading id="bp-docs-title">One file describes the whole deployment</Heading>
          <p className="mt-5 max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
            Routes, cache rules and data residency live next to your code in <code className="font-bp-mono text-[0.92em] text-ink">{file}</code>. The CLI diffs it against what is
            live and prints the plan before anything changes.
          </p>
          <ul className="mt-8 border-t border-hair">
            {DOCS.map(([title, meta]) => (
              <li key={title} className="border-b border-hair">
                <a href="#" onClick={(e) => e.preventDefault()} className="bp-focus group flex items-center gap-3 py-3.5 text-ink">
                  <Icon name="doc" className="text-ink-muted" />
                  <span className="min-w-0 flex-1 text-[15px] underline-offset-4 group-hover:underline">{title}</span>
                  <span className="shrink-0 font-bp-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase">{meta}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <div className="border border-rule bg-paper-deep/35">
            <div className="flex items-center justify-between border-b border-hair px-4 py-2.5">
              <span className="font-bp-mono text-[12px] text-ink">{file}</span>
              <Label>Detail E · config</Label>
            </div>
            <pre className="overflow-x-auto py-4 font-bp-mono text-[12px] leading-[1.75] @lg:text-[13px]">
              <code className="block min-w-max">
                {CONFIG.map((line, i) => (
                  <span key={i} className="flex items-center pr-4">
                    <span className="w-10 shrink-0 pr-4 text-right text-ink-muted/70 select-none">{i + 1}</span>
                    <span className="flex-1 whitespace-pre">
                      {line.tokens.map(([text, kind], j) => (
                        <span key={j} className={TOKEN_CLASS[kind]}>
                          {text}
                        </span>
                      ))}
                      {line.tokens.length === 0 ? ' ' : null}
                    </span>
                    {line.note ? <Balloon n={line.note} className="ml-6" /> : null}
                  </span>
                ))}
              </code>
            </pre>
          </div>
          <ol className="mt-5 flex flex-col gap-3">
            {NOTES.map((note, i) => (
              <li key={note} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                <Balloon n={i + 1} className="mt-0.5" />
                {note}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Sheet>
  )
}

/* ---------- 结尾与页脚 ---------- */

export function Closing({ brand }: { brand: string }) {
  return (
    <Sheet code="KS-006" title="Next step" labelledBy="bp-cta-title">
      <div className="grid gap-10 @5xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @5xl:items-end">
        <div>
          <Heading id="bp-cta-title">Move one route this afternoon. Move the rest when the graphs agree.</Heading>
          <p className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-ink-soft">
            Point a single path at {brand}, keep your current CDN for everything else and compare medians side by side for a week. The free allowance covers most trials.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Command command={`npx ${cliName(brand)} init`} />
          <div className="flex flex-col gap-3 @lg:flex-row">
            <Button className="@lg:flex-1">
              Deploy free <Icon name="arrow" />
            </Button>
            <Button variant="outline" className="@lg:flex-1">
              Talk to an engineer
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}

const FOOTER = [
  ['Product', ['Network', 'Edge functions', 'Cache', 'Pricing', 'Status']],
  ['Developers', ['Docs', 'CLI reference', 'Changelog', 'Community']],
  ['Company', ['About', 'Careers', 'Security', 'Contact']],
] as const

export function Footer({ brand }: { brand: string }) {
  const cell = 'flex flex-col gap-1.5 px-4 py-3'
  return (
    <footer className="px-4 pb-10 @3xl:px-8 @3xl:pb-14">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 border border-rule @3xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 flex flex-col gap-4 border-b border-hair p-5 @3xl:col-span-1 @3xl:border-r @3xl:border-b-0">
          <BrandMark name={brand} />
          <p className="max-w-xs text-[14px] leading-relaxed text-ink-soft">An edge network for APIs and apps, run by the people who answer the pager.</p>
          <p className="mt-auto inline-flex items-center gap-2 font-bp-mono text-[11px] tracking-[0.08em] text-ink-soft uppercase">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden />
            212 of 212 cities operational
          </p>
        </div>
        {FOOTER.map(([title, links], i) => (
          <nav
            key={title}
            aria-label={title}
            className={cn('border-b border-hair p-5 @3xl:col-span-1 @3xl:border-b-0', i === 0 && 'border-r', i === 1 && '@3xl:border-r', i === 2 && 'col-span-2')}
          >
            <Label>{title}</Label>
            <ul className="mt-4 flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="bp-focus text-[14px] text-ink-soft transition-colors duration-150 hover:text-ink">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 grid grid-cols-2 border-t border-rule @3xl:col-span-4 @3xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className={cn(cell, 'col-span-2 border-b border-hair @3xl:col-span-1 @3xl:border-r @3xl:border-b-0')}>
            <Label>Owner</Label>
            <span className="truncate font-bp-mono text-[12px] text-ink">© 2026 {brand} Networks</span>
          </div>
          <div className={cn(cell, 'border-r border-hair')}>
            <Label>Dwg no.</Label>
            <span className="font-bp-mono text-[12px] text-ink">KS-006</span>
          </div>
          <div className={cn(cell, '@3xl:border-r @3xl:border-hair')}>
            <Label>Rev</Label>
            <span className="font-bp-mono text-[12px] text-ink">C · Nov 2026</span>
          </div>
          <div className={cn(cell, 'col-span-2 border-t border-hair @3xl:col-span-1 @3xl:border-t-0')}>
            <Label>Sheet</Label>
            <span className="font-bp-mono text-[12px] text-ink">6 of 6</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
