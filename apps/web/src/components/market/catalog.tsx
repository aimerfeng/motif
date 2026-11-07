'use client'

import type { Category, Kind } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { initiallyRendered, sectionsOf, type CatalogGroup } from './catalog-groups'
import { ItemCard, ItemCardSkeleton } from './item-card'

/*
 * 市场的分组目录和跟着滚动的分类目录（docs/decisions/0010）。
 *
 * - 宽屏：左边一栏目录。顶部的筛选栏还看得见时只列层级（安静）；筛选栏滚出视口后目录「接手」导航——
 *   当前层级展开出它的分类，一条指示线停在正在看的分类上，随滚动在分类之间移动。
 * - 窄屏：筛选栏滚出视口后，头部下面滑出一条吸顶的分类条，当前分类高亮并自动滚进视野。
 * - 很多分类只有一两个条目：分类块按条目数占一到三列，小分类并排放，不会一类占一整行留一大片空。
 *   同一行里并排的几个分类一起算「正在看」，目录里的指示线把它们一起框住。
 * - 每组先画骨架（和真卡片同样的排版），离视口 1200px 以内才换成真卡片：上百张卡片一次性水合会拖慢首屏的第一次点击。
 */

/** 组的顶边到了头部下方这么多像素以内，就算「正在看这一组」。 */
const SPY_LINE = 160
const NEAR = '1200px 0px'
/** 顶边相差在这个范围内的组算同一行。 */
const SAME_ROW = 4

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const headerHeight = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 56

type Labels = (group: CatalogGroup) => string

/** 分类块占几列、块里的卡片排几列：和外层网格同样的列宽，所有卡片一样大。 */
function spanClasses(count: number): { block: string; list: string } {
  if (count >= 3) return { block: 'sm:col-span-2 xl:col-span-3', list: 'sm:grid-cols-2 xl:grid-cols-3' }
  if (count === 2) return { block: 'sm:col-span-2', list: 'sm:grid-cols-2' }
  return { block: '', list: '' }
}

export function Catalog({ groups, ranks, onFilter }: { groups: CatalogGroup[]; ranks: Record<string, number>; onFilter: (kind: Kind, category: Category) => void }) {
  const t = useTranslations('market')
  const sections = useMemo(() => sectionsOf(groups), [groups])
  const multipleKinds = sections.filter((section) => section.kind !== null).length > 1
  // 同一个条目第二次出现（例如在「精选」里出现过）就不参与卡片到详情页的变形：同名的共享元素只能有一个。
  const repeats = useMemo(() => {
    const seen = new Set<string>()
    const repeated = new Set<string>()
    for (const group of groups)
      for (const item of group.items) {
        if (seen.has(item.slug)) repeated.add(`${group.id}/${item.slug}`)
        else seen.add(item.slug)
      }
    return repeated
  }, [groups])
  const label: Labels = useCallback((group) => (group.shelf ? t(`catalog.${group.shelf}`) : t(`categories.${group.category!}`)), [t])

  // 筛选变了就从首屏那几组重新开始（渲染期间根据上一次的结果调整状态，不用 effect）。
  const firstRow = useCallback((list: CatalogGroup[]) => (list[0] ? [list[0].id] : []), [])
  const [rendered, setRendered] = useState(() => initiallyRendered(groups))
  const [active, setActive] = useState<string[]>(() => firstRow(groups))
  const [shownFor, setShownFor] = useState(groups)
  if (groups !== shownFor) {
    setShownFor(groups)
    setRendered(initiallyRendered(groups))
    setActive(firstRow(groups))
  }
  const [engaged, setEngaged] = useState(false)

  const elements = useRef(new Map<string, HTMLElement>())
  const kindElements = useRef(new Map<Kind, HTMLElement>())
  const sentinel = useRef<HTMLDivElement>(null)
  /** 点目录跳转期间（平滑滚动还没停）不让滚动监听改「当前组」，指示线直接去目标。 */
  const jumping = useRef(false)

  const register = useCallback((id: string, element: HTMLElement | null) => {
    if (element) elements.current.set(id, element)
    else elements.current.delete(id)
  }, [])

  // 离视口近了才换成真卡片。一个 IntersectionObserver 看所有组。
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const near = entries.filter((entry) => entry.isIntersecting).map((entry) => (entry.target as HTMLElement).dataset.group!)
        if (near.length === 0) return
        setRendered((previous) => (near.every((id) => previous.has(id)) ? previous : new Set([...previous, ...near])))
      },
      { rootMargin: NEAR },
    )
    for (const element of elements.current.values()) observer.observe(element)
    return () => observer.disconnect()
  }, [groups])

  // 目录的顶边滚到头部下面，说明筛选栏已经看不见了：目录接手导航。
  useEffect(() => {
    const element = sentinel.current
    if (!element) return
    const top = headerHeight()
    const observer = new IntersectionObserver(([entry]) => entry && setEngaged(!entry.isIntersecting && entry.boundingClientRect.top < top), { rootMargin: `-${top}px 0px 0px 0px` })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // 滚动监听：只在滚动时用 rAF 读一次各组的位置（几十个元素）。找最后一个越过那条线的组，和它同一行的组一起算「正在看」。
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (jumping.current || groups.length === 0) return
      const line = headerHeight() + SPY_LINE
      const tops = groups.map((group) => elements.current.get(group.id)?.getBoundingClientRect().top ?? Infinity)
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let index = 0
      if (atBottom) index = groups.length - 1
      else for (let i = 0; i < groups.length && tops[i]! <= line; i++) index = i
      const rowTop = tops[index]!
      const row = groups.filter((_, i) => Math.abs(tops[i]! - rowTop) <= SAME_ROW).map((group) => group.id)
      setActive((previous) => (previous.length === row.length && previous.every((id, i) => id === row[i]) ? previous : row))
    }
    const onScroll = () => {
      frame ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [groups])

  const scrollTo = useCallback((target: HTMLElement, id: string) => {
    setRendered((previous) => (previous.has(id) ? previous : new Set([...previous, id])))
    setActive([id])
    jumping.current = true
    let timer = 0
    const done = () => {
      jumping.current = false
      window.clearTimeout(timer)
      window.removeEventListener('scrollend', done)
      // 停下来以后按实际位置重新算一次（目标可能和别的分类并排）。
      window.dispatchEvent(new Event('scroll'))
    }
    window.addEventListener('scrollend', done)
    // 不支持 scrollend 的浏览器，或者目标本来就在原地（不会滚动）：到点自己放开。
    timer = window.setTimeout(done, 1200)
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
    // 键盘用户：焦点跟着到那一组的标题，再按 Tab 就进到那一组的卡片。
    target.querySelector<HTMLElement>('[data-catalog-heading]')?.focus({ preventScroll: true })
  }, [])

  const jump = useCallback(
    (id: string) => {
      const element = elements.current.get(id)
      if (element) scrollTo(element, id)
    },
    [scrollTo],
  )
  const jumpKind = useCallback(
    (kind: Kind) => {
      const first = groups.find((group) => group.kind === kind)
      const element = kindElements.current.get(kind) ?? (first ? elements.current.get(first.id) : undefined)
      if (first && element) scrollTo(element, first.id)
    },
    [groups, scrollTo],
  )

  const activeKind = groups.find((group) => group.id === active[0])?.kind ?? null

  return (
    <div className="lg:grid lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[192px_minmax(0,1fr)]" data-testid="market-catalog">
      <CatalogRail sections={sections} multipleKinds={multipleKinds} active={active} activeKind={activeKind} engaged={engaged} label={label} onJump={jump} onJumpKind={jumpKind} />
      <ChipBar groups={groups} active={active} engaged={engaged} label={label} onJump={jump} />
      <div className="min-w-0">
        <div ref={sentinel} aria-hidden />
        {sections.map((section) => (
          <section
            key={section.kind ?? 'shelf'}
            ref={(element) => {
              if (!section.kind) return
              if (element) kindElements.current.set(section.kind, element)
              else kindElements.current.delete(section.kind)
            }}
            aria-label={section.kind ? t(`kinds.${section.kind}`) : label(section.groups[0]!)}
            className="scroll-mt-[calc(var(--header-height)+64px)] not-first:mt-20 lg:scroll-mt-[calc(var(--header-height)+28px)]"
          >
            {section.kind && multipleKinds && (
              <header className="mb-8 flex items-baseline gap-3 border-b border-line pb-4">
                <h2 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.03em]">{t(`kinds.${section.kind}`)}</h2>
                <span className="font-mono text-[12px] text-ink-faint tabular-nums">{section.count}</span>
              </header>
            )}
            <div className="grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {section.groups.map((group, index) => (
                <GroupBlock
                  key={group.id}
                  group={group}
                  label={label(group)}
                  rendered={rendered.has(group.id)}
                  ranks={ranks}
                  repeats={repeats}
                  register={register}
                  onFilter={onFilter}
                  priority={section === sections[0] && index === 0}
                  heading={section.kind && multipleKinds ? 'h3' : 'h2'}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

const GroupBlock = memo(function GroupBlock({
  group,
  label,
  rendered,
  ranks,
  repeats,
  register,
  onFilter,
  priority,
  heading: Heading,
}: {
  group: CatalogGroup
  label: string
  rendered: boolean
  ranks: Record<string, number>
  repeats: Set<string>
  register: (id: string, element: HTMLElement | null) => void
  onFilter: (kind: Kind, category: Category) => void
  priority: boolean
  heading: 'h2' | 'h3'
}) {
  const t = useTranslations('market')
  const ref = useCallback((element: HTMLDivElement | null) => register(group.id, element), [register, group.id])
  const span = spanClasses(group.items.length)
  return (
    <div id={`catalog-${group.id}`} ref={ref} data-group={group.id} className={`min-w-0 scroll-mt-[calc(var(--header-height)+64px)] lg:scroll-mt-[calc(var(--header-height)+28px)] ${span.block}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <Heading data-catalog-heading tabIndex={-1} className="flex min-w-0 items-baseline gap-2 text-[15px] font-medium focus:outline-none">
          <span className="truncate">{label}</span>
          <span className="font-mono text-[11px] font-normal text-ink-faint tabular-nums">{group.items.length}</span>
        </Heading>
        {group.kind && group.category ? (
          <button type="button" onClick={() => onFilter(group.kind!, group.category!)} className="shrink-0 text-[12.5px] text-ink-faint transition-colors duration-(--duration-fast) hover:text-ink">
            {t('catalog.only')}
          </button>
        ) : group.shelf === 'hot' ? (
          <Link href="/rank" className="shrink-0 text-[12.5px] text-ink-faint transition-colors duration-(--duration-fast) hover:text-ink">
            {t('catalog.fullRanking')} →
          </Link>
        ) : null}
      </div>
      <ul className={`grid grid-cols-1 gap-x-5 gap-y-10 ${span.list}`}>
        {group.items.map((item, index) => (
          <li key={item.slug} className="min-w-0">
            {rendered ? <ItemCard item={item} categoryLabel={t(`categories.${item.category}`)} rank={ranks[item.slug]} priority={priority && index < 3} titleAs="h4" morph={!repeats.has(`${group.id}/${item.slug}`)} /> : <ItemCardSkeleton />}
          </li>
        ))}
      </ul>
    </div>
  )
})

/** 宽屏左侧的目录。 */
function CatalogRail({
  sections,
  multipleKinds,
  active,
  activeKind,
  engaged,
  label,
  onJump,
  onJumpKind,
}: {
  sections: ReturnType<typeof sectionsOf>
  multipleKinds: boolean
  active: string[]
  activeKind: Kind | null
  engaged: boolean
  label: Labels
  onJump: (id: string) => void
  onJumpKind: (kind: Kind) => void
}) {
  const t = useTranslations('market')
  const list = useRef<HTMLDivElement>(null)
  const rows = useRef(new Map<string, HTMLElement>())
  const [indicator, setIndicator] = useState<{ y: number; h: number } | null>(null)

  /** 层级的分类展开：只有一个层级时一直展开；否则只展开正在看的层级，而且要等目录接手（筛选栏滚出视口）之后。 */
  const isOpen = (kind: Kind) => !multipleKinds || (engaged && kind === activeKind)
  // 指示线框住哪几行：展开时是正在看的那几个分类，收起时是它们所在层级的那一行。
  const targets = activeKind !== null && !isOpen(activeKind) ? [`kind:${activeKind}`] : active
  const targetKey = targets.join(' ')

  // 展开、收起是高度动画，行的位置一路在变：用 ResizeObserver 跟着量，指示线一直贴着目标。
  useLayoutEffect(() => {
    const container = list.current
    if (!container) return
    const measure = () => {
      const found = targetKey
        .split(' ')
        .map((key) => rows.current.get(key))
        .filter((row): row is HTMLElement => row !== undefined)
      if (found.length === 0) {
        setIndicator(null)
        return
      }
      const top = Math.min(...found.map((row) => row.offsetTop))
      const bottom = Math.max(...found.map((row) => row.offsetTop + row.offsetHeight))
      setIndicator({ y: top, h: bottom - top })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [targetKey])

  const rowRef = (key: string) => (element: HTMLElement | null) => {
    if (element) rows.current.set(key, element)
    else rows.current.delete(key)
  }

  return (
    <nav aria-label={t('catalog.label')} className="max-lg:hidden">
      <div className="sticky top-[calc(var(--header-height)+28px)] max-h-[calc(100dvh-var(--header-height)-56px)] overflow-y-auto overscroll-contain pb-4 [scrollbar-width:none]">
        <p className="mb-3 pl-4 text-[12px] text-ink-faint">{t('catalog.label')}</p>
        <div ref={list} className="relative border-l border-line">
          {/* 指示线：一根 1px 高的线按目标的高度纵向拉伸（只动 transform）。 */}
          <span
            aria-hidden
            className="absolute top-0 -left-px h-px w-[2px] origin-top rounded-full bg-ink transition-[transform,opacity] duration-(--duration-base) ease-(--ease-in-out-soft) motion-reduce:transition-none"
            style={{ transform: `translateY(${indicator?.y ?? 0}px) scaleY(${indicator?.h ?? 0})`, opacity: indicator ? 1 : 0 }}
          />
          <ol>
            {sections.map((section) =>
              section.kind === null ? (
                section.groups.map((group) => (
                  <li key={group.id}>
                    <RailButton ref={rowRef(group.id)} active={active.includes(group.id)} count={group.items.length} onClick={() => onJump(group.id)}>
                      {label(group)}
                    </RailButton>
                  </li>
                ))
              ) : (
                <li key={section.kind}>
                  {multipleKinds && (
                    <RailButton ref={rowRef(`kind:${section.kind}`)} active={activeKind === section.kind} count={section.count} onClick={() => onJumpKind(section.kind!)}>
                      {t(`kinds.${section.kind}`)}
                    </RailButton>
                  )}
                  <RailCategories open={isOpen(section.kind)}>
                    {section.groups.map((group, index) => (
                      <li key={group.id}>
                        <RailButton
                          ref={rowRef(group.id)}
                          active={active.includes(group.id)}
                          count={group.items.length}
                          onClick={() => onJump(group.id)}
                          nested={multipleKinds}
                          // 展开时分类一个接一个出现（每个晚 30ms，最多 300ms）；收起时一起消失。
                          style={{ '--stagger': `${Math.min(index * 30, 300)}ms` } as CSSProperties}
                        >
                          {label(group)}
                        </RailButton>
                      </li>
                    ))}
                  </RailCategories>
                </li>
              ),
            )}
          </ol>
        </div>
      </div>
    </nav>
  )
}

/** 层级下面的分类列表：高度 0fr ↔ 1fr 展开收起；收起时不能被 Tab 进去。 */
function RailCategories({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div data-open={open} className="group/rail grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-out-soft) data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none">
      <ol className="min-h-0 overflow-hidden" inert={!open}>
        {children}
      </ol>
    </div>
  )
}

function RailButton({
  ref,
  active,
  count,
  onClick,
  nested = false,
  style,
  children,
}: {
  ref: (element: HTMLElement | null) => void
  active: boolean
  count: number
  onClick: () => void
  nested?: boolean
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-current={active ? 'location' : undefined}
      style={style}
      className={`flex w-full items-baseline justify-between gap-3 py-1.5 pr-1 text-left transition-colors duration-(--duration-fast) aria-[current]:text-ink ${
        nested
          ? 'pl-7 text-[13px] text-ink-faint hover:text-ink-muted [&>span]:transition-[opacity,translate] [&>span]:delay-0 [&>span]:duration-(--duration-base) [&>span]:ease-(--ease-out-soft) group-data-[open=false]/rail:[&>span]:-translate-x-1.5 group-data-[open=false]/rail:[&>span]:opacity-0 group-data-[open=true]/rail:[&>span]:delay-(--stagger) motion-reduce:[&>span]:transition-none'
          : 'pl-4 text-[13.5px] text-ink-muted hover:text-ink'
      }`}
    >
      <span className="truncate">{children}</span>
      <span className="font-mono text-[11px] text-ink-faint tabular-nums">{count}</span>
    </button>
  )
}

/** 窄屏：头部下面吸顶的分类条。 */
function ChipBar({ groups, active, engaged, label, onJump }: { groups: CatalogGroup[]; active: string[]; engaged: boolean; label: Labels; onJump: (id: string) => void }) {
  const t = useTranslations('market')
  const scroller = useRef<HTMLDivElement>(null)
  const chips = useRef(new Map<string, HTMLElement>())
  const lead = active[0]

  // 当前分类换了，把它的标签滚到分类条中间（只横向滚这一条，不动页面）。
  useEffect(() => {
    const chip = lead ? chips.current.get(lead) : undefined
    const box = scroller.current
    if (!chip || !box || !engaged) return
    box.scrollTo({ left: chip.offsetLeft - box.clientWidth / 2 + chip.offsetWidth / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [lead, engaged])

  return (
    <nav
      aria-label={t('catalog.label')}
      inert={!engaged}
      className={`fixed inset-x-0 top-(--header-height) z-30 border-b border-line bg-canvas/85 backdrop-blur-xl transition-[translate,opacity] duration-(--duration-base) ease-(--ease-out-soft) motion-reduce:transition-none lg:hidden ${
        engaged ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
    >
      <div ref={scroller} className="flex items-center gap-1 overflow-x-auto px-5 py-2 [scrollbar-width:none] sm:px-8">
        {groups.map((group, index) => (
          <span key={group.id} className="flex shrink-0 items-center gap-1">
            {group.kind !== null && group.kind !== groups[index - 1]?.kind && <span className="pr-0.5 pl-2 text-[11px] text-ink-faint first:pl-0">{t(`kinds.${group.kind}`)}</span>}
            <button
              ref={(element) => {
                if (element) chips.current.set(group.id, element)
                else chips.current.delete(group.id)
              }}
              type="button"
              onClick={() => onJump(group.id)}
              aria-current={active.includes(group.id) ? 'location' : undefined}
              className="rounded-full px-3 py-1.5 text-[13px] text-ink-muted transition-colors duration-(--duration-fast) aria-[current]:bg-ink aria-[current]:text-canvas"
            >
              {label(group)}
            </button>
          </span>
        ))}
      </div>
    </nav>
  )
}
