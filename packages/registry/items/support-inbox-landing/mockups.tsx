// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Gonzalo Chalé
// Source: https://github.com/gonzalochale/saas-landing-template/blob/7bc36b2/components/hero.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'
import { Avatar, Icon } from './parts'

const THREADS = [
  { name: 'Dana Whitfield', subject: 'Refund for the annual plan', preview: 'Hi, I was charged twice on the 3rd and would like…', time: '2m', tag: 'Billing', unread: true, active: true },
  { name: 'Kofi Mensah', subject: 'Can we export invoices as CSV?', preview: 'We close the books on Friday and need every…', time: '14m', tag: 'Feature', unread: true },
  { name: 'Ilse Vandermeer', subject: 'SSO login loops back to sign-in', preview: 'After the IdP redirect I land on the login page…', time: '38m', tag: 'Bug', unread: false },
  { name: 'Ren Takahashi', subject: 'Adding a second shared mailbox', preview: 'Our EU team wants their own address but the…', time: '1h', tag: 'Setup', unread: false },
  { name: 'Marisol Ortega', subject: 'Thank you, that fixed it', preview: 'Just confirming the webhook is arriving now…', time: '3h', tag: 'Resolved', unread: false },
]

const TAG_TONE: Record<string, string> = {
  Billing: 'bg-amber-500/15 text-amber-500',
  Feature: 'bg-violet-500/15 text-violet-500',
  Bug: 'bg-rose-500/15 text-rose-500',
  Setup: 'bg-sky-500/15 text-sky-500',
  Resolved: 'bg-emerald-500/15 text-emerald-500',
}

/** 共享收件箱的三栏界面。全部是 JSX，容器变窄时依次收起会话栏和文件夹栏。 */
export function InboxMock({ brand, className }: { brand: string; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <div className={cn('@container/mock overflow-hidden rounded-[calc(var(--radius)*1.6)] border border-border bg-card text-left shadow-[0_30px_80px_-30px_rgb(10_40_40/0.35)]', className)}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-[#ff6159]/80" />
          <i className="size-2.5 rounded-full bg-[#ffbd2e]/80" />
          <i className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="mx-auto flex h-6 w-full max-w-[260px] items-center justify-center gap-1.5 rounded-full bg-muted text-[11px] text-muted-foreground">
          <Icon name="search" className="size-3" />
          Search {brand}
        </span>
        <span className="w-12" aria-hidden />
      </div>
      <div className="flex h-[21rem] @2xl/mock:h-[26rem]">
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/50 p-3 text-[12.5px] text-muted-foreground @3xl/mock:flex" aria-hidden>
          <span className="mb-2 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary text-[12px] font-semibold text-primary-foreground">
            <Icon name="plus" className="size-3.5" />
            New message
          </span>
          {[
            ['inbox', 'Inbox', '12', true],
            ['users', 'Mine', '4', false],
            ['mail', 'Unassigned', '3', false],
            ['send', 'Sent', '', false],
            ['note', 'Drafts', '2', false],
          ].map(([icon, label, count, active]) => (
            <span key={label as string} className={cn('flex items-center gap-2 rounded-lg px-2.5 py-1.5', active && 'bg-card font-semibold text-foreground shadow-sm')}>
              <Icon name={icon as string} className="size-3.5" />
              {label as string}
              <span className="ml-auto text-[11px]">{count as string}</span>
            </span>
          ))}
          <p className="mt-4 px-2.5 text-[10.5px] font-semibold tracking-wide uppercase">Tags</p>
          {['Billing', 'Bug', 'Feature', 'Setup'].map((tag) => (
            <span key={tag} className="flex items-center gap-2 px-2.5 py-1">
              <i className="size-2 rounded-full bg-primary/60" />
              {tag}
            </span>
          ))}
        </aside>
        <div className="min-w-0 flex-1 overflow-hidden border-border @xl/mock:flex-none @xl/mock:basis-[15.5rem] @xl/mock:border-r @3xl/mock:basis-[17.5rem]">
          <div className="flex items-center justify-between px-4 pt-3 text-[12px]">
            <span className="font-semibold text-foreground">Inbox</span>
            <span className="text-muted-foreground">Newest first</span>
          </div>
          <ul className="mt-2">
            {THREADS.map((thread) => (
              <li key={thread.name} className={cn('flex gap-2.5 border-t border-border px-4 py-2.5', thread.active && 'bg-primary/[0.07]')}>
                <Avatar name={thread.name} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('truncate text-[12.5px]', thread.unread ? 'font-semibold text-foreground' : 'text-foreground/80')}>{thread.name}</span>
                    {thread.unread && <i className="size-1.5 rounded-full bg-primary" />}
                    <span className="ml-auto shrink-0 text-[10.5px] text-muted-foreground">{thread.time}</span>
                  </div>
                  <p className="truncate text-[12px] text-foreground/85">{thread.subject}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <p className="hidden min-w-0 flex-1 truncate text-[11px] text-muted-foreground @2xl/mock:block">{thread.preview}</p>
                    <span className={cn('shrink-0 rounded px-1.5 py-px text-[10px] font-medium', TAG_TONE[thread.tag])}>{thread.tag}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden min-w-0 flex-1 flex-col @xl/mock:flex">
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <Avatar name="Dana Whitfield" size={30} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">Refund for the annual plan</p>
              <p className="truncate text-[11px] text-muted-foreground">Dana Whitfield · dana@duetco.example · Pro plan</p>
            </div>
            <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10.5px] text-muted-foreground @2xl/mock:flex">
              <Icon name="clock" className="size-3" />
              Reply in 4 min
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-hidden px-4 py-3.5 text-[12px] leading-relaxed">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-3.5 py-2.5 text-foreground/90">
              Hi, I was charged twice on the 3rd for the annual plan. Could you refund the duplicate? Order 48213 and 48219.
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 px-3 py-2 text-foreground/85">
              <Icon name="note" className="mt-0.5 size-3.5 text-amber-500" />
              <span>
                <b className="font-semibold">Internal note · Tomás</b>
                <br />
                Confirmed in Stripe. Refund 48219, keep 48213.
              </span>
            </div>
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-primary-foreground">
              Hi Dana, sorry about that. I have refunded order 48219 and it should reach your card in 3 to 5 business days.
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Avatar name="Maya Ito" size={18} />
              Maya is typing
              <span className="flex gap-0.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.i
                    key={i}
                    className="size-1 rounded-full bg-muted-foreground"
                    animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.18, ease: 'easeInOut' }}
                  />
                ))}
              </span>
            </div>
          </div>
          <div className="m-3 mt-0 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground shadow-sm">
            <Icon name="bolt" className="size-3.5 text-primary" />
            <span className="truncate">/refund-confirmed</span>
            <span className="ml-auto grid h-6 place-items-center rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground">Send</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 自动化规则：一张「如果…就…」卡片。 */
export function RuleMock() {
  const rows = [
    ['When', 'Message contains', '"refund" or "charged twice"'],
    ['And', 'Customer plan is', 'Pro or Business'],
    ['Then', 'Assign to', 'Billing team'],
    ['Then', 'Reply with macro', '/refund-received'],
  ]
  return (
    <div className="rounded-[calc(var(--radius)*1.4)] border border-border bg-card p-4 shadow-sm @2xl:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="bolt" className="size-4 text-primary" />
          Route billing questions
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500">
          <i className="size-1.5 rounded-full bg-emerald-500" />
          Live · 214 runs this week
        </span>
      </div>
      <div className="space-y-2">
        {rows.map(([lead, label, value], i) => (
          <div key={i} className="flex items-center gap-2.5 text-[12.5px]">
            <span className={cn('w-11 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide', lead === 'Then' ? 'text-primary' : 'text-muted-foreground')}>{lead}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2">
              <span className="shrink-0 text-muted-foreground">{label}</span>
              <span className="truncate font-medium text-foreground">{value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const BARS = [
  ['Mon', 62],
  ['Tue', 48],
  ['Wed', 41],
  ['Thu', 36],
  ['Fri', 29],
  ['Sat', 22],
  ['Sun', 19],
] as const

/** 报表：首次响应时间逐日下降。 */
export function ReportMock() {
  return (
    <div className="rounded-[calc(var(--radius)*1.4)] border border-border bg-card p-4 shadow-sm @2xl:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Median first response</p>
          <p className="mt-1 text-3xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: 'var(--display-tracking)' }}>
            19 min
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-500">-69% since Monday</span>
      </div>
      <div className="mt-5 flex h-36 items-end gap-2.5" role="img" aria-label="Median first response time by day, falling from 62 to 19 minutes">
        {BARS.map(([day, value], i) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end">
              <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.round(value * 1.6)}px`, opacity: 0.35 + (i / (BARS.length - 1)) * 0.65 }} />
            </div>
            <span className="text-[10.5px] text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
