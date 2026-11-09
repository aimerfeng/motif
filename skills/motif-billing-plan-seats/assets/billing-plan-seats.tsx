// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/billing-usage/billing-usage-06.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  tone: 'plain',
  layout: 'split',
  currency: 'USD',
  seatsUsed: 5,
  seatsTotal: 25,
  showSpendCap: true,
}
/* @motif:end */

export type BillingPlanSeatsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控的消费上限开关；不传时用内部状态，初值取 showSpendCap。 */
  spendCapOn?: boolean
  onSpendCapChange?: (on: boolean) => void
}

// 按亮度选主色按钮上的文字颜色，任何主色都可读
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

const btnSecondary =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const btnPrimary =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium shadow-xs transition-[filter] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const inputCls =
  'mt-2 block w-full rounded-md border bg-background px-2.5 py-2 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-[var(--acc)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--acc)_30%,transparent)]'
const th = 'px-3 py-2.5 text-xs font-medium uppercase text-muted-foreground first:pl-0 last:pr-0'
const td = 'px-3 py-2.5 first:pl-0 last:pr-0'

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6Zm11-3v8h-2V6.41l-7.79 7.8-1.42-1.42L17.59 5H13V3h8Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-emerald-500" fill="currentColor" aria-hidden>
      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1-6 7.07-7.07-1.41-1.41L11 13.17 8.17 10.34l-1.41 1.41L11 16Z" />
    </svg>
  )
}

// 替代 Tremor ProgressBar
function ProgressBar({ value, run, className }: { value: number; run: boolean; className?: string }) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--acc)_18%,transparent)]', className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
      <motion.div
        className="h-full origin-left rounded-full bg-[var(--acc)]"
        style={{ width: `${value}%` }}
        initial={run ? { scaleX: 0 } : false}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// 替代 Tremor ProgressCircle（radius 20，strokeWidth 4.5）
function ProgressCircle({ value, run }: { value: number; run: boolean }) {
  const r = 20
  const sw = 4.5
  const nr = r - sw / 2
  const c = 2 * Math.PI * nr
  const v = Math.min(100, Math.max(0, value))
  return (
    <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`} className="-rotate-90 shrink-0" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)}>
      <circle cx={r} cy={r} r={nr} fill="none" strokeWidth={sw} className="stroke-[color-mix(in_oklab,var(--acc)_18%,transparent)]" />
      <motion.circle
        cx={r}
        cy={r}
        r={nr}
        fill="none"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        className="stroke-[var(--acc)]"
        initial={run ? { strokeDashoffset: c } : false}
        animate={{ strokeDashoffset: c - (v / 100) * c, opacity: v > 0 ? 1 : 0 }}
        transition={run ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      />
    </svg>
  )
}

// 替代 radix Switch
function Switch({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-[var(--acc)]' : 'bg-muted-foreground/30',
      )}
    >
      <span className={cn('block size-4 rounded-full bg-white shadow-sm transition-transform duration-150 motion-reduce:transition-none', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  )
}

function Divider() {
  return <div className="my-10 h-px w-full bg-border" aria-hidden />
}

// split = billing-usage-06 的左标题 + 右内容；stacked = 03/04 的上下排列
function Row({ labelId, split, title, desc, children }: { labelId: string; split: boolean; title: string; desc: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={labelId} className={cn(split ? 'grid grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-3' : 'space-y-4')}>
      <div>
        <h2 id={labelId} className="scroll-mt-10 font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm/6 text-muted-foreground">{desc}</p>
      </div>
      <div className={cn('min-w-0', split && 'md:col-span-2')}>{children}</div>
    </section>
  )
}

/** 计费设置：套餐与席位、本期账单、付款方式、消费上限（移植自 Tremor Blocks billing-usage）。 */
export function BillingPlanSeats({ className, style, spendCapOn, onSpendCapChange, ...props }: BillingPlanSeatsProps) {
  const { accent, tone, layout, currency, seatsUsed, seatsTotal, showSpendCap } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const run = !reduced
  const uid = useId()
  const [inner, setInner] = useState(showSpendCap)
  const [prevDefault, setPrevDefault] = useState(showSpendCap)
  if (prevDefault !== showSpendCap) {
    setPrevDefault(showSpendCap)
    setInner(showSpendCap)
  }
  const enabled = spendCapOn ?? inner
  const setEnabled = (v: boolean) => {
    setInner(v)
    onSpendCapChange?.(v)
  }
  const [cap, setCap] = useState('200')
  const [tab, setTab] = useState('tab3')

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)
  const symbol = fmt(0).replace(/[\d.,\s]/g, '')
  const total = Math.max(seatsTotal, 1)
  const used = Math.min(seatsUsed, total)
  const items = [
    { name: 'Team Seats', quantity: used, unit: 20 },
    { name: 'Query Caching (4 GB)', quantity: 1, unit: 25 },
  ]
  const cycleTotal = items.reduce((s, i) => s + i.quantity * i.unit, 0)
  const capValue = Math.max(0, Number(cap) || 0)
  const pct = enabled && capValue > 0 ? (cycleTotal / capValue) * 100 : 0
  const split = layout === 'split'

  const tabs = [
    { id: 'tab1', label: 'Account details' },
    { id: 'tab2', label: 'Workspaces' },
    { id: 'tab3', label: 'Billing' },
  ]

  return (
    <div
      className={cn('w-full text-foreground', tone === 'card' && 'rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-8', className)}
      style={{ ['--acc' as string]: accent, ['--acc-ink' as string]: inkFor(accent), ...style }}
    >
      <h1 className="text-lg font-semibold text-foreground">Billing</h1>
      <p className="mt-1 text-sm/6 text-muted-foreground">Update your payment information or switch plans according to your needs</p>

      <div role="tablist" aria-label="Settings" className="mt-8 flex gap-6 overflow-x-auto border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
              const i = tabs.findIndex((x) => x.id === tab)
              const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
              setTab(next.id)
              ;(e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]')[tabs.indexOf(next)])?.focus()
            }}
            className={cn(
              '-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2.5 text-sm font-medium transition-colors outline-none focus-visible:text-foreground focus-visible:underline',
              tab === t.id ? 'border-[var(--acc)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 和上游一样：只演示 Billing 标签的内容 */}
      <div className="mt-8" role="tabpanel">
        <Row labelId={`${uid}-plan`} split={split} title="Plan" desc="Your workspace plan and how often you are billed.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="flex items-center space-x-2">
                <span className="text-sm/8 font-medium text-foreground">Team</span>
                <span className="inline-flex items-center self-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Annual</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {fmt(100)}/month <span className="font-normal">(incl. VAT)</span>
              </p>
              <button type="button" className={cn(btnSecondary, 'mt-6')}>
                Manage plans
              </button>
            </div>
            <div>
              <p className="text-sm/8 font-medium text-foreground">Billing period</p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                Monthly <span className="font-normal">(renews 20/08/26)</span>
              </p>
              <button type="button" className={cn(btnSecondary, 'mt-6')}>
                Change billing period
              </button>
            </div>
          </div>
        </Row>
        <Divider />
        <Row labelId={`${uid}-seats`} split={split} title="Seats" desc="Members who can sign in to this workspace.">
          <p className="text-sm font-medium text-foreground">Remaining seats</p>
          <ProgressBar value={(used / total) * 100} run={run} className="mt-2" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center space-x-2">
              <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-foreground tabular-nums">{used}</span>
              <span className="text-sm text-muted-foreground">of {total} seats used</span>
            </p>
            <button type="button" className={btnSecondary}>
              Manage seats
            </button>
          </div>
        </Row>
        <Divider />
        <Row labelId={`${uid}-overview`} split={split}
          title="Billing overview"
          desc={
            <>
              Your workspace is on the team plan. The next payment of {fmt(cycleTotal)} will occur end of December.{' '}
              <a href="#plans" className="inline-flex items-center gap-1 text-[var(--acc)] outline-none hover:underline hover:underline-offset-4 focus-visible:underline">
                View plans
                <ExternalIcon />
              </a>
            </>
          }
        >
          <h4 className="text-sm font-semibold text-foreground">Current billing cycle (Nov 30 – Dec 31)</h4>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground">
              <thead>
                <tr className="border-b">
                  <th className={cn(th, 'text-left')}>Item</th>
                  <th className={cn(th, 'text-right')}>Quantity</th>
                  <th className={cn(th, 'hidden text-right sm:table-cell')}>Unit price</th>
                  <th className={cn(th, 'text-right')}>Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.name}>
                    <td className={cn(td, 'text-foreground')}>{item.name}</td>
                    <td className={cn(td, 'text-right tabular-nums')}>{item.quantity}</td>
                    <td className={cn(td, 'hidden text-right tabular-nums sm:table-cell')}>{fmt(item.unit)}</td>
                    <td className={cn(td, 'text-right tabular-nums')}>{fmt(item.quantity * item.unit)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <th scope="row" colSpan={2} className={cn(td, 'text-left font-medium text-foreground sm:hidden')}>
                    Total
                  </th>
                  <th scope="row" colSpan={3} className={cn(td, 'hidden text-left font-medium text-foreground sm:table-cell')}>
                    Total
                  </th>
                  <td className={cn(td, 'text-right font-semibold text-foreground tabular-nums')}>{fmt(cycleTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Row>
        <Divider />
        <Row labelId={`${uid}-payment`} split={split} title="Payment method" desc="Payments will be taken from the card listed below, and you can update it by adding a new card.">
          <div className="flex justify-end">
            <button type="button" className={btnPrimary} style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}>
              Add new card
            </button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-muted-foreground">
              <thead>
                <tr className="border-b">
                  <th className={cn(th, 'text-left')}>Provider</th>
                  <th className={cn(th, 'text-left')}>Status</th>
                  <th className={cn(th, 'hidden text-left sm:table-cell')}>Type</th>
                  <th className={cn(th, 'text-left')}>Last 4</th>
                  <th className={cn(th, 'hidden text-left sm:table-cell')}>Exp. Date</th>
                  <th className={cn(th, 'text-right')}>
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cn(td, 'text-foreground')}>
                    <span className="inline-flex items-center gap-2">
                      {/* 虚构的卡组织标记 */}
                      <svg viewBox="0 0 28 18" className="h-[18px] w-7 shrink-0" aria-hidden>
                        <rect width="28" height="18" rx="3" className="fill-muted" />
                        <path d="M9 13 13 5h2l-4 8H9Zm5 0 4-8h2l-4 8h-2Z" fill="var(--acc)" />
                      </svg>
                      Northcard
                    </span>
                  </td>
                  <td className={td}>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckIcon />
                      Active
                    </span>
                  </td>
                  <td className={cn(td, 'hidden sm:table-cell')}>Credit</td>
                  <td className={cn(td, 'tabular-nums')}>•••• 4242</td>
                  <td className={cn(td, 'hidden tabular-nums sm:table-cell')}>1/2028</td>
                  <td className={cn(td, 'text-right')}>
                    <a href="#edit-card" className="font-medium text-[var(--acc)] outline-none hover:brightness-110 focus-visible:underline">
                      Edit
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Row>
        <Divider />
        <form onSubmit={(e) => e.preventDefault()}>
          <Row labelId={`${uid}-spend`} split={split} title="Cost spend control" desc="Set hard caps for on-demand charges.">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <ProgressCircle value={pct} run={run} />
                <div>
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {enabled ? `${fmt(cycleTotal)} / ${capValue} (${pct.toFixed(1)}%)` : `${symbol}0 / 0 (0%)`}
                  </p>
                  <label htmlFor={`${uid}-switch`} className="text-sm text-muted-foreground">
                    {enabled ? 'Spend management enabled' : 'Spend management disabled'}
                  </label>
                </div>
              </div>
              <Switch id={`${uid}-switch`} checked={enabled} onChange={setEnabled} />
            </div>
            <AnimatePresence initial={false}>
              {enabled && (
                <motion.div
                  key="cap"
                  className="overflow-hidden"
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label htmlFor={`${uid}-cap`} className="text-sm font-medium text-foreground">
                        Set amount ({symbol})
                      </label>
                      <input id={`${uid}-cap`} name="hard-cap" type="number" min={0} value={cap} onChange={(e) => setCap(e.target.value)} className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor={`${uid}-email`} className="text-sm font-medium text-foreground">
                        Provide email for notifications
                      </label>
                      <input id={`${uid}-email`} name="email" type="email" placeholder="admin@company.com" className={inputCls} />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end pb-1">
                    <button type="submit" className={btnPrimary} style={{ background: 'var(--acc)', color: 'var(--acc-ink)' }}>
                      Update
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Row>
        </form>
      </div>
    </div>
  )
}
