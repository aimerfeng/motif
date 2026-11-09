// SPDX-License-Identifier: MIT
// Copyright (c) 2025 WebTUI
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/utils/box.css
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/components/table.css
// Source: https://github.com/webtui/webtui/blob/c8eaf2c/packages/css/src/components/badge.css
// Modified by Motif; see the item's provenance.
import { createContext, use, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { cn, useFrameLoop } from '@motif/runtime'

/** 所有面板共用的边框样式（square / round / double），对应上游的 box- 属性。 */
export const BoxContext = createContext('square')

const DIM = 'text-(--foreground2)'

/* ---------- 面板：标题嵌在上边框里 ---------- */

/**
 * 上游的写法：box- + shear-="top" 去掉上内边距，第一行的 background0 徽章盖住边框线，看起来像标题切进了边框。
 */
function Pane({ id, title, tag, flush, className, children }: { id: string; title: string; tag?: ReactNode; flush?: boolean; className?: string; children: ReactNode }) {
  const box = use(BoxContext)
  return (
    <section id={id} aria-labelledby={`${id}-title`} data-box={box} data-shear="top" className={cn('@container flex min-w-0 scroll-mt-[2lh] flex-col', className)}>
      <header className="flex min-w-0 items-start justify-between gap-[1ch]">
        <h2 id={`${id}-title`} data-is="badge" data-variant="background0" className="min-w-0 font-bold">
          {title}
        </h2>
        {tag !== undefined && (
          <span data-is="badge" data-variant="background0" className={cn('hidden @md:inline-flex', DIM)}>
            {tag}
          </span>
        )}
      </header>
      <div className={cn('min-w-0 pt-[1lh]', !flush && 'px-[1ch]')}>{children}</div>
    </section>
  )
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className={DIM}>
      <span className="text-(--ht-accent)" aria-hidden="true">
        ${' '}
      </span>
      {children}
    </p>
  )
}

/* ---------- 倒计时 ---------- */

function split(total: number) {
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  }
}
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 上游没有倒计时；这里由 useFrameLoop 驱动，只在秒数变化时重新渲染。
 * 传了 now 就从那一刻按帧时间往下数，海报和录屏每次都一样；不传就读真实时钟。
 */
function useCountdown(host: RefObject<HTMLElement | null>, startsAt: string, now?: number) {
  const target = Date.parse(startsAt)
  const [left, setLeft] = useState<number | null>(null)
  useFrameLoop(
    host,
    ({ time }) => {
      if (Number.isNaN(target)) return
      const clock = now === undefined ? Date.now() : now + time * 1000
      const seconds = Math.max(0, Math.floor((target - clock) / 1000))
      setLeft((prev) => (prev === seconds ? prev : seconds))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )
  return left
}

function BigCountdown({ startsAt, now }: { startsAt: string; now?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const left = useCountdown(host, startsAt, now)
  const u = split(left ?? 0)
  const cells = [
    { value: String(u.d), label: 'days' },
    { value: pad(u.h), label: 'hrs' },
    { value: pad(u.m), label: 'min' },
    { value: pad(u.s), label: 'sec' },
  ]
  return (
    <div ref={host}>
      {left === 0 ? (
        <p className="text-[1.5em] font-bold text-(--ht-ok)">we are live. hack until sun 12:00</p>
      ) : (
        <div className="grid grid-cols-4 gap-x-[1ch]" role="timer" aria-live="off" aria-label={`Starts in ${u.d} days, ${u.h} hours and ${u.m} minutes`}>
          {cells.map((cell) => (
            <div key={cell.label} className="min-w-0">
              <span className="block text-[2.25em] leading-[1.15] font-bold text-(--ht-accent) tabular-nums">{left === null ? '--' : cell.value}</span>
              <span className={cn('block', DIM)}>{cell.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CompactCountdown({ startsAt, now }: { startsAt: string; now?: number }) {
  const host = useRef<HTMLSpanElement>(null)
  const left = useCountdown(host, startsAt, now)
  const u = split(left ?? 0)
  return (
    <span ref={host} className="tabular-nums" aria-hidden="true">
      {left === null ? 'T-' : left === 0 ? 'LIVE' : `T-${u.d}d ${pad(u.h)}:${pad(u.m)}:${pad(u.s)}`}
    </span>
  )
}

/* ---------- 状态栏（tmux 风格） ---------- */

const NAV = [
  { href: '#readme', label: 'readme' },
  { href: '#schedule', label: 'cron' },
  { href: '#prizes', label: 'prizes' },
  { href: '#judges', label: 'judges' },
  { href: '#rules', label: 'rules' },
  { href: '#register', label: 'register' },
]

export function StatusBar({ name, startsAt, now }: { name: string; startsAt: string; now?: number }) {
  return (
    <header className="sticky top-0 z-20 bg-(--background1)">
      <div className="mx-auto flex max-w-[124ch] items-center gap-x-[2ch] pr-4 @5xl:pr-[2ch]">
        <a href="#readme" data-is="badge" data-variant="accent" data-cap="square triangle" className="max-w-[22ch] shrink-0 overflow-hidden font-bold">
          <span className="truncate">{name.toLowerCase()}</span>
        </a>
        <nav aria-label="Sections" className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
          <ul className="flex gap-x-[2ch] whitespace-nowrap">
            {NAV.map((link, i) => (
              <li key={link.href}>
                <a href={link.href} className="text-(--foreground1) hover:text-(--ht-accent) focus-visible:text-(--ht-accent)">
                  <span className={DIM}>{i}:</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="hidden shrink-0 text-(--ht-accent) @2xl:inline">
          <CompactCountdown startsAt={startsAt} now={now} />
        </span>
      </div>
    </header>
  )
}

/* ---------- 首屏 ---------- */

export function Hero({ name, dates, prizePool, startsAt, now, className }: { name: string; dates: string; prizePool: string; startsAt: string; now?: number; className?: string }) {
  const box = use(BoxContext)
  const facts = [
    { key: 'dates', value: dates },
    { key: 'where', value: 'Dock 4, Harbour Works' },
    { key: 'seats', value: '300 hackers, teams of 1 to 4' },
    { key: 'pool', value: prizePool },
  ]
  return (
    <Pane id="readme" title="README.md" tag="v2027.03" className={className}>
      <div className="grid gap-x-[3ch] gap-y-[1lh] @3xl:grid-cols-[minmax(0,1fr)_minmax(0,36ch)]">
        <div className="flex min-w-0 flex-col gap-y-[1lh]">
          <Prompt>cat ./README.md</Prompt>
          <h1 className="text-[clamp(2.25rem,8.5cqi,4.75rem)] leading-[1.05] font-bold tracking-[-0.02em] text-balance text-(--foreground0)">
            {name}
            <span className="ht-caret ml-[0.15em] text-(--ht-accent)" aria-hidden="true" />
          </h1>
          <p className="max-w-[58ch] text-(--foreground1)">
            48 hours to build something that runs in a terminal: a TUI, a CLI, a shell plugin or a game. Bring a laptop and a half-finished idea; we bring power, coffee and
            people who have shipped this before.
          </p>
          <div className="flex flex-wrap gap-x-[2ch]">
            <a href="#register" data-is="button" data-variant="accent" className="font-bold">
              register
            </a>
            <a href="#rules" data-is="button" data-box={box}>
              read the rules
            </a>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-y-[1lh]">
          <div data-box={box} data-shear="top" className="flex flex-col">
            <div className="flex justify-between gap-[1ch]">
              <span data-is="badge" data-variant="background0">
                countdown
              </span>
              <span data-is="badge" data-variant="background0" className={DIM}>
                T-minus
              </span>
            </div>
            <div className="pt-[0.5lh]">
              <BigCountdown startsAt={startsAt} now={now} />
            </div>
          </div>
          <dl className="grid grid-cols-[7ch_minmax(0,1fr)] gap-x-[1ch]">
            {facts.map((fact) => (
              <div key={fact.key} className="contents">
                <dt className={DIM}>{fact.key}</dt>
                <dd className={fact.key === 'pool' ? 'font-bold text-(--ht-accent2)' : undefined}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Pane>
  )
}

/* ---------- 日程（crontab） ---------- */

const CRON = [
  { m: '00', h: '18', dom: '12', dow: 'fri', cmd: 'doors --open --badges', where: 'hall A' },
  { m: '30', h: '19', dom: '12', dow: 'fri', cmd: 'kickoff --talks 3', where: 'main stage' },
  { m: '00', h: '21', dom: '12', dow: 'fri', cmd: 'teams --form --max 4', where: 'hall A' },
  { m: '00', h: '09', dom: '13', dow: 'sat', cmd: 'breakfast && standup', where: 'canteen' },
  { m: '00', h: '14', dom: '13', dow: 'sat', cmd: 'mentors --office-hours', where: 'room 2.04' },
  { m: '00', h: '22', dom: '13', dow: 'sat', cmd: 'lightning --talks 5m', where: 'main stage' },
  { m: '00', h: '12', dom: '14', dow: 'sun', cmd: 'git push --freeze', where: 'everywhere' },
  { m: '30', h: '13', dom: '14', dow: 'sun', cmd: 'demo --slot 3m', where: 'main stage' },
  { m: '00', h: '17', dom: '14', dow: 'sun', cmd: 'awards && exit 0', where: 'main stage' },
]

export function Schedule({ className }: { className?: string }) {
  return (
    <Pane id="schedule" title="schedule.cron" tag="TZ=CET" flush className={className}>
      <table className="w-full [&_td:first-child]:pl-[1ch] [&_th]:whitespace-nowrap [&_th:first-child]:pl-[1ch]">
        <caption className="sr-only">Schedule, three days, in crontab order: minute, hour, day of month, month, weekday and command</caption>
        <thead>
          <tr>
            <th scope="col" className={DIM}>
              m
            </th>
            <th scope="col" className={DIM}>
              h
            </th>
            <th scope="col" className={cn('hidden @xl:table-cell', DIM)}>
              dom
            </th>
            <th scope="col" className={cn('hidden @xl:table-cell', DIM)}>
              mon
            </th>
            <th scope="col" className={DIM}>
              dow
            </th>
            <th scope="col" className={DIM}>
              command
            </th>
          </tr>
        </thead>
        <tbody>
          {CRON.map((row) => (
            <tr key={`${row.dom}-${row.h}`}>
              <td className="whitespace-nowrap tabular-nums">{row.m}</td>
              <td className="whitespace-nowrap tabular-nums">{row.h}</td>
              <td className="hidden whitespace-nowrap tabular-nums @xl:table-cell">{row.dom}</td>
              <td className="hidden whitespace-nowrap tabular-nums @xl:table-cell">03</td>
              <td className="whitespace-nowrap text-(--ht-accent2)">{row.dow}</td>
              <td>
                <span className="text-(--foreground0)">{row.cmd}</span>
                <span className={cn('ml-[2ch] inline-block', DIM)}># {row.where}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Pane>
  )
}

/* ---------- 奖池 ---------- */

const SPLITS = [
  { label: 'grand prize', pct: 40 },
  { label: 'runner-up', pct: 20 },
  { label: 'best tui', pct: 15 },
  { label: 'best cli', pct: 15 },
  { label: 'first timers', pct: 10 },
]

const CELLS = 12
const MAX_PCT = Math.max(...SPLITS.map((split) => split.pct))

/** 文本进度条：按 1ch 一格画方块，不依赖字体里有没有 █ 字形。 */
function Bar({ pct }: { pct: number }) {
  const cells = (color: string): CSSProperties => ({
    backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 calc(1ch - 2px), transparent calc(1ch - 2px) 1ch)`,
  })
  const filled = Math.max(1, Math.round((pct / MAX_PCT) * CELLS))
  return (
    <span aria-hidden="true" className="relative inline-block h-[0.7lh] align-[-0.05lh]" style={{ width: `${CELLS}ch`, ...cells('var(--background2)') }}>
      <span className="absolute inset-y-0 left-0" style={{ width: `${Math.min(CELLS, filled)}ch`, ...cells('var(--ht-accent)') }} />
    </span>
  )
}

export function Prizes({ prizePool, className }: { prizePool: string; className?: string }) {
  return (
    <Pane id="prizes" title="prizes" tag="paid in cash" className={className}>
      <div className="flex flex-col gap-y-[1lh]">
        <div>
          <p className={DIM}>pool</p>
          <p className="text-[2.25em] leading-[1.15] font-bold text-(--ht-accent2) tabular-nums">{prizePool}</p>
        </div>
        <ul className="flex flex-col">
          {SPLITS.map((split) => (
            <li key={split.label} className="flex flex-wrap items-center justify-between gap-x-[1ch]">
              <span>{split.label}</span>
              <span className="inline-flex items-center gap-x-[1ch]">
                <Bar pct={split.pct} />
                <span className="w-[4ch] text-right tabular-nums">{split.pct}%</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={DIM}>Winners can donate their share to an open-source project; we match it up to $2,000.</p>
      </div>
    </Pane>
  )
}

/* ---------- 评委 ---------- */

const JUDGES = [
  { name: 'Ines Okafor', handle: 'inesok', role: 'kernel engineer, Lattice OS', initials: 'IO' },
  { name: 'Tomas Varga', handle: 'tvarga', role: 'maintains the ratchet TUI toolkit', initials: 'TV' },
  { name: 'Mei Lindqvist', handle: 'meil', role: 'staff SRE, Harborline Freight', initials: 'ML' },
  { name: 'Dario Esposito', handle: 'dario', role: 'founder, Quillterm', initials: 'DE' },
]

export function Judges({ className }: { className?: string }) {
  const box = use(BoxContext)
  return (
    <Pane id="judges" title="judges" tag={`${JUDGES.length} people`} className={className}>
      <ul className="grid gap-x-[2ch] gap-y-[1lh] @xl:grid-cols-2 @4xl:grid-cols-4">
        {JUDGES.map((judge, i) => (
          <li key={judge.handle} data-box={box} className="flex min-w-0 items-start gap-x-[1ch]">
            <span data-is="badge" data-variant={i % 2 === 0 ? 'accent' : 'accent2'} className="shrink-0 font-bold" aria-hidden="true">
              {judge.initials}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-bold">{judge.name}</span>
              <span className="text-(--foreground1)">{judge.role}</span>
              <span className="text-(--ht-accent)">@{judge.handle}</span>
            </span>
          </li>
        ))}
      </ul>
    </Pane>
  )
}

/* ---------- 规则（man page） ---------- */

const RULES = [
  'Teams of one to four. Come solo and we match teams on Friday night.',
  'Start from an empty repository after kickoff. Libraries and dotfiles are fair game.',
  'It has to run in a terminal: a TUI, a CLI, a shell plugin or a game.',
  'Code freeze is Sunday 12:00. Demo what you pushed, not what you meant to.',
  'Three minutes per demo, live, from your own laptop. No slides.',
  'What you build stays yours. Be kind in the chat and at the tables.',
]

export function Rules({ className }: { className?: string }) {
  return (
    <Pane id="rules" title="rules(7)" tag="man" className={className}>
      <div className="flex flex-col gap-y-[1lh]">
        <div>
          <p className="font-bold">NAME</p>
          <p className="pl-[4ch] text-(--foreground1)">rules - what counts as a submission</p>
        </div>
        <div>
          <p className="font-bold">RULES</p>
          <ol className="flex flex-col pl-[1ch]">
            {RULES.map((rule, i) => (
              <li key={rule} className="grid grid-cols-[3ch_minmax(0,1fr)]">
                <span className="text-(--ht-accent) tabular-nums" aria-hidden="true">
                  {i + 1}.
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Pane>
  )
}

/* ---------- 报名（假 shell） ---------- */

type Line = { kind: 'cmd' | 'out' | 'ok' | 'err'; text: string }

const INTRO: Line[] = [
  { kind: 'cmd', text: './register.sh --help' },
  { kind: 'out', text: 'usage: register.sh <handle>' },
  { kind: 'out', text: '  handle: 2-16 chars, a-z 0-9 _ -' },
  { kind: 'out', text: '  one seat per hacker; teams form on site' },
]
const GHOST = 'ada_byte'
const HANDLE = /^[a-z0-9_-]{2,16}$/i

/** 机器名：从活动名里取小写字母数字，作为提示符里的 host。 */
function hostOf(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 14) || 'hack'
  )
}

export function Register({ name, className }: { name: string; className?: string }) {
  const inputId = useId()
  const host = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<Line[]>(INTRO)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [seat, setSeat] = useState(264)
  const [taken, setTaken] = useState<string[]>([])
  const [ghost, setGhost] = useState(GHOST.length)

  // 空闲时在输入框里「打字」演示一个昵称：节奏来自 useFrameLoop 的时间（6 秒一轮：停留、清空、逐字打出）。
  // 第 0 秒是完整的提示，所以离屏暂停和减少动态效果时看到的都是完整的一行。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % 6
      const n = t < 2.6 ? GHOST.length : Math.max(0, Math.min(GHOST.length, Math.floor((t - 3) * 9)))
      setGhost((prev) => (prev === n ? prev : n))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  // 不用 <form> 提交：预览沙箱没有 allow-forms，隐式提交会被浏览器拦下，submit 事件也不会触发。
  const submit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    const handle = value.trim().replace(/^@/, '')
    if (handle === '') return
    const next: Line[] = [{ kind: 'cmd', text: `./register.sh ${handle}` }]
    if (handle === 'clear') {
      setLines([])
      setValue('')
      return
    }
    if (!HANDLE.test(handle)) {
      next.push({ kind: 'err', text: `invalid handle "${handle.slice(0, 24)}"; use 2-16 of a-z 0-9 _ -` })
    } else if (taken.includes(handle.toLowerCase())) {
      next.push({ kind: 'err', text: `@${handle} already has a seat` })
    } else {
      next.push({ kind: 'ok', text: `seat #${String(seat).padStart(4, '0')} reserved for @${handle}` })
      next.push({ kind: 'out', text: 'check in at hall A from 18:00 on friday' })
      setSeat(seat + 1)
      setTaken([...taken, handle.toLowerCase()])
    }
    setLines((prev) => [...prev, ...next].slice(-12))
    setValue('')
  }

  return (
    <Pane id="register" title="register.sh" tag="tty1" className={className}>
      <div ref={host} className="flex flex-col">
        <div role="log" aria-live="polite" aria-label="register.sh output" className="flex flex-col">
          {lines.map((line, i) => (
            <p key={i} className={cn('whitespace-pre-wrap', line.kind === 'out' && 'text-(--foreground1)', line.kind === 'ok' && 'text-(--ht-ok)')}>
              {line.kind === 'cmd' && <span className="text-(--ht-accent)">$ </span>}
              {line.kind === 'ok' && <span className="font-bold">ok </span>}
              {line.kind === 'err' && <span className="font-bold text-(--ht-err)">error: </span>}
              {line.text}
            </p>
          ))}
        </div>
        <div className="flex min-w-0 items-baseline focus-within:bg-(--background1)">
          <label htmlFor={inputId} className="shrink-0 whitespace-pre">
            <span className="hidden text-(--ht-accent2) @lg:inline">guest@{hostOf(name)}:~</span>
            <span className="text-(--ht-accent)">$ </span>
            <span className={DIM}>register </span>
            <span className="sr-only">handle</span>
          </label>
          <span className="relative min-w-0 flex-1">
            <input
              id={inputId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={submit}
              enterKeyHint="send"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={32}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="block h-[1lh] w-full min-w-0 bg-transparent p-0 text-(--foreground0) caret-(--ht-accent) outline-none focus-visible:outline-none"
            />
            {value === '' && !focused && (
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-start whitespace-pre text-(--foreground2)">
                {GHOST.slice(0, ghost)}
                <span className="ht-caret text-(--ht-accent)" />
              </span>
            )}
          </span>
        </div>
        <p className={cn('pt-[1lh]', DIM)}>Press Enter to reserve a seat. Type clear to reset the screen.</p>
      </div>
    </Pane>
  )
}

/* ---------- 页脚（状态行） ---------- */

export function Footer({ name, dates }: { name: string; dates: string }) {
  return (
    <footer className="bg-(--background1)">
      <div className="mx-auto flex max-w-[124ch] flex-wrap items-center gap-x-[2ch] pr-4 @5xl:pr-[2ch]">
        <span data-is="badge" data-variant="accent2" data-cap="square triangle" className="font-bold">
          NORMAL
        </span>
        <span className="min-w-0 flex-1 truncate">
          {name.toLowerCase()} <span className={DIM}>· {dates}</span>
        </span>
        <nav aria-label="Footer" className="ml-auto">
          <ul className="flex flex-wrap gap-x-[2ch] pl-4">
            <li>
              <a href="#rules" className="text-(--foreground1) hover:text-(--ht-accent)">
                code of conduct
              </a>
            </li>
            <li>
              <a href="#judges" className="text-(--foreground1) hover:text-(--ht-accent)">
                press
              </a>
            </li>
            <li className={DIM}>exit 0</li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
