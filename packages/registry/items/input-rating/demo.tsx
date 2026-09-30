import { useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { InputRating, type InputRatingProps } from './input-rating'

const WORDS = ['', 'Not for us', 'Fine, with caveats', 'Pretty good', 'Loved it', 'Exceptional']

/** 一轮 9 秒：指针从左扫到右预览 -> 点击 4 -> 停留 -> 清空。 */
function scripted(time: number, count: number) {
  const t = time % 9
  const target = Math.min(count, Math.max(1, Math.round(count * 0.8)))
  if (t < 1.0) return { hover: null, value: 0 }
  if (t < 3.6) return { hover: Math.min(target, 1 + Math.floor((t - 1.0) / 0.55)), value: 0 }
  if (t < 4.6) return { hover: target, value: 0 }
  if (t < 8.2) return { hover: null, value: target }
  return { hover: null, value: 0 }
}

export function Demo(props: InputRatingProps) {
  const host = useRef<HTMLDivElement>(null)
  const count = props.count ?? 5
  const [auto, setAuto] = useState<{ hover: number | null; value: number }>({ hover: null, value: 0 })
  const [manual, setManual] = useState<number | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time, count)
      setAuto((prev) => (prev.hover === next.hover && prev.value === next.value ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.3 },
  )

  const value = manual ?? auto.value
  const shown = manual === null ? (auto.hover ?? auto.value) : value
  const word = WORDS[Math.max(0, Math.min(5, Math.round((shown / count) * 5)))]

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(55%_55%_at_50%_100%,oklch(0.36_0.1_75/0.32),transparent)] bg-background p-6">
      <div className="w-full max-w-[420px] rounded-2xl border bg-card/70 p-6 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-indigo-600 text-sm font-bold text-white">HG</div>
        <h2 className="text-base font-semibold">How was your stay at Harbor &amp; Grain?</h2>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Two nights, Lisbon · checked out yesterday</p>
        <div className="flex justify-center">
          <InputRating
            {...props}
            label="Your rating"
            value={value}
            hoverValue={manual === null ? auto.hover : undefined}
            onValueChange={setManual}
          />
        </div>
        <div className="relative mt-3 h-5 text-sm font-medium">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={word} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }} className="absolute inset-x-0" style={{ color: shown > 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
              {word || 'Tap a star to rate'}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-5 h-16 rounded-lg border bg-background/50 px-3 py-2.5 text-left text-xs text-muted-foreground">Tell us more (optional)</div>
        <button type="button" className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity duration-200" style={{ opacity: value > 0 ? 1 : 0.45 }}>
          Send feedback
        </button>
      </div>
    </div>
  )
}
