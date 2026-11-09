import { cn, cssVars, useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { signatureArt } from './signature'

/* @motif:defaults */
export const defaults = {
  accent: '#27468a',
  paperTone: 'ivory',
  fontPairing: 'literary',
  measure: 62,
  signatureStyle: 'script',
  signDuration: 2.4,
  showPortrait: true,
  heading: 'Why we took the money, and what it won’t change',
}
/* @motif:end */

export type AboutFounderLetterProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 演示用：每隔多少秒重新签一次。不传时，签名在读者看到它时写一次。 */
  replayEvery?: number
}

/* ---------- 内容：虚构的小作坊记账软件 Osier ---------- */

const SIGNER = { name: 'Mara Lindell', initials: 'ML', title: 'Founder & CEO, Osier', place: 'Porto', date: '9 November 2026', iso: '2026-11-09', issue: 'Letters · No. 3' }

const LETTER = {
  lead: 'Seven years ago',
  first:
    " I kept the books for my parents’ pottery studio, reconciling kiln-time invoices by hand every Sunday night. Osier began as the spreadsheet I built to stop doing that. It now runs the accounts for 3,200 small workshops, and this morning we announced a $9M Series A led by Northfold.",
  second:
    'I want to be plain about what the money is for. It pays for twelve people: support staff who answer within the hour, and engineers who will finally rebuild bank sync so it stops breaking on the first of the month. It does not pay for a sales team, and it does not change your price.',
  quote: 'If a feature saves you an hour a week, it ships. If it only helps us, it waits.',
  third:
    'The rule from our first whiteboard still holds: if a feature saves you an hour a week, it ships; if it only helps us, it waits. Thank you for every bug report sent at midnight. Most of them are on the roadmap now.',
  closing: 'With gratitude,',
}

/* ---------- 颜色：任何墨水色在任何纸上都要读得清 ---------- */

type Rgb = [number, number, number]

function parseHex(value: string, fallback: Rgb): Rgb {
  let h = value.replace('#', '').trim()
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (h.length < 6 || Number.isNaN(n)) return fallback
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance([r, g, b]: Rgb) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: Rgb, b: Rgb) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const toHex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** 把墨水色往正文色方向推，直到对纸色的对比度达标：浅纸上的亮黄会被压暗，深纸上的深蓝会被提亮。 */
function legible(color: Rgb, paper: Rgb, ink: Rgb, target: number) {
  for (let step = 0; step <= 24; step++) {
    const t = step / 24
    const c: Rgb = [color[0] + (ink[0] - color[0]) * t, color[1] + (ink[1] - color[1]) * t, color[2] + (ink[2] - color[2]) * t]
    if (contrast(c, paper) >= target) return toHex(c)
  }
  return toHex(ink)
}

type Paper = { paper: string; ink: string; muted: string; rule: string; edge: string; grain: number }

const PAPERS: Record<string, Paper> = {
  ivory: { paper: '#f4eee2', ink: '#1f1b16', muted: 'rgba(31,27,22,0.66)', rule: 'rgba(31,27,22,0.16)', edge: 'rgba(122,92,46,0.12)', grain: 0.07 },
  linen: { paper: '#eeefeb', ink: '#16181b', muted: 'rgba(22,24,27,0.66)', rule: 'rgba(22,24,27,0.15)', edge: 'rgba(64,72,84,0.1)', grain: 0.06 },
  kraft: { paper: '#ddcba9', ink: '#261d13', muted: 'rgba(38,29,19,0.76)', rule: 'rgba(38,29,19,0.22)', edge: 'rgba(96,64,22,0.18)', grain: 0.1 },
  night: { paper: '#17181c', ink: '#ece6d9', muted: 'rgba(236,230,217,0.66)', rule: 'rgba(236,230,217,0.15)', edge: 'rgba(0,0,0,0.4)', grain: 0.05 },
}

/* ---------- 字体搭配 ---------- */

type Pairing = {
  display: string
  displayWeight: number
  tracking: string
  titleScale: number
  body: string
  size: string
  leading: number
  cap: string
  capWeight: number
  quote: string
  quoteWeight: number
  /** 引文字号（相对正文）：Instrument Serif 和小字号的打字稿需要放大一些 */
  quoteSize: string
}

const FRAUNCES = "'Fraunces Variable', 'Iowan Old Style', Georgia, 'Songti SC', serif"
const NEWSREADER = "'Newsreader Variable', 'Iowan Old Style', Georgia, 'Songti SC', serif"
const INSTRUMENT = "'Instrument Serif', 'Iowan Old Style', Georgia, 'Songti SC', serif"
const PLAYFAIR = "'Playfair Display Variable', 'Didot', Georgia, 'Songti SC', serif"
const GEIST = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const INTER_TIGHT = "'Inter Tight Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const PLEX_MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, 'PingFang SC', monospace"

const PAIRINGS: Record<string, Pairing> = {
  literary: { display: FRAUNCES, displayWeight: 420, tracking: '-0.018em', titleScale: 1, body: NEWSREADER, size: '1.125rem', leading: 1.6, cap: FRAUNCES, capWeight: 500, quote: FRAUNCES, quoteWeight: 380, quoteSize: '1.32em' },
  modern: { display: INSTRUMENT, displayWeight: 400, tracking: '-0.01em', titleScale: 1.14, body: GEIST, size: '1rem', leading: 1.7, cap: INSTRUMENT, capWeight: 400, quote: INSTRUMENT, quoteWeight: 400, quoteSize: '1.55em' },
  editorial: { display: PLAYFAIR, displayWeight: 500, tracking: '-0.015em', titleScale: 0.98, body: INTER_TIGHT, size: '1.03rem', leading: 1.66, cap: PLAYFAIR, capWeight: 600, quote: PLAYFAIR, quoteWeight: 420, quoteSize: '1.3em' },
  typewriter: { display: PLEX_MONO, displayWeight: 500, tracking: '-0.035em', titleScale: 0.8, body: PLEX_MONO, size: '0.9rem', leading: 1.75, cap: FRAUNCES, capWeight: 500, quote: NEWSREADER, quoteWeight: 400, quoteSize: '1.5em' },
}

/* ---------- 小图形 ---------- */

/** 虚构品牌 Osier（柳条）的标记：墨水色圆章里一片留白的柳叶。 */
function OsierMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M6.6 17.4C6.4 11 10.4 6.8 17.4 6.6c.2 6.4-3.8 10.6-10.8 10.8Z" fill="var(--afl-paper)" />
      <path d="M7.4 16.6 14.2 9.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function Portrait({ initials, font }: { initials: string; font: string }) {
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-full text-[1.05rem] italic"
      style={{
        fontFamily: font,
        color: 'var(--afl-ink-accent)',
        background: 'radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--afl-accent) 10%, var(--afl-paper)), color-mix(in oklab, var(--afl-accent) 24%, var(--afl-paper)))',
        boxShadow: '0 0 0 3px var(--afl-paper), 0 0 0 4px var(--afl-rule)',
      }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

/* ---------- 签名：按笔画长度分配时间，一笔一笔写出来 ---------- */

const PEN_LIFT = 0.12
/** 签名框高度（rem）：首字母那款字少、底下还有一道长线，框要高一些才和全名一样醒目 */
const SIG_HEIGHT: Record<string, number> = { script: 4.5, quick: 4.5, initials: 5.3 }
const START_DELAY = 0.45

type Slot = { start: number; span: number }

/**
 * 驱动签名动画的帧循环。只在「正在写」的时候挂载：页面里写完一次就卸掉，
 * 静态的关于页不会一直跑 requestAnimationFrame；演示重播时一直挂着。
 */
function SignatureDriver({
  host,
  replayEvery,
  duration,
  end,
  paint,
  onDone,
}: {
  host: RefObject<HTMLDivElement | null>
  replayEvery?: number
  duration: number
  end: number
  paint: (elapsed: number, opacity: number) => void
  onDone: () => void
}) {
  useFrameLoop(
    host,
    ({ time }) => {
      if (replayEvery) {
        const cycle = Math.max(replayEvery, duration + START_DELAY + 1.6)
        const t = time % cycle
        const fade = Math.min(1, Math.max(0, (cycle - t) / 0.55))
        paint(t - START_DELAY, fade)
        return
      }
      // 挂载时 time 从 0 起算，稍等一下再落笔。
      const elapsed = time - 0.2
      paint(elapsed, 1)
      if (elapsed > end) onDone()
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
  return null
}

function Signature({ variant, duration, replayEvery, label }: { variant: string; duration: number; replayEvery?: number; label: string }) {
  const art = useMemo(() => signatureArt(variant), [variant])
  const host = useRef<HTMLDivElement>(null)
  const group = useRef<SVGGElement>(null)
  const reduced = usePrefersReducedMotion()
  const [reached, setReached] = useState(false)
  const [done, setDone] = useState(false)
  const painted = useRef('')

  // 每一笔的开始时刻和用时：总时长扣掉提笔停顿后按长度分。
  const schedule = useMemo<Slot[]>(() => {
    const total = art.strokes.reduce((sum, s) => sum + s.length, 0)
    const lifts = PEN_LIFT * (art.strokes.length - 1)
    const writing = Math.max(duration * 0.6, duration - lifts)
    const lift = (duration - writing) / Math.max(1, art.strokes.length - 1)
    let t = 0
    return art.strokes.map((s) => {
      const span = Math.max(0.05, (s.length / total) * writing)
      const slot = { start: t, span }
      t += span + lift
      return slot
    })
  }, [art, duration])
  const last = schedule[schedule.length - 1]
  const end = last ? last.start + last.span : 0

  // 进入视口（露出 60%）才开始写，只写一次；演示时改成按周期重播。
  useEffect(() => {
    if (replayEvery || reduced) return
    const el = host.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReached(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [replayEvery, reduced])

  const paint = (elapsed: number, opacity: number) => {
    const g = group.current
    if (!g) return
    // 没开始或已写完时每帧的画面都一样，跳过重复的样式写入。
    const key = `${variant}|${duration}|${Math.min(Math.max(elapsed, -1), end + 0.01).toFixed(3)}|${opacity.toFixed(3)}`
    if (key === painted.current) return
    painted.current = key
    g.style.opacity = opacity.toFixed(3)
    const paths = g.querySelectorAll<SVGPathElement>('path[data-stroke]')
    paths.forEach((path) => {
      const slot = schedule[Number(path.dataset.stroke)]
      if (!slot) return
      const raw = Math.min(1, Math.max(0, (elapsed - slot.start) / slot.span))
      // 笔速：起笔稍慢、中段快、收笔稍慢，但不完全停住。
      const p = raw * 0.7 + raw * raw * (3 - 2 * raw) * 0.3
      path.style.strokeDashoffset = (1 - p).toFixed(4)
      path.style.opacity = raw > 0 ? '1' : '0'
    })
  }

  // 静止画面（减少动态效果，或页面里已经写完）：笔画由下面的初始样式画全，这里只清掉重播淡出留下的组透明度。
  const still = reduced || (!replayEvery && done)
  useEffect(() => {
    if (!still) return
    painted.current = ''
    if (group.current) group.current.style.opacity = '1'
  }, [still])
  const writing = !still && (replayEvery ? true : reached)

  const hidden = !still
  const h = SIG_HEIGHT[variant] ?? 4.5
  return (
    <div ref={host} role="img" aria-label={label} className="-ml-1 max-w-full shrink-0" style={{ height: `${h}rem`, width: `${((art.width / art.height) * h).toFixed(2)}rem` }}>
      {writing && <SignatureDriver host={host} replayEvery={replayEvery} duration={duration} end={end} paint={paint} onDone={() => setDone(true)} />}
      <svg viewBox={art.viewBox} className="block h-full w-full" preserveAspectRatio="xMinYMid meet" fill="none" stroke="var(--afl-ink-accent)" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <g ref={group}>
          {art.strokes.map((s, i) => (
            <g key={`${variant}-${i}`}>
              <path data-stroke={i} d={s.d} pathLength={1} strokeWidth={1.3} strokeDasharray="1 2" style={{ strokeDashoffset: hidden ? 1 : 0, opacity: hidden ? 0 : 1 }} />
              {/* 同一笔错开半个单位再描一遍细线：斜向笔画变粗、横向不变，像钢笔尖 */}
              <path data-stroke={i} d={s.d} pathLength={1} strokeWidth={0.75} strokeDasharray="1 2" transform="translate(0.45 0.35)" style={{ strokeDashoffset: hidden ? 1 : 0, opacity: hidden ? 0 : 1 }} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ---------- 区块 ---------- */

/** 创始人来信：信头、下沉首字母、页边引文、手写签名和署名。 */
export function AboutFounderLetter({ className, style, replayEvery, ...props }: AboutFounderLetterProps) {
  const { accent, paperTone, fontPairing, measure, signatureStyle, signDuration, showPortrait, heading } = { ...defaults, ...props }
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const tone = PAPERS[paperTone] ?? PAPERS.ivory!
  const pair = PAIRINGS[fontPairing] ?? PAIRINGS.literary!
  const width = Math.min(72, Math.max(50, measure))

  const vars = useMemo(() => {
    const paper = parseHex(tone.paper, [244, 238, 226])
    const ink = parseHex(tone.ink, [31, 27, 22])
    const raw = parseHex(accent, [39, 70, 138])
    return {
      '--afl-paper': tone.paper,
      '--afl-ink': tone.ink,
      '--afl-muted': tone.muted,
      '--afl-rule': tone.rule,
      '--afl-accent': toHex(raw),
      // 签名、首字母和引号：字大但笔画细，统一按正文的 4.5:1 要求。
      '--afl-ink-accent': legible(raw, paper, ink, 4.5),
      '--afl-measure': `${width}ch`,
      '--afl-title-scale': pair.titleScale,
      '--afl-cap': pair.cap,
      '--afl-cap-weight': pair.capWeight,
    }
  }, [accent, tone, pair, width])

  const label = `font-medium uppercase tracking-[0.16em] text-[0.6875rem]`
  // 标题可以清空：那时不渲染空的 h2，区块改用署名人做无障碍名称。
  const title = heading.trim()

  return (
    <section
      aria-labelledby={title ? `${uid}-title` : undefined}
      aria-label={title ? undefined : `Letter from ${SIGNER.name}`}
      className={cn('afl-root relative isolate w-full overflow-hidden', className)}
      style={cssVars(vars, { background: tone.paper, color: tone.ink, ...style })}
    >
      {/* 纸面：四边略暗的晕影 + 一层很淡的纤维噪点（静态，只栅格化一次） */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(120% 90% at 50% 40%, transparent 55%, ${tone.edge})` }} aria-hidden />
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full" style={{ opacity: tone.grain }} aria-hidden>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${uid}-grain)`} />
      </svg>

      <div className="px-5 py-12 sm:px-10 sm:py-11" style={{ fontFamily: pair.body, fontSize: pair.size, lineHeight: pair.leading }}>
        <article className="afl-article">
          <header className="afl-head flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b pb-3.5" style={{ borderColor: 'var(--afl-rule)' }}>
            <span className="flex items-center gap-2" style={{ color: 'var(--afl-ink-accent)' }}>
              <OsierMark className="size-[1.375rem]" />
              <span className="text-[1.15rem] leading-none" style={{ fontFamily: pair.display, fontWeight: pair.displayWeight, color: 'var(--afl-ink)', letterSpacing: '-0.01em' }}>
                Osier
              </span>
            </span>
            <span className={cn(label, 'afl-meta leading-none')} style={{ color: 'var(--afl-muted)' }}>
              <span>{SIGNER.issue}</span>
              <span className="afl-dot" aria-hidden>·</span>
              <time dateTime={SIGNER.iso}>
                {SIGNER.place}, {SIGNER.date}
              </time>
            </span>
          </header>

          {title && (
            <h2 id={`${uid}-title`} className="afl-title mt-8 mb-1" style={{ fontFamily: pair.display, fontWeight: pair.displayWeight, letterSpacing: pair.tracking }}>
              {title}
            </h2>
          )}

          <p className="afl-p afl-drop afl-r3">
            <span className="afl-lead">{LETTER.lead}</span>
            {LETTER.first}
          </p>
          {/* 窄屏时引文排在第一段后、引出第三段里的那条规矩；宽屏时由 CSS 放进页边栏（第 4–5 行），DOM 顺序不影响。 */}
          <aside className="afl-quote" aria-hidden>
            <svg viewBox="0 0 32 24" className="afl-quote-mark mb-2 h-5 w-auto" fill="var(--afl-ink-accent)">
              <path d="M0 24V14.2C0 6.6 4 1.6 11.4 0l1.4 2.9C8.7 4.3 6.6 7 6.4 10.6H12V24H0Zm18.6 0V14.2C18.6 6.6 22.6 1.6 30 0l1.4 2.9c-4.1 1.4-6.2 4.1-6.4 7.7h5.6V24H18.6Z" />
            </svg>
            <p className="text-pretty italic" style={{ fontFamily: pair.quote, fontWeight: pair.quoteWeight, fontSize: pair.quoteSize, lineHeight: 1.3, letterSpacing: '-0.005em' }}>
              {LETTER.quote}
            </p>
          </aside>
          <p className="afl-p afl-r4">{LETTER.second}</p>
          <p className="afl-p afl-r5">{LETTER.third}</p>

          <footer className="afl-r6 mt-6">
            <p style={{ color: 'var(--afl-muted)' }}>{LETTER.closing}</p>
            <div className="mt-1 flex flex-wrap items-end gap-x-10 gap-y-3">
              <Signature variant={signatureStyle} duration={Math.min(4, Math.max(1.2, signDuration))} replayEvery={replayEvery} label={`Signed, ${SIGNER.name}`} />
              <div className="flex items-center gap-3.5 pb-1.5">
                {showPortrait && <Portrait initials={SIGNER.initials} font={pair.cap} />}
                <div className="leading-tight">
                  <p className="font-semibold" style={{ fontSize: '0.95em' }}>
                    {SIGNER.name}
                  </p>
                  <p className="mt-1" style={{ color: 'var(--afl-muted)', fontSize: '0.85em' }}>
                    {SIGNER.title}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </section>
  )
}
