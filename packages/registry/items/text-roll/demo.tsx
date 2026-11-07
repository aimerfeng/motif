import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { defaults, TextRoll, type TextRollProps } from './text-roll'

const DISPLAY = "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif"
const MORE_LINKS = ['Studio', 'Journal', 'Contact']

// 自动播放：一个虚拟指针每 1.6 秒滑到下一项，停 1.1 秒后离开；开头空 0.4 秒，第一项也能看到滚入。
const LEAD = 0.4
const SLOT = 1.6
const HOLD = 1.1

export function Demo(props: TextRollProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(-1)
  // 用户一动指针或用键盘聚焦，就停掉自动播放，改由真实的悬停 / 聚焦控制。
  const [manual, setManual] = useState(false)
  const [pointed, setPointed] = useState<number | null>(null)
  const links = [props.text ?? defaults.text, ...MORE_LINKS]
  const current = manual ? pointed : auto

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const t = time - LEAD
      const slot = Math.floor(t / SLOT)
      const next = t >= 0 && t - slot * SLOT < HOLD ? slot % links.length : -1
      setAuto((value) => (value === next ? value : next))
    },
    { reducedMotion: 'static', staticTime: LEAD + 0.6 },
  )

  const take = (index: number | null) => {
    setManual(true)
    setPointed(index)
  }

  return (
    <div
      ref={hostRef}
      onPointerMove={() => setManual(true)}
      className="flex h-full w-full flex-col bg-background px-10 py-8"
      style={{ fontFamily: DISPLAY }}
    >
      <header className="flex items-center justify-between text-sm">
        <span className="font-semibold tracking-tight text-foreground">Halden</span>
        <span className="text-muted-foreground">Close</span>
      </header>
      <div className="flex flex-1 items-end justify-between gap-10">
        <nav aria-label="Main">
          <ul className="space-y-1">
            {links.map((label, index) => (
              <li key={`${index}-${label}`}>
                <a
                  href={`#${index}`}
                  onClick={(event) => event.preventDefault()}
                  onPointerEnter={() => take(index)}
                  onPointerLeave={() => take(null)}
                  onFocus={() => take(index)}
                  onBlur={() => take(null)}
                  className="inline-block rounded-md text-6xl leading-[1.04] font-semibold tracking-[-0.04em] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-8xl"
                >
                  <TextRoll {...props} text={label} active={current === index} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden pb-2 text-sm leading-relaxed text-muted-foreground sm:block">
          <p>Kongens gate 12, Oslo</p>
          <p>hello@halden.studio</p>
        </div>
      </div>
    </div>
  )
}
