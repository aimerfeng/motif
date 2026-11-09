// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Emil Gulamov
// Source: https://github.com/mearashadowfax/ScrewFast/blob/aa9da9a/src/components/sections/insights/InsightDetail.astro
// Modified by Motif; see the item's provenance.
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@motif/runtime'
import { INSIGHTS } from './content'
import { Art, BrandMark, focusRing, Heading, Icon } from './parts'

const EASE = 'ease-[cubic-bezier(0.165,0.84,0.44,1)]'
const PROGRESS = 'bg-linear-to-r from-[color-mix(in_srgb,var(--brand)_30%,transparent)] to-(--brand)'

/**
 * 洞察的阅读视图：上游是一个独立页面（GSAP 钉住目录、滚动进度条、按标题高亮目录），
 * 这里是一个铺满视口的对话框，自己滚动；进度和目录高亮都跟随对话框的滚动。
 */
export function InsightDetail({ index, name, style, onClose, onNavigate }: { index: number; name: string; style: CSSProperties; onClose: () => void; onNavigate: (index: number) => void }) {
  const insight = INSIGHTS[index] ?? INSIGHTS[0]!
  const next = (index + 1) % INSIGHTS.length
  const reduce = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const baseId = useId()
  const titleId = `${baseId}-title`
  const ids = insight.sections.map((_, i) => `${baseId}-section-${i}`)
  const [active, setActive] = useState<string | null>(null)

  // 上游：progress = (scrollTop - articleTop) / (articleHeight - innerHeight)。
  const { scrollY, scrollYProgress } = useScroll({ container: scrollRef, target: articleRef, offset: ['start start', 'end end'] })

  // 上游的 ScrollTrigger：标题越过视口 20% 处时高亮它，往回滚时退回上一个。
  const updateActive = () => {
    const container = scrollRef.current
    if (!container) return
    const line = container.getBoundingClientRect().top + container.clientHeight * 0.2
    let current: string | null = null
    for (const id of ids) {
      const heading = document.getElementById(id)
      if (heading && heading.getBoundingClientRect().top <= line) current = id
    }
    setActive(current)
  }
  useMotionValueEvent(scrollY, 'change', updateActive)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setActive(null)
  }, [index])

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  const jump = (i: number) => {
    const container = scrollRef.current
    const heading = document.getElementById(ids[i] ?? '')
    if (!container || !heading) return
    const top = heading.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 88
    container.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const nodes = scrollRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    if (!nodes || nodes.length === 0) return
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      ref={scrollRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain antialiased"
      style={style}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: [0.165, 0.84, 0.44, 1] }}
    >
      <motion.div aria-hidden="true" className={cn('fixed top-0 left-0 z-20 h-2 w-full origin-left md:hidden', PROGRESS)} style={{ scaleX: scrollYProgress }} />
      <div className="sticky top-0 z-10 border-b border-(--line) bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-4 px-4 md:px-8">
          <BrandMark name={name} className="min-w-0 overflow-hidden" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={cn('inline-flex shrink-0 items-center gap-2 rounded-(--r) border border-(--line) bg-(--surface) px-3 py-2 text-sm font-medium text-(--soft) transition-colors duration-300 hover:text-(--ink)', focusRing)}
          >
            <Icon name="arrowLeft" className="size-4" />
            All insights
          </button>
        </div>
      </div>

      <section className="py-6 pb-24 sm:py-8 sm:pb-28 lg:py-12 lg:pb-32">
        <div className="mx-auto max-w-[80rem] px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <div>
              <div className="h-64 overflow-hidden rounded-(--r) border border-(--line) shadow-lg md:aspect-[4/3] md:h-auto">
                <Art kind={insight.art} label={`Cover illustration for ${insight.title}`} />
              </div>
              <div className="mt-10 hidden space-y-4 md:sticky md:top-[20%] md:block">
                <div className="h-px w-full overflow-hidden bg-(--line)">
                  <motion.div className={cn('h-px w-full origin-left', PROGRESS)} style={{ scaleX: scrollYProgress }} />
                </div>
                <p className="text-sm text-pretty text-(--mut)">Table of contents</p>
                <nav aria-label="Table of contents">
                  <ul className="space-y-2 text-base text-pretty text-(--body)">
                    {insight.sections.map((section, i) => {
                      const selected = active === ids[i]
                      return (
                        <li key={section.heading} className={cn('flex items-center transition-opacity duration-300', EASE, selected ? 'opacity-100' : 'opacity-80')}>
                          <svg
                            className={cn('flex-none transition-[width,height,margin] duration-[400ms]', EASE, selected ? 'mr-[0.3rem] h-5 w-5' : 'h-0 w-0')}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="var(--brand-ink)"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          <a
                            href={`#${ids[i]}`}
                            aria-current={selected ? 'location' : undefined}
                            onClick={(event) => {
                              event.preventDefault()
                              jump(i)
                            }}
                            className={cn('rounded-sm transition-colors duration-300 hover:text-(--ink)', selected && 'text-(--ink)', focusRing)}
                          >
                            {section.heading}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="md:pt-8">
              <p className="mb-3 text-center text-sm text-(--mut) md:text-left">
                {insight.practice} · {insight.date} · {insight.minutes} min read
              </p>
              <Heading as="h1" id={titleId} className="mb-4 text-center text-2xl sm:text-3xl md:mb-6 md:text-left">
                {insight.title}
              </Heading>
              <p className="text-center text-sm font-medium text-(--soft) md:text-left">By {insight.author}</p>
              <article ref={articleRef} className="text-lg text-pretty text-(--body)">
                <p className="mt-6 font-medium text-(--ink)">{insight.description}</p>
                {insight.sections.map((section, i) => (
                  <Fragment key={section.heading}>
                    <h2 id={ids[i]} className="mt-10 scroll-mt-12 font-(family-name:--font-head) text-2xl leading-8 [font-weight:var(--head-weight)] text-(--ink)">
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)} className="mt-6">
                        {paragraph}
                      </p>
                    ))}
                  </Fragment>
                ))}
              </article>
              <div className="mt-12 border-t border-(--line) pt-6">
                <p className="text-sm text-(--mut)">Next insight</p>
                <button type="button" onClick={() => onNavigate(next)} className={cn('group mt-2 inline-flex items-center gap-x-2 rounded-(--r) text-left font-(family-name:--font-head) text-xl [font-weight:var(--head-weight)] text-(--ink) transition-colors duration-300 hover:text-(--brand-ink)', focusRing)}>
                  {INSIGHTS[next]!.title}
                  <Icon name="arrowRight" className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>,
    document.body,
  )
}
