import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Avatar, CoverArt, Icon, MetaLine, ShowMark, type CoverStyle } from './art'
import { chapterEnd, chapterIndexAt, EPISODE_COUNT, episodeBy, EPISODES, SEASON, SPEAKERS, TRANSCRIPT, transcriptWords, type Episode } from './data'
import { Equalizer, usePlayer, usePlayerPaint, usePlayerStore } from './player'
import { DISPLAY, formatLength, formatTime, slugify } from './theme'

export const MONO = 'font-[family-name:var(--pc-mono)]'
export const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-(--pc-accent-ui) focus-visible:ring-offset-2 focus-visible:ring-offset-(--pc-bg)'
export const EYEBROW = cn('text-[11px] uppercase tracking-[0.16em]', MONO)
export const SECTION = 'scroll-mt-16 px-5 @3xl:px-10'

/** 标题字号随容器宽度变化，再乘上字体搭配的视觉补偿。 */
export const fluid = (min: string, cqw: number, max: string) => `calc(clamp(${min}, ${cqw}cqw, ${max}) * var(--pc-display-scale))`

export interface ArtProps {
  coverStyle: CoverStyle
  accent: string
  showName: string
}

export type SectionIds = Record<'top' | 'player' | 'inside' | 'episodes' | 'hosts' | 'guests' | 'subscribe', string>

/** 页内跳转：保留链接语义，滚动交给 scrollIntoView（减少动态效果时不做平滑滚动）。 */
export function useJump() {
  const reduced = usePrefersReducedMotion()
  return (id: string) => (event?: MouseEvent) => {
    event?.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }
}

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className={cn(EYEBROW, 'text-(--pc-accent-text)')}>{eyebrow}</p>
      <h2 className="mt-3 leading-[1.04]" style={{ ...DISPLAY, fontSize: fluid('1.85rem', 4.4, '2.9rem') }}>
        {title}
      </h2>
      {children && <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-(--pc-muted)">{children}</p>}
    </div>
  )
}

/* ---------- 页眉 ---------- */

export function Header({ showName, ids }: { showName: string; ids: SectionIds }) {
  const jump = useJump()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const headerRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const links: [string, string][] = [
    ['Episodes', ids.episodes],
    ['Transcript', ids.inside],
    ['Hosts', ids.hosts],
    ['Guests', ids.guests],
  ]

  // 窄屏的分区菜单：点外面或按 Esc 关上（Esc 把焦点还给菜单按钮）
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-(--pc-line) bg-(--pc-bg)/85 px-5 backdrop-blur-md @3xl:px-10">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3">
        <a href={`#${ids.top}`} onClick={jump(ids.top)} className={cn('mr-auto flex min-w-0 items-center gap-2.5 rounded-md', FOCUS)}>
          <ShowMark />
          <span className="truncate text-[18px] leading-none" style={DISPLAY}>
            {showName}
          </span>
        </a>
        <nav className="hidden items-center gap-1 @3xl:flex" aria-label="Sections">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={jump(id)} className={cn('rounded-full px-3 py-2 text-[14px] text-(--pc-muted) transition-colors hover:text-(--pc-fg)', FOCUS)}>
              {label}
            </a>
          ))}
        </nav>
        <a
          href={`#${ids.subscribe}`}
          onClick={jump(ids.subscribe)}
          className={cn('hidden h-9 shrink-0 items-center gap-2 rounded-full border border-(--pc-line-strong) px-4 text-[14px] font-medium transition-colors hover:bg-(--pc-raised) @lg:inline-flex', FOCUS)}
        >
          <Icon name="rss" className="size-4" />
          Subscribe
        </a>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className={cn('inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-(--pc-line-strong) px-3.5 text-[14px] font-medium transition-colors hover:bg-(--pc-raised) @3xl:hidden', FOCUS)}
        >
          <Icon name={open ? 'close' : 'menu'} className="size-4" strokeWidth={2} />
          Menu
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            key="menu"
            id={menuId}
            aria-label="Sections"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-b border-(--pc-line) bg-(--pc-bg) px-5 pb-3 shadow-[0_24px_40px_-28px_rgb(0_0_0/0.6)] @3xl:hidden"
          >
            <ul className="mx-auto max-w-6xl">
              {[...links, ['Subscribe', ids.subscribe] as [string, string]].map(([label, id]) => (
                <li key={id} className="border-b border-(--pc-line) last:border-b-0">
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      setOpen(false)
                      jump(id)(event)
                    }}
                    className={cn('flex h-12 items-center justify-between rounded-md text-[16px] transition-colors hover:text-(--pc-accent-text)', FOCUS)}
                  >
                    {label}
                    <Icon name="arrow" className="size-4 text-(--pc-muted)" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ---------- 首屏 ---------- */

export function CopyFeed({ feed, className, compact }: { feed: string; className?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard
      .writeText(feed)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }
  return (
    <button
      type="button"
      onClick={copy}
      onBlur={() => setCopied(false)}
      onMouseLeave={() => setCopied(false)}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full border border-(--pc-line-strong) font-medium transition-colors hover:bg-(--pc-raised)',
        compact ? 'h-9 px-3.5 text-[13px]' : 'h-11 px-4 text-[15px]',
        FOCUS,
        className,
      )}
    >
      <Icon name={copied ? 'check' : compact ? 'copy' : 'rss'} className="size-[18px]" />
      {copied ? 'Copied' : compact ? 'Copy' : 'Copy RSS feed'}
      <span className="sr-only" aria-live="polite">
        {copied ? `Feed address ${feed} copied` : ''}
      </span>
    </button>
  )
}

export function Hero({ showName, tagline, art, ids, children }: { showName: string; tagline: string; art: ArtProps; ids: SectionIds; children: ReactNode }) {
  const jump = useJump()
  const [following, setFollowing] = useState(false)
  const ease = [0.22, 1, 0.36, 1] as const
  return (
    <section id={ids.top} className={cn(SECTION, 'relative pb-14 pt-8 @3xl:pb-16 @3xl:pt-12')}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(52%_62%_at_84%_0%,var(--pc-glow),transparent_72%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-end gap-7 @3xl:grid-cols-[minmax(0,1fr)_auto] @3xl:gap-12">
          <motion.div className="order-2 min-w-0 @3xl:order-1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <MetaLine className={cn(EYEBROW, 'text-(--pc-muted)')} items={['Science podcast', `Season ${SEASON}`, `${EPISODE_COUNT} episodes`]} />
            <h1 className="mt-3 leading-[0.92] [overflow-wrap:anywhere]" style={{ ...DISPLAY, fontSize: fluid('2.75rem', 9.2, '5.9rem') }}>
              {showName}
            </h1>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-(--pc-muted) @3xl:text-[18px]">{tagline}</p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                aria-pressed={following}
                onClick={() => setFollowing((value) => !value)}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-[transform,background-color,color,box-shadow] duration-150 active:scale-[0.98]',
                  following ? 'bg-(--pc-raised) text-(--pc-fg) shadow-[inset_0_0_0_1px_var(--pc-line-strong)]' : 'bg-(--pc-accent) text-(--pc-on-accent)',
                  FOCUS,
                )}
              >
                <Icon name={following ? 'check' : 'plus'} className="size-[18px]" strokeWidth={2.2} />
                <span>
                  {following ? 'Following' : 'Follow'}
                  {!following && <span className="hidden @md:inline"> the show</span>}
                </span>
              </button>
              <CopyFeed feed={`${slugify(showName)}.show/feed`} />
              <a
                href={`#${ids.subscribe}`}
                onClick={jump(ids.subscribe)}
                className={cn('inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-(--pc-muted) transition-colors hover:text-(--pc-fg)', FOCUS)}
              >
                <Icon name="mail" className="size-[18px]" />
                Weekly email
              </a>
            </div>
          </motion.div>
          <motion.div className="order-1 @3xl:order-2" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }}>
            <CoverArt
              style={art.coverStyle}
              accent={art.accent}
              title={art.showName}
              seed={3}
              variant="show"
              className="w-36 rounded-[calc(var(--pc-radius)-2px)] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] @3xl:w-[16.5rem] @5xl:w-[17.5rem]"
            />
          </motion.div>
        </div>
        <div id={ids.player} className="mt-10 scroll-mt-24 @3xl:mt-12">
          {children}
        </div>
      </div>
    </section>
  )
}

/* ---------- 章节与文字稿 ---------- */

function ChapterList({ episode, className }: { episode: Episode; className?: string }) {
  const store = usePlayerStore()
  const current = usePlayer((s) => (s.episode === episode.number ? chapterIndexAt(episode, s.time) : -1))
  const playing = usePlayer((s) => s.playing && s.episode === episode.number)
  const [fill, setFill] = useState<HTMLSpanElement | null>(null)
  usePlayerPaint((s) => {
    if (!fill || current < 0 || s.episode !== episode.number) return
    const start = episode.chapters[current]!.at
    const progress = (s.time - start) / (chapterEnd(episode, current) - start)
    fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress)).toFixed(4)})`
  })
  return (
    <div className={cn('rounded-(--pc-radius) border border-(--pc-line) bg-(--pc-surface) p-2', className)}>
      <ol>
        {episode.chapters.map((chapter, i) => {
          const active = i === current
          return (
            <li key={chapter.at}>
              <button
                type="button"
                onClick={() => store.seek(chapter.at)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'relative flex w-full items-center gap-3 overflow-hidden rounded-[calc(var(--pc-radius)-6px)] px-3 py-3 text-left transition-colors',
                  active ? 'bg-(--pc-raised)' : 'hover:bg-(--pc-raised)/60',
                  FOCUS,
                )}
              >
                {active && <span ref={setFill} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-(--pc-accent-ui)" style={{ transform: 'scaleX(0)' }} aria-hidden />}
                <span className={cn('w-6 shrink-0 text-[12px] tabular-nums', MONO, active ? 'text-(--pc-accent-text)' : 'text-(--pc-muted)')}>{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{chapter.title}</span>
                {active && playing && <Equalizer className="text-(--pc-accent-ui)" />}
                <span className={cn('shrink-0 text-[12px] tabular-nums text-(--pc-muted)', MONO)}>{formatTime(chapter.at)}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className={cn('flex items-center justify-between gap-3 border-t border-(--pc-line) px-3 pb-1.5 pt-3 text-[12px] text-(--pc-muted)', MONO)}>
        <span>
          {episode.chapters.length} chapters · {formatLength(episode.duration)}
        </span>
        <span>Ep {episode.number}</span>
      </p>
    </div>
  )
}

const WORDS = transcriptWords()

/** 本期提到的论文、数据和录音：在宽屏上和章节表叠在左栏，正好和右边的文字稿一样高。 */
function ShowNotes({ episode, className }: { episode: Episode; className?: string }) {
  // 卡片自己是容器：在宽屏左栏里也按卡片宽度决定类型标签放左边还是放上面
  return (
    <div className={cn('@container flex flex-col rounded-(--pc-radius) border border-(--pc-line) bg-(--pc-surface)', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-(--pc-line) px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-[14px] font-medium">
          <Icon name="notes" className="size-[18px] text-(--pc-accent-text)" />
          Mentioned in this episode
        </h3>
        <span className={cn('text-[12px] text-(--pc-muted)', MONO)}>Ep {episode.number}</span>
      </div>
      <ul className="px-2 py-2">
        {episode.notes.map((note) => (
          <li key={note.title} className="grid gap-1 px-3 py-3 @md:grid-cols-[5.75rem_minmax(0,1fr)] @md:gap-3">
            <span className={cn('text-[11px] uppercase tracking-[0.12em] text-(--pc-muted) @md:pt-[3px]', MONO)}>{note.kind}</span>
            <span className="min-w-0">
              <span className="block text-[15px] font-medium leading-snug">{note.title}</span>
              <span className="mt-1 block text-[13px] leading-snug text-(--pc-muted)">{note.source}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto border-t border-(--pc-line) px-5 py-3 text-[13px] leading-relaxed text-(--pc-muted)">Produced by Jonah Pell. Sound design by Ada Marsh. Theme music by The Plate Readers.</p>
    </div>
  )
}

function TranscriptCard({ accent, className }: { accent: string; className?: string }) {
  const store = usePlayerStore()
  const synced = usePlayer((s) => s.episode === TRANSCRIPT.episode)
  const index = usePlayer((s) => {
    if (s.episode !== TRANSCRIPT.episode) return WORDS.length
    let found = -1
    for (let i = 0; i < WORDS.length; i++) {
      if (WORDS[i]!.start <= s.time) found = i
      else break
    }
    return found
  })
  const activeLine = index >= 0 && index < WORDS.length && synced ? WORDS[index]!.line : -1
  const first = TRANSCRIPT.lines[0]!
  const last = TRANSCRIPT.lines[TRANSCRIPT.lines.length - 1]!
  const source = episodeBy(TRANSCRIPT.episode)
  const hues: Record<string, number> = { maren: 0, jonah: 40, ines: 160 }
  return (
    <div className={cn('flex flex-col rounded-(--pc-radius) border border-(--pc-line) bg-(--pc-surface)', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--pc-line) px-5 py-3.5">
        <h3 className="flex flex-wrap items-baseline gap-x-2 text-[14px] font-medium">
          <Icon name="transcript" className="size-[18px] self-center text-(--pc-accent-text)" />
          Transcript
          <span className={cn('text-[12px] font-normal text-(--pc-muted)', MONO)}>
            Ep {source.number} · {formatTime(first.at)}–{formatTime(last.at + 4)}
          </span>
        </h3>
        {!synced && (
          <button
            type="button"
            onClick={() => store.load(TRANSCRIPT.episode, { at: first.at, play: true })}
            className={cn('inline-flex h-8 items-center gap-1.5 rounded-full bg-(--pc-accent) px-3 text-[13px] font-semibold text-(--pc-on-accent)', FOCUS)}
          >
            <Icon name="play" className="size-3.5" />
            Play this excerpt
          </button>
        )}
      </div>
      {/* 播放器里换成了别的一集时，说清楚这段文字稿来自哪一集 */}
      {!synced && (
        <p className="border-b border-(--pc-line) bg-(--pc-raised) px-5 py-2.5 text-[13px] leading-relaxed text-(--pc-muted)">
          An excerpt from episode {source.number}, <span className="text-(--pc-fg)">{source.title}</span>. Full transcripts of every episode are in the archive.
        </p>
      )}
      <div className="px-2 py-2 @3xl:px-3">
        {TRANSCRIPT.lines.map((line, li) => {
          const speaker = SPEAKERS[line.speaker]
          const active = li === activeLine
          return (
            <div key={line.at} className={cn('grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-[calc(var(--pc-radius)-6px)] px-3 py-3 transition-colors duration-300', active && 'bg-(--pc-raised)')}>
              <Avatar name={speaker.name} accent={accent} hue={hues[line.speaker] ?? 0} className="w-8" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">{speaker.name}</span>
                  <span className="text-[12px] text-(--pc-muted)">{speaker.role === 'host' ? 'Host' : 'Guest'}</span>
                  <button
                    type="button"
                    onClick={() => store.load(TRANSCRIPT.episode, { at: line.at, play: true })}
                    aria-label={`Play from ${formatTime(line.at)}`}
                    className={cn('ml-auto rounded px-1 text-[12px] tabular-nums text-(--pc-accent-text) hover:underline', MONO, FOCUS)}
                  >
                    {formatTime(line.at)}
                  </button>
                </div>
                <p className="mt-1 text-[15px] leading-relaxed @3xl:text-[16px]">
                  {WORDS.map((word, wi) =>
                    word.line !== li ? null : (
                      <span
                        key={wi}
                        className={cn(
                          'transition-colors duration-200',
                          wi < index ? 'text-(--pc-fg)' : wi === index ? 'text-(--pc-fg) underline decoration-(--pc-accent-ui) decoration-2 underline-offset-[5px]' : 'text-(--pc-muted)',
                        )}
                      >
                        {word.text}{' '}
                      </span>
                    ),
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-auto border-t border-(--pc-line) px-5 py-3 text-[13px] text-(--pc-muted)">Lightly edited for clarity. Timestamps jump to that moment in the audio.</p>
    </div>
  )
}

export function Inside({ id, accent }: { id: string; accent: string }) {
  const number = usePlayer((s) => s.episode)
  const episode = EPISODES.find((e) => e.number === number) ?? EPISODES[0]!
  return (
    <section id={id} className={cn(SECTION, 'border-t border-(--pc-line) py-16 @3xl:py-24')}>
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={`Inside episode ${episode.number}`} title="Chapters and transcript">
          Jump to any chapter, or follow along with the conversation as it plays.
        </SectionHead>
        {/* 窄屏按章节、文字稿、本期提到的顺序往下排；宽屏左栏是章节和本期提到，右栏的文字稿跨两行 */}
        <div className="mt-9 grid gap-5 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:grid-rows-[auto_1fr] @4xl:gap-6">
          <ChapterList episode={episode} className="@4xl:col-start-1 @4xl:row-start-1" />
          <TranscriptCard accent={accent} className="@4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-1" />
          <ShowNotes episode={episode} className="@4xl:col-start-1 @4xl:row-start-2" />
        </div>
      </div>
    </section>
  )
}
