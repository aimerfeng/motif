'use client'

import { CATEGORIES_BY_KIND, KINDS, type Category, type Kind } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { memo, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronIcon, HeartIcon, SearchIcon } from '@/components/icons'
import { SkillButton } from '@/components/skill-button'
import { Link } from '@/i18n/navigation'
import type { ItemSummary } from '@/lib/catalog'
import { generalSkills } from '@/lib/general-skills'
import { FAVORITES, RECENT_ITEMS, useLocalList } from '@/lib/local-store'
import { writeMarketQuery, type MarketQuery } from '@/lib/market-query'
import { matchesAll, searchTerms } from '@/lib/store/search'
import { replaceUrl, URL_WRITE_DELAY_MS } from '@/lib/url-state'
import { ItemCard } from './item-card'

/**
 * 市场：先按层级（模板 / 风格 / 区块 / 组件 / 效果），再按分类和关键词筛选。
 * 初始筛选由服务端从链接解析好传进来；之后的改动写回链接（不产生历史记录），可以分享。
 */
export function MarketGrid({ items, initial }: { items: ItemSummary[]; initial: MarketQuery }) {
  const t = useTranslations('market')
  const [kind, setKind] = useState<Kind | null>(initial.kind)
  const [category, setCategory] = useState<Category | null>(initial.category)
  const [query, setQuery] = useState(initial.q)
  const [sort, setSort] = useState<MarketQuery['sort']>(initial.sort)
  // 只看收藏：收藏存在这个浏览器里，这个开关不写进链接（别人打开链接看不到你的收藏）。
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [favorites] = useLocalList(FAVORITES.key, FAVORITES.max)
  const [recent] = useLocalList(RECENT_ITEMS.key, RECENT_ITEMS.max)
  // 卡片网格跟着「延后」的筛选值渲染：点击时先把选中的标签画出来，上百张卡片在后台重排（INP）。
  const deferredKind = useDeferredValue(kind)
  const deferredCategory = useDeferredValue(category)
  const deferredQuery = useDeferredValue(query)
  const pending = kind !== deferredKind || category !== deferredCategory || query !== deferredQuery
  const searchRef = useRef<HTMLInputElement>(null)

  // 搜索词边打边写会很密，停下来再写进链接。
  useEffect(() => {
    const timer = window.setTimeout(() => replaceUrl((url) => writeMarketQuery(url, { kind, category, q: query, sort })), URL_WRITE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [kind, category, query, sort])

  // 「/」聚焦搜索框（输入框里打字时不抢）。
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 只显示有条目的层级和分类，按固定顺序。
  const kinds = useMemo(() => KINDS.filter((k) => items.some((item) => item.kind === k)), [items])
  const categories = useMemo(
    () => (kind ? (CATEGORIES_BY_KIND[kind] as readonly Category[]).filter((c) => items.some((item) => item.category === c)) : []),
    [items, kind],
  )

  // 搜索也匹配层级和分类的名字（搜「按钮」能找到所有按钮）；多个词之间是「且」。
  // 切词和商店给 agent 的搜索同一套：中文不用空格也能搜（「发光卡片」），常见的同义词（spinner → loader）也认得。
  const haystacks = useMemo(
    () => new Map(items.map((item) => [item.slug, [item.title, item.summary, item.slug, ...item.tags, t(`kinds.${item.kind}`), t(`categories.${item.category}`)].join('\n').toLowerCase()])),
    [items, t],
  )
  const favoriteSet = useMemo(() => new Set(favorites ?? []), [favorites])
  const visible = useMemo(() => {
    const concepts = searchTerms(deferredQuery, { stopwords: false })
    const matched = items.filter((item) => {
      if (deferredKind && item.kind !== deferredKind) return false
      if (deferredCategory && item.category !== deferredCategory) return false
      if (onlyFavorites && !favoriteSet.has(item.slug)) return false
      return matchesAll(haystacks.get(item.slug)!, concepts)
    })
    // 最新：上架时间从新到旧；还没提交（没有时间）的算最新。时间相同的保持精选顺序。
    if (sort === 'new') return matched.toSorted((a, b) => (b.addedAt ?? '9999').localeCompare(a.addedAt ?? '9999'))
    return matched
  }, [items, haystacks, deferredKind, deferredCategory, deferredQuery, sort, onlyFavorites, favoriteSet])
  // 最近看过：还在市场里的条目，按看的先后。
  const recentItems = useMemo(() => (recent ?? []).flatMap((slug) => items.filter((item) => item.slug === slug)), [recent, items])

  const selectKind = (next: Kind | null) => {
    setKind(next)
    setCategory(null)
  }
  const filtered = kind !== null || query.trim() !== '' || onlyFavorites
  const clearAll = () => {
    setKind(null)
    setCategory(null)
    setQuery('')
    setOnlyFavorites(false)
  }

  return (
    <section className="mt-10">
      <div role="tablist" aria-label={t('kindsLabel')} className="-mx-5 flex gap-6 overflow-x-auto border-b border-line px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <KindTab active={kind === null} onClick={() => selectKind(null)} count={items.length}>
          {t('all')}
        </KindTab>
        {kinds.map((k) => (
          <KindTab key={k} active={kind === k} onClick={() => selectKind(k)} count={items.filter((item) => item.kind === k).length}>
            {t(`kinds.${k}`)}
          </KindTab>
        ))}
      </div>

      <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div role="group" aria-label={t('categoriesLabel')} className="-mx-1 flex flex-wrap gap-1">
          {kind && (
            <FilterChip active={category === null} onClick={() => setCategory(null)}>
              {t('allIn', { kind: t(`kinds.${kind}`) })}
            </FilterChip>
          )}
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {t(`categories.${c}`)}
            </FilterChip>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="text-[12px] text-ink-faint">{t('generalSkill')}</span>
          <span className="flex flex-wrap gap-1.5" data-testid="general-skills">
            {generalSkills(kind, category).map((name) => (
              <SkillButton key={name} source={{ name }} label={t(`skillNames.${name}` as 'skillNames.motif-design')} />
            ))}
          </span>
          <span className="flex items-center gap-1.5 sm:ml-1">
            <button
              type="button"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((value) => !value)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-pressed:border-ink aria-pressed:text-ink"
            >
              <HeartIcon filled={onlyFavorites} className={`size-4 ${onlyFavorites ? 'text-heart' : ''}`} />
              {t('favorites.filter')}
              {favorites && favorites.length > 0 && <span className="font-mono text-[11px] text-ink-faint tabular-nums">{favorites.length}</span>}
            </button>
            <label className="relative">
              <span className="sr-only">{t('sort.label')}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value === 'new' ? 'new' : 'featured')}
                className="h-9 appearance-none rounded-lg border border-line bg-raised pr-8 pl-3 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink focus:border-line-strong focus:outline-none"
              >
                <option value="featured">{t('sort.featured')}</option>
                <option value="new">{t('sort.new')}</option>
              </select>
              <ChevronIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 rotate-90 text-ink-faint" />
            </label>
          </span>
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">{t('search')}</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault()
                  setQuery('')
                }
              }}
              placeholder={t('search')}
              enterKeyHint="search"
              className="peer h-9 w-full rounded-lg border border-line bg-raised pr-9 pl-9 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[11px] leading-[18px] text-ink-faint peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden max-sm:hidden">
              /
            </kbd>
          </label>
        </div>
      </div>

      {filtered && (
        <p className="flex items-center gap-3 pb-2 text-[13px] text-ink-faint" aria-live="polite">
          <span data-testid="result-count">{t('results', { count: visible.length })}</span>
          <button type="button" onClick={clearAll} className="text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink">
            {t('clearFilters')}
          </button>
        </p>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-ink-muted">{onlyFavorites && favoriteSet.size === 0 ? t('favorites.empty') : t('empty')}</p>
          <button type="button" onClick={clearAll} className="rounded-full border border-line px-4 py-1.5 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        // 后台重排期间把旧的卡片调暗一点；样式放在外层，网格的 props 不变，memo 才生效。
        <div className={`transition-opacity duration-150 ${pending ? 'opacity-60' : ''}`}>
          {!filtered && recentItems.length > 0 && <RecentStrip items={recentItems} />}
          <CardGrid items={visible} />
        </div>
      )}
    </section>
  )
}

/**
 * 每批渲染多少张卡片。首屏只看得到两行，剩下的滚动到附近再渲染：
 * 上百张卡片一次性水合时，页面刚打开那几秒的第一次点击要等它们全部水合完（INP）。
 */
const BATCH = 24

/** 卡片网格单独成组件并 memo：只改了选中状态的那次渲染不会碰到上百张卡片。 */
const CardGrid = memo(function CardGrid({ items }: { items: ItemSummary[] }) {
  const t = useTranslations('market')
  const [limit, setLimit] = useState(BATCH)
  // 筛选结果变了就从第一批重新开始（渲染期间根据上一次的结果调整状态，不用 effect）。
  const [shownFor, setShownFor] = useState(items)
  if (items !== shownFor) {
    setShownFor(items)
    setLimit(BATCH)
  }
  const sentinel = useRef<HTMLDivElement>(null)
  const more = limit < items.length

  // 哨兵离视口还有 1200px 时就渲染下一批；新一批渲染完哨兵还在范围内，会接着再加。
  useEffect(() => {
    const element = sentinel.current
    if (!element || !more) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setLimit((value) => value + BATCH)
    }, { rootMargin: '1200px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [more, limit])

  return (
    <>
      <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" data-testid="market-grid">
        {items.slice(0, limit).map((item, index) => (
          <li key={item.slug}>
            {/* 第一行（宽屏三列）是首屏，海报往往就是 LCP。 */}
            <ItemCard item={item} categoryLabel={t(`categories.${item.category}`)} priority={index < 3} />
          </li>
        ))}
      </ul>
      {more && <div ref={sentinel} aria-hidden className="h-px" />}
    </>
  )
})

/** 最近看过的条目：一行小卡片，横向滚动。 */
function RecentStrip({ items }: { items: ItemSummary[] }) {
  const t = useTranslations('market')
  return (
    <section aria-label={t('recent')} className="mb-8" data-testid="recent-items">
      <h2 className="mb-3 text-[13px] text-ink-faint">{t('recent')}</h2>
      <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        {items.map((item) => (
          <li key={item.slug} className="w-40 shrink-0">
            <Link href={item.community ? `/community/works/${item.slug}` : `/market/${item.slug}`} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-lg border border-line bg-sunken transition-colors duration-150 group-hover:border-line-strong">
                {(item.media.posterSmall ?? item.media.poster) && (
                  // 海报是预先生成的 webp，不需要 next/image 再处理。
                  <img src={item.media.posterSmall ?? item.media.poster ?? ''} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                )}
              </span>
              <span className="mt-1.5 block truncate text-[12.5px] text-ink-muted transition-colors duration-150 group-hover:text-ink">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function KindTab({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="-mb-px flex shrink-0 items-baseline gap-1.5 border-b-2 border-transparent pb-3 text-[15px] text-ink-muted transition-colors duration-150 hover:text-ink aria-selected:border-ink aria-selected:text-ink"
    >
      {children}
      <span className="font-mono text-[11px] text-ink-faint tabular-nums">{count}</span>
    </button>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink aria-pressed:bg-ink aria-pressed:text-canvas"
    >
      {children}
    </button>
  )
}
