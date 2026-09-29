'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import type { ItemSummary } from '@/lib/catalog'
import { RUNTIME_LABELS } from '@/lib/labels'

/** 市场卡片：静态海报，悬停时播放循环视频（画廊里不放实时 WebGL，见 docs/decisions/0002）。 */
export function ItemCard({ item, categoryLabel }: { item: ItemSummary; categoryLabel: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const tech = item.runtime.filter((r) => r !== 'react').map((r) => RUNTIME_LABELS[r] ?? r)

  const play = () => {
    const video = videoRef.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.play().catch(() => {
      // 自动播放被浏览器拒绝时保持海报即可。
    })
  }
  const stop = () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }

  return (
    <Link
      href={`/market/${item.slug}`}
      className="group block rounded-[var(--radius-card)]"
      onPointerEnter={play}
      onPointerLeave={stop}
      onFocus={play}
      onBlur={stop}
      data-testid={`card-${item.slug}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken transition-[border-color] duration-200 group-hover:border-line-strong">
        {item.media.poster ? (
          <>
            {/* 海报是预先生成的 webp，不需要 next/image 再处理。 */}
            <img src={item.media.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            {(item.media.loopWebm ?? item.media.loopMp4) && (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none"
                poster={item.media.poster}
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                {item.media.loopWebm && <source src={item.media.loopWebm} type="video/webm" />}
                {item.media.loopMp4 && <source src={item.media.loopMp4} type="video/mp4" />}
              </video>
            )}
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_90%_at_30%_20%,oklch(0.3_0.06_285),transparent_60%),radial-gradient(90%_80%_at_80%_90%,oklch(0.28_0.07_340),transparent_55%)]">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink/80">{item.title}</span>
          </div>
        )}
      </div>
      <div className="mt-3.5 flex items-baseline justify-between gap-4 px-0.5">
        <h2 className="truncate text-[15px] font-medium tracking-[-0.01em]">{item.title}</h2>
        <span className="shrink-0 text-[12px] text-ink-faint">{categoryLabel}</span>
      </div>
      <p className="mt-1 line-clamp-1 px-0.5 text-[13px] text-ink-muted">{item.summary}</p>
      {tech.length > 0 && (
        <p className="mt-2 flex gap-1.5 px-0.5 font-mono text-[11px] text-ink-faint">
          {tech.map((label) => (
            <span key={label} className="rounded border border-line px-1.5 py-0.5">
              {label}
            </span>
          ))}
        </p>
      )}
    </Link>
  )
}
