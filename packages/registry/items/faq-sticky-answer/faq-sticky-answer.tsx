import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { Fragment, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  heading: 'Answers for teams that ship behind flags',
  accent: '#5eead4',
  tone: 'dark',
  font: 'sans',
  listStyle: 'numbered',
  panelStyle: 'card',
  transition: 'rise',
  radius: 16,
}
/* @motif:end */

export type FaqStickyAnswerProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控：当前选中的问题序号；窄屏折叠成手风琴时 null 表示全部收起。不传时组件自己管理。 */
  active?: number | null
  onActiveChange?: (index: number | null) => void
}

/* ---------- 颜色：任何主色都要读得清 ---------- */

type Rgb = [number, number, number]

function parseHex(hex: string): Rgb {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  const n = Number.parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [94, 234, 212]
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

const hex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/** 把主色往前景色方向推，直到对底色的对比度达标：深底上的深色主色会被提亮，浅底上的亮黄会被压暗。 */
function legible(color: Rgb, bg: Rgb, toward: Rgb, target: number) {
  for (let step = 0; step <= 20; step++) {
    const t = step / 20
    const c: Rgb = [color[0] + (toward[0] - color[0]) * t, color[1] + (toward[1] - color[1]) * t, color[2] + (toward[2] - color[2]) * t]
    if (contrast(c, bg) >= target) return hex(c)
  }
  return hex(toward)
}

const TONES = {
  dark: {
    bg: '#0b0d10',
    fg: '#f2f3f5',
    surface: '#13161b',
    muted: 'rgba(242,243,245,0.62)',
    line: 'rgba(255,255,255,0.09)',
    shadow: '0 40px 90px -50px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.045)',
  },
  light: {
    bg: '#f5f4f0',
    fg: '#121315',
    surface: '#ffffff',
    muted: 'rgba(18,19,21,0.64)',
    line: 'rgba(18,19,21,0.11)',
    shadow: '0 34px 70px -46px rgba(40,34,20,0.45), 0 1px 2px rgba(40,34,20,0.06)',
  },
} as const

function palette(tone: string, accent: string): CSSProperties {
  const t = tone === 'light' ? TONES.light : TONES.dark
  const bg = parseHex(t.bg)
  const fg = parseHex(t.fg)
  const raw = parseHex(accent)
  // 填充色（指示条、序号底）至少 3:1；文字色至少 4.8:1，给浅色着色面板留余量。
  const fill = legible(raw, bg, fg, 3)
  const text = legible(raw, bg, fg, 4.8)
  const fillRgb = parseHex(fill)
  const ink = contrast(fillRgb, [255, 255, 255]) >= contrast(fillRgb, [10, 11, 13]) ? '#ffffff' : '#0a0b0d'
  return {
    '--s-bg': t.bg,
    '--s-fg': t.fg,
    '--s-sf': t.surface,
    '--s-mu': t.muted,
    '--s-ln': t.line,
    '--s-sh': t.shadow,
    '--s-ac': fill,
    '--s-at': text,
    '--s-on': ink,
  } as CSSProperties
}

/* ---------- 字体 ---------- */

const HEADING = {
  sans: { family: "'Inter Tight Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.035em' },
  serif: { family: "'Newsreader Variable', 'Times New Roman', 'Songti SC', serif", weight: 400, tracking: '-0.018em' },
  grotesk: { family: "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", weight: 600, tracking: '-0.04em' },
} as const

const BODY = "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

/* ---------- 内容：一个虚构的功能开关服务 Coldframe ---------- */

const box: CSSProperties = { borderColor: 'var(--s-ln)', background: 'color-mix(in oklab, var(--s-fg) 3.5%, transparent)', borderRadius: 'var(--s-r2)' }

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 py-1 @[26rem]:w-14 @[26rem]:flex-col @[26rem]:gap-1 @[26rem]:py-0" aria-hidden>
      <span className="text-[10.5px]" style={{ fontFamily: MONO, color: 'var(--s-at)' }}>
        {label}
      </span>
      <svg viewBox="0 0 40 10" className="hidden h-2.5 w-10 @[26rem]:block" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--s-mu)' }}>
        <path d="M1 5h37M34 1.5 38 5l-4 3.5" />
      </svg>
      <svg viewBox="0 0 10 14" className="h-3.5 w-2.5 @[26rem]:hidden" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--s-mu)' }}>
        <path d="M5 1v11M1.5 8.5 5 12l3.5-3.5" />
      </svg>
    </div>
  )
}

function Flow() {
  const nodes = [
    { title: 'Dashboard', sub: 'you edit a rule' },
    { title: 'Edge relay', sub: 'streams the diff' },
    { title: 'Your service', sub: 'SDK evaluates', on: true },
  ]
  return (
    <div className="@container">
      <div className="flex flex-col items-stretch border p-3 @[26rem]:flex-row @[26rem]:items-center" style={box}>
        {nodes.map((n, i) => (
          <Fragment key={n.title}>
            {i > 0 && <Arrow label={i === 1 ? '~1 s' : 'push'} />}
            <div
              className="min-w-0 flex-1 border px-3 py-2.5"
              style={{
                borderColor: n.on ? 'color-mix(in oklab, var(--s-ac) 55%, transparent)' : 'var(--s-ln)',
                background: n.on ? 'color-mix(in oklab, var(--s-ac) 12%, var(--s-bg))' : 'var(--s-bg)',
                borderRadius: 'var(--s-r3)',
              }}
            >
              <div className="flex items-center gap-1.5 text-[12.5px] font-medium">
                {n.on && <span className="size-1.5 shrink-0 rounded-full" style={{ background: 'var(--s-ac)' }} />}
                <span className="truncate">{n.title}</span>
              </div>
              <div className="mt-0.5 truncate text-[11.5px]" style={{ color: 'var(--s-mu)' }}>
                {n.sub}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function Code() {
  const k = { color: 'var(--s-at)' }
  const m = { color: 'var(--s-mu)' }
  return (
    <pre className="overflow-x-auto border px-4 py-3.5 text-[12.5px] leading-[1.7]" style={{ ...box, fontFamily: MONO }}>
      <code>
        <span style={k}>const</span> flags = <span style={k}>await</span> coldframe.init({'{'}
        {'\n  '}key: env.CF_SERVER_KEY,
        {'\n  '}fallback: <span style={m}>"./flags.snapshot.json"</span>,
        {'\n'}
        {'}'})
      </code>
    </pre>
  )
}

function Plans() {
  const rows = [
    ['Starter', '10,000', 'Upgrade to Team'],
    ['Team', '250,000', '$0.40 per 1,000'],
    ['Scale', '5M+', 'Volume pricing'],
  ]
  return (
    <div className="overflow-hidden border" style={box}>
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr style={{ color: 'var(--s-mu)' }}>
            <th className="px-3.5 py-2 font-medium">Plan</th>
            <th className="px-3.5 py-2 font-medium">Included</th>
            <th className="px-3.5 py-2 font-medium">Beyond that</th>
          </tr>
        </thead>
        <tbody style={{ fontFamily: MONO }}>
          {rows.map(([plan, included, over], i) => (
            <tr key={plan} className="border-t" style={{ borderColor: 'var(--s-ln)' }}>
              <td className="px-3.5 py-2" style={{ fontFamily: BODY, fontWeight: 500, color: i === 1 ? 'var(--s-at)' : undefined }}>
                {plan}
              </td>
              <td className="px-3.5 py-2 tabular-nums">{included}</td>
              <td className="px-3.5 py-2 tabular-nums" style={{ color: 'var(--s-mu)' }}>
                {over}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Ramp() {
  const steps = [
    { day: 'Mon', pct: 5 },
    { day: 'Tue', pct: 25 },
    { day: 'Thu', pct: 50 },
    { day: 'Mon', pct: 100 },
  ]
  const now = 1
  return (
    <div className="border px-4 pt-3.5 pb-3" style={box}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[11.5px]" style={{ fontFamily: MONO }}>
        <span>checkout-v2 · eu-west</span>
        <span style={{ color: 'var(--s-mu)' }}>
          guard 5xx &lt; 0.5%
        </span>
      </div>
      <div className="mt-3 flex gap-2 text-[11px] tabular-nums" style={{ fontFamily: MONO }}>
        {steps.map((s, i) => (
          <span key={i} className="flex-1" style={{ color: i === now ? 'var(--s-at)' : 'var(--s-mu)' }}>
            {s.pct}%
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex h-12 items-end gap-2" aria-hidden>
        {steps.map((s, i) => (
          <span
            key={i}
            className={cn('block flex-1 border', i > now && 'border-dashed')}
            style={{
              // 平方根刻度：5% 的台阶也看得见，100% 正好顶满。
              height: `${Math.round(18 + Math.sqrt(s.pct / 100) * 82)}%`,
              borderRadius: 'calc(var(--s-r3) * 0.6)',
              borderColor: i <= now ? 'transparent' : 'color-mix(in oklab, var(--s-fg) 22%, transparent)',
              background: i < now ? 'color-mix(in oklab, var(--s-ac) 40%, transparent)' : i === now ? 'var(--s-ac)' : 'transparent',
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-[11px]" style={{ color: 'var(--s-mu)' }}>
        {steps.map((s, i) => (
          <span key={i} className="flex-1" style={i === now ? { color: 'var(--s-fg)' } : undefined}>
            {s.day}
            {i === now ? ' · now' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function Links({ items, prefix }: { items: [string, string][]; prefix: string }) {
  return (
    <div className="@container">
      <ul className="grid gap-1.5 @[24rem]:grid-cols-2">
        {items.map(([name, meta]) => (
          <li key={name}>
            <a
              href={`#${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="group flex items-center gap-2 border px-3 py-2 text-[13px] transition-[border-color,background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ ...box, borderRadius: 'var(--s-r3)', outlineColor: 'var(--s-at)' }}
            >
              <span className="truncate font-medium">{name}</span>
              <span className="shrink-0 text-[11px]" style={{ fontFamily: MONO, color: 'var(--s-mu)' }}>
                {meta}
              </span>
              <svg viewBox="0 0 16 16" className="ml-auto size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--s-at)' }} aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Sdks() {
  return (
    <Links
      prefix="sdk"
      items={[
        ['Node.js & Deno', 'v6.4'],
        ['Go', 'v3.1'],
        ['Python', 'v5.0'],
        ['Java & Kotlin', 'v4.2'],
        ['Swift', 'v2.8'],
        ['React Native', 'v2.3'],
      ]}
    />
  )
}

function Trust() {
  return (
    <Links
      prefix="trust"
      items={[
        ['SOC 2 Type II report', 'Aug 2026'],
        ['Penetration test summary', 'Mar 2026'],
        ['Data processing agreement', 'v4'],
        ['Subprocessor list', '9 vendors'],
      ]}
    />
  )
}

function Envs() {
  const rows = [
    { env: 'production', note: 'counted', on: true },
    { env: 'staging', note: 'free' },
    { env: 'qa', note: 'free' },
    { env: 'preview-*', note: 'free, unlimited' },
  ]
  return (
    <ul className="divide-y border text-[12.5px]" style={{ ...box, fontFamily: MONO }}>
      {rows.map((r) => (
        <li key={r.env} className="flex items-center gap-3 px-3.5 py-2" style={{ borderColor: 'var(--s-ln)' }}>
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: r.on ? 'var(--s-ac)' : 'color-mix(in oklab, var(--s-fg) 24%, transparent)' }} aria-hidden />
          <span className="min-w-0 flex-1 truncate">{r.env}</span>
          <span className="text-[12px] whitespace-nowrap" style={{ color: r.on ? 'var(--s-at)' : 'var(--s-mu)' }}>
            {r.note}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Regions() {
  const regions = [
    { code: 'eu-1', city: 'Frankfurt', on: true },
    { code: 'us-1', city: 'Virginia' },
    { code: 'ap-1', city: 'Singapore' },
  ]
  return (
    <div className="@container">
      <ul className="grid gap-1.5 @[22rem]:grid-cols-3">
        {regions.map((r) => (
          <li
            key={r.code}
            className="flex items-center justify-between gap-2 border px-3 py-2.5 @[22rem]:flex-col @[22rem]:items-start @[22rem]:gap-1"
            style={{
              ...box,
              borderRadius: 'var(--s-r3)',
              borderColor: r.on ? 'color-mix(in oklab, var(--s-ac) 55%, transparent)' : 'var(--s-ln)',
              background: r.on ? 'color-mix(in oklab, var(--s-ac) 12%, var(--s-bg))' : box.background,
            }}
          >
            <span className="text-[11.5px]" style={{ fontFamily: MONO, color: r.on ? 'var(--s-at)' : 'var(--s-mu)' }}>
              {r.code}
            </span>
            <span className="text-[13px] font-medium">
              {r.city}
              {r.on && <span className="ml-1.5 text-[11.5px] font-normal" style={{ color: 'var(--s-mu)' }}>· yours</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Audit() {
  const rows = [
    { time: '14:02', flag: 'checkout-v2', who: 'maya.r + ken.o', change: '5% → 25%' },
    { time: '11:37', flag: 'search-rerank', who: 'ken.o', change: 'off → on' },
    { time: '09:15', flag: 'pricing-page-b', who: 'guard', change: 'paused' },
  ]
  return (
    <div className="@container">
      <ol className="divide-y border text-[12.5px]" style={box}>
        {rows.map((r) => (
          <li key={r.time} className="flex items-baseline gap-3 px-3.5 py-2" style={{ borderColor: 'var(--s-ln)', fontFamily: MONO }}>
            <span className="tabular-nums" style={{ color: 'var(--s-mu)' }}>
              {r.time}
            </span>
            <span className="min-w-0 flex-1 truncate">{r.flag}</span>
            <span className="hidden truncate text-[11.5px] @[24rem]:block" style={{ color: 'var(--s-mu)', fontFamily: BODY }}>
              {r.who}
            </span>
            <span className="text-[12px] whitespace-nowrap" style={{ color: 'var(--s-at)' }}>
              {r.change}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

interface Faq {
  q: string
  a: string[]
  extra?: () => ReactNode
}

const GROUPS: { name: string; items: Faq[] }[] = [
  {
    name: 'Architecture',
    items: [
      {
        q: 'Are flags evaluated on your servers or ours?',
        a: [
          'On yours. The SDK downloads your ruleset at startup and evaluates every flag in-process, in about 40 microseconds. User attributes never leave your network.',
          'Rule changes stream to each connected SDK over one long-lived connection, so a toggle in the dashboard reaches production in roughly a second.',
        ],
        extra: Flow,
      },
      {
        q: 'What happens to our app if Coldframe is down?',
        a: [
          'Nothing your users would notice. Each SDK keeps serving the last ruleset it received and reconnects in the background; evaluation never waits on the network.',
          'For cold starts during an outage, point the SDK at the snapshot your CI writes on every deploy.',
        ],
        extra: Code,
      },
      {
        q: 'Can we ramp a percentage inside one region?',
        a: [
          'Yes. Rules run top to bottom, so target eu-west first and ramp a percentage inside it. Bucketing is sticky: whoever gets the new checkout at 5% keeps it at 25%.',
          'Attach a guard and a step pauses itself when errors cross your line.',
        ],
        extra: Ramp,
      },
      {
        q: 'Which languages have an official SDK?',
        a: [
          'Twelve, all open source and released under semver. Server SDKs evaluate locally; browser and mobile SDKs receive only the flags that user may see, already evaluated, so your targeting rules stay private.',
        ],
        extra: Sdks,
      },
    ],
  },
  {
    name: 'Billing',
    items: [
      {
        q: 'How is usage billed?',
        a: [
          'By monthly active contexts: each distinct user, device or tenant that evaluates a flag in a calendar month counts once, however many flags it checks.',
          'Background jobs are free. Overage is billed at your plan rate, never throttled.',
        ],
        extra: Plans,
      },
      {
        q: 'Do staging and preview environments count?',
        a: [
          'No. Only contexts evaluated in environments marked as production are counted. Staging, QA and every preview environment your CI spins up are free.',
          'You choose which environments are production in workspace settings; a change applies from the next billing month.',
        ],
        extra: Envs,
      },
      {
        q: 'Can we pay annually or by invoice?',
        a: [
          'Yes. Annual plans are paid up front at 15% off, by card or by invoice on 30-day terms. Invoices carry your PO number and VAT ID, and can be split across cost centers.',
          'Moving from monthly to annual is prorated to the day, so you never pay twice for the same week.',
        ],
      },
      {
        q: 'Is there a free plan for open-source projects?',
        a: [
          'Yes. Public repositories under an OSI-approved license get the Team plan free, up to one million contexts a month, with no seat limit.',
          'Apply from the billing page with a link to the repository. Most applications are approved within two working days and renew every year.',
        ],
      },
    ],
  },
  {
    name: 'Security',
    items: [
      {
        q: 'Who can change a flag in production?',
        a: [
          'Only the roles you allow. Production can require a second approver, and every change lands in the audit log with the diff, the author and the reason they gave.',
          'Logs stream to your SIEM and are kept for 400 days on Scale.',
        ],
        extra: Audit,
      },
      {
        q: 'Where is our data stored?',
        a: [
          'In the region you pick when the workspace is created, and nowhere else: rulesets, audit logs and backups stay there. Moving regions later is a supported, zero-downtime migration.',
          'Because evaluation happens in your SDKs, user attributes are never stored by us at all.',
        ],
        extra: Regions,
      },
      {
        q: 'Do you support single sign-on and SCIM?',
        a: [
          'Yes, on Team and Scale. Any SAML 2.0 or OpenID Connect identity provider works, and you can enforce SSO for everyone except two break-glass owners.',
          'SCIM keeps roles in sync with your directory. Remove someone there and their dashboard session and personal API tokens are revoked within a minute.',
        ],
      },
      {
        q: 'Can we read your SOC 2 report?',
        a: [
          'Yes. Coldframe is audited for SOC 2 Type II every year. The current report, our latest penetration test and the DPA are in the trust center, under a click-through NDA.',
        ],
        extra: Trust,
      },
    ],
  },
]

/** 全部问题按分组展平：序号跨分组连续，分组名就是答案面板上的标签。 */
const FAQS = GROUPS.flatMap((g, group) => g.items.map((f) => ({ ...f, tag: g.name, group })))

/** 演示的自动播放要知道一共有几个问题。 */
export const faqCount = FAQS.length

/* ---------- 小图标 ---------- */

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} />
    </svg>
  )
}

function Plus({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 motion-reduce:transition-none" style={{ transform: open ? 'rotate(45deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

/* ---------- 切换动画 ---------- */

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** 不在当前位置的答案停在哪里：序号在前的往上 / 往左，在后的往下 / 往右，所以前进后退方向自然相反。 */
function restingStyle(kind: string, side: number, reduced: boolean): CSSProperties {
  if (reduced) return {}
  if (kind === 'rise') return { transform: `translate3d(0, ${side * 10}px, 0)` }
  if (kind === 'slide') return { transform: `translate3d(${side * 22}px, 0, 0)` }
  if (kind === 'blur') return { transform: 'scale(0.985)', filter: 'blur(7px)' }
  return {}
}

function answerStyle(kind: string, on: boolean, side: number, reduced: boolean): CSSProperties {
  if (reduced) {
    return on
      ? { opacity: 1, visibility: 'visible', transition: 'opacity 140ms ease-out, visibility 0s linear 0s' }
      : { opacity: 0, visibility: 'hidden', transition: 'opacity 100ms ease-out, visibility 0s linear 100ms' }
  }
  const blur = kind === 'blur'
  if (on) {
    return {
      opacity: 1,
      visibility: 'visible',
      transform: 'none',
      filter: blur ? 'blur(0px)' : undefined,
      transition: `opacity 300ms ${EASE} 90ms, transform 460ms ${EASE} 60ms${blur ? `, filter 380ms ${EASE} 60ms` : ''}, visibility 0s linear 0s`,
    }
  }
  return {
    opacity: 0,
    visibility: 'hidden',
    ...restingStyle(kind, side, reduced),
    transition: `opacity 150ms ease-out, transform 320ms ${EASE}${blur ? ', filter 220ms ease-out' : ''}, visibility 0s linear 320ms`,
  }
}

/* ---------- 组件 ---------- */

/** 容器宽度到这里才左右分栏；再窄的话问题列只剩一两个词宽，答案里的流程图和表格也挤不下。 */
const SPLIT = 860

/**
 * 左边是分组编号的问题列表，右边一块粘性答案面板：点击或用方向键切换时答案短暂交叉淡化；容器窄于 860px 时折回手风琴。
 * 布局切换全靠容器查询，服务端渲染的首帧就是对的；JS 只按量到的宽度切换 ARIA 模式（选项卡 / 手风琴）。
 */
export function FaqStickyAnswer({ className, style, active: controlled, onActiveChange, ...props }: FaqStickyAnswerProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const font = HEADING[o.font as keyof typeof HEADING] ?? HEADING.sans
  const uid = useId()
  const n = FAQS.length
  const radius = Math.max(0, Math.min(28, o.radius))

  const rootRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLLIElement | null)[]>([])
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [inner, setInner] = useState<number | null>(0)
  const raw = controlled !== undefined ? controlled : inner
  const selected = raw == null ? null : Math.max(0, Math.min(n - 1, raw))
  const shown = selected ?? 0
  const select = (i: number | null) => {
    setInner(i)
    onActiveChange?.(i)
  }

  // 只决定 ARIA 模式，不决定外观：首帧按手风琴的语义渲染（服务端量不到宽度），量到够宽再换成选项卡。
  const [wide, setWide] = useState(false)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const check = () => setWide(el.clientWidth >= SPLIT)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 指示条：量出当前行相对列表容器的位置和高度，只用 transform 移过去。
  const [bar, setBar] = useState({ y: 0, h: 0, ready: false })
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !wide) return
    const measure = () => {
      const row = rowRefs.current[shown]
      if (!row) return
      const y = row.getBoundingClientRect().top - list.getBoundingClientRect().top
      const h = row.offsetHeight
      setBar((prev) => (prev.y === y && prev.h === h ? prev : { y, h, ready: prev.h > 0 }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => ro.disconnect()
  }, [shown, wide, o.listStyle, o.font])

  const [votes, setVotes] = useState<Record<number, 'yes' | 'no'>>({})
  // 上一题 / 下一题按钮切换时才播报新问题；自动播放或受控切换不打扰读屏用户。
  const [announce, setAnnounce] = useState('')
  const step = (dir: number) => {
    const next = (shown + dir + n) % n
    select(next)
    setAnnounce(`Question ${next + 1} of ${n}: ${FAQS[next]?.q ?? ''}`)
  }

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: n - 1 }
    if (wide) Object.assign(map, { ArrowRight: i + 1, ArrowLeft: i - 1 })
    const target = map[e.key]
    if (target === undefined) return
    e.preventDefault()
    const next = (target + n) % n
    btnRefs.current[next]?.focus()
    if (wide) select(next)
  }

  const listStyle = o.listStyle
  const cards = listStyle === 'cards'
  const rail = listStyle === 'rail'
  const numbered = !cards && !rail

  const panelLook: CSSProperties =
    o.panelStyle === 'tinted'
      ? { background: 'color-mix(in oklab, var(--s-ac) 8%, var(--s-sf))', borderColor: 'color-mix(in oklab, var(--s-ac) 26%, transparent)' }
      : o.panelStyle === 'outline'
        ? { background: 'transparent', borderColor: 'color-mix(in oklab, var(--s-fg) 16%, transparent)' }
        : { background: 'var(--s-sf)', borderColor: 'var(--s-ln)', boxShadow: 'var(--s-sh)' }

  const marker = (i: number, on: boolean) => {
    if (rail) {
      return (
        <span
          className="absolute top-1/2 left-[3px] size-[9px] -translate-y-1/2 rounded-full border transition-[background-color,border-color] duration-300"
          style={{ background: on ? 'var(--s-ac)' : 'var(--s-bg)', borderColor: on ? 'var(--s-ac)' : 'color-mix(in oklab, var(--s-fg) 28%, transparent)' }}
          aria-hidden
        />
      )
    }
    if (cards) {
      return (
        <span
          className="grid size-7 shrink-0 place-items-center text-[11.5px] tabular-nums transition-[background-color,color,border-color] duration-300"
          style={{
            fontFamily: MONO,
            borderRadius: `${Math.min(radius, 14)}px`,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: on ? 'var(--s-ac)' : 'var(--s-ln)',
            background: on ? 'var(--s-ac)' : 'transparent',
            color: on ? 'var(--s-on)' : 'var(--s-mu)',
          }}
          aria-hidden
        >
          {i + 1}
        </span>
      )
    }
    return (
      <span className="w-7 shrink-0 text-[12px] tabular-nums transition-colors duration-300" style={{ fontFamily: MONO, color: on ? 'var(--s-at)' : 'var(--s-mu)' }} aria-hidden>
        {String(i + 1).padStart(2, '0')}
      </span>
    )
  }

  // 卡片样式：卡片始终是 li。分栏时 li 里的答案区域被容器查询隐藏，整张卡就是按钮；手风琴时卡片包住按钮和展开的答案。
  const cardLook = (on: boolean): CSSProperties => ({
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: `${radius}px`,
    borderColor: on ? 'color-mix(in oklab, var(--s-ac) 50%, transparent)' : 'var(--s-ln)',
    background: on ? 'color-mix(in oklab, var(--s-ac) 9%, var(--s-bg))' : 'color-mix(in oklab, var(--s-fg) 2%, transparent)',
    transition: 'background-color 300ms, border-color 300ms',
  })

  const rowClass = (on: boolean) =>
    cn(
      'relative flex w-full items-center gap-3.5 text-left transition-[background-color,color,border-color] duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2',
      numbered && 'py-4 pr-3 pl-5',
      numbered && on && '@min-[860px]:bg-[color-mix(in_oklab,var(--s-fg)_4%,transparent)]',
      rail && 'py-3 pr-3 pl-8',
      cards && 'px-4 py-3.5',
    )

  const body = (f: Faq) => (
    <>
      <div className="space-y-3 text-[15px] leading-relaxed text-pretty" style={{ color: 'var(--s-mu)' }}>
        {f.a.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      {f.extra && <div className="mt-5">{f.extra()}</div>}
    </>
  )

  const iconBtn = 'grid size-8 place-items-center border transition-[background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2'
  const headingFont: CSSProperties = { fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }

  return (
    <section
      ref={rootRef}
      className={cn('relative w-full @container', className)}
      style={{
        ...palette(o.tone, o.accent),
        ['--s-r' as string]: `${radius}px`,
        ['--s-r2' as string]: `${Math.min(radius, 14)}px`,
        ['--s-r3' as string]: `${Math.min(radius, 10)}px`,
        background: 'var(--s-bg)',
        color: 'var(--s-fg)',
        fontFamily: BODY,
        ...style,
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 @min-[640px]:px-8 @min-[640px]:pb-20">
        <header className="flex flex-col gap-6 @min-[860px]:flex-row @min-[860px]:items-end @min-[860px]:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11.5px] tracking-[0.16em] uppercase" style={{ fontFamily: MONO, color: 'var(--s-at)' }}>
              Help center · FAQ
            </p>
            <h2 className="mt-4 text-[clamp(2rem,3.9cqw,2.75rem)] leading-[1.04] text-balance" style={headingFont}>
              {o.heading}
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-pretty" style={{ color: 'var(--s-mu)' }}>
              What platform and security teams ask before putting Coldframe in front of production traffic, answered in full.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 text-[13px]" style={{ color: 'var(--s-mu)' }}>
            <span style={{ fontFamily: MONO, fontSize: 11.5 }}>
              {n} answers · updated 2 Nov 2026
            </span>
            <a href="#docs" className="inline-flex items-center gap-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-4" style={{ color: 'var(--s-fg)', outlineColor: 'var(--s-at)' }}>
              Browse the developer docs
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--s-at)' }} aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </header>

        <div className="mt-8 @min-[860px]:grid @min-[860px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @min-[860px]:items-start @min-[860px]:gap-10 @min-[1100px]:gap-14">
          <div
            ref={listRef}
            className="relative"
            role={wide ? 'tablist' : undefined}
            aria-orientation={wide ? 'vertical' : undefined}
            aria-label={wide ? 'Questions' : undefined}
          >
            {rail && <span className="absolute top-2 bottom-2 left-[7px] w-px" style={{ background: 'var(--s-ln)' }} aria-hidden />}
            {!cards && (
              <span
                className="pointer-events-none absolute top-0 hidden h-px w-[2px] origin-top @min-[860px]:block"
                style={{
                  left: rail ? 7 : 0,
                  background: 'var(--s-ac)',
                  transform: `translate3d(${rail ? -0.5 : 0}px, ${bar.y}px, 0) scaleY(${bar.h})`,
                  opacity: bar.h > 0 ? 1 : 0,
                  transition: bar.ready && !reduced ? `transform 460ms ${EASE}` : 'none',
                }}
                aria-hidden
              />
            )}
            {GROUPS.map((g, gi) => {
              const groupId = `${uid}-g${gi}`
              return (
                <div key={g.name} role={wide ? 'presentation' : undefined} className={cn(gi > 0 && 'mt-8')}>
                  <p
                    id={groupId}
                    aria-hidden={wide || undefined}
                    className={cn('mb-3 flex items-baseline gap-2.5 text-[11px] tracking-[0.14em] uppercase', numbered && 'pl-5', rail && 'pl-8', cards && 'pl-1')}
                    style={{ fontFamily: MONO, color: 'var(--s-mu)' }}
                  >
                    <span style={{ color: 'var(--s-fg)' }}>{g.name}</span>
                    <span className="tabular-nums">{String(g.items.length).padStart(2, '0')}</span>
                  </p>
                  <ol
                    role={wide ? 'presentation' : undefined}
                    aria-labelledby={wide ? undefined : groupId}
                    className={cn(cards && 'space-y-2', numbered && 'border-t')}
                    style={{ borderColor: 'var(--s-ln)' }}
                  >
                    {FAQS.map((f, i) => {
                      if (f.group !== gi) return null
                      const on = wide ? i === shown : i === selected
                      return (
                        <li
                          key={f.q}
                          ref={(el) => {
                            rowRefs.current[i] = el
                          }}
                          role={wide ? 'presentation' : undefined}
                          className={cn(numbered && 'border-b')}
                          style={cards ? cardLook(on) : { borderColor: 'var(--s-ln)' }}
                        >
                          <h3 role={wide ? 'presentation' : undefined}>
                            <button
                              ref={(el) => {
                                btnRefs.current[i] = el
                              }}
                              type="button"
                              id={`${uid}-t${i}`}
                              role={wide ? 'tab' : undefined}
                              aria-selected={wide ? on : undefined}
                              aria-expanded={wide ? undefined : on}
                              aria-controls={wide ? `${uid}-p${i}` : `${uid}-r${i}`}
                              aria-describedby={wide ? groupId : undefined}
                              tabIndex={wide ? (on ? 0 : -1) : undefined}
                              onClick={() => select(wide ? i : on ? null : i)}
                              onKeyDown={(e) => onKey(e, i)}
                              className={rowClass(on)}
                              style={{ outlineColor: 'var(--s-at)', color: on ? 'var(--s-fg)' : 'color-mix(in oklab, var(--s-fg) 72%, transparent)', borderRadius: cards ? `${radius}px` : undefined }}
                            >
                              {marker(i, on)}
                              <span className="min-w-0 flex-1 text-[15.5px] leading-snug font-medium tracking-[-0.01em] text-pretty">{f.q}</span>
                              <svg
                                viewBox="0 0 16 16"
                                className="hidden size-4 shrink-0 transition-[opacity,transform] duration-300 motion-reduce:transition-none @min-[860px]:block"
                                style={{ color: 'var(--s-at)', opacity: on ? 1 : 0, transform: on ? 'none' : 'translateX(-4px)' }}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M3 8h10M9 4l4 4-4 4" />
                              </svg>
                              <span
                                className="grid size-6 shrink-0 place-items-center rounded-full border transition-[background-color,color,border-color] duration-300 @min-[860px]:hidden"
                                style={{ borderColor: on ? 'var(--s-ac)' : 'var(--s-ln)', background: on ? 'var(--s-ac)' : 'transparent', color: on ? 'var(--s-on)' : 'var(--s-mu)' }}
                                aria-hidden
                              >
                                <Plus open={on} />
                              </span>
                            </button>
                          </h3>
                          <div
                            id={`${uid}-r${i}`}
                            role="region"
                            aria-labelledby={`${uid}-t${i}`}
                            inert={!on}
                            className="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none @min-[860px]:hidden"
                            style={{ gridTemplateRows: on ? '1fr' : '0fr', opacity: on ? 1 : 0 }}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div className={cn('pt-1 pb-6', numbered && 'pr-1 pl-5', rail && 'pr-1 pl-8', cards && 'px-4 pt-1 pb-5')}>{body(f)}</div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )
            })}
          </div>

          <div className="sticky top-6 hidden flex-col border p-7 @min-[860px]:flex @min-[1100px]:p-8" style={{ ...panelLook, borderRadius: `${radius}px` }}>
            {o.panelStyle === 'outline' && <span className="absolute -top-px left-7 h-[2px] w-14 @min-[1100px]:left-8" style={{ background: 'var(--s-ac)' }} aria-hidden />}
            <div className="grid">
              {FAQS.map((f, i) => {
                const on = i === shown
                return (
                  <article
                    key={f.q}
                    id={`${uid}-p${i}`}
                    role="tabpanel"
                    aria-labelledby={`${uid}-t${i}`}
                    aria-hidden={!on}
                    inert={!on}
                    tabIndex={on ? 0 : -1}
                    className="min-w-0 rounded-sm [grid-area:1/1] focus-visible:outline-2 focus-visible:outline-offset-8"
                    style={{ outlineColor: 'var(--s-at)', ...answerStyle(o.transition, on, i < shown ? -1 : 1, reduced) }}
                  >
                    <div className="flex items-center gap-2.5 text-[11.5px] tracking-[0.06em] uppercase" style={{ fontFamily: MONO }}>
                      <span style={{ color: 'var(--s-at)' }}>Q{String(i + 1).padStart(2, '0')}</span>
                      <span className="h-px w-5" style={{ background: 'var(--s-ln)' }} />
                      <span style={{ color: 'var(--s-mu)' }}>{f.tag}</span>
                    </div>
                    <h3 className="mt-4 text-[clamp(1.35rem,2.1cqw,1.65rem)] leading-[1.18] text-balance" style={headingFont}>
                      {f.q}
                    </h3>
                    <div className="mt-4">{body(f)}</div>
                  </article>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4" style={{ borderColor: 'var(--s-ln)' }}>
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--s-mu)' }}>
                <span>Helpful?</span>
                {(['yes', 'no'] as const).map((v) => {
                  const pressed = votes[shown] === v
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setVotes((prev) => ({ ...prev, [shown]: v }))}
                      className="border px-2.5 py-1 capitalize transition-[background-color,color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        borderRadius: 'var(--s-r3)',
                        borderColor: pressed ? 'var(--s-ac)' : 'var(--s-ln)',
                        background: pressed ? 'var(--s-ac)' : 'transparent',
                        color: pressed ? 'var(--s-on)' : 'var(--s-fg)',
                        outlineColor: 'var(--s-at)',
                      }}
                    >
                      {v}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous question" onClick={() => step(-1)} className={iconBtn} style={{ borderColor: 'var(--s-ln)', borderRadius: 'var(--s-r3)', outlineColor: 'var(--s-at)' }}>
                  <Chevron dir="left" />
                </button>
                <span className="w-12 text-center text-[12px] tabular-nums" style={{ fontFamily: MONO, color: 'var(--s-mu)' }} aria-hidden>
                  {shown + 1} / {n}
                </span>
                <button type="button" aria-label="Next question" onClick={() => step(1)} className={iconBtn} style={{ borderColor: 'var(--s-ln)', borderRadius: 'var(--s-r3)', outlineColor: 'var(--s-at)' }}>
                  <Chevron dir="right" />
                </button>
                <span className="sr-only" aria-live="polite">
                  {announce}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside
          className="mt-14 flex flex-col gap-5 border-t pt-8 @min-[640px]:flex-row @min-[640px]:items-center @min-[640px]:justify-between"
          style={{ borderColor: 'var(--s-ln)' }}
          aria-label="Contact"
        >
          <div className="max-w-xl">
            <p className="text-[19px] leading-snug" style={headingFont}>
              Didn’t find your question?
            </p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-pretty" style={{ color: 'var(--s-mu)' }}>
              A solutions engineer replies within one business day, usually with a sandbox workspace already set up for your stack.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex shrink-0 items-center gap-2 self-start px-4 py-2.5 text-[14px] font-medium transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 @min-[640px]:self-auto"
            style={{ background: 'var(--s-ac)', color: 'var(--s-on)', borderRadius: 'var(--s-r2)', outlineColor: 'var(--s-at)' }}
          >
            Talk to an engineer
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </aside>
      </div>
    </section>
  )
}
