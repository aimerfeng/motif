// SPDX-License-Identifier: MIT
// Copyright (c) 2023 shadcn
// Source: https://github.com/shadcn-ui/ui/blob/08ab84f/apps/v4/registry/new-york-v4/blocks/login-05/components/login-form.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brandName: 'Kestrel',
  mode: 'signin',
  accent: '#5e5ce6',
  font: 'serif',
  radius: 20,
  background: 'aurora',
  showProviders: true,
  resendSeconds: 30,
  spring: {
    visualDuration: 0.5,
    bounce: 0.18,
  },
}
/* @motif:end */

export type MagicLinkStep = 'email' | 'sending' | 'sent'

/** 演示用的固定画面：传入时组件按它渲染；移除后内部状态从这一帧接着走。 */
export interface MagicLinkPreview {
  step: MagicLinkStep
  email: string
  /** 距离可以重发还剩几秒。 */
  resendIn: number
  /** 输入框显示聚焦样式和光标。 */
  focused?: boolean
}

export type AuthMagicLinkProps = Partial<typeof defaults> & {
  /** 发送登录链接；返回 Promise 时按钮显示发送中，reject 时显示错误。不传则只模拟发送。 */
  onSend?: (email: string) => void | Promise<unknown>
  /** 重发链接；不传时复用 onSend。 */
  onResend?: (email: string) => void | Promise<unknown>
  onProvider?: (provider: 'sso' | 'passkey') => void
  defaultEmail?: string
  preview?: MagicLinkPreview
  className?: string
  style?: CSSProperties
}

const SANS = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
const HEADING: Record<string, CSSProperties> = {
  serif: { fontFamily: "'Instrument Serif', ui-serif, Georgia, serif", fontWeight: 400, fontSize: 34, letterSpacing: '-0.01em', lineHeight: 1.05 },
  sans: { fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '-0.03em', lineHeight: 1.2 },
  grotesk: { fontFamily: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", fontWeight: 600, fontSize: 25, letterSpacing: '-0.035em', lineHeight: 1.15 },
}

/** 文案里用到品牌名的地方都给空品牌单独一句，不拼出「your workspace」之类的占位词。 */
const COPY = {
  signin: {
    heading: (brand: string) => (brand ? `Sign in to ${brand}` : 'Sign in with email'),
    sub: 'Enter your work email and we’ll send a link that signs you in. No password needed.',
    button: 'Email me a sign-in link',
    sending: 'Sending link…',
    footnote: (brand: string) => (brand ? `New to ${brand}? The same link creates your account.` : 'New here? The same link creates your account.'),
    sentHeading: 'Check your inbox',
    sentBody: 'We sent a sign-in link to',
    sentTail: 'It expires in 15 minutes.',
  },
  waitlist: {
    heading: (brand: string) => (brand ? `Join the ${brand} beta` : 'Join the beta'),
    sub: 'We let a new group of teams in every Monday. Confirm your email to hold a place.',
    button: 'Request early access',
    sending: 'Saving your place…',
    footnote: () => 'Already invited? Use the address the invite went to.',
    sentHeading: 'Confirm your place',
    sentBody: 'We sent a confirmation link to',
    sentTail: 'Open it within 24 hours to stay in line.',
  },
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** 打码：保留本地部分的首尾字母和完整域名。 */
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@')
  if (at < 1) return email
  const local = email.slice(0, at)
  return `${local[0]}•••${local.length > 2 ? local[local.length - 1] : ''}${email.slice(at)}`
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** WCAG 相对亮度；解析不了的颜色返回 null。 */
function luminance(color: string) {
  // 六位分支在前且锚定结尾：否则 #5e5ce6 会被前三位截成 #55ee55。
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const INK = '#0b0b12'
const INK_L = luminance(INK) ?? 0

/** 在白字和近黑字里选对比度更高的那个，用于主按钮和品牌方块。 */
function readable(color: string) {
  const l = luminance(color)
  if (l === null) return '#ffffff'
  return (l + 0.05) / (INK_L + 0.05) > 1.05 / (l + 0.05) ? INK : '#ffffff'
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4 shrink-0', className)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}
const I = {
  mail: 'M5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9A2.5 2.5 0 0 1 5.5 5ZM4 7l8 6 8-6',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  arrowLeft: 'M19 12H5m6-6-6 6 6 6',
  key: 'M14.5 9.5a5 5 0 1 1-1.6-3.7M14.5 9.5 21 16v3h-3v-2h-2v-2h-1.5l-1.6-1.6M8.5 10.5h.01',
  fingerprint: 'M8.5 4.2A8 8 0 0 1 20 11.5m-16 0a8 8 0 0 1 1.8-5M12 11.5c0 3-.6 5.7-2 8m5.2-6c-.1 2.2-.7 4.3-1.7 6.2M8.3 14c-.2 1.6-.8 3-1.7 4.2M8.5 11.5a3.5 3.5 0 0 1 7 0M18.7 15.5c.2-1 .3-2 .3-3',
  clock: 'M12 7.5V12l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  refresh: 'M20 11.5A8 8 0 1 0 17.7 17M20 5v6.5h-6.5',
}

const STAR = 'M12 3c.8 4.7 3.5 7.4 8.5 8.5-5 1.1-7.7 3.8-8.5 8.5-.8-4.7-3.5-7.4-8.5-8.5C8.5 10.4 11.2 7.7 12 3Z'
/** 信封周围闪烁的小星：left、top、尺寸、起始延迟。 */
const SPARKS: [number, number, number, number][] = [
  [20, 26, 14, 1.3],
  [180, 30, 11, 1.9],
  [28, 100, 9, 2.5],
  [178, 96, 13, 1.6],
]

/** 信封插画：信纸从上方滑入，后翻盖收起、前翻盖合上，封蜡弹出，然后轻轻浮动。 */
function Envelope({ run }: { run: boolean }) {
  const ease = [0.32, 0.72, 0, 1] as const
  const at = (delay: number, duration: number) => (run ? { delay, duration, ease } : { duration: 0 })
  return (
    <div
      aria-hidden
      className="relative mx-auto grid h-36 w-52 place-items-center"
      style={{
        ['--env-in' as string]: 'color-mix(in oklab, var(--acc) 45%, #0c0c16)',
        ['--env-pocket' as string]: 'color-mix(in oklab, var(--acc) 42%, #ffffff)',
        ['--env-flap' as string]: 'color-mix(in oklab, var(--acc) 78%, #ffffff)',
        ['--env-line' as string]: 'color-mix(in oklab, var(--acc) 80%, #0c0c16)',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--acc) 40%, transparent), transparent)' }} />
      {run &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute size-32 rounded-full border"
            style={{ borderColor: 'color-mix(in oklab, var(--acc) 60%, transparent)' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.5], opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, times: [0, 0.2, 1], repeat: Infinity, delay: 1.4 + i * 1.5, ease: 'easeOut' }}
          />
        ))}
      {SPARKS.map(([left, top, size, delay]) => (
        <motion.svg
          key={`${left}-${top}`}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left, top, width: size, height: size, color: 'color-mix(in oklab, var(--acc) 55%, #ffffff)' }}
          fill="currentColor"
          initial={run ? { scale: 0, opacity: 0 } : false}
          animate={run ? { scale: [0, 1, 0.55, 1, 0], opacity: [0, 1, 0.6, 1, 0] } : { scale: 1, opacity: 0.8 }}
          transition={run ? { duration: 2.6, times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity, delay } : { duration: 0 }}
        >
          <path d={STAR} />
        </motion.svg>
      ))}
      <motion.div initial={run ? { scale: 0.86, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={at(0, 0.4)}>
        <motion.div className="relative h-[88px] w-32" animate={run ? { y: [0, -4, 0] } : undefined} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
          {/* 打开的后翻盖，在信纸后面 */}
          <motion.div className="absolute inset-x-0 -top-[50px] h-[50px] origin-bottom" initial={run ? { scaleY: 1 } : false} animate={{ scaleY: 0 }} transition={at(0.66, 0.2)}>
            <svg viewBox="0 0 128 50" className="size-full">
              <path d="M2 50 56.5 6.5a12 12 0 0 1 15 0L126 50Z" fill="var(--env-in)" />
            </svg>
          </motion.div>
          <div className="absolute inset-0 rounded-[10px]" style={{ background: 'var(--env-in)' }} />
          {/* 信纸 */}
          <motion.div
            className="absolute top-0 left-3 h-[74px] w-[104px] rounded-md bg-white p-2.5 shadow-sm"
            initial={run ? { y: -56, opacity: 0 } : false}
            animate={{ y: 9, opacity: 1 }}
            transition={run ? { y: { delay: 0.12, duration: 0.6, ease }, opacity: { delay: 0.12, duration: 0.15 } } : { duration: 0 }}
          >
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: 'var(--acc)' }} />
              <span className="h-1.5 w-10 rounded-full bg-zinc-300" />
            </div>
            <span className="mt-2 block h-1.5 w-full rounded-full bg-zinc-200" />
            <span className="mt-1 block h-1.5 w-4/5 rounded-full bg-zinc-200" />
            <span className="mt-2 block h-3.5 w-12 rounded-[4px]" style={{ background: 'var(--acc)' }} />
          </motion.div>
          {/* 前袋 */}
          <div className="absolute inset-0 overflow-hidden rounded-[10px] shadow-[0_18px_40px_-14px_rgb(0_0_0/0.6)]">
            <svg viewBox="0 0 128 88" className="size-full">
              <path d="M0 0 64 48 128 0V88H0Z" fill="var(--env-pocket)" />
              <path d="M0 88 64 44 128 88Z" fill="var(--env-line)" fillOpacity=".1" />
              <path d="M0 88 64 44 128 88" stroke="var(--env-line)" strokeOpacity=".3" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          {/* 合上的前翻盖 */}
          <motion.div className="absolute inset-x-0 top-0 h-[52px] origin-top" initial={run ? { scaleY: 0 } : false} animate={{ scaleY: 1 }} transition={at(0.86, 0.26)}>
            <svg viewBox="0 0 128 52" className="size-full drop-shadow-[0_3px_3px_rgb(0_0_0/0.22)]">
              <path d="M10 0h108a10 10 0 0 1 9 5L71.5 46.5a12 12 0 0 1-15 0L1 5a10 10 0 0 1 9-5Z" fill="var(--env-flap)" />
              <path d="M1.5 5.5 56.5 46.5a12 12 0 0 0 15 0l55-41" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1" fill="none" />
            </svg>
          </motion.div>
          {/* 封蜡 */}
          <motion.div
            className="absolute top-[33px] left-1/2 -ml-[13px] grid size-[26px] place-items-center rounded-full bg-white shadow-md shadow-black/25"
            style={{ color: 'var(--acc)' }}
            initial={run ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={run ? { type: 'spring', delay: 1.1, visualDuration: 0.35, bounce: 0.5 } : { duration: 0 }}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d={STAR} />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Backdrop({ kind, run }: { kind: string; run: boolean }) {
  const drift = (x: number[], y: number[], duration: number) => (run ? { animate: { x, y }, transition: { duration, repeat: Infinity, ease: 'easeInOut' as const } } : {})
  const blob = (tint: string) => ({ background: `radial-gradient(closest-side, ${tint}, transparent)` })
  if (kind === 'plain') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-muted/50">
        <div className="absolute inset-x-0 top-0 h-3/4" style={{ background: 'radial-gradient(55% 70% at 50% 0%, color-mix(in oklab, var(--acc) 12%, transparent), transparent)' }} />
      </div>
    )
  }
  if (kind === 'grid') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 20%, transparent) 1px, transparent 0)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 45%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 45%, #000 30%, transparent 100%)',
          }}
        />
        <motion.div className="absolute top-1/2 left-1/2 -mt-[18rem] -ml-[22rem] h-[36rem] w-[44rem]" style={blob('color-mix(in oklab, var(--acc) 22%, transparent)')} {...drift([0, 40, -30, 0], [0, -24, 16, 0], 18)} />
      </div>
    )
  }
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-2/3" style={{ background: 'radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--acc) 16%, transparent), transparent)' }} />
      <motion.div className="absolute -top-[15rem] left-1/2 -ml-[36rem] size-[46rem]" style={blob('color-mix(in oklab, var(--acc) 46%, transparent)')} {...drift([0, 90, 30, 0], [0, 50, 90, 0], 17)} />
      <motion.div className="absolute -bottom-[17rem] left-1/2 -ml-[2rem] size-[44rem]" style={blob('color-mix(in oklab, color-mix(in oklab, var(--acc) 55%, #38bdf8) 36%, transparent)')} {...drift([0, -80, -20, 0], [0, -40, -80, 0], 21)} />
      <motion.div className="absolute top-[34%] left-1/2 -ml-[30rem] size-[26rem]" style={blob('color-mix(in oklab, color-mix(in oklab, var(--acc) 55%, #f472b6) 26%, transparent)')} {...drift([0, 60, 0], [0, -30, 0], 13)} />
    </div>
  )
}

/** 邮箱魔法链接登录：只填邮箱，提交后卡片变形成「去收件箱看看」，带打码邮箱、重发倒计时和返回入口。 */
export function AuthMagicLink({ onSend, onResend, onProvider, defaultEmail = '', preview, className, style, ...props }: AuthMagicLinkProps) {
  const { brandName, mode, accent, font, radius, background, showProviders, resendSeconds, spring } = { ...defaults, ...props }
  const reduced = useReducedMotion() === true
  const run = !reduced
  const copy = mode === 'waitlist' ? COPY.waitlist : COPY.signin
  const brand = brandName.trim()
  const total = Math.max(1, Math.round(resendSeconds))
  const inner = Math.round(Math.max(4, Math.min(14, radius * 0.55)))
  const fg = readable(accent)
  const headingStyle = HEADING[font] ?? HEADING.serif

  const id = useId()
  const [innerStep, setInnerStep] = useState<MagicLinkStep>('email')
  const [innerEmail, setInnerEmail] = useState(defaultEmail)
  const [innerRemaining, setInnerRemaining] = useState(total)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)
  const [cycle, setCycle] = useState(0)
  const deadline = useRef(0)
  const focusNext = useRef<'heading' | 'input' | null>(null)
  const [shakeScope, animate] = useAnimate<HTMLDivElement>()

  const previewing = preview !== undefined
  const step = preview?.step ?? innerStep
  const email = preview?.email ?? innerEmail
  const remaining = preview ? Math.max(0, Math.round(preview.resendIn)) : innerRemaining
  const sent = step === 'sent'
  const busy = step === 'sending'
  const masked = maskEmail(email.trim()) || 'your email address'

  // 预览期间把内部状态同步到预览帧：移除 preview 后从同一画面继续，不会闪回初始状态。
  const pStep = preview?.step
  const pEmail = preview?.email
  const pLeft = preview?.resendIn
  useEffect(() => {
    if (pStep === undefined) return
    const left = Math.max(0, Math.round(pLeft ?? total))
    setInnerStep(pStep === 'sending' ? 'email' : pStep)
    setInnerEmail(pEmail ?? '')
    setInnerRemaining(left)
    deadline.current = performance.now() + left * 1000
  }, [pStep, pEmail, pLeft, total])

  // 重发冷却：按截止时刻每帧换算剩余秒数，只在整秒变化时更新状态。
  useEffect(() => {
    if (previewing || step !== 'sent') return
    let frame = 0
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000))
      setInnerRemaining((prev) => (prev === left ? prev : left))
      if (left > 0) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [previewing, step, cycle])

  const startCooldown = () => {
    deadline.current = performance.now() + total * 1000
    setInnerRemaining(total)
    setCycle((c) => c + 1)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    const value = email.trim()
    if (!EMAIL.test(value)) {
      setError(value ? 'That doesn’t look like an email address.' : 'Enter your email and we’ll send the link.')
      if (run && shakeScope.current) void animate(shakeScope.current, { x: [0, -7, 6, -4, 3, 0] }, { duration: 0.42 })
      return
    }
    setError(null)
    setInnerStep('sending')
    try {
      await (onSend ? onSend(value) : new Promise((resolve) => setTimeout(resolve, 900)))
      startCooldown()
      setResent(false)
      focusNext.current = 'heading'
      setInnerStep('sent')
    } catch {
      setInnerStep('email')
      setError('We couldn’t send the link. Try again in a moment.')
    }
  }

  const resend = async () => {
    if (remaining > 0 || resending) return
    setResending(true)
    setError(null)
    try {
      await (onResend ?? onSend)?.(email.trim())
      startCooldown()
      setResent(true)
    } catch {
      setResent(false)
      setError('We couldn’t resend the link. Try again in a moment.')
    } finally {
      setResending(false)
    }
  }

  const back = () => {
    focusNext.current = 'input'
    setResent(false)
    setError(null)
    setInnerStep('email')
  }

  const enter = run ? { opacity: 0, y: 10 } : { opacity: 0 }
  const leave = run ? { opacity: 0, y: -8, transition: { duration: 0.14 } } : { opacity: 0, transition: { duration: 0.12 } }
  const layoutTransition = run ? { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce } : { duration: 0 }
  const focused = preview?.focused === true
  const live = sent ? (resent ? `A new link is on its way to ${masked}.` : `${copy.sentBody} ${masked}.`) : ''

  const focusRing = 'border-[color-mix(in_oklab,var(--acc)_65%,var(--border))] ring-4 ring-[color-mix(in_oklab,var(--acc)_20%,transparent)]'
  const legal: ReactNode = (
    <p className="mt-5 text-center text-xs leading-relaxed text-pretty text-muted-foreground">
      By continuing, you agree to the{' '}
      <a href="#" className="underline underline-offset-4 transition-colors hover:text-foreground">
        Terms of Service
      </a>{' '}
      and{' '}
      <a href="#" className="underline underline-offset-4 transition-colors hover:text-foreground">
        Privacy Policy
      </a>
      .
    </p>
  )

  return (
    <section
      aria-labelledby={sent ? `${id}-sent` : `${id}-heading`}
      className={cn('relative isolate flex w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 text-foreground sm:py-12', className)}
      style={{ ['--acc' as string]: accent, ['--acc-fg' as string]: fg, fontFamily: SANS, ...style }}
    >
      <Backdrop kind={background} run={run} />
      <div className="relative w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid size-8 place-items-center shadow-lg shadow-black/20" style={{ background: 'var(--acc)', color: fg, borderRadius: Math.max(6, inner - 2) }}>
            <svg viewBox="0 0 24 24" className="size-[22px]" fill="currentColor" aria-hidden>
              <path d="M2 6c3.5.5 7.5 2.5 10 6 2.5-3.5 6.5-5.5 10-6-1 6.5-5 11.8-10 14C7 17.8 3 12.5 2 6Z" />
              <circle cx="12" cy="6.5" r="2.4" />
            </svg>
          </span>
          {brand && <span className="min-w-0 text-[15px] font-semibold tracking-tight [overflow-wrap:anywhere]">{brand}</span>}
        </div>

        <motion.div
          layout
          transition={{ layout: layoutTransition }}
          className="relative mt-5 overflow-hidden border bg-card/85"
          style={{ borderRadius: radius, boxShadow: '0 30px 80px -30px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.04)' }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklab, var(--acc) 70%, transparent), transparent)' }} />
          <AnimatePresence mode="popLayout" initial={false}>
            {sent ? (
              <motion.div key="sent" layout initial={enter} animate={{ opacity: 1, y: 0 }} exit={leave} transition={{ duration: run ? 0.35 : 0.15, delay: run ? 0.14 : 0 }} className="px-6 pt-7 pb-6 text-center sm:px-8">
                <Envelope run={run} />
                <h1
                  id={`${id}-sent`}
                  tabIndex={-1}
                  ref={(el) => {
                    if (el && focusNext.current === 'heading') {
                      focusNext.current = null
                      el.focus({ preventScroll: true })
                    }
                  }}
                  className="outline-none [overflow-wrap:anywhere]"
                  style={headingStyle}
                >
                  {copy.sentHeading}
                </h1>
                <p className="mx-auto mt-2.5 max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
                  {copy.sentBody} <span className="font-medium whitespace-nowrap text-foreground">{masked}</span>.
                  {/* 尾句单独成行：打码地址不换行，接在后面会把「It」挤成孤字。这里不用 balance，窄屏时地址整体换到第二行，不拖着「to」。 */}
                  <span className="block">{copy.sentTail}</span>
                </p>
                <button
                  type="button"
                  onClick={() => void resend()}
                  aria-disabled={remaining > 0 || resending}
                  className={cn(
                    'relative mt-5 flex h-11 w-full items-center justify-center overflow-hidden border bg-background/50 text-sm font-medium outline-none transition-[background-color,color] focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--acc)_25%,transparent)]',
                    remaining > 0 ? 'cursor-default text-muted-foreground' : 'hover:bg-muted',
                  )}
                  style={{ borderRadius: inner }}
                >
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: 'color-mix(in oklab, var(--acc) 14%, transparent)' }}>
                    <motion.span
                      className="absolute inset-0 origin-left"
                      style={{ background: 'var(--acc)' }}
                      initial={false}
                      animate={{ scaleX: remaining > 0 ? Math.max(0, remaining - 1) / total : 0 }}
                      transition={{ duration: run && remaining > 0 ? 1 : 0.2, ease: 'linear' }}
                    />
                  </span>
                  <span className="relative flex items-center gap-2">
                    {remaining > 0 ? (
                      <>
                        <Icon d={I.clock} />
                        Resend in <span className="tabular-nums text-foreground">{clock(remaining)}</span>
                      </>
                    ) : (
                      <>
                        <Icon d={I.refresh} />
                        {resending ? 'Sending…' : 'Resend link'}
                      </>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={back}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon d={I.arrowLeft} className="size-3.5" />
                  Use a different email
                </button>
                <p role={error ? 'alert' : undefined} className={cn('mt-4 border-t pt-4 text-xs leading-relaxed text-pretty', error ? 'text-destructive' : 'text-muted-foreground')}>
                  {error ?? (resent ? 'A fresh link is on its way. The previous one no longer works.' : brand ? `Can’t find it? Check spam, or search your inbox for “${brand}”.` : 'Can’t find it? Check your spam folder.')}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                layout
                noValidate
                aria-labelledby={`${id}-heading`}
                onSubmit={(event) => void submit(event)}
                initial={enter}
                animate={{ opacity: 1, y: 0 }}
                exit={leave}
                transition={{ duration: run ? 0.35 : 0.15, delay: run ? 0.14 : 0 }}
                className="px-6 pt-7 pb-6 sm:px-8"
              >
                <h1
                  id={`${id}-heading`}
                  tabIndex={-1}
                  className="text-center text-balance outline-none [overflow-wrap:anywhere]"
                  style={headingStyle}
                >
                  {copy.heading(brand)}
                </h1>
                <p className="mx-auto mt-2.5 max-w-[20rem] text-center text-sm leading-relaxed text-pretty text-muted-foreground">{copy.sub}</p>

                <label htmlFor={`${id}-email`} className="mt-7 mb-1.5 block text-xs font-medium text-muted-foreground">
                  Work email
                </label>
                <div ref={shakeScope} className="relative">
                  <Icon d={I.mail} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id={`${id}-email`}
                    ref={(el) => {
                      if (el && focusNext.current === 'input') {
                        focusNext.current = null
                        el.focus({ preventScroll: true })
                        el.select()
                      }
                    }}
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@company.com"
                    value={email}
                    readOnly={busy}
                    onChange={(event) => {
                      setInnerEmail(event.target.value)
                      if (error) setError(null)
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(
                      'h-11 w-full border bg-background/60 pr-3 pl-10 text-sm outline-none transition-[border-color,box-shadow,opacity] placeholder:text-muted-foreground/60 focus:border-[color-mix(in_oklab,var(--acc)_65%,var(--border))] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--acc)_20%,transparent)] aria-[invalid=true]:border-destructive/70',
                      focused && focusRing,
                      busy && 'opacity-70',
                    )}
                    style={{ borderRadius: inner }}
                  />
                  {focused && (
                    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center border border-transparent pl-10 text-sm">
                      <span className="invisible whitespace-pre">{email}</span>
                      <motion.span
                        className="ml-px h-[1.1em] w-px bg-foreground"
                        animate={run ? { opacity: [1, 1, 0, 0] } : undefined}
                        transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
                      />
                    </span>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {error && (
                    <motion.p
                      key="error"
                      id={`${id}-error`}
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: run ? 0.2 : 0 }}
                      className="mt-2 text-xs text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  aria-disabled={busy}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 text-sm font-medium outline-none transition-[transform,filter] hover:brightness-110 focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--acc)_35%,transparent)] active:scale-[0.985] aria-disabled:cursor-progress"
                  style={{ background: 'var(--acc)', color: fg, borderRadius: inner, boxShadow: '0 12px 30px -12px color-mix(in oklab, var(--acc) 85%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2)' }}
                >
                  {busy ? (
                    <>
                      <motion.span
                        aria-hidden
                        className="size-4 rounded-full border-2 border-current border-t-transparent"
                        animate={run ? { rotate: 360 } : undefined}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      {copy.sending}
                    </>
                  ) : (
                    <>
                      {copy.button}
                      <Icon d={I.arrowRight} className="size-3.5" />
                    </>
                  )}
                </button>

                {showProviders && mode !== 'waitlist' && (
                  <>
                    <div className="my-5 flex items-center gap-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                      <span className="h-px flex-1 bg-border" />
                      or
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {(
                        [
                          ['sso', I.key, 'Continue with SSO'],
                          ['passkey', I.fingerprint, 'Use a passkey'],
                        ] as const
                      ).map(([key, icon, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onProvider?.(key)}
                          className="inline-flex h-10 items-center justify-center gap-2 border bg-background/40 text-[13px] font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ borderRadius: inner }}
                        >
                          <Icon d={icon} className="text-muted-foreground" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <p className="mt-6 text-center text-xs leading-relaxed text-balance text-muted-foreground">{copy.footnote(brand)}</p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {legal}
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </div>
    </section>
  )
}
