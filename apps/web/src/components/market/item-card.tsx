'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, ViewTransition } from 'react'
import { SkillButton } from '@/components/skill-button'
import { Link } from '@/i18n/navigation'
import type { ItemSummary } from '@/lib/catalog'
import { RUNTIME_LABELS } from '@/lib/labels'
import { FavoriteButton } from './favorite-button'

/** 本周前几名在卡片上标出名次（docs/decisions/0010）。 */
const RANK_BADGE_MAX = 10

/**
 * 市场卡片：静态海报，悬停时播放循环视频（画廊里不放实时 WebGL，见 docs/decisions/0002）。
 * 右上角可以直接复制这个条目的 Skill；按钮是链接的兄弟节点，不嵌在链接里。
 * 技术标签那一行总是占位（没有标签也留出高度）：所有卡片一样高，分组目录的骨架和真卡片排版完全一致。
 */
export function ItemCard({
  item,
  categoryLabel,
  priority = false,
  rank,
  titleAs: Title = 'h2',
  morph = true,
}: {
  item: ItemSummary
  categoryLabel: string
  /** 首屏的卡片：海报立即加载、优先级调高（往往就是页面的 LCP）。 */
  priority?: boolean
  /** 本周综合榜的名次；前 10 名在海报上标出来。 */
  rank?: number
  /** 卡片标题的标签：放在分组目录里时比分组标题低一级。 */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** 海报参与「点开时变形成详情页预览」的过渡。同一页上同一个条目出现两次时，只有第一张参与（名字必须唯一）。 */
  morph?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // 条目页是静态页，默认一进视口就整页预取（每个十几 KB）：市场一屏十几张卡，慢网络下会和海报抢带宽。
  // 改成指针移上来、获得焦点（触屏按下时也会触发 pointerenter）才预取，只取用户可能点开的那一个。
  const [intent, setIntent] = useState(false)
  const t = useTranslations('community')
  const tm = useTranslations('market')
  const tech = item.runtime.filter((r) => r !== 'react').map((r) => RUNTIME_LABELS[r] ?? r)

  const play = () => {
    setIntent(true)
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

  const poster = (
    <div
      data-cursor="view"
      className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken transition-[border-color] duration-(--duration-base) group-hover:border-line-strong"
    >
      {item.media.poster ? (
        <>
          {/* 海报是预先生成的 webp，不需要 next/image 再处理。 */}
          <img
            src={item.media.poster}
            srcSet={item.media.posterSmall ? `${item.media.posterSmall} 480w, ${item.media.poster} 960w` : undefined}
            sizes="(min-width: 1280px) 440px, (min-width: 640px) 50vw, 100vw"
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          {/* 视频不设 poster：下面的 img 已经是海报；poster 属性会不管 srcSet 和懒加载、立刻再下一张全尺寸海报。 */}
          {(item.media.loopWebm ?? item.media.loopMp4) && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-(--duration-slow) group-hover:opacity-100"
            >
              {item.media.loopWebm && <source src={item.media.loopWebm} type="video/webm" />}
              {item.media.loopMp4 && <source src={item.media.loopMp4} type="video/mp4" />}
            </video>
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_90%_at_30%_20%,oklch(0.3_0.06_285),transparent_60%),radial-gradient(90%_80%_at_80%_90%,oklch(0.28_0.07_340),transparent_55%)]">
          {/* 占位图的底色总是深色（像一张海报），字用白色，不随主题变。 */}
          <span className="font-display text-2xl font-semibold tracking-tight text-white/80">{item.title}</span>
        </div>
      )}
      {rank !== undefined && rank <= RANK_BADGE_MAX && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white/90 tabular-nums ring-1 ring-white/15 backdrop-blur-md">
          {tm('rankBadge', { rank })}
        </span>
      )}
    </div>
  )

  return (
    <div className="group relative" onPointerEnter={play} onPointerLeave={stop} data-testid={`card-${item.slug}`}>
      <Link href={item.community ? `/community/works/${item.slug}` : `/market/${item.slug}`} className="block rounded-[var(--radius-card)]" prefetch={intent ? null : false} onFocus={play} onBlur={stop}>
        {morph ? (
          <ViewTransition name={`item-${item.slug}`} share="morph" default="none">
            {poster}
          </ViewTransition>
        ) : (
          poster
        )}
        <div className="mt-3.5 flex items-baseline justify-between gap-4 px-0.5">
          <Title className="truncate text-[15px] font-medium tracking-[-0.01em]">{item.title}</Title>
          <span className="shrink-0 text-[12px] text-ink-faint">
            {item.community && <span className="mr-2 text-success">{t('cardBadge')}</span>}
            {categoryLabel}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 px-0.5 text-[13px] text-ink-muted">{item.summary}</p>
        <p className="mt-2 flex h-[22px] gap-1.5 px-0.5 font-mono text-[11px] text-ink-faint">
          {tech.map((label) => (
            <span key={label} className="rounded border border-line px-1.5 py-0.5 leading-4">
              {label}
            </span>
          ))}
        </p>
      </Link>
      <FavoriteButton
        slug={item.slug}
        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=on]:opacity-100 [@media(hover:none)]:opacity-100"
      />
      <SkillButton
        source={{ name: item.skill }}
        stat={item.slug}
        variant="overlay"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=copied]:opacity-100 [@media(hover:none)]:opacity-100"
      />
    </div>
  )
}

/** 还没渲染的卡片：和 ItemCard 同样的排版（同样的字号撑出同样的行高），换成真卡片时不跳动。 */
export function ItemCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[16/10] rounded-[var(--radius-card)] border border-line bg-sunken" />
      <div className="mt-3.5 flex items-baseline justify-between gap-4 px-0.5">
        <span className="truncate text-[15px] font-medium">
          <span className="inline-block w-32 rounded bg-ink/[0.06] text-transparent">.</span>
        </span>
        <span className="text-[12px]">
          <span className="inline-block w-10 rounded bg-ink/[0.04] text-transparent">.</span>
        </span>
      </div>
      <p className="mt-1 px-0.5 text-[13px]">
        <span className="inline-block w-3/4 rounded bg-ink/[0.04] text-transparent">.</span>
      </p>
      <p className="mt-2 h-[22px]" />
    </div>
  )
}
