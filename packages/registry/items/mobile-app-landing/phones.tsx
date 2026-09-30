// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Bohdan (https://bohd4n.dev/)
// Source: https://github.com/bohd4nx/app-landing/blob/8bd0798/src/components/Screenshots/index.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@motif/runtime'
import { Icon } from './parts'

export const PHONE_W = 272
export const PHONE_H = 560

/** 手机外框。屏幕内容固定用深色 UI，不随页面明暗切换。scale 用来整体缩放。 */
export function Phone({ children, scale = 1, className }: { children: ReactNode; scale?: number; className?: string }) {
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}>
        <div className="relative size-full rounded-[42px] border border-white/15 bg-[#050505] p-[7px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7),0_0_0_1px_rgb(0_0_0/0.6)]">
          <div className="relative size-full overflow-hidden rounded-[35px] bg-[#0f0e0d] text-[#f7f3ee]">
            <span className="absolute left-1/2 top-2 z-20 h-[22px] w-[74px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <StatusBar />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-[11px] text-[11px] font-semibold" aria-hidden>
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 18 12" className="h-2.5 w-3.5" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-3 w-5" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.5" />
          <rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor" />
        </svg>
      </span>
    </div>
  )
}

function TabBar({ active }: { active: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-[#0f0e0d]/95 px-3 pb-4 pt-2.5 text-white/45" aria-hidden>
      {['home', 'calendar', 'pin', 'chart', 'user'].map((icon, i) => (
        <span key={icon} className={cn('grid size-8 place-items-center', i === active && 'text-primary')}>
          <Icon name={icon} className="size-[19px]" />
        </span>
      ))}
    </div>
  )
}

const mono = { fontFamily: 'var(--font-mono)' } as const
const display = { fontFamily: 'var(--font-display)', fontWeight: 'var(--display-weight)', letterSpacing: '-0.02em' } as const

/* ---- 屏幕 1：今日训练 ---- */
export function TodayScreen({ brand }: { brand: string }) {
  const R = 44
  const C = 2 * Math.PI * R
  return (
    <div className="absolute inset-0 px-4 pt-14">
      <p className="text-[11px] text-white/50">Good morning, Jo</p>
      <p className="mt-0.5 text-[19px] leading-tight" style={display}>
        Today: tempo run
      </p>
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
        <div className="relative size-[100px] shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={R} fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="8" />
            <circle cx="50" cy="50" r={R} fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * 0.62} ${C}`} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <span>
              <span className="block text-[22px] leading-none" style={display}>
                31
              </span>
              <span className="text-[9px] text-white/50">of 50 km</span>
            </span>
          </div>
        </div>
        <div className="text-[10.5px] leading-relaxed text-white/60">
          <p className="text-white">Week 9 of 16</p>
          <p>Half marathon plan</p>
          <p className="mt-1.5 flex items-center gap-1 text-primary">
            <Icon name="flame" className="size-3" /> 12-day streak
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          ['10 min', 'Easy warm-up', '6:10 /km'],
          ['3 x 8 min', 'Tempo', '5:05 /km'],
          ['5 min', 'Cool-down', '6:30 /km'],
        ].map(([time, label, pace], i) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 text-[11px]">
            <span className={cn('h-7 w-1 rounded-full', i === 1 ? 'bg-primary' : 'bg-white/25')} />
            <span className="flex-1">
              <span className="block font-semibold text-white">{label}</span>
              <span className="text-white/50">{time}</span>
            </span>
            <span className="text-white/70" style={mono}>
              {pace}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 grid h-11 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">Start run</div>
      <p className="sr-only">{brand}</p>
      <TabBar active={0} />
    </div>
  )
}

/* ---- 屏幕 2：跑步中 ---- */
export function RunScreen() {
  const reduced = useReducedMotion()
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e1b18,#0f0e0d_70%)]" aria-hidden />
      <svg viewBox="0 0 272 300" className="absolute inset-x-0 top-[104px] w-full" aria-hidden>
        {[40, 90, 140, 190, 240].map((v) => (
          <g key={v} stroke="white" strokeOpacity="0.05">
            <path d={`M${v} 0V300`} />
            <path d={`M0 ${v}H272`} />
          </g>
        ))}
        <path d="M-10 250C40 240 60 190 100 200S150 260 190 210 220 120 170 100 90 130 110 70 210 30 290 20" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="14" strokeLinecap="round" />
        <path d="M40 262C60 236 70 196 104 200S160 254 194 214 222 124 174 104 92 130 112 74" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="112" cy="74" r="6" fill="var(--primary)" />
        {!reduced && (
          <motion.circle cx="112" cy="74" r="6" fill="none" stroke="var(--primary)" strokeWidth="2" animate={{ r: [6, 20], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeOut' }} />
        )}
        <circle cx="40" cy="262" r="4" fill="white" fillOpacity="0.6" />
      </svg>
      <div className="relative px-5 pt-14">
        <p className="text-[11px] tracking-widest text-white/50 uppercase" style={mono}>
          Distance
        </p>
        <p className="text-[54px] leading-none" style={display}>
          7.42<span className="ml-1 text-[16px] text-white/50">km</span>
        </p>
      </div>
      <div className="absolute inset-x-3 bottom-4 rounded-3xl border border-white/10 bg-[#1a1816]/90 p-4 backdrop-blur">
        <div className="grid grid-cols-3 text-center">
          {[
            ['5:12', 'pace /km'],
            ['38:36', 'time'],
            ['156', 'bpm'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-[20px] leading-none" style={display}>
                {value}
              </p>
              <p className="mt-1 text-[10px] text-white/50">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="grid size-11 place-items-center rounded-full bg-white/10">
            <Icon name="mic" className="size-[18px]" />
          </span>
          <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Icon name="pause" className="size-6" />
          </span>
          <span className="grid size-11 place-items-center rounded-full bg-white/10">
            <Icon name="pin" className="size-[18px]" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---- 屏幕 3：训练计划 ---- */
export function PlanScreen() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const rows = [
    ['Easy run', '6 km · 6:15 /km', 'bg-emerald-400', 'Mon'],
    ['Intervals', '6 x 800 m · 3:55', 'bg-primary', 'Tue'],
    ['Tempo', '3 x 8 min · 5:05', 'bg-amber-400', 'Thu'],
    ['Long run', '16 km · 6:00 /km', 'bg-sky-400', 'Sun'],
  ]
  return (
    <div className="absolute inset-0 px-4 pt-14">
      <div className="flex items-end justify-between">
        <p className="text-[19px] leading-tight" style={display}>
          Week 9
        </p>
        <p className="text-[10.5px] text-white/50">Mar 24 to Mar 30</p>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-white/50">
        {days.map((d, i) => (
          <div key={i} className={cn('rounded-xl py-1.5', i === 1 ? 'bg-primary text-primary-foreground' : 'bg-white/[0.04]')}>
            {d}
            <span className={cn('mx-auto mt-1 block size-1 rounded-full', i === 1 ? 'bg-primary-foreground' : i < 1 ? 'bg-emerald-400' : 'bg-white/20')} />
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map(([title, meta, dot, day]) => (
          <div key={title} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 text-[11px]">
            <span className={cn('size-2 rounded-full', dot)} />
            <span className="flex-1">
              <span className="block font-semibold text-white">{title}</span>
              <span className="text-white/50">{meta}</span>
            </span>
            <span className="text-white/40">{day}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-[10.5px] leading-relaxed text-white/75">
        <span className="font-semibold text-primary">Adjusted for you.</span> Your Thursday tempo was shortened by 4 minutes after a low recovery score.
      </div>
      <TabBar active={1} />
    </div>
  )
}

/* ---- 屏幕 4：周总结 ---- */
export function SummaryScreen() {
  const bars = [6, 10, 0, 8, 0, 5, 19]
  const max = 19
  return (
    <div className="absolute inset-0 px-4 pt-14">
      <p className="text-[11px] text-white/50">This week</p>
      <p className="text-[38px] leading-none" style={display}>
        48.6<span className="ml-1 text-[14px] text-white/50">km</span>
      </p>
      <p className="mt-1 text-[10.5px] text-emerald-400">+6.2 km vs last week</p>
      <div className="mt-4 flex h-24 items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 pb-2 pt-3">
        {bars.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
            <div className={cn('w-full rounded-t-md', i === 6 ? 'bg-primary' : 'bg-white/25')} style={{ height: `${Math.max(4, (v / max) * 64)}px` }} />
            <span className="text-[9px] text-white/40">{'MTWTFSS'[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-primary/90 to-primary/60 p-3.5 text-primary-foreground">
        <p className="text-[10px] font-semibold tracking-widest uppercase opacity-80" style={mono}>
          New personal best
        </p>
        <p className="mt-1 text-[24px] leading-none" style={display}>
          5K · 24:08
        </p>
        <p className="mt-1 text-[10.5px] opacity-80">47 seconds faster than in January</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10.5px]">
        {[
          ['Avg pace', '5:41 /km'],
          ['Recovery', '84 / 100'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/[0.04] p-2.5">
            <p className="text-white/50">{label}</p>
            <p className="mt-0.5 text-[14px] font-semibold text-white" style={mono}>
              {value}
            </p>
          </div>
        ))}
      </div>
      <TabBar active={3} />
    </div>
  )
}
