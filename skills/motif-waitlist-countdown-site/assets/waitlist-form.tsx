// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/Form.astro
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Button, Icon, headingStyle } from './parts'

/** 页面上展示的「已排队人数」；新加入的人排在它后面。 */
export const WAITLIST_COUNT = 3186
/** 每邀请一位朋友前进的名次。 */
const REFERRAL_JUMP = 25

const INPUT =
  'block w-full rounded-[calc(var(--radius)*0.75)] border border-border bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30'

function hash(text: string) {
  let h = 2166136261
  for (const ch of text.toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return h
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'lamp'
}

type Joined = { email: string; position: number; link: string }

/**
 * 上游 Form.astro：一个邮箱字段、一个同意框、一个按钮、一行说明。
 * 提交只改本地状态（上游表单本来就没有接后端）：按邮箱算出一个稳定的排队名次和邀请链接。
 */
export function WaitlistForm({ brand, showReferral }: { brand: string; showReferral: boolean }) {
  const reduced = useReducedMotion()
  const id = useId()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [joined, setJoined] = useState<Joined | null>(null)
  const [copied, setCopied] = useState(false)
  const linkRef = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const h = hash(email.trim())
    setCopied(false)
    setJoined({
      email: email.trim(),
      position: WAITLIST_COUNT + 1 + (h % 17),
      link: `${slug(brand)}.example/r/${h.toString(36).slice(0, 6)}`,
    })
  }

  const copy = () => {
    linkRef.current?.select()
    const text = linkRef.current?.value ?? ''
    // 沙箱或旧浏览器里没有剪贴板权限时，文字已经选中，用户可以自己复制。
    navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }

  const fade = {
    initial: reduced ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: reduced ? { opacity: 1 } : { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: 'easeOut' as const },
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {joined ? (
        <motion.div key="joined" {...fade} role="status" className="flex flex-col items-center py-2 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Icon name="check" className="size-6" />
          </span>
          <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Your place in line</p>
          <p className="mt-1 text-5xl tabular-nums" style={headingStyle}>
            #{joined.position.toLocaleString('en-US')}
          </p>
          <p className="mt-3 max-w-sm text-pretty text-muted-foreground">
            We will email <span className="font-medium break-all text-foreground">{joined.email}</span> when batch one opens. Your founder price of $89 is held until then.
          </p>
          {showReferral && (
            <div className="mt-6 w-full rounded-[var(--radius)] border border-border bg-[var(--tint)] p-4 text-left">
              <label htmlFor={`${id}-link`} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Icon name="link" className="size-4 text-[var(--accent-ink)]" />
                Your referral link
              </label>
              <div className="mt-2 flex gap-2">
                <input ref={linkRef} id={`${id}-link`} readOnly value={joined.link} onFocus={(event) => event.target.select()} className={`${INPUT} min-w-0 flex-1 py-2.5 text-sm`} />
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)*0.75)] border border-border bg-card px-3 text-sm font-medium text-foreground transition-[background-color,border-color] duration-150 outline-none hover:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <Icon name={copied ? 'check' : 'copy'} className="size-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Each friend who joins with it moves you {REFERRAL_JUMP} places up, for up to ten friends.
              </p>
            </div>
          )}
          <Button
            type="button"
            className="mt-6 py-2.5 text-sm"
            onClick={() => {
              setJoined(null)
              setEmail('')
              setConsent(false)
            }}
          >
            Use another email
          </Button>
        </motion.div>
      ) : (
        <motion.form key="form" {...fade} onSubmit={submit}>
          <div className="mb-6">
            <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={INPUT}
            />
          </div>
          <div className="mt-3 flex items-start">
            <div className="mt-0.5 flex">
              <input
                id={`${id}-consent`}
                name="disclaimer"
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 size-4 cursor-pointer rounded accent-[var(--primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              />
            </div>
            <div className="ml-3">
              <label htmlFor={`${id}-consent`} className="cursor-pointer text-sm text-muted-foreground select-none">
                Email me about this launch only. I can unsubscribe with one click.
              </label>
            </div>
          </div>
          <div className="mt-10 grid">
            <Button variant="primary" type="submit">
              Save my place
            </Button>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              {showReferral ? 'You get your queue number and a referral link right away.' : 'You get your queue number right away.'} We never share the list.
            </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
