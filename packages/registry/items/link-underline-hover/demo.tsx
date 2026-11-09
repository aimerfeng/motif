import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { LinkUnderlineHover, type LinkUnderlineHoverProps } from './link-underline-hover'

const NAV = ['Work', 'Studio', 'Journal', 'Contact']

export function Demo(props: LinkUnderlineHoverProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<number | null>(0)
  const [manual, setManual] = useState(false)

  // 自动播放：每 1.5 秒把虚拟悬停移到下一个导航项，中间留一小段空档让离场动画可见。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const slot = time % 1.5
      const next = slot < 1.1 ? Math.floor(time / 1.5) % NAV.length : null
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.6 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6" onPointerEnter={() => setManual(true)}>
      <div className="w-full max-w-md">
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-7 gap-y-3 text-lg text-foreground">
          {NAV.map((item, i) => (
            <LinkUnderlineHover key={item} {...props} href={`#${item.toLowerCase()}`} active={!manual && auto === i}>
              {item}
            </LinkUnderlineHover>
          ))}
        </nav>
        <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
          Halden &amp; Pike is a two-person studio drawing wayfinding systems for libraries and transit. Read the{' '}
          <LinkUnderlineHover {...props} href="#case" className="text-foreground">
            Northgate case study
          </LinkUnderlineHover>{' '}
          or see what we are sketching this month.
        </p>
      </div>
    </div>
  )
}
