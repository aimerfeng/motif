import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/motif-runtime'
import { AWARDS, formatCoords, OFFICES, PARTNERS, PROJECTS, TYPOLOGIES, typologyLabel, type Project, type Typology } from './data'
import { PLANS, SECTIONS } from './drawings'
import { LineDrawing, viewBoxOf } from './line-drawing'

/* ---------- 共用的字体类与小部件 ---------- */

export const display = '[font-family:var(--font-display)] [font-weight:var(--display-weight)] [letter-spacing:var(--display-tracking)]'
export const mono = '[font-family:var(--font-mono)] text-[11px] uppercase tracking-[0.12em]'
const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-line)]'
const linkish = cn('underline decoration-[var(--line-strong)] underline-offset-[5px] transition-[text-decoration-color] duration-150 hover:decoration-[var(--accent-line)]', focusRing)

export type ProjectId = Project['id']
export type Filter = Typology | 'all'

function Arrow({ dir = 'right', className }: { dir?: 'right' | 'down' | 'up'; className?: string }) {
  const d = { right: 'M3 8h10M9 4l4 4-4 4', down: 'M8 3v10M4 9l4 4 4-4', up: 'M8 13V3M4 7l4-4 4 4' }[dir]
  return (
    <svg viewBox="0 0 16 16" className={cn('size-3.5 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d={d} />
    </svg>
  )
}

/** 虚构的事务所标志：一个带隔墙的方形平面，一个红铅笔方块。 */
function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" aria-hidden>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.75 13.5H11V21.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14.25" y="6" width="3.5" height="3.5" fill="var(--accent-line)" />
    </svg>
  )
}

function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(mono, 'text-[var(--muted)]', className)}>{children}</p>
}

/* ---------- 导航 ---------- */

const NAV = [
  ['index', 'Index'],
  ['plans', 'Plans'],
  ['practice', 'Practice'],
  ['awards', 'Awards'],
  ['offices', 'Offices'],
] as const

/** 页内跳转链接：保留真实的 href（可复制、可在新标签打开），点击时平滑滚动（减少动态效果时直接跳）。 */
function jump(uid: string, target: string, onNav: (target: string) => void, after?: () => void) {
  return {
    href: `#${uid}-${target}`,
    onClick: (event: { preventDefault: () => void }) => {
      event.preventDefault()
      after?.()
      onNav(target)
    },
  }
}

export function Header({ name, uid, onNav }: { name: string; uid: string; onNav: (target: string) => void }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-5 @3xl:px-8 @6xl:px-10">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault()
            onNav('top')
          }}
          className={cn('flex min-w-0 items-center gap-2.5', focusRing)}
        >
          <Mark />
          <span className="truncate text-[15px] font-medium tracking-[-0.01em]">{name}</span>
          <span className={cn(mono, 'hidden text-[var(--muted)] @md:inline')}>Architects</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-6 text-[14px] @3xl:flex @5xl:gap-8">
          {NAV.map(([id, label]) => (
            <a key={id} {...jump(uid, id, onNav)} className={cn('text-[var(--muted)] transition-colors duration-150 hover:text-[var(--ink)]', focusRing)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a
            {...jump(uid, 'contact', onNav)}
            className={cn('hidden h-9 items-center gap-2 border border-[var(--line-strong)] px-3.5 text-[14px] transition-colors duration-150 hover:bg-[var(--ink)] hover:text-[var(--bg)] @3xl:inline-flex', focusRing)}
          >
            Contact <Arrow />
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className={cn('grid size-10 place-items-center border border-[var(--line-strong)] @3xl:hidden', focusRing)}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d={open ? 'M5 5l10 10M15 5L5 15' : 'M3 6h14M3 10h14M3 14h14'} />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id={menuId} aria-label="Sections" className="border-t border-[var(--line)] px-5 pb-3 @3xl:hidden">
          {[...NAV, ['contact', 'Contact'] as const].map(([id, label]) => (
            <a
              key={id}
              {...jump(uid, id, onNav, () => setOpen(false))}
              className={cn('flex w-full items-center justify-between border-b border-[var(--line)] py-3 text-left text-[15px] last:border-b-0', focusRing)}
            >
              {label}
              <Arrow className="text-[var(--muted)]" />
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

/* ---------- 首屏介绍 ---------- */

const FACTS = [
  ['Founded', '2009'],
  ['People', '38'],
  ['Projects', '64, 41 built'],
  ['Offices', 'Rotterdam, Porto'],
] as const

export function Intro({ name, statement, className }: { name: string; statement: string; className?: string }) {
  // 开场白很长时字号跟着收一点，首屏不至于被一句话占满
  const fit = Math.min(1, Math.sqrt(150 / Math.max(150, name.length + statement.length + 1)))
  return (
    <section className={cn('@container pb-12 pt-10 @3xl:pt-14', className)} aria-label="About the practice">
      <Kicker>Architecture · Landscape · Interiors</Kicker>
      <h1 className={cn(display, 'mt-5 text-pretty leading-[1.12] [font-size:clamp(1.5rem,calc(5.3cqw*var(--ds)*var(--fit)),2.9rem)]')} style={{ '--fit': fit.toFixed(3) } as CSSProperties}>
        {name} {statement}
      </h1>
      <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--line)] pt-5 @md:grid-cols-4">
        {FACTS.map(([term, value]) => (
          <div key={term} className="min-w-0">
            <dt className={cn(mono, 'text-[var(--muted)]')}>{term}</dt>
            <dd className="mt-1.5 text-[15px]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ---------- 项目索引表 ---------- */

/** 某个筛选下看得见的项目，顺序与索引表一致。 */
export function rowsFor(filter: Filter): Project[] {
  return filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.typology === filter)
}

export function IndexTable({
  id,
  className,
  rows,
  filter,
  onFilter,
  shownId,
  selectedId,
  onHover,
  onSelect,
  coords,
}: {
  id: string
  className?: string
  rows: Project[]
  filter: Filter
  onFilter: (filter: Filter) => void
  shownId: string
  selectedId: ProjectId
  onHover: (id: ProjectId | null) => void
  onSelect: (id: ProjectId) => void
  coords: boolean
}) {
  const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, ...TYPOLOGIES]
  return (
    <section id={id} className={cn('@container scroll-mt-20 pb-16', className)} aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--line-strong)] pb-3">
        <h2 id={`${id}-title`} className={cn(display, 'text-[24px] leading-none')}>
          Index
        </h2>
        <p className={cn(mono, 'text-[var(--muted)]')} aria-live="polite">
          {rows.length} of 64 projects
        </p>
      </div>
      <div role="group" aria-label="Filter by typology" className="-mx-1 flex flex-wrap gap-1 py-3">
        {filters.map((item) => {
          const count = item.id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.typology === item.id).length
          const on = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => onFilter(item.id)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 px-2.5 text-[14px] transition-colors duration-150',
                on ? 'bg-[var(--ink)] text-[var(--bg)]' : 'text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]',
                focusRing,
              )}
            >
              {item.label}
              <span className="[font-family:var(--font-mono)] text-[11px] tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
      {/* 固定列宽：筛选后行变少，各列也不会左右跳 */}
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Selected projects. Hover or focus a project to see its plan; choose it to open the project below.</caption>
        <thead>
          <tr className={cn(mono, 'text-[var(--muted)]')}>
            <th scope="col" className="w-14 py-2.5 pl-3 font-normal">
              No.
            </th>
            <th scope="col" className="py-2.5 pr-4 font-normal">
              Project
            </th>
            <th scope="col" className="hidden w-[10.75rem] py-2.5 pr-4 font-normal @xl:table-cell">
              Place
            </th>
            <th scope="col" className="hidden w-[7rem] py-2.5 pr-4 font-normal @xl:table-cell">
              Typology
            </th>
            <th scope="col" className="w-14 py-2.5 pr-1 text-right font-normal">
              Year
            </th>
          </tr>
        </thead>
        <tbody onPointerLeave={() => onHover(null)}>
          {rows.map((p) => {
            const selected = p.id === selectedId
            return (
              <tr
                key={p.id}
                data-active={shownId === p.id ? '' : undefined}
                onPointerEnter={() => onHover(p.id)}
                onClick={() => onSelect(p.id)}
                className="group cursor-pointer border-t border-[var(--line)] transition-colors duration-150 data-[active]:bg-[var(--hover)]"
              >
                <td className="relative py-3.5 pl-3 pr-2 align-top [font-family:var(--font-mono)] text-[12px] tabular-nums">
                  <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[var(--accent-line)] transition-transform duration-200 group-data-[active]:scale-y-100" />
                  <span className={selected ? 'text-[var(--accent-ink)]' : 'text-[var(--muted)]'}>{p.id}</span>
                </td>
                <td className="py-3.5 pr-4 align-top">
                  <button
                    type="button"
                    aria-current={selected ? 'true' : undefined}
                    onFocus={() => onHover(p.id)}
                    onBlur={() => onHover(null)}
                    className={cn('text-left text-[15px] font-medium leading-snug', focusRing)}
                  >
                    {p.name}
                  </button>
                  {p.onSite && <span className="ml-2 hidden whitespace-nowrap align-[1px] [font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-[var(--accent-ink)] @xl:inline">On site</span>}
                  <span className="mt-0.5 block text-[13px] text-[var(--muted)] @xl:hidden">
                    {p.place} · {typologyLabel(p.typology)}
                    {p.onSite && <span className="text-[var(--accent-ink)]"> · On site</span>}
                  </span>
                </td>
                <td className="hidden py-3.5 pr-4 align-top text-[14px] @xl:table-cell">
                  {p.place}
                  {coords && <span className="mt-0.5 block whitespace-nowrap [font-family:var(--font-mono)] text-[10.5px] text-[var(--muted)]">{formatCoords(p.coords)}</span>}
                </td>
                <td className="hidden py-3.5 pr-4 align-top text-[14px] text-[var(--muted)] @xl:table-cell">{typologyLabel(p.typology)}</td>
                <td className="py-3.5 pr-1 text-right align-top [font-family:var(--font-mono)] text-[12px] tabular-nums">{p.year}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-5 border-t border-[var(--line)] pt-4 text-[14px] text-[var(--muted)]">Selected work, 2017–2025. The other 52 projects are in the archive and the full index is sent on request.</p>
    </section>
  )
}

/* ---------- 平面图面板 ---------- */

/** 「Ground floor」→「Ground floor plan」；「Site plan」本身已经带 plan。 */
const planName = (project: Project) => (/plan$/i.test(project.planLabel) ? project.planLabel : `${project.planLabel} plan`)

function CropMarks() {
  return (
    <>
      {['left-2 top-2 border-l border-t', 'right-2 top-2 border-r border-t', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((place) => (
        <span key={place} aria-hidden className={cn('pointer-events-none absolute size-3 border-[var(--line-strong)]', place)} />
      ))}
    </>
  )
}

/** 比例尺：按当前图的像素/米挑一个 60px 以上的整数米长度。 */
function ScaleBar({ ppu }: { ppu: number }) {
  const metres = [2, 5, 10, 20, 50].find((m) => m * ppu >= 60) ?? 50
  const width = Math.round(metres * ppu)
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="flex h-[6px] border border-[var(--ink)]" style={{ width }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-full flex-1', i % 2 === 0 && 'bg-[var(--ink)]')} />
        ))}
      </span>
      <span className="text-[var(--ink)]">{metres} m</span>
    </span>
  )
}

export function PlanPanel({ project, weight, coords, onOpen }: { project: Project; weight: number; coords: boolean; onOpen: () => void }) {
  const [ppu, setPpu] = useState(5)
  return (
    <figure className="@container border border-[var(--line-strong)] bg-[var(--panel)]">
      <div className={cn(mono, 'flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3')}>
        <span className="truncate">
          <span className="text-[var(--accent-ink)]">{project.id}</span>
          <span className="text-[var(--muted)]"> / </span>
          {project.planLabel}
        </span>
        <span className="hidden shrink-0 text-[var(--muted)] @[16.5rem]:inline">North up</span>
      </div>
      {/* 高度由外层的 --plan-h 决定（吸顶时不超过视口），没有给就按 5:4 */}
      <div className="relative h-[var(--plan-h,80cqw)] p-[clamp(10px,3cqw,20px)] [--halo:var(--panel)]">
        <CropMarks />
        <LineDrawing drawing={PLANS[project.id]} weight={weight} title={`${planName(project)} of ${project.name}`} grid={coords} labels marks animated onScale={setPpu} />
      </div>
      <figcaption className="border-t border-[var(--line)] px-4 pb-4 pt-3.5">
        <div className={cn(mono, 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[var(--muted)]')}>
          <ScaleBar ppu={ppu} />
          <span>{project.area}</span>
          {coords && <span className="hidden @sm:inline">{formatCoords(project.coords)}</span>}
        </div>
        <p className={cn(display, 'mt-3.5 text-[21px] leading-tight')}>{project.name}</p>
        <p className="mt-1.5 text-pretty text-[14px] leading-relaxed text-[var(--muted)]">{project.summary}</p>
        <button type="button" onClick={onOpen} className={cn('mt-3 inline-flex items-center gap-1.5 text-[14px]', linkish)}>
          Open project <Arrow dir="down" />
        </button>
      </figcaption>
    </figure>
  )
}

/* ---------- 选中的项目：剖面 + 资料 ---------- */

export function Spread({ id, project, weight, coords, onBack }: { id: string; project: Project; weight: number; coords: boolean; onBack: () => void }) {
  const section = SECTIONS[project.id]
  const vb = viewBoxOf(section, true)
  const facts: [string, string][] = [
    ['Client', project.client],
    ['Programme', project.programme],
    ['Area', project.area],
    ['Status', project.status],
    ['Team', project.team],
  ]
  if (coords) facts.push(['Location', formatCoords(project.coords)])
  return (
    <section id={id} className="@container scroll-mt-16 border-t border-[var(--line-strong)] py-12 @3xl:py-16" aria-labelledby={`${id}-title`}>
      <div className={cn(mono, 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[var(--muted)]')}>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 bg-[var(--accent-line)]" />
          Project {project.id} · {typologyLabel(project.typology)}
        </span>
        <span>
          {project.place} · {project.span} · {project.status}
        </span>
      </div>
      <h2 id={`${id}-title`} className={cn(display, 'mt-5 text-balance leading-[1.02] [font-size:clamp(2.1rem,calc(6.2cqw*var(--ds)),5rem)]')}>
        {project.name}
      </h2>
      <figure className="mt-9 border-y border-[var(--line)] py-6 @3xl:py-8">
        {/* 剖面又长又扁：窄屏上按至少 170px 高排版，横向滚动看全，人和标高都还认得出 */}
        <div tabIndex={0} role="region" aria-label="Section A–A, scrolls sideways" className={cn('-mx-5 overflow-x-auto overscroll-x-contain px-5 @3xl:mx-0 @3xl:overflow-visible @3xl:px-0', focusRing)}>
          <div className="mx-auto w-full min-w-[var(--sec-min)] @3xl:min-w-0" style={{ aspectRatio: `${vb[2].toFixed(2)} / ${vb[3].toFixed(2)}`, maxHeight: 420, '--sec-min': `${Math.round((vb[2] / vb[3]) * 170)}px` } as CSSProperties}>
            <LineDrawing drawing={section} weight={weight} title={`Section A–A through ${project.name}`} labels marks animated />
          </div>
        </div>
        <figcaption className={cn(mono, 'mt-5 flex flex-wrap justify-between gap-2 text-[var(--muted)]')}>
          <span>
            Section A–A<span className="@3xl:hidden"> · scroll sideways</span>
          </span>
          <span>Levels in metres above ground</span>
        </figcaption>
      </figure>
      <div className="mt-10 grid gap-10 @4xl:grid-cols-12 @4xl:gap-8">
        <div className="space-y-4 text-pretty text-[16px] leading-[1.65] @4xl:col-span-5">
          {project.text.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        <dl className="grid content-start gap-y-3 @md:grid-cols-2 @md:gap-x-6 @4xl:col-span-3 @4xl:grid-cols-1">
          {facts.map(([term, value]) => (
            <div key={term} className="min-w-0 border-t border-[var(--line)] pt-2.5">
              <dt className={cn(mono, 'text-[var(--muted)]')}>{term}</dt>
              <dd className="mt-1 text-[14.5px] leading-snug">{value}</dd>
            </div>
          ))}
        </dl>
        <figure className="@4xl:col-span-4">
          <div className="relative aspect-[5/4] border border-[var(--line)] bg-[var(--panel)] p-3">
            <LineDrawing drawing={PLANS[project.id]} weight={weight * 0.9} title={`${planName(project)} with section line A–A`} marks animated />
          </div>
          <figcaption className={cn(mono, 'mt-3 text-[var(--muted)]')}>{project.planLabel} · section line A–A</figcaption>
        </figure>
      </div>
      <button type="button" onClick={onBack} className={cn('mt-10 inline-flex items-center gap-1.5 text-[14px]', linkish)}>
        Back to the index <Arrow dir="up" />
      </button>
    </section>
  )
}

/* ---------- 平面图集 ---------- */

export function Atlas({ id, weight, selectedId, onSelect }: { id: string; weight: number; selectedId: ProjectId; onSelect: (id: ProjectId) => void }) {
  return (
    <section id={id} className="@container scroll-mt-16 border-t border-[var(--line-strong)] py-12 @3xl:py-16" aria-labelledby={`${id}-title`}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2 id={`${id}-title`} className={cn(display, 'leading-none [font-size:clamp(1.7rem,calc(3.6cqw*var(--ds)),2.6rem)]')}>
          Plans
        </h2>
        <p className="max-w-sm text-[14px] text-[var(--muted)]">Twelve plans from the index, each drawn to fit its frame, north up. The 52 other projects since 2009 are drawn in the archive.</p>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] @3xl:grid-cols-3 @5xl:grid-cols-4">
        {PROJECTS.map((p) => (
          <li key={p.id} className="bg-[var(--bg)]">
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              aria-label={`${p.name}, open project`}
              className="group flex h-full w-full flex-col p-3 text-left outline-none transition-colors duration-150 hover:bg-[var(--hover)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-line)] @3xl:p-4"
            >
              <span className="block aspect-[4/3] w-full text-[var(--ink)] transition-colors duration-200 group-hover:text-[var(--accent-line)]">
                <LineDrawing drawing={PLANS[p.id]} weight={weight * 0.8} />
              </span>
              <span className="mt-3 flex items-baseline gap-2 text-[13px] leading-snug">
                <span className={cn('[font-family:var(--font-mono)] text-[11px] tabular-nums', p.id === selectedId ? 'text-[var(--accent-ink)]' : 'text-[var(--muted)]')}>{p.id}</span>
                <span className="min-w-0">{p.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- 事务所、奖项 ---------- */

export function Practice({ id, awardsId }: { id: string; awardsId: string }) {
  return (
    <section id={id} className="@container scroll-mt-16 border-t border-[var(--line-strong)] py-12 @3xl:py-16" aria-labelledby={`${id}-title`}>
      <div className="grid gap-14 @4xl:grid-cols-12 @4xl:gap-8">
        <div className="@4xl:col-span-5">
          <h2 id={`${id}-title`} className={cn(display, 'leading-none [font-size:clamp(1.7rem,calc(3.6cqw*var(--ds)),2.6rem)]')}>
            Practice
          </h2>
          <div className="mt-6 space-y-4 text-pretty text-[16px] leading-[1.65]">
            <p>We are 38 architects, landscape architects and model makers. Every project is led by one of four partners from the first site visit to the last.</p>
            <p>About half of our work comes through public competitions. The other half comes from clients who return: three housing associations, two cities and a school board.</p>
          </div>
          <ul className="mt-8 border-t border-[var(--line)]">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3">
                <span className="text-[15px]">{partner.name}</span>
                <span className="text-right text-[13px] text-[var(--muted)]">{partner.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div id={awardsId} className="scroll-mt-20 @4xl:col-span-6 @4xl:col-start-7">
          <h2 className={cn(display, 'leading-none [font-size:clamp(1.7rem,calc(3.6cqw*var(--ds)),2.6rem)]')}>Awards</h2>
          <table className="mt-6 w-full border-collapse text-left">
            <caption className="sr-only">Awards and shortlists</caption>
            <thead>
              <tr className={cn(mono, 'text-[var(--muted)]')}>
                <th scope="col" className="w-16 py-2.5 font-normal">
                  Year
                </th>
                <th scope="col" className="py-2.5 pr-4 font-normal">
                  Award
                </th>
                <th scope="col" className="hidden py-2.5 text-right font-normal @md:table-cell">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {AWARDS.map((award) => (
                <tr key={`${award.year}${award.award}`} className="border-t border-[var(--line)]">
                  <td className="py-3.5 align-top [font-family:var(--font-mono)] text-[12px] tabular-nums text-[var(--muted)]">{award.year}</td>
                  <td className="py-3.5 pr-4 align-top">
                    <span className="block text-[15px] leading-snug">{award.award}</span>
                    <span className="mt-0.5 block text-[13px] text-[var(--muted)]">
                      {award.project}
                      <span className="@md:hidden"> · {award.result}</span>
                    </span>
                  </td>
                  <td className="hidden py-3.5 text-right align-top text-[14px] @md:table-cell">{award.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ---------- 办公室 ---------- */

/** 办公室所在街区的小总图（虚构的街区形状），办公楼用标记色斜线填充。 */
function SitePlan({ variant }: { variant: number }) {
  const raw = useId()
  const pattern = `hatch${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const blocks =
    variant === 0
      ? ['M8 8h44v30H8z', 'M60 8h36v30H60z', 'M104 8h48v30h-48z', 'M8 46h44v32H8z', 'M104 46h48v32h-48z']
      : ['M10 14l40-6 6 28-42 6z', 'M64 6l50 6-5 28-49-5z', 'M122 14l30 2-2 30-32-3z', 'M14 52l42-6 4 30-44 4z', 'M118 52l32 3-3 28-31-2z']
  const office = variant === 0 ? 'M60 46h36v32H60z' : 'M68 46l42 4-3 30-41-3z'
  const water = variant === 0 ? ['M0 88H160', 'M0 96H160', 'M0 104H160', 'M0 112H160'] : ['M0 92C40 86 80 98 160 90', 'M0 100C40 94 80 106 160 98', 'M0 108C40 102 80 114 160 106']
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full max-w-[260px] text-[var(--ink)] @lg:w-[200px]" fill="none" aria-hidden>
      <defs>
        <pattern id={pattern} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V4" stroke="var(--accent-line)" strokeWidth="1.1" />
        </pattern>
      </defs>
      {blocks.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />
      ))}
      <path d={office} fill={`url(#${pattern})`} stroke="var(--accent-line)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      {water.map((d, i) => (
        <path key={d} d={d} stroke="currentColor" strokeOpacity={i === 0 ? 0.7 : 0.25} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

export function Offices({ id, careersId, domain, coords }: { id: string; careersId: string; domain: string; coords: boolean }) {
  return (
    <section id={id} className="@container scroll-mt-16 border-t border-[var(--line-strong)] py-12 @3xl:py-16" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={cn(display, 'leading-none [font-size:clamp(1.7rem,calc(3.6cqw*var(--ds)),2.6rem)]')}>
        Offices
      </h2>
      <div className="mt-8 grid gap-px border border-[var(--line)] bg-[var(--line)] @3xl:grid-cols-2">
        {OFFICES.map((office, i) => (
          <article key={office.city} className="@container grid gap-6 bg-[var(--bg)] p-5 @3xl:p-7">
            <div className="grid gap-6 @lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h3 className={cn(display, 'text-[30px] leading-none')}>{office.city}</h3>
                <p className="mt-2 text-[14px] text-[var(--muted)]">
                  {office.note} · {office.people} people
                </p>
                <address className="mt-5 text-[15px] not-italic leading-relaxed">
                  {office.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a href={`mailto:${office.mailbox}@${domain}`} className={cn('mt-4 inline-block break-all text-[15px]', linkish)}>
                  {office.mailbox}@{domain}
                </a>
                {coords && <p className={cn(mono, 'mt-5 text-[var(--muted)]')}>{formatCoords(office.coords)}</p>}
              </div>
              <SitePlan variant={i} />
            </div>
          </article>
        ))}
      </div>
      <div id={careersId} className="mt-6 flex scroll-mt-20 flex-col gap-2 border-b border-[var(--line)] pb-6 text-[15px] @2xl:flex-row @2xl:items-baseline @2xl:gap-6">
        <span className={cn(mono, 'shrink-0 text-[var(--accent-ink)]')}>Open position</span>
        <span className="min-w-0 flex-1">Project architect for the Porto competition team, from March. Portuguese or Dutch registration preferred.</span>
        <a href={`mailto:porto@${domain}?subject=Project%20architect`} className={cn('inline-flex w-fit shrink-0 items-center gap-1.5 text-[14px]', linkish)}>
          Apply by email <Arrow />
        </a>
      </div>
    </section>
  )
}

/* ---------- 页脚 ---------- */

/**
 * 页脚大字：量出名字在 100px 字号下的宽度，再换算成刚好撑满一行的字号。
 * 同时观察容器和量尺：容器变宽、字体加载完成或换了字体搭配，都会重新计算。
 */
function Wordmark({ name }: { name: string }) {
  const box = useRef<HTMLParagraphElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState<number | null>(null)
  useLayoutEffect(() => {
    const element = box.current
    const ruler = probe.current
    if (!element || !ruler) return
    const fit = () => {
      const natural = ruler.getBoundingClientRect().width
      if (natural > 0 && element.clientWidth > 0) setSize(Math.min(element.clientWidth * 0.24, (element.clientWidth / natural) * 100 * 0.985))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    observer.observe(ruler)
    return () => observer.disconnect()
  }, [name])
  return (
    <p ref={box} aria-hidden className={cn(display, 'relative mt-16 whitespace-nowrap leading-[0.9]')} style={{ fontSize: size ?? `${Math.min(15, 90 / (Math.max(name.length, 4) * 0.62)).toFixed(2)}cqw` }}>
      <span className="invisible absolute left-0 top-0 h-0 w-0 overflow-hidden">
        <span ref={probe} className="inline-block text-[100px] [letter-spacing:var(--display-tracking)]">
          {name}
        </span>
      </span>
      {name}
    </p>
  )
}

// 页内链接写目标区块；Elsewhere 一栏是站外页面的占位（套用时换成真实地址）。
const FOOTER_LINKS: [string, [string, string | null][]][] = [
  ['Studio', [['Practice', 'practice'], ['People', 'practice'], ['Careers', 'careers']]],
  ['Work', [['Index', 'index'], ['Plans', 'plans'], ['Awards', 'awards']]],
  ['Elsewhere', [['Newsletter', null], ['Press kit', null], ['Colophon', null]]],
]

const placeholder = { href: '#', onClick: (event: { preventDefault: () => void }) => event.preventDefault() }

export function Footer({ id, uid, name, domain, onNav }: { id: string; uid: string; name: string; domain: string; onNav: (target: string) => void }) {
  return (
    <footer id={id} className="@container mx-auto max-w-[1360px] scroll-mt-16 px-5 @3xl:px-8 @6xl:px-10">
      <div className="grid gap-12 border-t border-[var(--line-strong)] pt-12 @3xl:pt-16 @4xl:grid-cols-12 @4xl:gap-8">
        <div className="@4xl:col-span-6">
          <h2 className={cn(display, 'leading-tight [font-size:clamp(1.7rem,calc(3.6cqw*var(--ds)),2.6rem)]')}>Start a project</h2>
          <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-[var(--muted)]">Send us the site, the brief and the budget, even if they are rough. We reply within a week.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={`mailto:office@${domain}?subject=Project%20brief`}
              className={cn('inline-flex h-11 items-center gap-2 bg-[var(--accent)] px-5 text-[15px] font-medium text-[var(--on-accent)] transition-[filter] duration-150 hover:brightness-110', focusRing)}
            >
              Send a brief <Arrow />
            </a>
            <a href={`mailto:office@${domain}`} className={cn('break-all text-[15px]', linkish)}>
              office@{domain}
            </a>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 @md:grid-cols-3 @4xl:col-span-5 @4xl:col-start-8">
          {FOOTER_LINKS.map(([title, links]) => (
            <div key={title}>
              <p className={cn(mono, 'text-[var(--muted)]')}>{title}</p>
              <ul className="mt-3 space-y-2 text-[14px]">
                {links.map(([link, target]) => (
                  <li key={link}>
                    <a {...(target ? jump(uid, target, onNav) : placeholder)} className={cn('transition-colors duration-150 hover:text-[var(--accent-ink)]', focusRing)}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <Wordmark name={name} />
      <div className={cn(mono, 'mt-6 flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pb-8 pt-4 text-[var(--muted)]')}>
        <span>© 2025 {name}</span>
        <span>Registered architects · NL · PT</span>
      </div>
    </footer>
  )
}
