'use client'

import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import type { ItemSummary } from '@/lib/catalog'

/**
 * 排行榜前三名的海报：静态海报，悬停（或键盘聚焦到所在的链接）时播放循环视频，和市场卡片一样。
 * 链接由外层负责，这里只管画面。
 */
export function RankPoster({ item, priority = false }: { item: ItemSummary; priority?: boolean }) {
  const video = useRef<HTMLVideoElement>(null)
  const play = () => {
    if (!video.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.current.play().catch(() => undefined)
  }
  const stop = () => {
    if (!video.current) return
    video.current.pause()
    video.current.currentTime = 0
  }
  return (
    <div
      data-cursor="view"
      onPointerEnter={play}
      onPointerLeave={stop}
      className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken transition-[border-color] duration-(--duration-base) group-hover:border-line-strong group-focus-visible:border-line-strong"
    >
      {item.media.poster && (
        // 海报是预先生成的 webp。
        <img src={item.media.poster} alt="" loading={priority ? 'eager' : 'lazy'} decoding="async" className="absolute inset-0 size-full object-cover" />
      )}
      {item.media.poster && (item.media.loopWebm ?? item.media.loopMp4) && (
        <video ref={video} muted loop playsInline preload="none" poster={item.media.poster} className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-(--duration-slow) group-hover:opacity-100">
          {item.media.loopWebm && <source src={item.media.loopWebm} type="video/webm" />}
          {item.media.loopMp4 && <source src={item.media.loopMp4} type="video/mp4" />}
        </video>
      )}
    </div>
  )
}

/** 名次变化：和上一个同样长的时间段比。「全部」没有上一段，不显示。 */
export function RankChange({ rank, previous, show }: { rank: number; previous: number | null; show: boolean }) {
  const t = useTranslations('rank')
  if (!show) return null
  if (previous === null)
    return (
      <span className="rounded-full border border-success/40 px-1.5 text-[10.5px] leading-[18px] text-success" title={t('change.new')}>
        {t('newBadge')}
      </span>
    )
  const delta = previous - rank
  if (delta === 0)
    return (
      <span className="font-mono text-[11px] text-ink-faint" title={t('change.same')}>
        —
      </span>
    )
  const label = delta > 0 ? t('change.up', { count: delta }) : t('change.down', { count: -delta })
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${delta > 0 ? 'text-success' : 'text-ink-faint'}`} title={label}>
      <span aria-hidden>{delta > 0 ? '▲' : '▼'}</span>
      <span className="sr-only">{label}</span>
      <span aria-hidden>{Math.abs(delta)}</span>
    </span>
  )
}

/** 近 14 天的走势：一条细线，最后一天一个点。全是 0 的天也画出来（贴着底）。 */
export function Sparkline({ series, label, className = '' }: { series: number[]; label: string; className?: string }) {
  const width = 112
  const height = 28
  const max = Math.max(1, ...series)
  const step = series.length > 1 ? width / (series.length - 1) : width
  const points = series.map((value, index) => [index * step, height - 2 - (value / max) * (height - 4)] as const)
  const last = points.at(-1)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={label} className={`overflow-visible text-ink-muted ${className}`}>
      <polyline points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {last && <circle cx={last[0]} cy={last[1]} r="2" className="fill-ink" />}
    </svg>
  )
}
