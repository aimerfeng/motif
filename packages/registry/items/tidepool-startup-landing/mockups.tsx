// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/components/Video/index.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { Avatar, Icon } from './parts'

const PAYOUTS = [
  ['PO-20418', 'Mar 28', '$84,210.40', '312 orders', 'Matched', 'ok'],
  ['PO-20417', 'Mar 27', '$61,902.15', '244 orders', 'Matched', 'ok'],
  ['PO-20416', 'Mar 26', '$47,880.00', '187 orders', 'Review', 'warn'],
  ['PO-20415', 'Mar 25', '$72,455.90', '290 orders', 'Matched', 'ok'],
  ['PO-20414', 'Mar 24', '$39,120.25', '141 orders', 'Pending', 'idle'],
] as const

const TONE: Record<string, string> = {
  ok: 'bg-emerald-500/15 text-emerald-500',
  warn: 'bg-amber-500/15 text-amber-500',
  idle: 'bg-foreground/10 text-muted-foreground',
}

/** 对账看板：三张指标卡 + 环形匹配率 + 打款列表。 */
export function ReconcileMock({ brand, className }: { brand: string; className?: string }) {
  const rate = 0.986
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <div className={cn('@container/mock overflow-hidden rounded-[calc(var(--radius)*1.3)] border border-border bg-card text-left', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5 text-[12px] text-muted-foreground">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
          <i className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="mx-auto">{brand} · Payouts · March 2026</span>
        <span className="w-10" aria-hidden />
      </div>
      <div className="p-4 @2xl/mock:p-6">
        <div className="grid gap-3 @xl/mock:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
            <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="7" />
              <circle cx="32" cy="32" r={R} fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * rate} ${C}`} />
            </svg>
            <div>
              <p className="text-[11px] text-muted-foreground">Auto-match rate</p>
              <p className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)' }}>
                98.6%
              </p>
            </div>
          </div>
          {[
            ['Reconciled', '$1.28M', '4,211 orders'],
            ['Needs review', '41', '$12,480 open'],
          ].map(([label, value, note]) => (
            <div key={label} className="hidden rounded-xl border border-border bg-background p-4 @xl/mock:block">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)' }}>
                {value}
              </p>
              <p className="text-[11px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border text-[12.5px]">
          {PAYOUTS.map(([id, date, amount, orders, status, tone], i) => (
            <div key={id} className={cn('flex items-center gap-3 px-4 py-2.5', i > 0 && 'border-t border-border')}>
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name="wallet" className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                  {id}
                </span>
                <span className="block text-[11px] text-muted-foreground">{date}</span>
              </span>
              <span className="hidden text-muted-foreground @xl/mock:block">{orders}</span>
              <span className="font-medium text-foreground">{amount}</span>
              <span className={cn('w-[4.5rem] rounded-full px-2 py-0.5 text-center text-[11px] font-semibold', TONE[tone])}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 播放按钮：外圈脉冲用 motion 做，减少动态效果时只留静态圆环。 */
export function PlayButton({ label }: { label: string }) {
  const reduced = useReducedMotion()
  return (
    <a href="#" onClick={(e) => e.preventDefault()} aria-label={label} className="group relative grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_40px_-8px_var(--primary)] outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40">
      {!reduced && (
        <motion.span className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeOut' }} aria-hidden />
      )}
      <Icon name="play" className="ml-1 size-8 fill-current" />
    </a>
  )
}

/** 银行入账与订单的匹配示意：中间用曲线连起来。 */
export function MatchMock() {
  const banks = [
    ['Deposit  #88121', '$12,480.00', 'Mar 28'],
    ['Deposit  #88122', '$7,905.40', 'Mar 28'],
    ['Deposit  #88123', '$3,318.75', 'Mar 27'],
  ]
  const groups = [
    ['Orders 41022 to 41067', '46 orders · fees $374.40'],
    ['Orders 41068 to 41091', '24 orders · fees $237.16'],
    ['Orders 41092 to 41103', '12 orders · fees $99.56'],
  ]
  return (
    <div className="rounded-[calc(var(--radius)*1.5)] border border-border bg-card p-4 shadow-[0_18px_50px_-30px_rgb(9_14_52/0.4)] @2xl:p-6">
      <div className="grid grid-cols-[1fr_3rem_1fr] items-center @2xl:grid-cols-[1fr_5rem_1fr]">
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Bank</p>
        <span />
        <p className="mb-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Marketplace</p>
        {banks.map(([title, amount, date], i) => (
          <div key={title} className="contents">
            <div className="my-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-[12px]">
              <p className="font-semibold text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {title}
              </p>
              <p className="text-muted-foreground">
                {amount} · {date}
              </p>
            </div>
            <svg viewBox="0 0 80 20" preserveAspectRatio="none" className="h-5 w-full text-primary" aria-hidden>
              <path d="M0 10 C 30 10, 50 10, 80 10" stroke="currentColor" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" strokeDasharray={i === 2 ? '4 4' : undefined} />
              <circle cx="40" cy="10" r="4" fill="currentColor" />
            </svg>
            <div className={cn('my-1.5 rounded-xl border bg-background px-3 py-2.5 text-[12px]', i === 2 ? 'border-amber-500/50' : 'border-border')}>
              <p className="font-semibold text-foreground">{groups[i]![0]}</p>
              <p className="text-muted-foreground">{groups[i]![1]}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-[12px] font-medium text-emerald-500">
        <Icon name="check" className="size-4" />2 of 3 matched exactly. The third is $0.02 off and is waiting for your review.
      </p>
    </div>
  )
}

const SELLERS = [
  ['Harlow Ceramics', '$4,820.00', '$385.60', '$4,434.40'],
  ['North Pier Prints', '$3,116.50', '$249.32', '$2,867.18'],
  ['Juniper & Oak', '$2,540.00', '$203.20', '$2,336.80'],
  ['Studio Marlowe', '$1,978.90', '$158.31', '$1,820.59'],
]

/** 卖家分账表。 */
export function LedgerMock() {
  return (
    <div className="rounded-[calc(var(--radius)*1.5)] border border-border bg-card p-4 shadow-[0_18px_50px_-30px_rgb(9_14_52/0.4)] @2xl:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Ready to release</p>
          <p className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)' }}>
            $412,880.00
          </p>
        </div>
        <span className="rounded-[calc(var(--radius)*0.6)] bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground">Release 128 payouts</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-border text-[12.5px]">
        <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-2 bg-muted/60 px-3.5 py-2 text-[11px] font-semibold text-muted-foreground @xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <span>Seller</span>
          <span className="hidden text-right @xl:block">Gross</span>
          <span className="text-right">Fee 8%</span>
          <span className="text-right">Payout</span>
        </div>
        {SELLERS.map(([name, gross, fee, payout]) => (
          <div key={name} className="grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 border-t border-border px-3.5 py-2.5 @xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={name} size={24} />
              <span className="truncate font-medium text-foreground">{name}</span>
            </span>
            <span className="hidden text-right text-muted-foreground @xl:block">{gross}</span>
            <span className="text-right text-muted-foreground">{fee}</span>
            <span className="text-right font-semibold text-foreground">{payout}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
