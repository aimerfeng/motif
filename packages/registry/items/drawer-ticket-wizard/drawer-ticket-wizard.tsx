// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/dialogs/dialog-09.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  side: 'right',
  width: 512,
  stepStyle: 'bars',
  radius: 6,
  tone: 'solid',
}
/* @motif:end */

export const ticketTypes = [
  { name: 'First Notice of Loss', value: 'fnol', extended: 'First Notice of Loss Call' },
  { name: 'Policy Service', value: 'policy', extended: 'Policy Service Call' },
  { name: 'Claims Status', value: 'claims', extended: 'Claims Status Check' },
  { name: 'Emergency', value: 'emergency', extended: 'Emergency Assistance' },
  { name: 'Coverage Review', value: 'coverage', extended: 'Policy Coverage Discussion' },
  { name: 'Billing Support', value: 'billing', extended: 'Payment & Billing Assistance' },
]

export const categoryTypes = [
  { name: 'Accident Report', value: 'accident-report' },
  { name: 'Emergency', value: 'emergency' },
  { name: 'Claim Status', value: 'claim-status' },
  { name: 'Policy Changes', value: 'policy-changes' },
  { name: 'Coverage Inquiry', value: 'coverage-inquiry' },
  { name: 'Document Request', value: 'document-request' },
  { name: 'Billing', value: 'billing' },
  { name: 'New Quote', value: 'new-quote' },
  { name: 'Account Service', value: 'account-service' },
  { name: 'Complaint', value: 'complaint' },
  { name: 'Fraud Report', value: 'fraud-report' },
  { name: 'Agent Request', value: 'agent-request' },
]

export const policyTypes = [
  { name: 'Auto Insurance', value: 'auto' },
  { name: 'Home Insurance', value: 'home' },
  { name: 'Life Insurance', value: 'life' },
  { name: 'Health Insurance', value: 'health' },
  { name: 'Business Insurance', value: 'business' },
  { name: 'Umbrella Insurance', value: 'umbrella' },
]

export const priorities = [
  { value: 'emergency', label: 'Emergency', sla: '15m', description: 'Accidents, injuries, immediate assistance needed' },
  { value: 'high', label: 'High Priority', sla: '4h', description: 'Coverage issues, policy changes' },
  { value: 'medium', label: 'Medium Priority', sla: '24h', description: 'General inquiries, documentation requests' },
  { value: 'low', label: 'Low Priority', sla: '48h', description: 'Information requests, future policy changes' },
]

export interface Ticket {
  created: string
  status: string
  description: string
  priority: string
  category: string
  type: string
  duration: string | null
  policyNumber: string
  policyType: string
}

export type TicketFormData = Partial<Ticket>

export const initialTicket = (): TicketFormData => ({
  status: 'in-progress',
  category: categoryTypes[0].value,
  type: ticketTypes[0].value,
  policyType: policyTypes[0].value,
  priority: priorities[0].value,
  description: '',
  policyNumber: '',
  duration: '0',
  created: new Date().toISOString(),
})

// 按亮度选实色背景上的文字颜色，任何主色都可读
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const fieldBase =
  'w-full rounded-[var(--r)] border border-input bg-background px-2.5 py-2 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] duration-100 outline-none placeholder:text-muted-foreground focus:border-[var(--acc)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--acc)_25%,transparent)] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground'
const btnBase =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-[var(--r)] border px-3 py-2 text-center text-sm font-medium shadow-sm transition-[background-color,color,filter] duration-100 ease-in-out ' +
  focusRing

function Button({ variant = 'primary', className, ...props }: { variant?: 'primary' | 'secondary' | 'ghost' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        btnBase,
        variant === 'primary' && 'border-transparent bg-[var(--acc)] text-[var(--acc-ink)] hover:brightness-110',
        variant === 'secondary' && 'border-border bg-background text-foreground hover:bg-muted',
        variant === 'ghost' && 'border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

/** 上游 RadioCardGroup（Radix）的替代：radiogroup + 方向键切换 + roving tabindex。 */
function RadioCardGroup({
  value,
  onValueChange,
  options,
  className,
  itemClassName,
  label,
  children,
}: {
  value?: string
  onValueChange: (v: string) => void
  options: string[]
  className?: string
  itemClassName?: string
  label: string
  children: (value: string, checked: boolean) => ReactNode
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (i + dir + options.length) % options.length
    onValueChange(options[next])
    refs.current[next]?.focus()
  }
  const current = options.includes(value ?? '') ? value : options[0]
  return (
    <div role="radiogroup" aria-label={label} className={cn('grid gap-2', className)}>
      {options.map((v, i) => {
        const checked = v === value
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={v === current ? 0 : -1}
            data-state={checked ? 'checked' : 'unchecked'}
            onClick={() => onValueChange(v)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'group relative w-full rounded-[var(--r)] border border-border bg-background p-4 text-left text-foreground shadow-sm transition-[background-color,border-color,color] duration-75',
              'data-[state=checked]:border-[var(--acc)]',
              focusRing,
              itemClassName,
            )}
            style={
              checked
                ? { background: 'var(--card-on-bg)', color: 'var(--card-on-ink)', borderColor: 'var(--card-on-border)' }
                : undefined
            }
          >
            {children(v, checked)}
          </button>
        )
      })}
    </div>
  )
}

/** 上游 Radix Select 的替代：带样式的原生 select，键盘和读屏天然可用。 */
function Select({ id, value, onValueChange, items }: { id: string; value?: string; onValueChange: (v: string) => void; items: { name: string; value: string }[] }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onValueChange(e.target.value)} className={cn(fieldBase, 'appearance-none pr-8')}>
        {items.map((it) => (
          <option key={it.value} value={it.value}>
            {it.name}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground">
        <path d="M12 16 6 10h12l-6 6Z" />
      </svg>
    </div>
  )
}

const SummaryItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm break-words">{value ?? 'Not provided'}</p>
  </div>
)

const FormField = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) => (
  <div>
    {htmlFor ? (
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
    ) : (
      <p className="text-sm font-medium text-foreground">{label}</p>
    )}
    <div className="mt-2">{children}</div>
  </div>
)

const PAGES = [
  { title: 'Create Support Ticket', subtitle: 'Ticket Type & Category' },
  { title: 'Ticket Details', subtitle: 'Priority & Description' },
  { title: 'Review Ticket', subtitle: 'Please review all details before submitting' },
]

function StepIndicator({ step, style }: { step: number; style: string }) {
  if (style === 'none') return null
  if (style === 'numbers') {
    return (
      <ol className="flex items-center gap-2 text-xs" aria-label="Progress">
        {PAGES.map((_, i) => {
          const n = i + 1
          const done = n < step
          const on = n === step
          return (
            <li key={n} className="flex items-center gap-2" aria-current={on ? 'step' : undefined}>
              <span
                className={cn('grid size-6 place-items-center rounded-full border text-[11px] font-semibold tabular-nums transition-[background-color,color,border-color] duration-200', !on && !done && 'border-border text-muted-foreground')}
                style={on || done ? { background: on ? 'var(--acc)' : 'transparent', color: on ? 'var(--acc-ink)' : 'var(--acc)', borderColor: 'var(--acc)' } : undefined}
              >
                {n}
              </span>
              {n < PAGES.length && <span className="h-px w-6 bg-border" aria-hidden />}
            </li>
          )
        })}
      </ol>
    )
  }
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-label="Progress" aria-valuemin={1} aria-valuemax={PAGES.length} aria-valuenow={step}>
      {PAGES.map((_, i) => (
        <span key={i} className="h-1 w-8 overflow-hidden rounded-full bg-border">
          <span className="block h-full origin-left rounded-full bg-[var(--acc)] transition-transform duration-300" style={{ transform: `scaleX(${i + 1 <= step ? 1 : 0})` }} />
        </span>
      ))}
    </div>
  )
}

export type TicketWizardDrawerProps = Omit<Partial<typeof defaults>, 'side' | 'stepStyle' | 'tone'> & {
  side?: 'right' | 'left'
  stepStyle?: 'bars' | 'numbers' | 'none'
  tone?: 'solid' | 'tinted'
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 受控步骤（1–3），演示自动播放用。 */
  step?: number
  onStepChange?: (step: number) => void
  /** 受控表单数据。 */
  formData?: TicketFormData
  onFormDataChange?: (data: TicketFormData) => void
  onSubmit?: (data: TicketFormData) => void
  /** 绝对定位在父元素内，而不是铺满视口。 */
  contained?: boolean
  className?: string
  style?: CSSProperties
}

export function TicketWizardDrawer({
  open,
  onOpenChange,
  step: stepProp,
  onStepChange,
  formData: dataProp,
  onFormDataChange,
  onSubmit,
  contained = false,
  className,
  style,
  ...props
}: TicketWizardDrawerProps) {
  const { accent, side, width, stepStyle, radius, tone } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const titleId = useId()
  const fid = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [innerData, setInnerData] = useState<TicketFormData>(initialTicket)
  const [innerStep, setInnerStep] = useState(1)
  const formData = dataProp ?? innerData
  const currentPage = stepProp ?? innerStep

  const setCurrentPage = (n: number) => {
    if (stepProp === undefined) setInnerStep(n)
    onStepChange?.(n)
  }
  const handleUpdateForm = (updates: Partial<TicketFormData>) => {
    const next = { ...formData, ...updates }
    if (dataProp === undefined) setInnerData(next)
    onFormDataChange?.(next)
  }
  const handleSubmit = () => {
    onSubmit?.(formData)
    onOpenChange(false)
  }

  // 打开时把焦点移进抽屉，关闭后还给之前的元素
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus({ preventScroll: true })
    return () => returnFocus.current?.focus?.({ preventScroll: true })
  }, [open])

  // 关闭后回到第一步（非受控时）
  useEffect(() => {
    if (!open && stepProp === undefined) setInnerStep(1)
  }, [open, stepProp])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onOpenChange(false)
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const nodes = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),select,textarea,input:not([disabled]),[tabindex="0"]')
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const ink = inkFor(accent)
  const vars = {
    '--acc': accent,
    '--acc-ink': ink,
    '--r': `${radius}px`,
    '--card-on-bg': tone === 'solid' ? accent : `color-mix(in oklab, ${accent} 12%, var(--color-background))`,
    '--card-on-ink': tone === 'solid' ? ink : 'var(--color-foreground)',
    '--card-on-border': tone === 'solid' ? 'transparent' : accent,
  } as CSSProperties

  const layer = contained ? 'absolute' : 'fixed'
  const dir = side === 'left' ? -1 : 1
  const page = PAGES[currentPage - 1] ?? PAGES[0]
  const find = <T extends { value: string }>(list: T[], v?: string) => list.find((x) => x.value === v)

  const body = () => {
    if (currentPage === 1)
      return (
        <div className="space-y-6">
          <FormField label="Contact Type">
            <RadioCardGroup
              label="Contact Type"
              value={formData.type}
              onValueChange={(value) => handleUpdateForm({ type: value })}
              options={ticketTypes.map((t) => t.value)}
              className="grid grid-cols-2 gap-2 text-sm"
              itemClassName="flex flex-col justify-start p-2.5 text-sm"
            >
              {(v) => {
                const type = find(ticketTypes, v)!
                return (
                  <>
                    <span className="font-medium">{type.name}</span>
                    <span className="block text-xs opacity-75">{type.extended}</span>
                  </>
                )
              }}
            </RadioCardGroup>
          </FormField>
          <FormField label="Category" htmlFor={`${fid}-cat`}>
            <Select id={`${fid}-cat`} value={formData.category} onValueChange={(value) => handleUpdateForm({ category: value })} items={categoryTypes} />
          </FormField>
          <FormField label="Policy Type" htmlFor={`${fid}-pol`}>
            <Select id={`${fid}-pol`} value={formData.policyType} onValueChange={(value) => handleUpdateForm({ policyType: value })} items={policyTypes} />
          </FormField>
          <FormField label="Policy Number" htmlFor={`${fid}-num`}>
            <input id={`${fid}-num`} disabled name="policyNumber" value={formData.policyNumber ?? ''} onChange={(e) => handleUpdateForm({ policyNumber: e.target.value })} placeholder="Auto generated" className={fieldBase} />
          </FormField>
        </div>
      )
    if (currentPage === 2)
      return (
        <div className="space-y-6">
          <FormField label="Priority Level">
            <RadioCardGroup
              label="Priority Level"
              value={formData.priority}
              onValueChange={(value) => handleUpdateForm({ priority: value })}
              options={priorities.map((p) => p.value)}
              className="grid grid-cols-1 gap-2 text-sm"
              itemClassName="p-2.5 text-sm"
            >
              {(v) => {
                const priority = find(priorities, v)!
                return (
                  <>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium">{priority.label}</span>
                      <span className="text-xs opacity-75">SLA: {priority.sla}</span>
                    </span>
                    <span className="block text-xs opacity-75">{priority.description}</span>
                  </>
                )
              }}
            </RadioCardGroup>
          </FormField>
          <FormField label="Description" htmlFor={`${fid}-desc`}>
            <textarea
              id={`${fid}-desc`}
              name="description"
              value={formData.description ?? ''}
              onChange={(e) => handleUpdateForm({ description: e.target.value })}
              placeholder="Detailed description of the issue..."
              className={cn(fieldBase, 'h-32 resize-none')}
            />
          </FormField>
          <FormField label="Expected Call Duration (minutes)" htmlFor={`${fid}-dur`}>
            <input
              id={`${fid}-dur`}
              name="duration"
              type="number"
              value={formData.duration || ''}
              onChange={(e) => handleUpdateForm({ duration: e.target.value || null })}
              placeholder="0"
              min="0"
              className={fieldBase}
            />
          </FormField>
        </div>
      )
    const priority = find(priorities, formData.priority)?.label
    return (
      <div className="rounded-[var(--r)] border border-border">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-medium">Ticket Information</h3>
          <div className="mt-4 space-y-4">
            <SummaryItem label="Type" value={find(ticketTypes, formData.type)?.name} />
            <SummaryItem label="Category" value={find(categoryTypes, formData.category)?.name} />
            <SummaryItem label="Policy Type" value={find(policyTypes, formData.policyType)?.name} />
            <SummaryItem label="Priority" value={priority} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium">Details</h3>
          <div className="mt-4 space-y-4">
            <SummaryItem label="Description" value={formData.description || undefined} />
            <SummaryItem label="Call Duration" value={formData.duration && formData.duration !== '0' ? `${formData.duration} minute${formData.duration === '1' ? '' : 's'}` : undefined} />
            <SummaryItem
              label="Created"
              value={formData.created ? new Date(formData.created).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : undefined}
            />
          </div>
        </div>
      </div>
    )
  }

  const footer = () => {
    if (currentPage === 1)
      return (
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => setCurrentPage(2)}>Continue</Button>
        </>
      )
    if (currentPage === 2)
      return (
        <>
          <Button variant="secondary" onClick={() => setCurrentPage(1)}>
            Back
          </Button>
          <Button onClick={() => setCurrentPage(3)}>Review</Button>
        </>
      )
    return (
      <>
        <Button variant="secondary" onClick={() => setCurrentPage(2)}>
          Back
        </Button>
        <Button onClick={handleSubmit}>Create Ticket</Button>
      </>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <div className={cn(layer, 'inset-0 z-50')} style={vars}>
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: `${dir * 50}%` }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: `${dir * 50}%` }}
            transition={reduced ? { duration: 0.15 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute inset-y-2 flex flex-col overflow-hidden rounded-[var(--r)] border border-border bg-background p-4 text-foreground shadow-lg outline-none sm:p-6',
              side === 'left' ? 'left-2' : 'right-2',
              className,
            )}
            style={{ width: `min(${width}px, calc(100% - 16px))`, ...style }}
          >
            <div className="flex items-start justify-between gap-x-4 pb-4">
              <div className="mt-1 flex min-w-0 flex-col gap-y-1">
                <h2 id={titleId} className="text-base font-semibold text-foreground">
                  <span className="block">{page.title}</span>
                  <span className="block text-sm font-normal text-muted-foreground">{page.subtitle}</span>
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StepIndicator step={currentPage} style={stepStyle} />
                <Button variant="ghost" aria-label="Close" className="aspect-square p-1" onClick={() => onOpenChange(false)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-6">
                    <path d="m12 10.6 4.95-4.95 1.41 1.41L13.41 12l4.95 4.95-1.41 1.41L12 13.41l-4.95 4.95-1.41-1.41L10.59 12 5.64 7.05l1.41-1.41L12 10.59Z" />
                  </svg>
                </Button>
              </div>
            </div>
            <div className="-mx-4 flex-1 overflow-y-auto border-t border-border px-4 py-4 sm:-mx-6 sm:px-6">{body()}</div>
            <div className="-mx-4 flex flex-col-reverse gap-2 border-t border-border px-4 pt-4 sm:-mx-6 sm:flex-row sm:justify-between sm:px-6">{footer()}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
