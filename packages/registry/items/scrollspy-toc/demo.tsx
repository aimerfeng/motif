// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/scrollspy/c-scrollspy-1.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef } from 'react'
import { ScrollspyToc, type ScrollspyTocProps } from './scrollspy-toc'

const SECTIONS = [
  { id: 'spy-install', label: 'Install', body: 'Add the CLI to your project and run init. It writes a config file and a sample route you can delete later.' },
  { id: 'spy-config', label: 'Configure', body: 'Point the config at your content folder. Every Markdown file becomes a page; front matter sets title and order.' },
  { id: 'spy-routing', label: 'Routing', body: 'Folders map to URL segments. Use an index file for the folder root and brackets for dynamic segments.' },
  { id: 'spy-deploy', label: 'Deploy', body: 'Build once, upload the output folder to any static host. Previews get their own URL per branch.' },
  { id: 'spy-faq', label: 'FAQ', body: 'Search is built at deploy time, so it works offline. Old URLs keep working through the redirects file.' },
]

const HOLD = 1.6
const MOVE = 0.8
const STEP = HOLD + MOVE

export function Demo(props: Partial<ScrollspyTocProps>) {
  const host = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement | null>(null)
  const manual = useRef(false)

  // 自动播放：每节停一下再缓动滚到下一节，最后回到顶部；用户一动就停止。
  useFrameLoop(
    host,
    ({ time }) => {
      const el = parentRef.current
      if (manual.current || !el) return
      const tops = SECTIONS.map((s) => (document.getElementById(s.id)?.offsetTop ?? 0) - 50)
      tops.push(0)
      const n = SECTIONS.length
      const t = time % (STEP * n)
      const i = Math.floor(t / STEP)
      const local = t - i * STEP
      const k = local < HOLD ? 0 : (local - HOLD) / MOVE
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
      const max = el.scrollHeight - el.clientHeight
      const from = Math.min(Math.max(tops[i], 0), max)
      const to = Math.min(Math.max(tops[i + 1], 0), max)
      el.scrollTop = from + (to - from) * e
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const stop = () => {
    manual.current = true
  }

  return (
    <div ref={host} onPointerDown={stop} onWheel={stop} onKeyDown={stop} onTouchStart={stop} className="flex h-full w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex h-full max-h-[500px] w-full max-w-[720px] gap-5">
        <div className="flex flex-col gap-2">
          <ScrollspyToc {...props} items={SECTIONS} targetRef={parentRef} className="w-[120px] sm:w-[150px]" />
        </div>
        <div ref={parentRef} className="relative min-w-0 grow overflow-y-auto pe-2">
          <div className="space-y-8 pb-24">
            {SECTIONS.map((item) => (
              <div key={item.id} id={item.id} className="space-y-2.5">
                <h3 className="text-base text-foreground">{item.label}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                <div className="h-[260px] rounded-2xl bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
