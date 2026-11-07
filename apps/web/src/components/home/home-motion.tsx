'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { ItemSummary } from '@/lib/catalog'

/**
 * 停在首屏顶端时头部变透明，叠在正在运行的效果上（docs/decisions/0010）：首屏是一张「海报」，头部不该在它上面压一条实底。
 * 一开始滚动就恢复成平时的半透明实底：首屏底部的标题和按钮往上走时不会从透明的头部下面穿过、和导航叠在一起。
 * 首屏永远是暗色，所以叠在上面时头部也临时用暗色（浅色主题里字才看得清）。
 */
/** 滚动不到这么多像素算「还在顶端」（触控板的轻微抖动不来回切换）。 */
const TOP_SLACK = 24

export function ImmersiveHeader() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-site-header]')
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    if (!header || !hero) return
    let frame = 0
    const update = () => {
      frame = 0
      if (window.scrollY < TOP_SLACK && hero.getBoundingClientRect().bottom > header.offsetHeight) {
        header.dataset.overHero = ''
        header.dataset.theme = 'dark'
      } else {
        delete header.dataset.overHero
        delete header.dataset.theme
      }
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
      delete header.dataset.overHero
      delete header.dataset.theme
    }
  }, [])
  return null
}

interface TrendingEntry {
  slug: string
  rank: number
  item: ItemSummary
}

/**
 * 首页的「本周热门」：在浏览器里取排行榜（首页本身是静态页面）。上榜的不到 3 个时整段不出现，不拿空榜单充数。
 */
export function TrendingStrip({ locale }: { locale: Locale }) {
  const t = useTranslations('home.trending')
  const [entries, setEntries] = useState<TrendingEntry[] | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/rank?limit=5&locale=${locale}`)
      .then((response) => (response.ok ? (response.json() as Promise<{ entries: TrendingEntry[] }>) : null))
      .then((data) => {
        if (alive && data) setEntries(data.entries)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [locale])

  if (!entries || entries.length < 3) return null
  return (
    <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8" data-testid="home-trending">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.03em]">{t('title')}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
        </div>
        <Link href="/rank" className="shrink-0 text-[14px] text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink">
          {t('all')} →
        </Link>
      </div>
      <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-5">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <Link href={entry.item.community ? `/community/works/${entry.slug}` : `/market/${entry.slug}`} className="group block">
              <span data-cursor="view" className="relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken transition-[border-color] duration-(--duration-base) group-hover:border-line-strong">
                {(entry.item.media.posterSmall ?? entry.item.media.poster) && (
                  // 海报是预先生成的 webp。
                  <img src={entry.item.media.posterSmall ?? entry.item.media.poster ?? ''} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                )}
              </span>
              <span className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-[28px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{entry.rank}</span>
                <span className="min-w-0 truncate text-[14px] text-ink-muted transition-colors duration-(--duration-fast) group-hover:text-ink">{entry.item.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
