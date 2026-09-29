'use client'

import { CATEGORIES, type Category } from '@motif/schema'
import { useTranslations } from 'next-intl'
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import type { ItemSummary } from '@/lib/catalog'
import { ItemCard } from './item-card'

export function MarketGrid({ items }: { items: ItemSummary[] }) {
  const t = useTranslations('market')
  const [category, setCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // 只显示有条目的分类，按固定顺序。
  const categories = useMemo(() => CATEGORIES.filter((c) => items.some((item) => item.category === c)), [items])

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()
    return items.filter((item) => {
      if (category && item.category !== category) return false
      if (!needle) return true
      return [item.title, item.summary, item.slug, ...item.tags].some((text) => text.toLowerCase().includes(needle))
    })
  }, [items, category, deferredQuery])

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={t('all')} className="-mx-1 flex flex-wrap gap-1">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            {t('all')}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {t(`categories.${c}`)}
            </FilterChip>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">{t('search')}</span>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
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

      {visible.length === 0 ? (
        <p className="py-24 text-center text-ink-faint">{t('empty')}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" data-testid="market-grid">
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
