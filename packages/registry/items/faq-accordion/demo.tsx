import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { FaqAccordion, type FaqAccordionProps } from './faq-accordion'

export function Demo(props: FaqAccordionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number[]>(props.firstOpen === false ? [] : [0])
  const manual = useRef(false)

  // 演示里的自动播放：每隔一会儿换一个问题展开；用户自己点过之后就不再干预。
  useFrameLoop(
    ref,
    ({ time }) => {
      if (manual.current || time < 1.6) return
      const i = Math.floor((time - 1.6) / 2.2 + 1) % 5
      setOpen((prev) => (prev.length === 1 && prev[0] === i ? prev : [i]))
    },
    { reducedMotion: 'static' },
  )

  return (
    <div ref={ref} className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <FaqAccordion
        {...props}
        open={open}
        onOpenChange={(next) => {
          manual.current = true
          setOpen(next)
        }}
      />
    </div>
  )
}
