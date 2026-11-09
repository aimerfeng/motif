import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DialogOnboardingCarousel, defaults, type DialogOnboardingCarouselProps } from './dialog-onboarding-carousel'

/** 9 秒一轮：0.6s 打开 -> 逐步点「下一步」 -> 最后一步停留 -> 关闭。 */
function scripted(time: number, steps: number) {
  const t = time % 9
  if (t < 0.6 || t > 8.4) return { open: false, step: 1 }
  const per = 7.4 / steps
  return { open: true, step: Math.min(steps, 1 + Math.floor((t - 0.6) / per)) }
}

export function Demo(props: DialogOnboardingCarouselProps) {
  const host = useRef<HTMLDivElement>(null)
  const steps = props.steps ?? defaults.steps
  const [auto, setAuto] = useState({ open: false, step: 1 })
  const [manual, setManual] = useState<{ open: boolean; step: number } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, steps)
      setAuto((prev) => (prev.open === next.open && prev.step === next.step ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  const state = manual ?? auto

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background">
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Lumen · Workspace</div>
        <h1 className="text-lg font-semibold tracking-tight">You’re all set up</h1>
        <p className="max-w-sm text-sm text-muted-foreground">Take a 30-second tour of what’s inside before you start your first project.</p>
        <button
          type="button"
          onClick={() => setManual({ open: true, step: 1 })}
          className="mt-2 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs transition-[background-color,color] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Onboarding
        </button>
      </div>
      <DialogOnboardingCarousel
        {...props}
        contained
        open={state.open}
        step={state.step}
        onStepChange={(step) => setManual({ open: true, step })}
        onOpenChange={(open) => setManual({ open, step: 1 })}
      />
    </div>
  )
}
