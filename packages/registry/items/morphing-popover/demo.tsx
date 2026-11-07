import { cn, useFrameLoop } from '@motif/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  MorphingPopover,
  MorphingPopoverBody,
  MorphingPopoverClose,
  MorphingPopoverContent,
  MorphingPopoverLabel,
  MorphingPopoverTrigger,
  type MorphingPopoverProps,
} from './morphing-popover'

const face = (mouth: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9 10h.01M15 10h.01" strokeWidth="2.4" />
    {mouth}
  </svg>
)

const RATINGS = [
  { id: 'no', label: 'Not helpful', icon: face(<path d="M8.8 15.8c1.8-1.6 4.6-1.6 6.4 0" />) },
  { id: 'meh', label: 'Somewhat helpful', icon: face(<path d="M9 15h6" />) },
  { id: 'yes', label: 'Helpful', icon: face(<path d="M8.8 14c1.8 1.7 4.6 1.7 6.4 0" />) },
  { id: 'love', label: 'Very helpful', icon: face(<path d="M8.4 13.4h7.2c-.5 2-1.9 3.2-3.6 3.2s-3.1-1.2-3.6-3.2z" />) },
]

const NOTE = 'The backoff table should mention jitter.'

type FormState = { open: boolean; rating: string | null; text: string; sent: boolean }

const CLOSED: FormState = { open: false, rating: null, text: '', sent: false }

/** 10 秒一轮：0.8 秒展开 → 选表情 → 打字 → 5.1 秒发送 → 显示感谢 → 7.6 秒收回按钮。 */
function scripted(time: number): FormState {
  const t = time % 10
  if (t < 0.8 || t >= 7.6) return CLOSED
  const typed = NOTE.slice(0, Math.max(0, Math.min(NOTE.length, Math.floor((t - 2.1) / 0.055) + 1)))
  return { open: true, rating: t >= 1.6 ? 'yes' : null, text: t >= 2.1 ? typed : '', sent: t >= 5.1 }
}

function Form({ state, onChange, onSend }: { state: FormState; onChange: (next: Partial<FormState>) => void; onSend: () => void }) {
  const canSend = state.text.trim().length > 0 || state.rating !== null
  return (
    <form
      className="px-4 pb-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
    >
      <p id="feedback-question" className="text-xs text-muted-foreground">
        Was this page helpful?
      </p>
      <div role="radiogroup" aria-labelledby="feedback-question" className="mt-2 flex gap-1.5">
        {RATINGS.map((rating) => {
          const selected = state.rating === rating.id
          return (
            <button
              key={rating.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={rating.label}
              onClick={() => onChange({ rating: rating.id })}
              className={cn(
                'grid h-9 flex-1 place-items-center rounded-lg border outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-[#8fb3ff]/60 bg-[#8fb3ff]/15 text-[#b9cdff]' : 'border-transparent bg-foreground/[0.05] text-muted-foreground hover:text-foreground',
              )}
            >
              {rating.icon}
            </button>
          )
        })}
      </div>
      <label className="sr-only" htmlFor="feedback-note">
        What could be clearer?
      </label>
      <textarea
        id="feedback-note"
        data-autofocus
        rows={3}
        value={state.text}
        onChange={(event) => onChange({ text: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canSend) {
            event.preventDefault()
            onSend()
          }
        }}
        placeholder="What could be clearer?"
        className="mt-3 block w-full resize-none rounded-lg border bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-[#8fb3ff]/70"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">Enter</kbd> to send
        </span>
        <button
          type="submit"
          disabled={!canSend}
          className="h-8 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background outline-none transition-opacity duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </form>
  )
}

function Thanks() {
  return (
    <div className="flex items-start gap-3 px-4 pb-4" role="status">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m3.5 8.5 3 3 6-7" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-medium">Thanks for the note.</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">It goes straight to the docs team.</p>
      </div>
    </div>
  )
}

export function Demo(props: Omit<MorphingPopoverProps, 'children' | 'open' | 'onOpenChange' | 'defaultOpen'>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<FormState>(CLOSED)
  // 用户一碰就接管：从当前画面的状态接着往下走，自动播放不再回来。
  const [manual, setManual] = useState<FormState | null>(null)
  const state = manual ?? auto

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((current) => (current.open === next.open && current.rating === next.rating && current.text === next.text && current.sent === next.sent ? current : next))
    },
    { reducedMotion: 'static', staticTime: 4.8 },
  )

  const change = (next: Partial<FormState>) => setManual({ ...state, ...next })

  // 手动发送后停 1.6 秒再收起，然后清空表单。
  useEffect(() => {
    if (!manual?.sent || !manual.open) return
    const timer = window.setTimeout(() => setManual({ ...CLOSED }), 1600)
    return () => window.clearTimeout(timer)
  }, [manual])

  return (
    <div ref={host} className="h-full w-full overflow-hidden bg-background">
      <div className="mx-auto flex max-w-[620px] flex-col px-8 pt-10">
        <div className="flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Docs</span>
            <span aria-hidden>/</span>
            <span>Webhooks</span>
            <span aria-hidden>/</span>
            <span className="text-foreground">Retries</span>
          </nav>
          <MorphingPopover {...props} open={state.open} onOpenChange={(open) => change(open ? { open } : { ...CLOSED })}>
            <MorphingPopoverTrigger className="flex h-9 items-center gap-2 border bg-card px-3.5 text-sm text-card-foreground">
              {/* 收回时图标等标签落位之后再出现，不和飞回来的文字叠在一起。 */}
              <motion.svg
                viewBox="0 0 16 16"
                className="size-3.5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                aria-hidden
                animate={{ opacity: state.open ? 0 : 1 }}
                transition={{ duration: 0.2, delay: state.open ? 0 : 0.22 }}
              >
                <path d="M3 12.5V4.2C3 3.5 3.5 3 4.2 3h7.6c.7 0 1.2.5 1.2 1.2v5.1c0 .7-.5 1.2-1.2 1.2H5.5z" />
              </motion.svg>
              <MorphingPopoverLabel>Feedback</MorphingPopoverLabel>
            </MorphingPopoverTrigger>
            <MorphingPopoverContent className="w-[316px] border bg-card text-card-foreground">
              <div className="flex items-center justify-between py-2.5 pr-2.5 pl-4">
                <MorphingPopoverLabel className="text-sm font-medium">Feedback</MorphingPopoverLabel>
                <MorphingPopoverClose aria-label="Close feedback" />
              </div>
              <MorphingPopoverBody>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={state.sent ? 'thanks' : 'form'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.08 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    {state.sent ? <Thanks /> : <Form state={state} onChange={change} onSend={() => change({ sent: true })} />}
                  </motion.div>
                </AnimatePresence>
              </MorphingPopoverBody>
            </MorphingPopoverContent>
          </MorphingPopover>
        </div>

        <h1 className="mt-9 text-[28px] font-semibold tracking-tight text-balance text-foreground">Retry policy</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          When your endpoint answers with anything other than a 2xx, Ferry retries the delivery with exponential backoff: 30 seconds, 2 minutes, 10 minutes, then
          hourly for up to three days.
        </p>
        <pre className="mt-5 overflow-hidden rounded-xl border bg-card px-4 py-3.5 font-mono text-[13px] leading-6 text-card-foreground">
          <span className="text-muted-foreground">HTTP/1.1</span> 503 Service Unavailable{'\n'}
          <span className="text-[#8fb3ff]">Retry-After</span>: 120
        </pre>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">If the response includes Retry-After, the next attempt waits at least that long.</p>
      </div>
    </div>
  )
}
