'use client'

import { useTranslations } from 'next-intl'
import { HeartIcon } from '@/components/icons'
import { FAVORITES, useLocalList } from '@/lib/local-store'

/**
 * 收藏一个条目（只存在这个浏览器里）。overlay：卡片海报左上角的圆钮；button：详情页里带文字的按钮。
 * 服务端渲染时不知道收藏了什么，先按未收藏画出来，水合后再更新。
 */
export function FavoriteButton({ slug, variant = 'overlay', className = '' }: { slug: string; variant?: 'overlay' | 'button'; className?: string }) {
  const t = useTranslations('market.favorites')
  const [favorites, setFavorites] = useLocalList(FAVORITES.key, FAVORITES.max)
  const on = favorites?.includes(slug) ?? false
  const toggle = () => {
    if (!favorites) return
    setFavorites(on ? favorites.filter((entry) => entry !== slug) : [slug, ...favorites])
  }
  const label = on ? t('remove') : t('add')

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className={`inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-pressed:text-ink ${className}`}
      >
        <HeartIcon filled={on} className={`size-4 ${on ? 'text-heart' : ''}`} />
        {on ? t('saved') : t('save')}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      data-state={on ? 'on' : 'off'}
      className={`grid size-8 place-items-center rounded-full bg-black/55 text-white/90 ring-1 ring-white/15 backdrop-blur-md transition-[opacity,background-color] duration-150 hover:bg-black/75 ${className}`}
    >
      <HeartIcon filled={on} className={`size-4 ${on ? 'text-heart' : ''}`} />
    </button>
  )
}
