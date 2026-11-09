import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { WhatsNewPopover, type WhatsNewPopoverProps } from './whats-new-popover'

type Auto = { open: boolean; page: number }

const STEPS = [0, 1, 2, 3, 0]

/** 10 秒一轮：0.6s 打开 -> 每 1.6s 翻一页 -> 翻回第一页 -> 8.8s 关闭。 */
function scripted(time: number): Auto {
  const t = time % 10
  if (t < 0.6 || t >= 8.8) return { open: false, page: 0 }
  return { open: true, page: STEPS[Math.min(STEPS.length - 1, Math.floor((t - 0.6) / 1.6))] }
}

export function Demo(props: WhatsNewPopoverProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Auto>({ open: false, page: 0 })
  // 指针一进来就交给用户，自动播放不再回来。
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((cur) => (cur.open === next.open && cur.page === next.page ? cur : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const control = manual ? {} : { open: auto.open, page: auto.page }

  return (
    <div
      ref={host}
      className="flex h-full w-full items-start justify-center bg-background px-4 pt-[16%]"
      onPointerDown={() => setManual(true)}
      onPointerMove={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      <header className="flex w-full max-w-[400px] items-center justify-between rounded-xl border bg-card py-2.5 pr-5 pl-3.5 text-card-foreground">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <rect x="2" y="2" width="16" height="16" rx="5" fill="currentColor" opacity="0.9" />
            <path d="M6 13V7l4 4 4-4v6" fill="none" stroke="var(--color-card)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold">Mosaic</span>
        </div>
        <WhatsNewPopover key={manual ? 'manual' : 'auto'} {...props} {...control} changelogHref="#changelog" />
      </header>
    </div>
  )
}
