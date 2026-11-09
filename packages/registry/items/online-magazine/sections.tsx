// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/app/blog-sidebar/page.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '@motif/runtime'
import { Avatar, CalendarIcon, CommentIcon, Cover, EyeIcon, Icon, Masthead, SearchIcon, TagButton, headStyle, stay } from './parts'

type Palette = readonly [string, string, string]

interface Post {
  section: 'Culture' | 'Science' | 'Food'
  title: string
  paragraph: string
  author: { name: string; designation: string }
  publishDate: string
  palette: Palette
}

const COVERS = ['waves', 'orbits', 'blocks'] as const
/** mixed：按文章轮换三种封面，其他取值所有封面同一种。 */
const coverFor = (style: string, index: number) => (style === 'mixed' ? COVERS[index % COVERS.length]! : style)

const link = 'rounded-xs outline-none transition-colors duration-200 hover:text-[var(--accent-text)] focus-visible:ring-2 focus-visible:ring-primary'
const box = 'rounded-xs bg-card shadow-[var(--shadow-three)]'

export interface Layout {
  compact: boolean
  coverStyle: string
}

const sectionPad = (compact: boolean) => (compact ? 'py-12 @3xl:py-16' : 'py-16 @3xl:py-[100px]')

/* ---------- 刊头 ---------- */

const NAV = ['Culture', 'Science', 'Food', 'Ideas', 'Travel', 'Audio', 'Archive']

export function Header({ name }: { name: string }) {
  return (
    <header className="border-b border-border px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-xs font-medium text-muted-foreground">
          <span>
            Monday, 9 November 2026<span className="hidden @xl:inline"> · Issue 214</span>
          </span>
          <a href="#0" onClick={stay} className="shrink-0 rounded-xs bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground outline-none transition-[filter] duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            Subscribe
          </a>
        </div>
        <div className="flex justify-center py-6 @3xl:py-8">
          <a href="#0" onClick={stay} className="min-w-0 max-w-full rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`${name} home`}>
            <Masthead name={name} className="[font-size:clamp(1.6rem,6.5cqw,3.25rem)] leading-none [&_svg]:size-[0.9em]" />
          </a>
        </div>
        <nav aria-label="Sections" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <ul className="flex min-w-max justify-center gap-6 py-3 text-sm font-medium text-foreground/85 @3xl:gap-9">
            {NAV.map((item, i) => (
              <li key={item}>
                <a href="#0" onClick={stay} aria-current={i === 1 ? 'page' : undefined} className={cn(link, i === 1 && 'text-[var(--accent-text)]')}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

/* ---------- 封面故事 + 最多阅读 ---------- */

const COVER_STORY = {
  section: 'Culture',
  title: 'The night ferry that keeps an archipelago talking',
  paragraph:
    'Every evening at 21:40 the Saltholm Star leaves the mainland with mail, medicine and forty-odd passengers. We rode it for a week to hear what the islands say to each other on the way.',
  author: { name: 'Ines Calloway', designation: 'Senior Writer' },
  publishDate: '9 Nov 2026',
  palette: ['#14254a', '#3d5bd9', '#ffb347'] as Palette,
}

const MOST_READ = [
  ['The night ferry that keeps an archipelago talking', 'Culture', 14],
  ['Mapping the sea floor with fishing boats', 'Science', 9],
  ['Twelve bakeries, one sourdough starter', 'Food', 7],
  ['The quiet return of the neighbourhood repair shop', 'Ideas', 6],
  ['A walking guide to the river towns in winter', 'Travel', 11],
] as const

function Byline({ name, designation, date }: { name: string; designation: string; date: string }) {
  return (
    <div className="flex items-center">
      <div className="mr-5 flex min-w-0 items-center border-r border-border pr-5 @6xl:mr-3 @6xl:pr-3">
        <div className="mr-4">
          <Avatar name={name} />
        </div>
        <div className="w-full min-w-0">
          <p className="mb-1 text-sm font-medium text-foreground">By {name}</p>
          <p className="text-xs text-muted-foreground">{designation}</p>
        </div>
      </div>
      <div className="inline-block shrink-0">
        <p className="mb-1 text-sm font-medium text-foreground">Date</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  )
}

export function CoverStory({ compact, coverStyle }: Layout) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  const story = COVER_STORY
  return (
    <section className={cn('px-4', compact ? 'py-10 @3xl:py-12' : 'py-12 @3xl:py-16')} aria-label="Cover story">
      <div className="mx-auto grid max-w-[1200px] gap-8 @5xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <motion.article {...rise(0)} className={cn('group relative overflow-hidden', box)}>
          <a href="#0" onClick={stay} className="relative block aspect-[16/10] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary @3xl:aspect-[16/8]" aria-label={story.title}>
            <span className="absolute top-6 right-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground capitalize">{story.section}</span>
            <Cover variant={coverStyle === 'mixed' ? 'waves' : coverStyle} palette={story.palette} seed={3} className="transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
          </a>
          <div className={compact ? 'p-5 @xl:p-7' : 'p-6 @xl:p-8 @5xl:p-10'}>
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--accent-text)] uppercase">Cover story · 14 min read</p>
            <h2 className="mt-3 text-balance text-foreground [font-size:clamp(1.7rem,3.6cqw,2.6rem)] leading-[1.12]" style={headStyle}>
              <a href="#0" onClick={stay} className={link}>
                {story.title}
              </a>
            </h2>
            <p className="mt-4 mb-6 max-w-2xl border-b border-border pb-6 text-base leading-relaxed font-medium text-muted-foreground @xl:text-lg">{story.paragraph}</p>
            <Byline name={story.author.name} designation={story.author.designation} date={story.publishDate} />
          </div>
        </motion.article>

        <motion.aside {...rise(0.12)} className={cn(box, 'self-start')} aria-labelledby="most-read-title">
          <h2 id="most-read-title" className="border-b border-border px-8 py-4 text-lg font-semibold text-foreground">
            Most read this week
          </h2>
          <ol className={cn('px-8', compact ? 'py-1' : 'py-3')}>
            {MOST_READ.map(([title, section, minutes], i) => (
              <li key={title} className={cn('flex gap-5 border-b border-border last:border-0', compact ? 'py-4' : 'py-5')}>
                <span className="w-9 shrink-0 text-3xl leading-none text-[var(--accent-text)] tabular-nums" style={headStyle} aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <a href="#0" onClick={stay} className={cn(link, 'block text-base leading-snug font-medium text-foreground')}>
                    {title}
                  </a>
                  <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                    {section} · {minutes} min read
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>
    </section>
  )
}

/* ---------- 栏目文章网格（上游 blog 页 + SingleBlog） ---------- */

const POSTS: Post[] = [
  {
    section: 'Culture',
    title: 'A village choir rebuilt from cassette tapes',
    paragraph: 'When the last founding member died, the choir had no sheet music left. It had 61 cassettes recorded in a church hall since 1979.',
    author: { name: 'Tomas Reyes', designation: 'Culture Editor' },
    publishDate: '7 Nov 2026',
    palette: ['#5e1f3d', '#d65a78', '#ffd28a'],
  },
  {
    section: 'Science',
    title: 'Mapping the sea floor with fishing boats',
    paragraph: 'Forty trawlers off the west coast now log depth soundings on every trip. The result is the most detailed chart the region has had.',
    author: { name: 'Halvard Lien', designation: 'Science Writer' },
    publishDate: '3 Nov 2026',
    palette: ['#0b3d4f', '#1b8a8f', '#9ef0d9'],
  },
  {
    section: 'Food',
    title: 'The fermenting season: a kitchen notebook',
    paragraph: 'Cabbage in October, plums in November, a crock of miso that will not be ready until spring. Notes from a year of jars.',
    author: { name: 'Lucia Ferrante', designation: 'Food Editor' },
    publishDate: '30 Oct 2026',
    palette: ['#5a2d0c', '#d9822b', '#f6e3b4'],
  },
  {
    section: 'Culture',
    title: 'Why small cinemas are booking matinees again',
    paragraph: 'Daytime screenings were the first thing independents cut. Now they sell out, mostly to retirees and remote workers with a free afternoon.',
    author: { name: 'Priya Nandakumar', designation: 'Contributor' },
    publishDate: '5 Nov 2026',
    palette: ['#2b1b4a', '#7b4bd1', '#f7c948'],
  },
  {
    section: 'Science',
    title: 'What a cold winter tells us about bird memory',
    paragraph: 'Chickadees cache thousands of seeds each autumn and find most of them again. A long freeze showed researchers how they do it.',
    author: { name: 'Amara Osei', designation: 'Contributing Editor' },
    publishDate: '1 Nov 2026',
    palette: ['#20324a', '#6c8fbf', '#f2efe6'],
  },
  {
    section: 'Food',
    title: 'Twelve bakeries, one sourdough starter',
    paragraph: 'A starter first fed in 1994 now lives in a dozen kitchens across three cities. We followed it from bakery to bakery.',
    author: { name: 'Ben Okafor', designation: 'Staff Writer' },
    publishDate: '28 Oct 2026',
    palette: ['#6b3e26', '#c98f5a', '#fff1d6'],
  },
]

function SingleBlog({ blog, cover, seed, compact }: { blog: Post; cover: string; seed: number; compact: boolean }) {
  const { title, paragraph, author, section, publishDate, palette } = blog
  return (
    <article className="group relative h-full overflow-hidden rounded-xs bg-card shadow-[0px_2px_3px_rgba(7,7,77,0.05)] transition-shadow duration-300 hover:shadow-[0px_5px_18px_rgba(6,8,15,0.14)]">
      <a href="#0" onClick={stay} className="relative block aspect-[37/22] w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={title}>
        <span className="absolute top-6 right-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground capitalize">{section}</span>
        <Cover variant={cover} palette={palette} seed={seed} className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
      </a>
      <div className={compact ? 'p-5' : 'p-6 @xl:p-8 @3xl:px-6 @3xl:py-8 @5xl:p-8 @6xl:px-5 @6xl:py-8'}>
        <h3>
          <a href="#0" onClick={stay} className={cn(link, 'mb-4 block text-xl text-foreground @xl:text-2xl')} style={headStyle}>
            {title}
          </a>
        </h3>
        <p className={cn('border-b border-border text-base font-medium text-muted-foreground', compact ? 'mb-5 pb-5' : 'mb-6 pb-6')}>{paragraph}</p>
        <Byline name={author.name} designation={author.designation} date={publishDate} />
      </div>
    </article>
  )
}

const TABS = ['All', 'Culture', 'Science', 'Food'] as const

export function Latest({ compact, coverStyle, columns }: Layout & { columns: number }) {
  const reduced = useReducedMotion()
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const posts = POSTS.map((post, i) => ({ post, i })).filter(({ post }) => tab === 'All' || post.section === tab)
  const width = columns >= 3 ? '@3xl:w-2/3 @5xl:w-1/2 @6xl:w-1/3' : '@3xl:w-2/3 @5xl:w-1/2'

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1
    const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? last : -1
    if (next < 0) return
    event.preventDefault()
    setTab(TABS[next]!)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={cn('border-t border-border px-4', sectionPad(compact))} aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-[1200px]">
        <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border pb-5', compact ? 'mb-8' : 'mb-12')}>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--accent-text)] uppercase">The sections</p>
            <h2 id={`${id}-title`} className="mt-2 text-foreground [font-size:clamp(1.6rem,3cqw,2.25rem)] leading-tight" style={headStyle}>
              Latest stories
            </h2>
          </div>
          <div role="tablist" aria-label="Filter by section" className="flex flex-wrap gap-2">
            {TABS.map((name, i) => {
              const selected = name === tab
              return (
                <button
                  key={name}
                  ref={(node) => {
                    tabRefs.current[i] = node
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${name}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(name)}
                  onKeyDown={(event) => onKey(event, i)}
                  className={cn(
                    'rounded-xs px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <motion.div
          key={tab}
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${tab}`}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="-mx-4 flex flex-wrap justify-center"
        >
          {posts.map(({ post, i }) => (
            <div key={post.title} className={cn('w-full px-4', compact ? 'mb-6' : 'mb-8', width)}>
              <SingleBlog blog={post} cover={coverFor(coverStyle, i)} seed={i} compact={compact} />
            </div>
          ))}
        </motion.div>

        <nav aria-label="Pagination" className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <ul className="flex flex-wrap items-center justify-center gap-y-2 pt-4">
              {['Prev', '1', '2', '3', '...', '12', 'Next'].map((label) =>
                label === '...' ? (
                  <li key={label} className="mx-1">
                    <span className="flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md bg-muted px-4 text-sm text-muted-foreground">...</span>
                  </li>
                ) : (
                  <li key={label} className="mx-1">
                    <a
                      href="#0"
                      onClick={stay}
                      aria-current={label === '1' ? 'page' : undefined}
                      className={cn(
                        'flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm outline-none transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary',
                        label === '1' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </nav>
      </div>
    </section>
  )
}

/* ---------- 文章页 + 侧栏（上游 blog-sidebar 页） ---------- */

const bodyText = 'text-base leading-relaxed font-medium text-muted-foreground @xl:text-lg @xl:leading-relaxed @5xl:text-base @5xl:leading-relaxed @6xl:text-lg @6xl:leading-relaxed'

const RELATED = [
  { title: 'What a cold winter tells us about bird memory', date: '1 Nov 2026', palette: ['#20324a', '#6c8fbf', '#f2efe6'] as Palette },
  { title: 'The tide tables nobody reads any more', date: '19 Oct 2026', palette: ['#0f2f3a', '#2f7d8c', '#ffd28a'] as Palette },
  { title: 'Inside the seed vault under a northern hill', date: '6 Oct 2026', palette: ['#23301c', '#6f8f4a', '#f6e3b4'] as Palette },
]

function RelatedPost({ title, date, palette, cover, seed }: { title: string; date: string; palette: Palette; cover: string; seed: number }) {
  return (
    <div className="flex items-center @5xl:block @6xl:flex">
      <div className="mr-5 @5xl:mb-3 @6xl:mb-0">
        <div className="relative h-[60px] w-[70px] overflow-hidden rounded-md @xl:h-[75px] @xl:w-[85px]">
          <Cover variant={cover} palette={palette} seed={seed} />
        </div>
      </div>
      <div className="w-full min-w-0">
        <h3>
          <a href="#0" onClick={stay} className={cn(link, 'mb-[6px] block text-base leading-snug font-medium text-foreground')}>
            {title}
          </a>
        </h3>
        <p className="text-xs font-medium text-muted-foreground">{date}</p>
      </div>
    </div>
  )
}

function NewsLatterBox({ accent, dark }: { accent: string; dark: boolean }) {
  const id = `nl${useId().replace(/[^\w-]/g, '')}`
  const [sent, setSent] = useState(false)
  const stop = dark ? '#ffffff' : accent
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }
  const input = 'mb-4 w-full rounded-xs border border-border bg-muted px-6 py-3 text-base text-foreground outline-none transition-[border-color] duration-300 placeholder:text-muted-foreground focus:border-primary'
  return (
    <div className={cn('relative z-10 overflow-hidden p-8 @xl:p-11 @5xl:p-8 @6xl:p-11', box)}>
      <h3 className="mb-4 text-2xl leading-tight text-foreground" style={headStyle}>
        Subscribe to the Sunday edition
      </h3>
      <p className="mb-11 border-b border-border pb-11 text-base leading-relaxed text-muted-foreground">One email a week: the five stories our editors liked best, plus one from the archive.</p>
      {sent ? (
        <p role="status" className="flex items-center justify-center gap-2 rounded-xs bg-muted px-6 py-4 text-base font-medium text-foreground">
          <Icon name="check" className="size-5 text-[var(--accent-text)]" />
          You are on the list. See you Sunday.
        </p>
      ) : (
        <form onSubmit={submit}>
          <input type="text" name="name" aria-label="Your name" placeholder="Enter your name" autoComplete="name" className={input} />
          <input type="email" name="email" aria-label="Your email" placeholder="Enter your email" autoComplete="email" required className={input} />
          <button
            type="submit"
            className="mb-5 flex w-full cursor-pointer items-center justify-center rounded-xs bg-primary px-9 py-4 text-base font-medium text-primary-foreground shadow-[0px_5px_20px_rgba(4,10,34,0.1)] outline-none transition-[filter] duration-300 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Subscribe
          </button>
          <p className="text-center text-base leading-relaxed text-muted-foreground">No spam. Unsubscribe in one click.</p>
        </form>
      )}

      <div aria-hidden className="pointer-events-none">
        <span className="absolute top-7 left-2 -z-10">
          <svg width="57" height="65" viewBox="0 0 57 65" fill="none">
            <path opacity="0.5" d="M0.407629 15.9573L39.1541 64.0714L56.4489 0.160793L0.407629 15.9573Z" fill={`url(#${id}-a)`} />
            <defs>
              <linearGradient id={`${id}-a`} x1="-18.3187" y1="55.1044" x2="37.161" y2="15.3509" gradientUnits="userSpaceOnUse">
                <stop stopColor={stop} stopOpacity="0.62" />
                <stop offset="1" stopColor={stop} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="absolute bottom-24 left-1.5 -z-10">
          <svg width="39" height="32" viewBox="0 0 39 32" fill="none">
            <path opacity="0.5" d="M14.7137 31.4215L38.6431 4.24115L6.96581e-07 0.624124L14.7137 31.4215Z" fill={`url(#${id}-b)`} />
            <defs>
              <linearGradient id={`${id}-b`} x1="39.1948" y1="38.335" x2="10.6982" y2="10.2511" gradientUnits="userSpaceOnUse">
                <stop stopColor={stop} stopOpacity="0.62" />
                <stop offset="1" stopColor={stop} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="absolute top-[140px] right-2 -z-10">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path
              opacity="0.5"
              d="M10.6763 35.3091C23.3976 41.6367 38.1681 31.7045 37.107 17.536C36.1205 4.3628 21.9407 -3.46901 10.2651 2.71063C-2.92254 9.69061 -2.68321 28.664 10.6763 35.3091Z"
              fill={`url(#${id}-c)`}
            />
            <defs>
              <linearGradient id={`${id}-c`} x1="-0.571054" y1="-37.1717" x2="28.7937" y2="26.7564" gradientUnits="userSpaceOnUse">
                <stop stopColor={stop} stopOpacity="0.62" />
                <stop offset="1" stopColor={stop} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="absolute top-0 right-0 -z-10">
          <svg width="162" height="91" viewBox="0 0 162 91" fill="none">
            <g opacity="0.3">
              {[
                'M1 89.9999C8 77.3332 27.7 50.7999 50.5 45.9999C79 39.9999 95 41.9999 106 30.4999C117 18.9999 126 -3.50014 149 -3.50014C172 -3.50014 187 4.99986 200.5 -8.50014C214 -22.0001 210.5 -46.0001 244 -37.5001C270.8 -30.7001 307.167 -45 322 -53',
                'M43 64.9999C50 52.3332 69.7 25.7999 92.5 20.9999C121 14.9999 137 16.9999 148 5.49986C159 -6.00014 168 -28.5001 191 -28.5001C214 -28.5001 229 -20.0001 242.5 -33.5001C256 -47.0001 252.5 -71.0001 286 -62.5001C312.8 -55.7001 349.167 -70 364 -78',
                'M4 73.9999C11 61.3332 30.7 34.7999 53.5 29.9999C82 23.9999 98 25.9999 109 14.4999C120 2.99986 129 -19.5001 152 -19.5001C175 -19.5001 190 -11.0001 203.5 -24.5001C217 -38.0001 213.5 -62.0001 247 -53.5001C273.8 -46.7001 310.167 -61 325 -69',
                'M41 40.9999C48 28.3332 67.7 1.79986 90.5 -3.00014C119 -9.00014 135 -7.00014 146 -18.5001C157 -30.0001 166 -52.5001 189 -52.5001C212 -52.5001 227 -44.0001 240.5 -57.5001C254 -71.0001 250.5 -95.0001 284 -86.5001C310.8 -79.7001 347.167 -94 362 -102',
              ].map((d, i) => (
                <path key={i} opacity="0.45" d={d} stroke={`url(#${id}-w${i})`} />
              ))}
            </g>
            <defs>
              {[
                [291.35, 12.1032, 179.211, 237.617],
                [333.35, -12.8968, 221.211, 212.617],
                [294.35, -3.89678, 182.211, 221.617],
                [331.35, -36.8968, 219.211, 188.617],
              ].map(([x1, y1, x2, y2], i) => (
                <linearGradient key={i} id={`${id}-w${i}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
                  <stop offset="0.328125" stopColor={stop} />
                  <stop offset="1" stopColor={stop} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
          </svg>
        </span>
      </div>
    </div>
  )
}

function QuoteBox({ accent }: { accent: string }) {
  const id = `qb${useId().replace(/[^\w-]/g, '')}`
  return (
    <figure className={cn('relative z-10 mb-10 overflow-hidden rounded-md p-8 @3xl:p-9 @5xl:p-8 @6xl:p-9', 'bg-primary/10')}>
      <blockquote className="text-center text-base font-medium text-foreground/80 italic">
        “We used to keep this stuff in our heads and pass it on over a pint. Now the next skipper gets it on a screen before he leaves the quay.”
      </blockquote>
      <figcaption className="mt-3 text-center text-sm font-medium text-muted-foreground">Ewan Doyle, skipper of the Morning Wren</figcaption>
      <span className="absolute top-0 left-0 z-[-1]" aria-hidden>
        <svg width="132" height="109" viewBox="0 0 132 109" fill="none">
          <path opacity="0.5" d="M33.0354 90.11C19.9851 102.723 -3.75916 101.834 -14 99.8125V-15H132C131.456 -12.4396 127.759 -2.95278 117.318 14.5117C104.268 36.3422 78.7114 31.8952 63.2141 41.1934C47.7169 50.4916 49.3482 74.3435 33.0354 90.11Z" fill={`url(#${id}-a)`} />
          <path opacity="0.5" d="M33.3654 85.0768C24.1476 98.7862 1.19876 106.079 -9.12343 108.011L-38.876 22.9988L100.816 -25.8905C100.959 -23.8126 99.8798 -15.5499 94.4164 0.87754C87.5871 21.4119 61.9822 26.677 49.5641 38.7512C37.146 50.8253 44.8877 67.9401 33.3654 85.0768Z" fill={`url(#${id}-b)`} />
          <defs>
            <linearGradient id={`${id}-a`} x1="94.7523" y1="82.0246" x2="8.40951" y2="52.0609" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.06" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-b`} x1="90.3206" y1="58.4236" x2="1.16149" y2="50.8365" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.06" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="absolute right-0 bottom-0 z-[-1]" aria-hidden>
        <svg width="53" height="30" viewBox="0 0 53 30" fill="none">
          <circle opacity="0.8" cx="37.5" cy="37.5" r="37.5" fill={accent} />
          <circle opacity="0.8" cx="37.5" cy="37.5" r="37.5" fill={`url(#${id}-r)`} />
          <defs>
            <radialGradient id={`${id}-r`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(37.5 37.5) rotate(90) scale(40.2574)">
              <stop stopOpacity="0.47" />
              <stop offset="1" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </span>
    </figure>
  )
}

const CATEGORIES = ['Culture', 'Science', 'Food', 'Ideas', 'Travel']
const SIDEBAR_TAGS = ['Long reads', 'Interviews', 'Climate', 'Recipes', 'Field notes']
const SHARE = [
  ['link', 'Copy link'],
  ['mail', 'Share by email'],
  ['bookmark', 'Save for later'],
] as const

export function Article({ compact, coverStyle, showSidebar, accent, dark }: Layout & { showSidebar: boolean; accent: string; dark: boolean }) {
  const [query, setQuery] = useState('')
  const related = RELATED.filter((post) => post.title.toLowerCase().includes(query.trim().toLowerCase()))
  const gap = compact ? 'mb-7' : 'mb-10'
  return (
    <section className={cn('overflow-hidden border-t border-border px-4', sectionPad(compact))} aria-label="Featured article">
      <div className="mx-auto max-w-[1200px]">
        <div className={cn('-mx-4 flex flex-wrap', !showSidebar && 'justify-center')}>
          <article className="w-full px-4 @5xl:w-8/12">
            <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-[var(--accent-text)] uppercase">Science · Long read</p>
            <h1 className="mb-8 text-3xl leading-tight text-foreground @xl:text-4xl @xl:leading-tight" style={headStyle}>
              Mapping the sea floor with fishing boats
            </h1>
            <div className={cn('flex flex-wrap items-center justify-between border-b border-border pb-4', gap)}>
              <div className="flex flex-wrap items-center">
                <div className="mr-10 mb-5 flex items-center">
                  <div className="mr-4">
                    <Avatar name="Halvard Lien" />
                  </div>
                  <div className="w-full">
                    <span className="mb-1 text-base font-medium text-muted-foreground">
                      By <span className="text-foreground"> Halvard Lien</span>
                    </span>
                  </div>
                </div>
                <div className="mb-5 flex items-center">
                  <p className="mr-5 flex items-center text-base font-medium text-muted-foreground">
                    <span className="mr-3">
                      <CalendarIcon />
                    </span>
                    3 Nov 2026
                  </p>
                  <p className="mr-5 flex items-center text-base font-medium text-muted-foreground">
                    <span className="mr-3">
                      <CommentIcon />
                    </span>
                    48<span className="sr-only"> comments</span>
                  </p>
                  <p className="flex items-center text-base font-medium text-muted-foreground">
                    <span className="mr-3">
                      <EyeIcon />
                    </span>
                    3.1k<span className="sr-only"> views</span>
                  </p>
                </div>
              </div>
              <div className="mb-5">
                <a href="#0" onClick={stay} className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  Science
                </a>
              </div>
            </div>
            <div>
              <p className={cn(bodyText, gap)}>
                Charts of the coastal shelf were last surveyed properly in the 1970s. Since then the sand has moved, wrecks have settled and two harbours have silted up. The fishing fleet noticed long before the maps did.
              </p>
              <div className={cn('w-full overflow-hidden rounded-xs', gap)}>
                <div className="relative aspect-[97/60] w-full @xl:aspect-[97/44]">
                  <Cover variant={coverStyle === 'mixed' ? 'orbits' : coverStyle} palette={['#0b3d4f', '#1b8a8f', '#9ef0d9']} seed={4} />
                </div>
              </div>
              <p className={cn(bodyText, compact ? 'mb-6' : 'mb-8')}>
                Three years ago, a cooperative of skippers in Kerrow began fitting low-cost echo sounders to their boats and uploading the soundings when they came back into port. Each trip adds a thin line of depth readings; thousands of trips add up to a surface.
                <strong className="text-[var(--accent-text)]"> The cooperative now covers 1,800 square kilometres, </strong>
                about four times what the national survey managed in the same period.
              </p>
              <p className={cn(bodyText, gap)}>
                The data is messy. Boats roll, tides move the water level by several metres, and every sounder has its own small bias. Marta Lindqvist, a hydrographer at the regional university, spends most of her week correcting for all three.
                <span className="text-[var(--accent-text)] underline"> “The errors are random and the sea floor isn’t,” </span>
                she says. With enough passes over the same ground, the noise averages out.
              </p>
              <h2 className={cn('text-xl leading-tight text-foreground @xl:text-2xl @xl:leading-tight @5xl:text-xl @5xl:leading-tight @6xl:text-2xl @6xl:leading-tight', gap)} style={headStyle}>
                What the boats see that surveys miss
              </h2>
              <p className={cn(bodyText, gap)}>Because the fleet works the same grounds every week, it records change rather than a single snapshot. That has turned up things a one-off survey never would:</p>
              <ul className={cn('list-inside list-disc text-muted-foreground', gap)}>
                {[
                  'A sandbank off Gull Point that moves about 40 metres north each winter.',
                  'Two uncharted wrecks, one of them a steamer lost in 1911.',
                  'Scour holes around a wind farm cable that nobody had reported.',
                  'A harbour channel half a metre shallower than the chart says.',
                ].map((item) => (
                  <li key={item} className="mb-2 text-base font-medium text-muted-foreground @xl:text-lg @5xl:text-base @6xl:text-lg">
                    {item}
                  </li>
                ))}
              </ul>
              <QuoteBox accent={accent} />
              <p className={cn(bodyText, gap)}>
                The national hydrographic office now uses the cooperative’s soundings to decide where to send its own survey ship next. The skippers get something back too: a free chart of their own grounds, refreshed every month.
              </p>
              <div className="items-center justify-between @xl:flex">
                <div className="mb-5">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">Filed under :</h3>
                  <div className="flex flex-wrap items-center">
                    <TagButton text="Oceans" />
                    <TagButton text="Fieldwork" />
                    <TagButton text="Data" />
                  </div>
                </div>
                <div className="mb-5">
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground @xl:text-right">Share this story :</h3>
                  <div className="flex items-center gap-3 @xl:justify-end">
                    {SHARE.map(([icon, label]) => (
                      <a
                        key={icon}
                        href="#0"
                        onClick={stay}
                        aria-label={label}
                        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xs bg-muted text-muted-foreground outline-none transition-colors duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Icon name={icon} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {showSidebar && (
            <aside className="w-full px-4 @5xl:w-4/12" aria-label="Sidebar">
              <form role="search" onSubmit={stay} className={cn('mt-12 p-6 @5xl:mt-0', gap, box)}>
                <div className="flex items-center justify-between">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search related stories"
                    placeholder="Search here..."
                    className="mr-4 w-full min-w-0 rounded-xs border border-border bg-muted px-6 py-3 text-base text-foreground outline-none transition-[border-color] duration-300 placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button type="submit" aria-label="Search" className="flex h-[50px] w-full max-w-[50px] shrink-0 items-center justify-center rounded-xs bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    <SearchIcon />
                  </button>
                </div>
              </form>
              <div className={cn(gap, box)}>
                <h2 className="border-b border-border px-8 py-4 text-lg font-semibold text-foreground">Related Stories</h2>
                <ul className="p-8" aria-live="polite">
                  {related.map((post, i) => (
                    <li key={post.title} className="mb-6 border-b border-border pb-6 last:mb-0 last:border-0 last:pb-0">
                      <RelatedPost {...post} cover={coverFor(coverStyle, i + 1)} seed={i + 7} />
                    </li>
                  ))}
                  {related.length === 0 && <li className="text-base text-muted-foreground">No related stories match “{query.trim()}”.</li>}
                </ul>
              </div>
              <div className={cn(gap, box)}>
                <h2 className="border-b border-border px-8 py-4 text-lg font-semibold text-foreground">Popular Sections</h2>
                <ul className="px-8 py-6">
                  {CATEGORIES.map((name) => (
                    <li key={name}>
                      <a href="#0" onClick={stay} className={cn(link, 'mb-3 inline-block text-base font-medium text-muted-foreground')}>
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(gap, box)}>
                <h2 className="border-b border-border px-8 py-4 text-lg font-semibold text-foreground">Popular Tags</h2>
                <div className="flex flex-wrap px-8 py-6">
                  {SIDEBAR_TAGS.map((name) => (
                    <TagButton key={name} text={name} />
                  ))}
                </div>
              </div>
              <NewsLatterBox accent={accent} dark={dark} />
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- 页脚 ---------- */

export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 @4xl:flex-row @4xl:items-center @4xl:justify-between">
        <Masthead name={name} className="text-xl" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
            {['About', 'Contributors', 'Corrections', 'Advertise', 'Privacy'].map((item) => (
              <li key={item}>
                <a href="#0" onClick={stay} className={link}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 {name}. Independent and reader-funded.</p>
      </div>
    </footer>
  )
}
