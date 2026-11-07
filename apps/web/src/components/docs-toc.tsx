'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * 文档目录：随滚动高亮当前所在的章节。
 * 指示线和市场的分类目录一样（docs/decisions/0010）：一根线在章节之间滑动，只动 transform。
 */
export function DocsToc({ sections, label }: { sections: { id: string; title: string }[]; label: string }) {
  const [current, setCurrent] = useState(sections[0]?.id)
  const list = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ y: number; h: number } | null>(null)

  useEffect(() => {
    const headings = sections.map((section) => document.getElementById(section.id)).filter((element) => element !== null)
    // 章节顶部进入视口上方三分之一时算「当前」。
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -66% 0px' },
    )
    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [sections])

  // 字体加载、窗口变化会改变行高：用 ResizeObserver 跟着量。
  useLayoutEffect(() => {
    const element = list.current
    if (!element) return
    const measure = () => {
      const link = element.querySelector<HTMLElement>('[aria-current="location"]')
      setIndicator(link ? { y: link.offsetTop, h: link.offsetHeight } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [current])

  return (
    <nav aria-label={label} className="hidden lg:block">
      {/* 吸顶的容器是定位元素：链接的 offsetTop 和指示线都以它为准。 */}
      <div ref={list} className="sticky top-24">
        <span
          aria-hidden
          className="absolute top-0 -left-px h-px w-[2px] origin-top rounded-full bg-ink transition-[transform,opacity] duration-(--duration-base) ease-(--ease-in-out-soft) motion-reduce:transition-none"
          style={{ transform: `translateY(${indicator?.y ?? 0}px) scaleY(${indicator?.h ?? 0})`, opacity: indicator ? 1 : 0 }}
        />
        <ol className="space-y-1 border-l border-line text-[13.5px]">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current === section.id ? 'location' : undefined}
                className="block py-1 pl-4 text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=location]:text-ink"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
