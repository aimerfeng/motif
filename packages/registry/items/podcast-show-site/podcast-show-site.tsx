import { cn, usePrefersReducedMotion } from '@motif/runtime'
import { MotionConfig } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { CoverStyle } from './art'
import { LATEST, RESUME_AT } from './data'
import { Episodes, Footer, Guests, Hosts, Subscribe } from './listing'
import { createPlayerStore, MiniPlayer, PlaybackClock, PlayerCard, PlayerProvider } from './player'
import { Header, Hero, Inside, useJump, type SectionIds } from './sections'
import { palette, themeStyle } from './theme'

/* @motif:defaults */
export const defaults = {
  showName: 'Control Group',
  tagline: 'A weekly science show about experiments that went sideways, told by the people who ran them.',
  accent: '#ff6a3d',
  coverStyle: 'orbits',
  fontPairing: 'broadcast',
  dark: true,
  waveformDensity: 18,
  autoplayPreview: true,
}
/* @motif:end */

export type PodcastShowSiteProps = Partial<typeof defaults> & {
  /** 演示用：在波形上显示一个虚拟指针（0–1），null 时隐藏。真实指针移上来时以真实的为准。 */
  ghostScrub?: number | null
  className?: string
  style?: CSSProperties
}

const COVER_STYLES: readonly CoverStyle[] = ['orbits', 'contours', 'halftone', 'monogram']

/**
 * 播客节目站：首屏是最新一集的大播放器（可拖动的 SVG 波形 + 章节标记），往下是章节与逐词同步的文字稿、
 * 单集列表（按话题筛选、每集的章节条）、主持人、嘉宾墙、订阅与页脚；滚过播放器后底部出现迷你播放条。
 * 没有音频文件，播放是模拟的时钟；布局全部用容器查询。
 */
export function PodcastShowSite({ className, style, ghostScrub = null, ...props }: PodcastShowSiteProps) {
  const options = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const colors = useMemo(() => palette(options.accent, options.dark), [options.accent, options.dark])
  const [store] = useState(() => createPlayerStore({ episode: LATEST.number, time: RESUME_AT }))
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const ids = useMemo<SectionIds>(
    () => ({
      top: `${uid}-top`,
      player: `${uid}-player`,
      inside: `${uid}-inside`,
      episodes: `${uid}-episodes`,
      hosts: `${uid}-hosts`,
      guests: `${uid}-guests`,
      subscribe: `${uid}-subscribe`,
    }),
    [uid],
  )
  const jump = useJump()

  const showName = options.showName.trim() || 'Control Group'
  const tagline = options.tagline.trim()
  const coverStyle = COVER_STYLES.find((value) => value === options.coverStyle) ?? 'orbits'
  const density = Math.min(34, Math.max(8, options.waveformDensity))
  const art = { coverStyle, accent: colors.accent, showName }

  // 自动预览：不出声地从上次听到的地方接着播。开启「减少动态效果」时不自动播放，但按下播放照常走。
  useEffect(() => {
    if (options.autoplayPreview && !reduced) store.play()
    else store.pause()
  }, [options.autoplayPreview, reduced, store])

  // 滚过首屏播放器以后，在底部显示迷你播放条（只在这次访问按过播放之后）
  const started = useSyncExternalStore(
    store.subscribe,
    () => store.get().started,
    () => false,
  )
  const playerRef = useRef<HTMLDivElement>(null)
  const [playerOut, setPlayerOut] = useState(false)
  useEffect(() => {
    const element = playerRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setPlayerOut(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <PlayerProvider value={store}>
      <MotionConfig reducedMotion="user">
        <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(colors, options.fontPairing, 16), ...style }}>
          <PlaybackClock />
          <Header showName={showName} ids={ids} />
          <main>
            <Hero showName={showName} tagline={tagline} art={art} ids={ids}>
              <div ref={playerRef}>
                <PlayerCard density={density} ghost={ghostScrub} />
              </div>
            </Hero>
            <Inside id={ids.inside} accent={colors.accent} />
            <Episodes id={ids.episodes} art={art} />
            <Hosts id={ids.hosts} accent={colors.accent} />
            <Guests id={ids.guests} accent={colors.accent} />
            <Subscribe id={ids.subscribe} showName={showName} />
          </main>
          <Footer showName={showName} ids={ids} />
          <MiniPlayer visible={started && playerOut} coverStyle={coverStyle} accent={colors.accent} showName={showName} onReturn={() => jump(ids.player)()} />
        </div>
      </MotionConfig>
    </PlayerProvider>
  )
}
