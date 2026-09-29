import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  type MorphingDialogProps,
} from './morphing-dialog'

// 空闲时每 8 秒自动开合一次：1.2 秒展开，5.4 秒收起，与循环视频等长。
// 用户点击之后让出控制权，关掉对话框 4 秒后才恢复自动播放。
const CYCLE = 8
const OPEN_AT = 1.2
const CLOSE_AT = 5.4
const RESUME_AFTER = 4

const COVER =
  'radial-gradient(circle at 25% 20%, #fda4af 0, transparent 50%), radial-gradient(circle at 80% 85%, #818cf8 0, transparent 55%), linear-gradient(135deg, #7c3aed, #1e1b4b)'

export function Demo(props: Omit<MorphingDialogProps, 'children' | 'open' | 'onOpenChange'>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const clock = useRef({ now: 0, pausedUntil: 0, userOpen: false })

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const state = clock.current
      state.now = time
      if (state.userOpen || time < state.pausedUntil) return
      const phase = time % CYCLE
      const next = phase >= OPEN_AT && phase < CLOSE_AT
      setOpen((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const handleOpenChange = (next: boolean) => {
    const state = clock.current
    state.userOpen = next
    state.pausedUntil = state.now + RESUME_AFTER
    setOpen(next)
  }

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-8">
      <MorphingDialog {...props} open={open} onOpenChange={handleOpenChange}>
        <MorphingDialogTrigger className="flex w-80 items-center gap-4 border bg-card p-3 pr-5 text-left shadow-xl shadow-black/30">
          <MorphingDialogImage className="size-16 shrink-0 rounded-xl" style={{ background: COVER }} />
          <div className="min-w-0">
            <MorphingDialogTitle className="text-lg font-semibold tracking-tight text-card-foreground">Northwind rebrand</MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-sm text-muted-foreground">Case study · 6 min read</MorphingDialogSubtitle>
          </div>
        </MorphingDialogTrigger>

        <MorphingDialogContainer>
          <MorphingDialogContent className="relative w-full max-w-md border bg-card shadow-2xl shadow-black/60">
            <MorphingDialogImage className="h-48 w-full" style={{ background: COVER }} />
            <div className="p-6">
              <MorphingDialogTitle className="text-lg font-semibold tracking-tight text-card-foreground">Northwind rebrand</MorphingDialogTitle>
              <MorphingDialogSubtitle className="text-sm text-muted-foreground">Case study · 6 min read</MorphingDialogSubtitle>
              <MorphingDialogDescription className="mt-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Northwind wanted an identity that felt calm at small sizes and confident on a billboard. We reduced the palette to three inks, redrew the wordmark
                  around a single stroke weight, and rebuilt the design system on top of it.
                </p>
                <button type="button" className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Read the case study
                </button>
              </MorphingDialogDescription>
            </div>
            <MorphingDialogClose className="bg-black/40 text-white backdrop-blur-sm" />
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </div>
  )
}
