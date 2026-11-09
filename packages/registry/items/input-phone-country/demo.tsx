import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { COUNTRIES, InputPhoneCountry, type InputPhoneCountryProps } from './input-phone-country'

/** 每 6 秒一轮：换一个国家，逐位输入号码，停住，清空。 */
const SCRIPT = [
  { country: '', digits: '4155550142' },
  { country: 'GB', digits: '7700900461' },
  { country: 'JP', digits: '9012345678' },
]

function scripted(time: number, fallback: string) {
  const round = Math.floor(time / 6) % SCRIPT.length
  const step = SCRIPT[round]!
  const t = time % 6
  const n = t < 0.5 || t > 5.4 ? 0 : Math.floor((t - 0.5) / 0.16) + 1
  return { country: step.country || fallback, digits: step.digits.slice(0, n) }
}

export function Demo(props: InputPhoneCountryProps) {
  const host = useRef<HTMLDivElement>(null)
  const fallback = props.defaultCountry ?? 'US'
  const allowed = (code: string) => {
    const c = COUNTRIES.find((x) => x.code === code)
    return Boolean(c) && (props.countries === undefined || props.countries === 'all' || c?.region === props.countries || code === fallback)
  }
  const [auto, setAuto] = useState({ country: fallback, digits: '' })
  const [manual, setManual] = useState<{ country: string; digits: string } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, fallback)
      if (!allowed(next.country)) next.country = fallback
      setAuto((prev) => (prev.country === next.country && prev.digits === next.digits ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.5 },
  )

  const state = manual ?? auto

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[360px] rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Turn on two-step sign-in</h2>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">We’ll text a 6-digit code to this number each time you sign in.</p>
        <InputPhoneCountry
          {...props}
          country={state.country}
          value={state.digits}
          onCountryChange={(country) => setManual({ country, digits: '' })}
          onValueChange={(digits, country) => setManual({ country, digits })}
        />
        <button
          type="button"
          className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Send code
        </button>
      </div>
    </div>
  )
}
