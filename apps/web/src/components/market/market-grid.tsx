'use client'

import { CATEGORIES_BY_KIND, KINDS, type Category, type Kind } from '@motif/schema'
import { useTranslations } from 'next-intl'
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SkillButton } from '@/components/skill-button'
import type { ItemSummary } from '@/lib/catalog'
import { generalSkills } from '@/lib/general-skills'
import { ItemCard } from './item-card'

function readQuery(): { kind: Kind | null; category: Category | null } {
  const params = new URLSearchParams(window.location.search)
  const kind = params.get('kind')
  const category = params.get('category')
  const validKind = (KINDS as readonly string[]).includes(kind ?? '') ? (kind as Kind) : null
  const validCategory = validKind && (CATEGORIES_BY_KIND[validKind] as readonly string[]).includes(category ?? '') ? (category as Category) : null
  return { kind: validKind, category: validCategory }
}

/** 市场：先按层级（模板 / 风格 / 区块 / 组件 / 效果），再按分类和关键词筛选。筛选状态写进 URL，可以分享。 */
export function MarketGrid({ items }: { items: ItemSummary[] }) {
  const t = useTranslations('market')
  const [kind, setKind] = useState<Kind | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // 首次挂载时从链接还原筛选（静态页面在服务端没有查询参数，所以放在 effect 里）。
  useEffect(() => {
    const initial = readQuery()
    setKind(initial.kind)
    setCategory(initial.category)
  }, [])

  // 只在用户操作时写回链接；放在 effect 里会在开发模式的双重挂载中把链接先清掉。
  const writeQuery = (nextKind: Kind | null, nextCategory: Category | null) => {
    const url = new URL(window.location.href)
    if (nextKind) url.searchParams.set('kind', nextKind)
    else url.searchParams.delete('kind')
    if (nextCategory) url.searchParams.set('category', nextCategory)
    else url.searchParams.delete('category')
    window.history.replaceState(window.history.state, '', url)
  }

  // 只显示有条目的层级和分类，按固定顺序。
  const kinds = useMemo(() => KINDS.filter((k) => items.some((item) => item.kind === k)), [items])
  const categories = useMemo(
    () => (kind ? (CATEGORIES_BY_KIND[kind] as readonly Category[]).filter((c) => items.some((item) => item.category === c)) : []),
    [items, kind],
  )

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()
    return items.filter((item) => {
      if (kind && item.kind !== kind) return false
      if (category && item.category !== category) return false
      if (!needle) return true
      return [item.title, item.summary, item.slug, ...item.tags].some((text) => text.toLowerCase().includes(needle))
    })
  }, [items, kind, category, deferredQuery])

  const selectKind = (next: Kind | null) => {
    setKind(next)
    setCategory(null)
    writeQuery(next, null)
  }
  const selectCategory = (next: Category | null) => {
    setCategory(next)
    writeQuery(kind, next)
  }

  return (
    <section className="mt-10">
      <div role="tablist" aria-label={t('kindsLabel')} className="flex gap-6 overflow-x-auto border-b border-line">
        <KindTab active={kind === null} onClick={() => selectKind(null)} count={items.length}>
          {t('all')}
        </KindTab>
        {kinds.map((k) => (
          <KindTab key={k} active={kind === k} onClick={() => selectKind(k)} count={items.filter((item) => item.kind === k).length}>
            {t(`kinds.${k}`)}
          </KindTab>
        ))}
      </div>

      <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t('categoriesLabel')} className="-mx-1 flex flex-wrap gap-1">
          {kind && (
            <FilterChip active={category === null} onClick={() => selectCategory(null)}>
              {t('allIn', { kind: t(`kinds.${kind}`) })}
            </FilterChip>
          )}
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => selectCategory(c)}>
              {t(`categories.${c}`)}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-ink-faint">{t('generalSkill')}</span>
          <span className="flex flex-wrap gap-1.5" data-testid="general-skills">
            {generalSkills(kind, category).map((name) => (
              <SkillButton key={name} source={{ name }} label={t(`skillNames.${name}` as 'skillNames.motif-design')} />
            ))}
          </span>
          <label className="relative ml-1 block w-full sm:w-64">
            <span className="sr-only">{t('search')}</span>
            <svg viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 3.3 3.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('search')}
              className="h-9 w-full rounded-lg border border-line bg-raised pr-3 pl-9 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
            />
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-center text-ink-faint">{t('empty')}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" data-testid="market-grid">
          {visible.map((item) => (
            <li key={item.slug}>
              <ItemCard item={item} categoryLabel={t(`categories.${item.category}`)} />
            </li>
          ))}
        </ul>
      )}
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
      className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors duration-150 hover:text-ink aria-pressed:bg-ink aria-pressed:text-canvas"
    >
      {children}
    </button>
  )
}
