import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputFloatingLabel, type InputFloatingLabelProps } from './input-floating-label'

const EMAIL = 'mira@northwind.dev'
const PASSWORD = 'correct-horse-9'

const mail = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 6 7.5-6" />
  </svg>
)
const lock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)

const chars = (text: string, t: number, start: number, rate = 0.11) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - start) / rate) + 1)))

/** 一轮 10 秒：聚焦邮箱并输入 -> 聚焦密码并输入 -> 稍停 -> 清空。 */
function scripted(time: number) {
  const t = time % 10
  if (t >= 9.2) return { email: '', password: '', focus: null as null | 'email' | 'password', error: false }
  return {
    email: t >= 0.7 ? chars(EMAIL, t, 0.9) : '',
    password: t >= 3.4 ? chars(PASSWORD, t, 3.6, 0.1) : '',
    focus: t < 0.7 ? null : t < 3.3 ? ('email' as const) : t < 8.3 ? ('password' as const) : null,
    error: false,
  }
}

export function Demo(props: InputFloatingLabelProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(scripted(0))
  const [manual, setManual] = useState<{ email: string; password: string } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.email === next.email && prev.password === next.password && prev.focus === next.focus ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.1 },
  )

  const email = manual?.email ?? auto.email
  const password = manual?.password ?? auto.password
  const ready = email.length > 3 && password.length > 3

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(55%_55%_at_50%_0%,oklch(0.32_0.1_285/0.45),transparent)] bg-background p-6">
      <div className="w-full max-w-[400px] rounded-2xl border bg-card/70 p-7 shadow-2xl shadow-black/30">
        <h2 className="text-lg font-semibold tracking-tight">Welcome back</h2>
        <p className="mt-1 mb-6 text-[13px] text-muted-foreground">Sign in to continue to Northwind.</p>
        <div className="space-y-3.5">
          <InputFloatingLabel
            {...props}
            type="email"
            autoComplete="email"
            leading={mail}
            value={email}
            focused={manual ? undefined : auto.focus === 'email'}
            onChange={(v) => setManual({ email: v, password })}
          />
          <InputFloatingLabel
            variant={props.variant}
            color={props.color}
            radius={props.radius}
            size={props.size}
            spring={props.spring}
            label="Password"
            placeholder="At least 8 characters"
            type="password"
            autoComplete="current-password"
            leading={lock}
            value={password}
            focused={manual ? undefined : auto.focus === 'password'}
            onChange={(v) => setManual({ email, password: v })}
          />
        </div>
        <button
          type="button"
          className="mt-5 h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-opacity duration-200"
          style={{ opacity: ready ? 1 : 0.55 }}
        >
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          New here? <span className="text-foreground underline underline-offset-2">Create an account</span>
        </p>
      </div>
    </div>
  )
}
