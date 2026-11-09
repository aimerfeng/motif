// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/stories/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type ComponentProps, type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  duration: 5,
  autoplay: true,
  accent: '#ee2a7b',
  radius: 12,
  aspect: 'portrait',
  showAvatars: true,
}
/* @motif:end */

/* ---------- upstream primitives (embla carousel -> motion drag) ---------- */

export type StoriesProps = ComponentProps<'div'>

export const Stories = ({ className, ...props }: StoriesProps) => (
  <div className={cn('w-full min-w-0 overflow-hidden', className)} {...props} />
)

export type StoriesContentProps = {
  className?: string
  children?: ReactNode
  /** The Stories viewport; enables drag with constraints. */
  constraints?: RefObject<HTMLDivElement | null>
}

export const StoriesContent = ({ className, constraints, children }: StoriesContentProps) => (
  <motion.div
    className={cn('-ml-2 flex w-max cursor-grab active:cursor-grabbing', className)}
    drag={constraints ? 'x' : false}
    dragConstraints={constraints}
    dragElastic={0.08}
  >
    {children}
  </motion.div>
)

export type StoryProps = HTMLAttributes<HTMLDivElement>

export const Story = ({ className, ...props }: StoryProps) => (
  <div className="shrink-0 pl-2 md:pl-4">
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-muted/40',
        'cursor-pointer transition-[transform,box-shadow] duration-200',
        'hover:scale-[1.02] hover:shadow-lg motion-reduce:hover:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      role="button"
      tabIndex={0}
      {...props}
    />
  </div>
)

export type StoryMediaProps = { background: string; art?: ReactNode; playing?: boolean; className?: string }

/** Replaces StoryVideo / StoryImage: a generated slide that slowly pans while it plays. */
export const StoryMedia = ({ background, art, playing = false, className }: StoryMediaProps) => {
  const reduced = useReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className={cn('absolute inset-0 size-full transition-opacity duration-200 group-hover:opacity-90', className)}
      style={{ background }}
      animate={playing && !reduced ? { scale: 1.12, x: '-4%' } : { scale: 1, x: 0 }}
      transition={{ duration: playing ? 6 : 0.6, ease: 'easeOut' }}
    >
      {art}
    </motion.div>
  )
}

export type StoryAuthorProps = HTMLAttributes<HTMLDivElement>

export const StoryAuthor = ({ className, children, ...props }: StoryAuthorProps) => (
  <div className={cn('absolute right-0 bottom-0 left-0 z-10', 'p-3 text-white', className)} {...props}>
    <div className="flex items-center gap-2">{children}</div>
  </div>
)

export type StoryAuthorImageProps = HTMLAttributes<HTMLSpanElement> & { name?: string; fallback?: string; tint?: string }

/** Avatar with initials (no remote images). */
export const StoryAuthorImage = ({ fallback, name, tint, className, ...props }: StoryAuthorImageProps) => (
  <span className={cn('relative flex size-6 shrink-0 overflow-hidden rounded-full border border-white/20', className)} {...props}>
    <span
      className="flex size-full items-center justify-center rounded-full bg-white/10 font-medium text-white text-xs"
      style={tint ? { background: tint } : undefined}
    >
      {fallback || name?.charAt(0)?.toUpperCase()}
    </span>
  </span>
)

export type StoryAuthorNameProps = HTMLAttributes<HTMLSpanElement>

export const StoryAuthorName = ({ className, ...props }: StoryAuthorNameProps) => (
  <span className={cn('truncate font-medium text-sm', className)} {...props} />
)

export type StoryTitleProps = HTMLAttributes<HTMLDivElement>

export const StoryTitle = ({ className, ...props }: StoryTitleProps) => (
  <div className={cn('absolute top-0 right-0 left-0 z-10', 'p-3 text-white', className)} {...props} />
)

export type StoryOverlayProps = HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' }

export const StoryOverlay = ({ className, side = 'bottom', ...props }: StoryOverlayProps) => {
  const positionClasses = side === 'top' ? 'top-0 bg-gradient-to-b' : 'bottom-0 bg-gradient-to-t'
  return <div className={cn('absolute right-0 left-0 h-10 from-black/20 to-transparent', positionClasses, className)} {...props} />
}

/* ---------- composed viewer ---------- */

export interface StoryItem {
  id: string
  author: string
  fallback: string
  /** CSS background of the slide. */
  background: string
  /** Avatar fill. */
  tint?: string
  title?: string
  art?: ReactNode
}

export type StoriesViewerProps = Partial<typeof defaults> & {
  stories?: StoryItem[]
  onSelect?: (story: StoryItem) => void
  className?: string
  style?: CSSProperties
}

const defaultStories: StoryItem[] = [
  { id: 'a', author: 'Mara Lind', fallback: 'ML', title: 'Studio tour', tint: '#6d28d9', background: 'radial-gradient(80% 70% at 30% 20%, #8b5cf6, transparent), linear-gradient(160deg, #312e81, #0f172a)' },
  { id: 'b', author: 'Theo Ankers', fallback: 'TA', title: 'Morning ride', tint: '#0e7490', background: 'radial-gradient(70% 70% at 70% 30%, #22d3ee, transparent), linear-gradient(200deg, #164e63, #020617)' },
  { id: 'c', author: 'Ines Okafor', fallback: 'IO', title: 'Kiln day', tint: '#c2410c', background: 'radial-gradient(70% 80% at 40% 75%, #fb923c, transparent), linear-gradient(140deg, #7c2d12, #1c1917)' },
  { id: 'd', author: 'Jun Park', fallback: 'JP', title: 'New prints', tint: '#15803d', background: 'radial-gradient(80% 70% at 60% 60%, #4ade80, transparent), linear-gradient(120deg, #14532d, #0a0a0a)' },
]

const aspectClasses: Record<string, string> = {
  portrait: 'aspect-[3/4] w-[140px] sm:w-[200px]',
  tall: 'aspect-[9/16] w-[120px] sm:w-[170px]',
  square: 'aspect-square w-[140px] sm:w-[190px]',
}

export function StoriesViewer({ stories = defaultStories, onSelect, className, style, ...props }: StoriesViewerProps) {
  const o = { ...defaults, ...props }
  const host = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const [auto, setAuto] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered ?? (o.autoplay ? auto : -1)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!o.autoplay || stories.length === 0) return
      const d = Math.max(1, o.duration)
      const index = Math.floor(time / d) % stories.length
      const progress = (time % d) / d
      setAuto((prev) => (prev === index ? prev : index))
      bars.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleX(${i === index && hovered === null ? progress : 0})`
      })
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )

  const hoverProps = (i: number) => ({
    onMouseEnter: () => setHovered(i),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(i),
    onBlur: () => setHovered(null),
  })

  return (
    <div ref={host} className={cn('w-full min-w-0', className)} style={style}>
      {o.showAvatars && (
        <ul className="mb-5 flex flex-wrap justify-center gap-3" aria-label="Stories">
          {stories.map((story, i) => (
            <li key={story.id}>
              <button
                type="button"
                aria-label={`Open story by ${story.author}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => onSelect?.(story)}
                {...hoverProps(i)}
                className="block size-12 rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:hover:scale-100"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-full rounded-full p-0.5 transition-opacity duration-300"
                  style={{ background: `linear-gradient(45deg, #f9ce34, ${o.accent}, #6228d7)`, opacity: i === active ? 1 : 0.45 }}
                >
                  <span className="inline-flex size-full rounded-full bg-background p-0.5">
                    <StoryAuthorImage className="size-full" fallback={story.fallback} name={story.author} tint={story.tint} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Stories ref={viewport}>
        <StoriesContent constraints={viewport}>
          {stories.map((story, i) => (
            <Story
              key={story.id}
              aria-label={`${story.author}: ${story.title ?? 'story'}`}
              className={aspectClasses[o.aspect] ?? aspectClasses.portrait}
              style={{ borderRadius: o.radius }}
              onClick={() => onSelect?.(story)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect?.(story)
                }
              }}
              {...hoverProps(i)}
            >
              <StoryMedia background={story.background} art={story.art} playing={i === active} />
              <StoryOverlay side="top" className="h-16 from-black/50" />
              <StoryOverlay className="h-20 from-black/60" />
              {o.autoplay && (
                <span aria-hidden="true" className="absolute top-2 right-3 left-3 z-20 h-0.5 overflow-hidden rounded-full bg-white/30">
                  <span
                    ref={(el) => {
                      bars.current[i] = el
                    }}
                    className="block h-full origin-left rounded-full bg-white"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>
              )}
              {story.title && <StoryTitle className="pt-5 font-semibold text-sm">{story.title}</StoryTitle>}
              <StoryAuthor>
                <StoryAuthorImage fallback={story.fallback} name={story.author} tint={story.tint} />
                <StoryAuthorName>{story.author}</StoryAuthorName>
              </StoryAuthor>
            </Story>
          ))}
        </StoriesContent>
      </Stories>
    </div>
  )
}
