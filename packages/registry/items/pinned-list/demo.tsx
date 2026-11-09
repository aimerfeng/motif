// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/apps/docs/examples/pinned-list.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef, useState, type ReactNode } from 'react'
import { PinnedList, defaults, type PinnedListItem } from './pinned-list'

const Icon = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
    {children}
  </svg>
)

const ITEMS: PinnedListItem[] = [
  {
    icon: (
      <Icon>
        <path d="M4 5h16v11H9l-5 4z" />
      </Icon>
    ),
    id: 'conv-nadia',
    meta: '“Numbers are in — they look good.”',
    title: 'Nadia Ferreira',
  },
  {
    icon: (
      <Icon>
        <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
      </Icon>
    ),
    id: 'team-launch',
    meta: '8 members · active now',
    title: 'Launch War Room',
  },
  {
    icon: (
      <Icon>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 13h6M9 17h4" />
      </Icon>
    ),
    id: 'doc-roadmap',
    meta: 'Edited yesterday by Hiro',
    title: 'Q3 Roadmap Draft',
  },
  {
    icon: (
      <Icon>
        <circle cx="6" cy="6" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 8v8M18 16v-6a3 3 0 0 0-3-3h-3M14 5l-2 2 2 2" />
      </Icon>
    ),
    id: 'pr-registry',
    meta: '#482 · 2 approvals, 1 change requested',
    title: 'feat: registry bundling',
  },
  {
    icon: (
      <Icon>
        <rect height="7" rx="1.5" width="7" x="4" y="4" />
        <circle cx="17.5" cy="7.5" r="3.5" />
        <path d="m7.5 14 3.5 6H4z" />
        <rect height="7" rx="3.5" width="7" x="14" y="14" />
      </Icon>
    ),
    id: 'design-tokens',
    meta: '3 new comments',
    title: 'Design tokens · v4',
  },
  {
    icon: (
      <Icon>
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </Icon>
    ),
    id: 'conv-hiro',
    meta: '“Shipping the fix tonight.”',
    title: 'Hiro Tanaka',
  },
  {
    icon: (
      <Icon>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.1.7 3.5 2.6 3.5 5.7" />
      </Icon>
    ),
    id: 'team-support',
    meta: '12 members · 4 unread',
    title: 'Customer Support',
  },
  {
    icon: (
      <Icon>
        <path d="M3 10v4h3l8 5V5l-8 5zM18 9a4 4 0 0 1 0 6" />
      </Icon>
    ),
    id: 'chan-announcements',
    meta: 'Last post 3h ago',
    title: 'Announcements',
  },
]

const DEFAULT_PINNED = ['conv-nadia', 'team-launch', 'doc-roadmap']

/** 自动播放一轮 10 秒：置顶两行碰到上限，再依次取消，最后回到初始状态。 */
const CYCLE = 10
const SCRIPT: [number, string, 'pin' | 'unpin'][] = [
  [1.4, 'design-tokens', 'pin'],
  [3.0, 'conv-hiro', 'pin'],
  [4.8, 'team-launch', 'unpin'],
  [6.4, 'design-tokens', 'unpin'],
  [8.0, 'conv-hiro', 'unpin'],
  [9.0, 'team-launch', 'pin'],
]

function scripted(time: number, max: number): string[] {
  const t = time % CYCLE
  let pinned = DEFAULT_PINNED.slice(0, max)
  for (const [at, id, action] of SCRIPT) {
    if (t < at) break
    if (action === 'unpin') pinned = pinned.filter((pinnedId) => pinnedId !== id)
    else if (!pinned.includes(id) && pinned.length < max) pinned = [...pinned, id]
  }
  return pinned
}

const same = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id))

const Kbd = ({ children }: { children: ReactNode }) => <kbd className="rounded border border-border bg-muted px-1.5 font-mono">{children}</kbd>

const BUTTON =
  'rounded-lg px-2.5 py-1.5 font-medium text-xs outline-none transition-[background-color,border-color,color,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

export function Demo(props: Partial<typeof defaults>) {
  const maxPinned = props.maxPinned ?? defaults.maxPinned
  const label = props.label ?? defaults.label
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string[]>(() => DEFAULT_PINNED.slice(0, maxPinned))
  const [manual, setManual] = useState<string[] | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, maxPinned)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.8 },
  )

  const pinned = manual ?? auto

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4 sm:p-6">
      <div className="flex h-[26rem] w-full max-w-[640px] gap-4 overflow-hidden rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
          <header className="flex shrink-0 items-baseline justify-between gap-3">
            <h3 className="truncate font-semibold text-base text-foreground tracking-tight">{label}</h3>
            <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
              {pinned.length} / {maxPinned} pinned
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <PinnedList {...props} emptyPinnedMessage="Nothing pinned — pin a row to keep it up here." items={ITEMS} onPinnedChange={setManual} pinnedIds={pinned} />
          </div>
        </div>

        <aside className="hidden w-52 shrink-0 flex-col gap-3 rounded-xl border border-border bg-background/70 p-3 sm:flex">
          <div>
            <p className="font-medium text-foreground text-sm">Try it</p>
            <p className="mt-1 text-muted-foreground text-xs leading-relaxed">Click a row, or tab into the list and use the keys below. Pinned rows stay at the top until you unpin them.</p>
          </div>

          <ul className="flex flex-col gap-1.5 text-muted-foreground text-xs">
            <li className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Move between rows
            </li>
            <li className="flex items-center gap-1.5">
              <Kbd>P</Kbd>
              Pin / unpin the focused row
            </li>
            <li className="flex items-center gap-1.5">
              <Kbd>Home</Kbd>
              <Kbd>End</Kbd>
              First / last
            </li>
          </ul>

          <div className="mt-auto flex flex-col gap-1.5">
            <button className={`${BUTTON} border border-border bg-background text-foreground hover:bg-muted`} onClick={() => setManual(DEFAULT_PINNED.slice(0, maxPinned))} type="button">
              Reset
            </button>
            <button className={`${BUTTON} text-muted-foreground hover:bg-muted hover:text-foreground`} disabled={pinned.length === 0} onClick={() => setManual([])} type="button">
              Unpin all
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
