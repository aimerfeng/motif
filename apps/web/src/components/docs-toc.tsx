'use client'

import { useEffect, useState } from 'react'

/** 文档目录：随滚动高亮当前所在的章节。 */
export function DocsToc({ sections, label }: { sections: { id: string; title: string }[]; label: string }) {
  const [current, setCurrent] = useState(sections[0]?.id)

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

  return (
    <nav aria-label={label} className="hidden lg:block">
      <ol className="sticky top-24 space-y-1 border-l border-line text-[13.5px]">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={current === section.id ? 'location' : undefined}
              className="-ml-px block border-l border-transparent py-1 pl-4 text-ink-muted transition-colors duration-150 hover:text-ink aria-[current=location]:border-ink aria-[current=location]:text-ink"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
