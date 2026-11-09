// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/gallery-grid-block.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#a78bfa',
  tone: 'dusk',
  artStyle: 'geometric',
  filterStyle: 'pills',
  columns: 3,
  gap: 16,
  radius: 12,
}
/* @motif:end */

export type GalleryGridBlockProps = Partial<typeof defaults> & {
  /** 受控：当前分类（演示自动播放用）。 */
  filter?: string
  /** 受控：灯箱里打开的作品 id，null 为关闭。 */
  selectedId?: number | null
  onFilterChange?: (category: string) => void
  onSelect?: (id: number | null) => void
  className?: string
  style?: CSSProperties
}

const galleryImages = [
  { id: 1, title: 'Abstract Architecture', category: 'Architecture' },
  { id: 2, title: 'Modern Design', category: 'Design' },
  { id: 3, title: 'Urban Landscape', category: 'Nature' },
  { id: 4, title: 'Digital Art', category: 'Art' },
  { id: 5, title: 'Creative Space', category: 'Architecture' },
  { id: 6, title: 'Minimalist View', category: 'Design' },
  { id: 7, title: 'Tidal Study', category: 'Nature' },
  { id: 8, title: 'Signal Bloom', category: 'Art' },
  { id: 9, title: 'Quiet Courtyard', category: 'Architecture' },
]

export const galleryCategories = ['All', ...new Set(galleryImages.map((img) => img.category))]

/* 生成的作品，替代上游的 Unsplash 照片。 */
const TONES: Record<string, readonly (readonly [string, string, string, string])[]> = {
  dusk: [
    ['#1e1b4b', '#7c3aed', '#f472b6', '#fde68a'],
    ['#311a3f', '#c2410c', '#fb923c', '#fef3c7'],
    ['#172554', '#6d28d9', '#f9a8d4', '#fff7ed'],
    ['#3b0764', '#db2777', '#fdba74', '#fefce8'],
  ],
  ocean: [
    ['#082f49', '#0369a1', '#38bdf8', '#e0f2fe'],
    ['#042f2e', '#0f766e', '#5eead4', '#f0fdfa'],
    ['#0c1a3a', '#1d4ed8', '#7dd3fc', '#ecfeff'],
    ['#05252e', '#0e7490', '#a5f3fc', '#f8fafc'],
  ],
  mono: [
    ['#0a0a0a', '#404040', '#a3a3a3', '#fafafa'],
    ['#171717', '#525252', '#d4d4d4', '#ffffff'],
    ['#1c1917', '#57534e', '#a8a29e', '#f5f5f4'],
    ['#111111', '#333333', '#bdbdbd', '#f0f0f0'],
  ],
}

function rand(seed: number) {
  const x = Math.sin(seed * 91.17 + 7.31) * 43758.5453
  return x - Math.floor(x)
}

function Artwork({ id, artStyle, tone, uid }: { id: number; artStyle: string; tone: string; uid: string }) {
  const set = TONES[tone] ?? TONES.dusk!
  const [deep, mid, light, pale] = set[id % set.length]!
  const g = `${uid}-art-${id}`
  const r = (k: number) => rand(id * 13 + k)
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${g}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={deep} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <radialGradient id={`${g}-glow`} cx={0.3 + r(1) * 0.4} cy={0.25 + r(2) * 0.3} r="0.6">
          <stop offset="0" stopColor={light} stopOpacity="0.85" />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${g}-bg)`} />
      <rect width="400" height="400" fill={`url(#${g}-glow)`} />
      {artStyle === 'waves' &&
        Array.from({ length: 6 }, (_, i) => {
          const y = 150 + i * 42
          const a = 18 + r(i + 3) * 28
          const f = 1 + Math.floor(r(i + 9) * 3)
          let d = `M0 ${y}`
          for (let x = 0; x <= 400; x += 20) d += ` L${x} ${(y + Math.sin((x / 400) * Math.PI * f + i + id) * a).toFixed(1)}`
          d += ' L400 400 L0 400 Z'
          return <path key={i} d={d} fill={i % 2 ? light : deep} opacity={0.18 + i * 0.1} />
        })}
      {artStyle === 'orbits' && (
        <g fill="none" stroke={pale} strokeWidth="1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx={200}
              cy={200}
              rx={40 + i * 26}
              ry={(40 + i * 26) * (0.4 + r(4) * 0.4)}
              transform={`rotate(${(r(5) * 180 + i * 9).toFixed(1)} 200 200)`}
              opacity={0.75 - i * 0.08}
            />
          ))}
          <circle cx={200} cy={200} r={22 + r(6) * 18} fill={pale} stroke="none" />
          {Array.from({ length: 5 }, (_, i) => {
            const t = r(i + 20) * Math.PI * 2
            const d = 70 + i * 30
            return <circle key={`p${i}`} cx={200 + Math.cos(t) * d} cy={200 + Math.sin(t) * d * 0.6} r={4 + r(i + 30) * 6} fill={light} stroke="none" />
          })}
        </g>
      )}
      {artStyle !== 'waves' && artStyle !== 'orbits' && (
        <g>
          <rect x={40 + r(7) * 60} y={60 + r(8) * 60} width={160 + r(9) * 80} height={220} fill={deep} opacity="0.55" />
          <circle cx={240 + r(10) * 60} cy={140 + r(11) * 60} r={70 + r(12) * 40} fill={light} opacity="0.8" />
          <path d={`M0 400 L${120 + r(13) * 120} ${220 + r(14) * 60} L400 400 Z`} fill={pale} opacity="0.85" />
          <rect x={250} y={260} width={110} height={10} fill={pale} opacity="0.7" />
          <rect x={250} y={280} width={70} height={10} fill={pale} opacity="0.45" />
        </g>
      )}
    </svg>
  )
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#0b0b0f'
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

const Icon = {
  grid: (
    <svg viewBox="0 0 24 24" className="mr-1 h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 24 24" className="mb-2 h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  left: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  right: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
}

const badge = 'inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground'
const iconButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gfl-accent)]'

export function GalleryGridBlock({ className, style, filter: filterProp, selectedId, onFilterChange, onSelect, ...props }: GalleryGridBlockProps) {
  const o = { ...defaults, ...props }
  const uid = useId().replace(/:/g, '')
  const reduced = useReducedMotion() ?? false
  const [selectedState, setSelectedState] = useState<number | null>(null)
  const [filterState, setFilterState] = useState<string>('All')
  const selectedImage = selectedId !== undefined ? selectedId : selectedState
  const filter = filterProp ?? filterState
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const userOpened = useRef(false)
  // 只有最初点开的那一格用共享 layoutId 从原位放大；翻页后的图直接淡入。
  const openedFrom = useRef<number | null>(null)

  const setSelectedImage = (id: number | null, byUser = true) => {
    if (byUser && id !== null && selectedImage === null) {
      userOpened.current = true
      returnFocus.current = document.activeElement as HTMLElement | null
    }
    setSelectedState(id)
    onSelect?.(id)
  }
  const setFilter = (category: string) => {
    setFilterState(category)
    onFilterChange?.(category)
  }

  const filteredImages = filter === 'All' ? galleryImages : galleryImages.filter((img) => img.category === filter)

  const step = (dir: 1 | -1) => {
    if (selectedImage === null) return
    const currentIndex = galleryImages.findIndex((img) => img.id === selectedImage)
    const nextIndex = (currentIndex + dir + galleryImages.length) % galleryImages.length
    setSelectedImage(galleryImages[nextIndex]!.id)
  }

  const selectedImageData = galleryImages.find((img) => img.id === selectedImage)
  const open = selectedImage !== null && selectedImageData !== undefined
  if (!open) openedFrom.current = null
  else if (openedFrom.current === null) openedFrom.current = selectedImage

  // 键盘：方向键切换、Esc 关闭；只有用户打开时才移动焦点，自动播放不抢焦点。
  const stepRef = useRef(step)
  stepRef.current = step
  const closeFn = useRef(() => setSelectedImage(null))
  closeFn.current = () => setSelectedImage(null)
  useEffect(() => {
    if (!open) return
    if (userOpened.current) closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeFn.current()
      else if (e.key === 'ArrowRight') stepRef.current(1)
      else if (e.key === 'ArrowLeft') stepRef.current(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => {
    if (open || !userOpened.current) return
    userOpened.current = false
    returnFocus.current?.focus({ preventScroll: true })
  }, [open])

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, imageId: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedImage(imageId)
    }
  }

  const ink = inkFor(o.accent)
  const enter = (t: object) => (reduced ? { duration: 0 } : t)
  const layoutId = (id: number) => (reduced ? undefined : `${uid}-tile-${id}`)

  return (
    <section
      className={cn('w-full bg-background px-4 py-16 text-foreground', className)}
      aria-labelledby={`${uid}-heading`}
      style={{ '--gfl-accent': o.accent, '--gfl-ink': ink, '--gfl-radius': `${o.radius}px`, '--gfl-cols': o.columns, ...style } as CSSProperties}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enter({ duration: 0.6 })}
          className="mb-12 text-center"
        >
          <span className={cn(badge, 'mb-4')}>
            {Icon.grid}
            Gallery
          </span>
          <h2 id={`${uid}-heading`} className="mb-4 text-4xl font-bold tracking-tight">
            Our Portfolio
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">Explore our collection of stunning visuals and creative work</p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enter({ delay: 0.2 })}
          className={cn('mb-8 flex flex-wrap justify-center', o.filterStyle === 'underline' ? 'gap-x-5 gap-y-2 border-b border-border' : 'gap-2')}
          role="group"
          aria-label="Gallery categories"
        >
          {galleryCategories.map((category) => {
            const active = filter === category
            return o.filterStyle === 'underline' ? (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={cn(
                  'relative px-1 pb-3 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gfl-accent)] rounded-sm',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {category}
                {active && (
                  <motion.span
                    layoutId={reduced ? undefined : `${uid}-underline`}
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--gfl-accent)]"
                    transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
                  />
                )}
              </button>
            ) : (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gfl-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active
                    ? 'border-transparent bg-[var(--gfl-accent)] text-[var(--gfl-ink)]'
                    : 'border-border bg-background text-foreground hover:bg-secondary',
                )}
              >
                {category}
              </button>
            )
          })}
        </motion.div>

        <LayoutGroup id={uid}>
          {/* Gallery Grid */}
          <motion.div
            layout={!reduced}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(var(--gfl-cols),minmax(0,1fr))]"
            style={{ gap: o.gap }}
            role="list"
            aria-label="Gallery items"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.8 }}
                  transition={enter({ duration: 0.3, delay: index * 0.05 })}
                  role="listitem"
                >
                  <div
                    className="group relative cursor-pointer overflow-hidden rounded-[var(--gfl-radius)] border border-border bg-card shadow-sm transition-[border-color,box-shadow] hover:border-[var(--gfl-accent)] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gfl-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setSelectedImage(image.id)}
                    onKeyDown={(event) => handleCardKeyDown(event, image.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${image.title}`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <motion.div layoutId={layoutId(image.id)} className="h-full w-full">
                        <div className="h-full w-full transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                          <Artwork id={image.id} artStyle={o.artStyle} tone={o.tone} uid={uid} />
                        </div>
                      </motion.div>

                      {/* Overlay */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        {Icon.zoom}
                        <h3 className="mb-1 px-4 text-center text-lg font-semibold">{image.title}</h3>
                        <span className={badge}>{image.category}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Lightbox */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={enter({ duration: 0.25 })}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                onClick={() => setSelectedImage(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${uid}-dialog-title`}
                aria-describedby={`${uid}-dialog-description`}
              >
                <div onClick={(e) => e.stopPropagation()} className="relative flex max-h-[90vh] max-w-5xl flex-col items-center">
                  <div className="relative">
                    <motion.div
                      key={selectedImageData.id}
                      layoutId={selectedImageData.id === openedFrom.current ? layoutId(selectedImageData.id) : undefined}
                      initial={selectedImageData.id === openedFrom.current ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className="aspect-square w-[min(84vw,68vh,36rem)] overflow-hidden rounded-[var(--gfl-radius)]"
                    >
                      <Artwork id={selectedImageData.id} artStyle={o.artStyle} tone={o.tone} uid={`${uid}-lb`} />
                    </motion.div>

                    {/* Close Button */}
                    <button
                      ref={closeRef}
                      type="button"
                      className={cn(iconButton, 'absolute right-2 top-2 sm:-right-14 sm:top-0')}
                      onClick={() => setSelectedImage(null)}
                      aria-label="Close gallery dialog"
                    >
                      {Icon.x}
                    </button>

                    {/* Navigation Buttons */}
                    <button
                      type="button"
                      className={cn(iconButton, 'absolute left-3 top-1/2 -translate-y-1/2')}
                      onClick={() => step(-1)}
                      aria-label="View previous image"
                    >
                      {Icon.left}
                    </button>
                    <button
                      type="button"
                      className={cn(iconButton, 'absolute right-3 top-1/2 -translate-y-1/2')}
                      onClick={() => step(1)}
                      aria-label="View next image"
                    >
                      {Icon.right}
                    </button>
                  </div>

                  {/* Image Info */}
                  <motion.div
                    key={`info-${selectedImage}`}
                    initial={reduced ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={enter({ delay: 0.1 })}
                    className="mt-4 text-center text-white"
                    id={`${uid}-dialog-description`}
                  >
                    <h3 className="mb-2 text-xl font-semibold" id={`${uid}-dialog-title`}>
                      {selectedImageData.title}
                    </h3>
                    <span className={badge}>{selectedImageData.category}</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}
