import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PLANS, PricingPlanPicker, type BillingCycle, type PricingPlanPickerProps } from './pricing-plan-picker'

type Script = { cycle: BillingCycle; plan: string; seats: number }

/** One 10 s round: flip to yearly, add seats, switch plans, then back to the start. */
function scripted(time: number, planCount: number): Script {
  const t = time % 10
  const cycle: BillingCycle = t >= 1.5 && t < 7 ? 'yearly' : 'monthly'
  const seats = t < 3 ? 3 : t < 3.5 ? 4 : t < 4 ? 5 : t < 8.5 ? 6 : 3
  const ids = PLANS.slice(0, planCount).map((p) => p.id)
  const plan = t >= 5 && t < 9 ? ids[ids.length - 1] : ids[Math.min(1, ids.length - 1)]
  return { cycle, plan, seats }
}

export function Demo(props: PricingPlanPickerProps) {
  const host = useRef<HTMLDivElement>(null)
  const planCount = Math.max(2, Math.min(3, Math.round(props.plans ?? 3)))
  const [auto, setAuto] = useState<Script>(() => scripted(0, planCount))
  const [manual, setManual] = useState<Script | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, planCount)
      setAuto((prev) => (prev.cycle === next.cycle && prev.plan === next.plan && prev.seats === next.seats ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const state = manual ?? auto
  const take = (patch: Partial<Script>) => setManual({ ...state, ...patch })

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <section className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-14 sm:px-6">
        <div className="max-w-md text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step 2 of 3 · Choose a plan</p>
          <p className="mt-2 text-sm text-muted-foreground">Switch or cancel any time. Seats are billed per user.</p>
        </div>
        <PricingPlanPicker
          {...props}
          billingCycle={state.cycle}
          selectedPlan={state.plan}
          userCount={state.seats}
          onBillingCycleChange={(cycle) => take({ cycle })}
          onSelectedPlanChange={(plan) => take({ plan })}
          onUserCountChange={(seats) => take({ seats })}
        />
      </section>
    </div>
  )
}
