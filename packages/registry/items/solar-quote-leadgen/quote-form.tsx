// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/ui/Form.astro
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@motif/runtime'
import { estimate } from './art'
import { Button, Icon, headingStyle } from './parts'

/* 上游 Form.astro 的输入框、同意框与按钮；提交只改本地状态，不发请求。 */

const INPUT =
  'block w-full rounded-[calc(var(--radius)*0.75)] border border-border bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30'
const LABEL = 'mb-1.5 block text-sm font-medium text-foreground'

function Field({
  id,
  label,
  className,
  ...input
}: {
  id: string
  label: string
  className?: string
  type?: string
  name: string
  autoComplete?: string
  placeholder?: string
  required?: boolean
  inputMode?: 'numeric' | 'tel' | 'email' | 'text'
  pattern?: string
  value: string
  onChange: (value: string) => void
}) {
  const { onChange, ...rest } = input
  return (
    <div className={cn('mb-6', className)}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input id={id} {...rest} onChange={(event) => onChange(event.target.value)} className={INPUT} />
    </div>
  )
}

function Disclaimer({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="mt-3 flex items-start">
      <div className="mt-0.5 flex">
        <input
          id={id}
          name="disclaimer"
          type="checkbox"
          required
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 size-4 cursor-pointer rounded accent-[var(--primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        />
      </div>
      <div className="ml-3">
        <label htmlFor={id} className="cursor-pointer text-sm text-muted-foreground select-none">
          {label}
        </label>
      </div>
    </div>
  )
}

function Sent({ title, children, onReset, reset }: { title: string; children: ReactNode; onReset: () => void; reset: string }) {
  return (
    <div role="status" className="flex flex-col items-center py-4 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
        <Icon name="check" className="size-6" />
      </span>
      <p className="mt-4 text-xl" style={headingStyle}>
        {title}
      </p>
      <div className="mt-2 max-w-sm text-muted-foreground">{children}</div>
      <Button type="button" className="mt-6 py-2.5 text-sm" onClick={onReset}>
        {reset}
      </Button>
    </div>
  )
}

/* ---------- 联系表单：Contact.astro + Form.astro 原样的字段结构 ---------- */

export function ContactForm({ brand }: { brand: string }) {
  const [values, setValues] = useState({ name: '', phone: '', email: '', message: '' })
  const [consent, setConsent] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (key: keyof typeof values) => (value: string) => setValues((v) => ({ ...v, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }
  if (sent)
    return (
      <Sent title="Call booked" reset="Book another call" onReset={() => setSent(false)}>
        A {brand} designer will call {values.name ? values.name.split(' ')[0] : 'you'} within one business day, Monday to Saturday.
      </Sent>
    )
  return (
    <form onSubmit={submit}>
      <Field id="contact-name" name="name" label="Name" autoComplete="name" placeholder="Your first name is enough" required value={values.name} onChange={set('name')} />
      <div className="grid gap-x-4 @xl:grid-cols-2">
        <Field id="contact-phone" name="phone" type="tel" inputMode="tel" label="Phone" autoComplete="tel" placeholder="(555) 014-0000" required value={values.phone} onChange={set('phone')} />
        <Field id="contact-email" name="email" type="email" label="Email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set('email')} />
      </div>
      <div>
        <label htmlFor="contact-message" className={LABEL}>
          Anything we should know?
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={3}
          placeholder="Roof age, an EV on order, a planned extension…"
          value={values.message}
          onChange={(event) => set('message')(event.target.value)}
          className={cn(INPUT, 'resize-y')}
        />
      </div>
      <Disclaimer id="contact-consent" label="I agree to be contacted about my quote by phone or email. No marketing lists, ever." checked={consent} onChange={setConsent} />
      <div className="mt-10 grid">
        <Button variant="primary" type="submit">
          Request a call
        </Button>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm text-muted-foreground">Fifteen minutes with a designer, not a salesperson.</p>
      </div>
    </form>
  )
}

/* ---------- 首屏报价表单：地址 → 屋顶 → 电费，带进度 ---------- */

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'roof', label: 'Roof' },
  { id: 'bill', label: 'Bill' },
] as const

const ROOFS = [
  { value: 'shingle', label: 'Shingle', d: 'M3 15l9-7 9 7M5 13.5v6h14v-6M7 16h10' },
  { value: 'metal', label: 'Metal', d: 'M3 15l9-7 9 7M5 13.5v6h14v-6M9 11v8M12 9v10M15 11v8' },
  { value: 'tile', label: 'Tile', d: 'M3 15l9-7 9 7M5 13.5v6h14v-6M5 16.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0' },
  { value: 'flat', label: 'Flat', d: 'M3 10h18M5 10v9h14v-9M8 7h8l1 3H7z' },
] as const

const SHADE = [
  { value: 'sun', label: 'Full sun' },
  { value: 'some', label: 'Some shade' },
  { value: 'heavy', label: 'Heavy shade' },
] as const

type Values = { address: string; zip: string; roof: string; shade: string; bill: number; email: string; consent: boolean }

function Progress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Quote progress">
      {STEPS.map((s, i) => {
        const state = i < step ? 'done' : i === step ? 'current' : 'todo'
        return (
          <li key={s.id} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="block h-1.5 overflow-hidden rounded-full bg-border">
              <motion.span
                className="block h-full origin-left bg-primary"
                initial={false}
                animate={{ scaleX: state === 'done' ? 1 : state === 'current' ? 0.5 : 0 }}
                transition={{ type: 'spring', visualDuration: 0.4, bounce: 0 }}
              />
            </span>
            <span className={cn('mt-2 flex items-center gap-1.5 text-xs font-semibold', state === 'todo' ? 'text-muted-foreground' : 'text-foreground')}>
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full border text-[11px] transition-[background-color,border-color,color] duration-200',
                  state === 'todo' ? 'border-border' : 'border-primary bg-primary text-primary-foreground',
                )}
                aria-hidden
              >
                {state === 'done' ? <Icon name="check" className="size-3" /> : i + 1}
              </span>
              {s.label}
              <span className="sr-only">{state === 'done' ? ' (done)' : state === 'current' ? ' (current)' : ''}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function AddressStep({ values, set }: { values: Values; set: <K extends keyof Values>(key: K, value: Values[K]) => void }) {
  return (
    <fieldset>
      <legend className="mb-4 text-lg font-semibold text-foreground">Where is the house?</legend>
      <Field id="quote-address" name="address" label="Street address" autoComplete="street-address" placeholder="418 Alder Lane" required value={values.address} onChange={(v) => set('address', v)} />
      <Field
        id="quote-zip"
        name="zip"
        label="ZIP code"
        autoComplete="postal-code"
        inputMode="numeric"
        pattern="[0-9]{5}"
        placeholder="94530"
        required
        value={values.zip}
        onChange={(v) => set('zip', v.replace(/[^0-9]/g, '').slice(0, 5))}
        className="mb-0"
      />
    </fieldset>
  )
}

const CHOICE =
  'relative flex cursor-pointer items-center rounded-[calc(var(--radius)*0.75)] border border-border bg-card text-sm font-medium text-foreground transition-[background-color,border-color] duration-150 hover:bg-[var(--tint)] has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--tint)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ring)]/40'

function RoofStep({ values, set }: { values: Values; set: <K extends keyof Values>(key: K, value: Values[K]) => void }) {
  return (
    <div>
      <fieldset>
        <legend className="mb-3 text-lg font-semibold text-foreground">What is the roof made of?</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {ROOFS.map((roof) => (
            <label key={roof.value} className={cn(CHOICE, 'gap-2.5 px-3 py-3')}>
              <input type="radio" name="roof" value={roof.value} checked={values.roof === roof.value} onChange={() => set('roof', roof.value)} className="sr-only" />
              <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-[var(--accent-ink)]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={roof.d} />
              </svg>
              {roof.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-medium text-foreground">How much shade does it get at midday?</legend>
        <div className="grid grid-cols-3 gap-2">
          {SHADE.map((shade) => (
            <label key={shade.value} className={cn(CHOICE, 'justify-center px-2 py-2.5 text-center leading-tight')}>
              <input type="radio" name="shade" value={shade.value} checked={values.shade === shade.value} onChange={() => set('shade', shade.value)} className="sr-only" />
              {shade.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function BillStep({ values, set, rate, sunHours }: { values: Values; set: <K extends keyof Values>(key: K, value: Values[K]) => void; rate: number; sunHours: number }) {
  const data = estimate(values.bill, rate, sunHours)
  return (
    <fieldset>
      <legend className="mb-4 text-lg font-semibold text-foreground">What is your average monthly bill?</legend>
      <div className="mb-6">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="quote-bill" className="text-sm font-medium text-foreground">
            Monthly electricity bill
          </label>
          <output htmlFor="quote-bill" className="text-2xl font-bold text-foreground tabular-nums">
            ${values.bill}
          </output>
        </div>
        <input
          id="quote-bill"
          name="bill"
          type="range"
          min={40}
          max={450}
          step={10}
          value={values.bill}
          onChange={(event) => set('bill', Number(event.target.value))}
          aria-valuetext={`$${values.bill} a month`}
          className="mt-3 h-2 w-full cursor-pointer accent-[var(--primary)]"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          About {Math.round(data.usage).toLocaleString('en-US')} kWh a month, so roughly a {data.size} kW system.
        </p>
      </div>
      <Field id="quote-email" name="email" type="email" label="Where should we send the quote?" autoComplete="email" placeholder="you@example.com" required value={values.email} onChange={(v) => set('email', v)} className="mb-0" />
      <Disclaimer id="quote-consent" label="Email me this quote and one follow-up. Nothing else unless I ask." checked={values.consent} onChange={(v) => set('consent', v)} />
    </fieldset>
  )
}

/** 新一步挂载后把焦点移到第一个输入框；初次渲染不抢焦点。 */
function StepPanel({ children, autoFocus, reduced }: { children: ReactNode; autoFocus: boolean; reduced: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (autoFocus) ref.current?.querySelector<HTMLElement>('input:not([type=radio]), input:checked')?.focus({ preventScroll: true })
  }, [autoFocus])
  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: reduced ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function QuoteForm({ mode, rate, sunHours, brand }: { mode: string; rate: number; sunHours: number; brand: string }) {
  const reduced = useReducedMotion()
  const wizard = mode !== 'single'
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const touched = useRef(false)
  const [values, setValues] = useState<Values>({ address: '', zip: '', roof: 'shingle', shade: 'sun', bill: 160, email: '', consent: false })
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    touched.current = true
    if (wizard && step < STEPS.length - 1) setStep(step + 1)
    else setDone(true)
  }
  const back = () => {
    touched.current = true
    setStep((s) => Math.max(0, s - 1))
  }
  const reset = () => {
    touched.current = true
    setDone(false)
    setStep(0)
  }

  const data = estimate(values.bill, rate, sunHours)
  const shadeFactor = values.shade === 'heavy' ? 0.7 : values.shade === 'some' ? 0.88 : 1

  return (
    <div className="flex w-full flex-col rounded-[var(--radius)] border border-border bg-card p-4 text-left shadow-xl @xl:p-6 @5xl:p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl" style={headingStyle}>
          Get your fixed-price quote
        </h2>
        {wizard && !done && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Step {step + 1} of {STEPS.length}
          </p>
        )}
      </div>
      {wizard && !done && (
        <div className="mb-6">
          <Progress step={step} />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <StepPanel key="done" autoFocus={false} reduced={reduced}>
            <Sent title="Your quote is on its way" reset="Edit answers" onReset={reset}>
              <p>
                We will email a panel layout for {values.address || 'your roof'} and a fixed price to {values.email || 'you'} within one business day.
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-2 text-left">
                {[
                  ['System', `${data.size} kW`],
                  ['Panels', `${data.panels}`],
                  ['Payback', data.payback === null ? '25y+' : `${(data.payback / shadeFactor).toFixed(1)}y`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[calc(var(--radius)*0.75)] bg-[var(--tint)] px-3 py-2">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </Sent>
          </StepPanel>
        ) : (
          <StepPanel key={wizard ? STEPS[step]!.id : 'single'} autoFocus={touched.current} reduced={reduced}>
            <form onSubmit={submit} aria-label={`${brand} solar quote`}>
              {wizard ? (
                <>
                  {step === 0 && <AddressStep values={values} set={set} />}
                  {step === 1 && <RoofStep values={values} set={set} />}
                  {step === 2 && <BillStep values={values} set={set} rate={rate} sunHours={sunHours} />}
                </>
              ) : (
                <div className="space-y-8">
                  <AddressStep values={values} set={set} />
                  <RoofStep values={values} set={set} />
                  <BillStep values={values} set={set} rate={rate} sunHours={sunHours} />
                </div>
              )}
              <div className={cn('mt-8 grid gap-3', wizard && step > 0 && 'grid-cols-[auto_1fr]')}>
                {wizard && step > 0 && (
                  <Button type="button" onClick={back} className="px-5 @3xl:px-6">
                    Back
                  </Button>
                )}
                <Button variant="primary" type="submit">
                  {wizard && step < STEPS.length - 1 ? 'Continue' : 'Get my quote'}
                  <Icon name="arrow" className="-mr-1 size-5" />
                </Button>
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground">Free, no credit check, no site visit until you want one.</p>
            </form>
          </StepPanel>
        )}
      </AnimatePresence>
    </div>
  )
}
