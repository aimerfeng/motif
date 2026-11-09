import { cn } from '@motif/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState, type FormEvent } from 'react'
import { Avatar, CoverArt, Icon, MetaLine, ShowMark } from './art'
import { chapterEnd, chapterIndexAt, EPISODE_COUNT, EPISODES, GUEST_COUNT, GUESTS, HOSTS, TOPICS, type Episode, type Topic } from './data'
import { PlayButton, usePlayer, usePlayerPaint } from './player'
import { CopyFeed, EYEBROW, fluid, FOCUS, MONO, SECTION, SectionHead, useJump, type ArtProps, type SectionIds } from './sections'
import { DISPLAY, formatDate, formatLength, formatTime, slugify } from './theme'

/* ---------- 单集列表 ---------- */

/** 每集的章节条：段宽按章节时长，正在播的那集用 --p 填充进度（每段露出多少在 CSS 里算）。 */
function ChapterBar({ episode, className }: { episode: Episode; className?: string }) {
  const [bar, setBar] = useState<HTMLDivElement | null>(null)
  const loaded = usePlayer((s) => s.episode === episode.number)
  const chapter = usePlayer((s) => (s.episode === episode.number ? chapterIndexAt(episode, s.time) : -1))
  usePlayerPaint((s) => {
    bar?.style.setProperty('--p', s.episode === episode.number ? (s.time / episode.duration).toFixed(5) : '0')
  })
  return (
    <div className={cn('min-w-0', className)}>
      <div ref={setBar} role="img" aria-label={`${episode.chapters.length} chapters: ${episode.chapters.map((c) => c.title).join(', ')}`} className="flex h-1.5 gap-[3px]">
        {episode.chapters.map((c, i) => {
          const start = c.at / episode.duration
          const span = (chapterEnd(episode, i) - c.at) / episode.duration
          return (
            <span key={c.at} title={`${formatTime(c.at)}  ${c.title}`} className="relative h-full min-w-1 overflow-hidden rounded-full bg-(--pc-line-strong)" style={{ flex: `${span} 1 0%` }}>
              <span
                className="absolute inset-0 origin-left bg-(--pc-accent-ui)"
                style={{ transform: `scaleX(clamp(0, calc((var(--p, 0) - ${start.toFixed(5)}) / ${span.toFixed(5)}), 1))` }}
              />
            </span>
          )
        })}
      </div>
      <p className={cn('mt-2 truncate text-[11px] text-(--pc-muted)', MONO)}>
        {loaded && chapter >= 0 ? (
          <span className="text-(--pc-accent-text)">
            Ch {chapter + 1} · {episode.chapters[chapter]!.title}
          </span>
        ) : (
          `${episode.chapters.length} chapters`
        )}
      </p>
    </div>
  )
}

function EpisodeRow({ episode, art }: { episode: Episode; art: ArtProps }) {
  const loaded = usePlayer((s) => s.episode === episode.number)
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 border-b border-(--pc-line) py-5 @3xl:grid-cols-[4.75rem_minmax(0,1fr)_13rem_auto] @3xl:gap-x-7 @3xl:py-6">
      <CoverArt style={art.coverStyle} accent={art.accent} title={art.showName} seed={episode.number} variant="episode" label={String(episode.number)} className="w-14 rounded-lg @3xl:w-[4.75rem]" />
      <div className="min-w-0">
        <MetaLine
          className={cn('text-[11px] uppercase tracking-[0.12em] text-(--pc-muted)', MONO)}
          items={[
            { node: `Ep ${episode.number}`, className: cn(loaded && 'text-(--pc-accent-text)') },
            formatDate(episode.date, true),
            formatLength(episode.duration),
            { node: episode.topic, className: 'hidden @md:block' },
          ]}
        />
        <h3 className="mt-1.5 text-[calc(18px*var(--pc-display-scale))] leading-snug @3xl:text-[calc(22px*var(--pc-display-scale))]" style={DISPLAY}>
          {episode.title}
        </h3>
        <p className="mt-1 text-[14px] text-(--pc-muted)">
          <span className="text-(--pc-fg)">{episode.guest}</span>, {episode.affiliation}
        </p>
        <p className="mt-2 hidden max-w-[62ch] text-[14px] leading-relaxed text-(--pc-muted) @2xl:block">{episode.blurb}</p>
      </div>
      <ChapterBar episode={episode} className="order-last col-span-full @3xl:order-none @3xl:col-span-1" />
      <PlayButton episode={episode.number} size="md" />
    </div>
  )
}

export function Episodes({ id, art }: { id: string; art: ArtProps }) {
  const [topic, setTopic] = useState<Topic | 'All'>('All')
  const pill = useId()
  const list = topic === 'All' ? EPISODES : EPISODES.filter((episode) => episode.topic === topic)
  const options: (Topic | 'All')[] = ['All', ...TOPICS]
  return (
    <section id={id} className={cn(SECTION, 'border-t border-(--pc-line) py-16 @3xl:py-24')}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 @4xl:flex-row @4xl:items-end @4xl:justify-between">
          <SectionHead eyebrow="Episodes" title="Recent episodes">
            {EPISODE_COUNT} episodes since 2018. Each one follows a single experiment from the plan to the part that went wrong.
          </SectionHead>
          <div role="group" aria-label="Filter episodes by topic" className="flex flex-wrap gap-1.5">
            {options.map((option) => {
              const active = option === topic
              const count = option === 'All' ? EPISODES.length : EPISODES.filter((e) => e.topic === option).length
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(option)}
                  className={cn('relative h-9 rounded-full px-3.5 text-[14px] transition-colors', active ? 'text-(--pc-on-accent)' : 'text-(--pc-muted) hover:text-(--pc-fg)', FOCUS)}
                >
                  {active && <motion.span layoutId={pill} className="absolute inset-0 rounded-full bg-(--pc-accent)" transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }} />}
                  <span className="relative">
                    {option} <span className={cn('text-[12px] opacity-75', MONO)}>{count}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <ul className="mt-9 border-t border-(--pc-line)">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((episode) => (
              <motion.li key={episode.number} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <EpisodeRow episode={episode} art={art} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="mt-8 text-center text-[14px] text-(--pc-muted)">
          Showing {list.length} of {EPISODE_COUNT}. Older episodes and full transcripts live in the archive.
        </p>
      </div>
    </section>
  )
}

/* ---------- 主持人与嘉宾 ---------- */

export function Hosts({ id, accent }: { id: string; accent: string }) {
  return (
    <section id={id} className={cn(SECTION, 'border-t border-(--pc-line) py-16 @3xl:py-24')}>
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow="Hosts" title="Two people who read the methods section first" />
        <div className="mt-9 grid gap-4 @3xl:grid-cols-2 @3xl:gap-5">
          {HOSTS.map((host) => (
            <article key={host.name} className="flex flex-col rounded-(--pc-radius) border border-(--pc-line) bg-(--pc-surface) p-6 @3xl:p-8">
              <div className="flex items-center gap-4">
                <Avatar name={host.name} accent={accent} hue={host.hue} className="w-16" />
                <div className="min-w-0">
                  <h3 className="text-[calc(24px*var(--pc-display-scale))] leading-tight" style={DISPLAY}>
                    {host.name}
                  </h3>
                  <MetaLine className={cn(EYEBROW, 'mt-1 tracking-[0.12em] text-(--pc-muted)')} items={host.role.split(' · ')} />
                </div>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-(--pc-muted)">{host.bio}</p>
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-(--pc-line) pt-4 text-[14px]">
                <Icon name="mic" className="size-4 text-(--pc-accent-text)" />
                <span className="text-(--pc-muted)">Favorite episode</span>
                <span className="font-medium">
                  #{host.pick.number} · {host.pick.title}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Guests({ id, accent }: { id: string; accent: string }) {
  return (
    <section id={id} className={cn(SECTION, 'border-t border-(--pc-line) py-16 @3xl:py-24')}>
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow="Guests" title={`${GUEST_COUNT} scientists so far`}>
          The last twelve, with the episode they were on. Every guest brings one experiment that did not go to plan.
        </SectionHead>
        <ul className="mt-9 grid grid-cols-2 gap-3 @2xl:grid-cols-3 @4xl:grid-cols-4 @6xl:grid-cols-6">
          {GUESTS.map((guest, i) => (
            <li key={guest.name} className="group flex min-w-0 flex-col rounded-(--pc-radius) border border-(--pc-line) bg-(--pc-surface) p-4 transition-colors hover:border-(--pc-line-strong)">
              <Avatar name={guest.name} accent={accent} hue={((i * 23) % 70) - 35} className="w-11 transition-transform duration-300 group-hover:scale-105" />
              <p className="mt-4 text-[15px] font-medium leading-snug [overflow-wrap:anywhere]">{guest.name}</p>
              <p className="mt-1 text-[13px] leading-snug text-(--pc-muted)">{guest.field}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-(--pc-muted)">{guest.affiliation}</p>
              <p className={cn('mt-auto pt-4 text-[12px] text-(--pc-accent-text)', MONO)}>Ep {guest.episode}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- 订阅与页脚 ---------- */

function WaveStrip() {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => {
        const h = 6 + Math.abs(Math.sin(i * 0.37) * 26 + Math.sin(i * 0.11 + 1) * 22 + Math.sin(i * 1.7) * 6)
        return <rect key={i} x={i * 4 + 1} y={80 - h} width={2} height={h} rx={1} fill="var(--pc-accent-ui)" fillOpacity={0.1 + (i / 100) * 0.28} />
      })}
    </svg>
  )
}

export function Subscribe({ id, showName }: { id: string; showName: string }) {
  const field = useId()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const feed = `${slugify(showName)}.show/feed`
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter an email address like name@lab.org.')
      return
    }
    setError('')
    setSent(true)
  }
  return (
    <section id={id} className={cn(SECTION, 'py-16 @3xl:py-24')}>
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[calc(var(--pc-radius)+8px)] border border-(--pc-line) bg-(--pc-raised) p-6 pb-24 @3xl:p-12 @3xl:pb-28">
        <WaveStrip />
        <div className="relative grid gap-9 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] @4xl:items-end @4xl:gap-14">
          <div>
            <p className={cn(EYEBROW, 'text-(--pc-accent-text)')}>Subscribe</p>
            <h2 className="mt-3 leading-[1.02]" style={{ ...DISPLAY, fontSize: fluid('2rem', 5.2, '3.5rem') }}>
              New episodes every Tuesday at 6 a.m.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-(--pc-muted) @3xl:text-[16px]">
              Follow in any podcast app with the RSS feed, or get one short email a week with the episode, the paper behind it and the guest&apos;s reading list.
            </p>
          </div>
          <div className="min-w-0">
            {sent ? (
              <p role="status" className="flex items-start gap-3 rounded-(--pc-radius) border border-(--pc-line-strong) bg-(--pc-surface) p-4 text-[15px]">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--pc-accent) text-(--pc-on-accent)">
                  <Icon name="check" className="size-4" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  Check <span className="font-medium">{email.trim()}</span> to confirm. One email a week, and every one has an unsubscribe link.
                </span>
              </p>
            ) : (
              <form noValidate onSubmit={submit}>
                <label htmlFor={field} className="text-[14px] font-medium">
                  Email address
                </label>
                <div className="mt-2 flex flex-col gap-2 @md:flex-row">
                  <input
                    id={field}
                    type="email"
                    autoComplete="email"
                    placeholder="you@lab.org"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${field}-error` : undefined}
                    className="h-11 min-w-0 flex-none rounded-full @md:flex-1 border border-(--pc-line-strong) bg-(--pc-surface) px-4 text-[15px] text-(--pc-fg) outline-none transition-[border-color,box-shadow] placeholder:text-(--pc-muted) focus-visible:border-(--pc-accent-ui) focus-visible:ring-2 focus-visible:ring-(--pc-accent-ui)/40"
                  />
                  <button type="submit" className={cn('h-11 shrink-0 rounded-full bg-(--pc-accent) px-5 text-[15px] font-semibold text-(--pc-on-accent) transition-transform active:scale-[0.98]', FOCUS)}>
                    Email me
                  </button>
                </div>
                {error && (
                  <p id={`${field}-error`} role="alert" className="mt-2 text-[13px] text-(--pc-fg)">
                    {error}
                  </p>
                )}
              </form>
            )}
            <div className="mt-4 flex items-center gap-2 rounded-full border border-(--pc-line) bg-(--pc-surface) py-1 pl-4 pr-1">
              <Icon name="rss" className="size-4 text-(--pc-accent-text)" />
              <code className={cn('min-w-0 flex-1 truncate text-[13px]', MONO)}>{feed}</code>
              <CopyFeed feed={feed} compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer({ showName, ids }: { showName: string; ids: SectionIds }) {
  const jump = useJump()
  const groups: [string, [string, string][]][] = [
    [
      'Listen',
      [
        ['Latest episode', ids.player],
        ['All episodes', ids.episodes],
        ['Transcripts', ids.inside],
      ],
    ],
    [
      'Show',
      [
        ['Hosts', ids.hosts],
        ['Guests', ids.guests],
        ['Weekly email', ids.subscribe],
      ],
    ],
  ]
  return (
    <footer className="border-t border-(--pc-line) px-5 pb-32 pt-14 @3xl:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 @3xl:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShowMark />
            <span className="truncate text-[20px]" style={DISPLAY}>
              {showName}
            </span>
          </div>
          <p className="mt-4 max-w-[42ch] text-[14px] leading-relaxed text-(--pc-muted)">
            Recorded in Halden and produced independently since 2018. Corrections are read out at the start of the next episode and noted in the transcript.
          </p>
        </div>
        {groups.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <p className={cn(EYEBROW, 'text-(--pc-muted)')}>{title}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map(([label, target]) => (
                <li key={label}>
                  <a href={`#${target}`} onClick={jump(target)} className={cn('rounded text-[15px] transition-colors hover:text-(--pc-accent-text)', FOCUS)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-(--pc-line) pt-6 text-[13px] text-(--pc-muted)">
        <span className="min-w-0 [overflow-wrap:anywhere]">
          © 2026 {showName}. Pitch us an experiment: tips@{slugify(showName)}.show
        </span>
        <a href={`#${ids.top}`} onClick={jump(ids.top)} className={cn('inline-flex items-center gap-1.5 rounded transition-colors hover:text-(--pc-fg)', FOCUS)}>
          <Icon name="up" className="size-4" />
          Back to top
        </a>
      </div>
    </footer>
  )
}
