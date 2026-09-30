import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputOtp, type InputOtpProps } from './input-otp'

const WRONG = '482915'
const RIGHT = '739206'

/** 一轮 11 秒：输入错误的码 -> 抖动变红 -> 清空 -> 输入正确的码 -> 变绿。 */
function scripted(time: number, length: number) {
  const t = time % 11
  const typed = (code: string, start: number) => code.slice(0, length).slice(0, Math.max(0, Math.min(length, Math.floor((t - start) / 0.38) + 1)))
  if (t < 0.6) return { value: '', status: 'idle' as const }
  if (t < 3.6) return { value: typed(WRONG, 0.6), status: 'idle' as const }
  if (t < 5.4) return { value: WRONG.slice(0, length), status: 'error' as const }
  if (t < 6.1) return { value: '', status: 'idle' as const }
  if (t < 8.8) return { value: typed(RIGHT, 6.1), status: 'idle' as const }
  if (t < 10.7) return { value: RIGHT.slice(0, length), status: 'success' as const }
  return { value: '', status: 'idle' as const }
}

export function Demo(props: InputOtpProps) {
  const host = useRef<HTMLDivElement>(null)
  const length = props.length ?? 6
  const [auto, setAuto] = useState<{ value: string; status: 'idle' | 'error' | 'success' }>({ value: '', status: 'idle' })
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time, length)
      setAuto((prev) => (prev.value === next.value && prev.status === next.status ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 9.6 },
  )

  const status = manual === null ? auto.status : manual.length === length ? (manual === RIGHT.slice(0, length) ? 'success' : 'error') : 'idle'
  const value = manual ?? auto.value
  const complete = value.length === length

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(55%_55%_at_50%_0%,oklch(0.32_0.1_275/0.45),transparent)] bg-background p-6">
      <div className="w-full max-w-[440px] rounded-2xl border bg-card/70 p-7 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
            <path d="m4.5 7.5 7.5 6 7.5-6" />
          </svg>
        </div>
        <h2 className="text-base font-semibold">Check your email</h2>
        <p className="mt-1 mb-6 text-[13px] text-muted-foreground">
          We sent a {length}-digit code to <span className="text-foreground">mira@northwind.dev</span>
        </p>
        <div className="flex justify-center">
          <InputOtp {...props} value={value} status={status} focused={manual === null ? !complete || status !== 'idle' : undefined} onChange={setManual} />
        </div>
        <div className="mt-2.5 h-4 text-xs">
          {status === 'error' && <span className="text-rose-400">That code is not right. Try again.</span>}
          {status === 'success' && <span className="text-emerald-400">Verified. Signing you in…</span>}
        </div>
        <button
          type="button"
          disabled={!complete}
          className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity duration-200 disabled:opacity-40"
        >
          Verify and continue
        </button>
        <p className="mt-4 text-xs text-muted-foreground">Did not get it? <span className="text-foreground underline underline-offset-2">Resend code</span> in 0:24</p>
      </div>
    </div>
  )
}
