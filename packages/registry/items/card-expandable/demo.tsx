// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/example/expandable-demo.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
  type ExpandableProps,
} from './card-expandable'

type DemoProps = Omit<ExpandableProps, 'children'>

// 上游用 lucide 图标，这里换成手画的内联 SVG。
function Icon({ children, className = 'h-4 w-4' }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {children}
    </svg>
  )
}

const CalendarIcon = () => (
  <Icon>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
)
const ClockIcon = () => (
  <Icon className="mr-1 h-4 w-4">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)
const PinIcon = () => (
  <Icon className="mr-1 h-4 w-4">
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Icon>
)
const PeopleIcon = () => (
  <Icon className="mr-2 h-4 w-4">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
    <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.7.8 2.7 2.5 3 5.2" />
  </Icon>
)
const VideoIcon = () => (
  <Icon className="mr-2 h-4 w-4">
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
  </Icon>
)
const ChatIcon = () => (
  <Icon className="mr-2 h-4 w-4">
    <path d="M20.5 15a2 2 0 0 1-2 2H8l-4.5 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
  </Icon>
)

const ATTENDEES = [
  { name: 'Alice', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100' },
  { name: 'Bob', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' },
  { name: 'Charlie', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' },
  { name: 'David', tone: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100' },
]

// 卡片里的按钮自己处理点击，不要冒泡到触发器把卡片收起来。
const stop = (event: MouseEvent) => event.stopPropagation()

function DesignSyncCard({ isExpanded }: { isExpanded: boolean }) {
  return (
    <ExpandableTrigger aria-label="Design Sync, show meeting details" className="flex min-w-0 max-w-full justify-center">
      <ExpandableCard className="relative w-full">
        <ExpandableCardHeader>
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col items-start">
              <span className="mb-2 inline-flex items-center rounded-md border border-transparent bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900 dark:text-red-100">
                In 15 mins
              </span>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Design Sync</h3>
            </div>
            <button
              type="button"
              aria-label="Add to Calendar"
              title="Add to Calendar"
              onClick={stop}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-[background-color] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CalendarIcon />
            </button>
          </div>
        </ExpandableCardHeader>

        <ExpandableCardContent>
          <div className="mb-4 flex flex-col items-start justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <ClockIcon />
              <span>1:30PM → 2:30PM</span>
            </div>

            <ExpandableContent preset="blur-md">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <PinIcon />
                <span>Conference Room A</span>
              </div>
            </ExpandableContent>
          </div>
          <ExpandableContent preset="blur-md" stagger>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-200">
              Weekly design sync to discuss ongoing projects, share updates, and address any design-related challenges.
            </p>
            <div className="mb-4">
              <h4 className="mb-2 flex items-center text-sm font-medium text-gray-800 dark:text-gray-100">
                <PeopleIcon />
                Attendees:
              </h4>
              <div className="flex -space-x-2 overflow-hidden">
                {ATTENDEES.map(({ name, tone }) => (
                  <span
                    key={name}
                    title={name}
                    aria-label={name}
                    role="img"
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white text-sm font-medium dark:border-gray-800 ${tone}`}
                  >
                    {name[0]}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={stop}
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-[background-color] outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <VideoIcon />
                Join Meeting
              </button>
              {isExpanded && (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-[background-color] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChatIcon />
                  Open Chat
                </button>
              )}
            </div>
          </ExpandableContent>
        </ExpandableCardContent>
        <ExpandableContent preset="slide-up">
          <ExpandableCardFooter>
            <div className="flex w-full items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Weekly</span>
              <span>Next: Mon, 10:00 AM</span>
            </div>
          </ExpandableCardFooter>
        </ExpandableContent>
      </ExpandableCard>
    </ExpandableTrigger>
  )
}

export function Demo(props: DemoProps) {
  const host = useRef<HTMLDivElement>(null)
  const autoplay = useRef(true)
  const [open, setOpen] = useState(false)

  // 真实指针一动就停下自动播放，交给用户自己点或悬停。
  useEffect(() => {
    const halt = (event: PointerEvent) => {
      if (event.isTrusted) autoplay.current = false
    }
    window.addEventListener('pointermove', halt)
    return () => window.removeEventListener('pointermove', halt)
  }, [])

  // 一轮 7 秒：1 秒时展开，停到 4.8 秒收回。
  useFrameLoop(
    host,
    ({ time }) => {
      if (!autoplay.current) return
      const t = time % 7
      const next = t >= 1 && t < 4.8
      setOpen((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="flex h-full w-full items-center justify-center overflow-hidden bg-background p-4">
      <Expandable
        {...props}
        expanded={open}
        onToggle={() => {
          autoplay.current = false
          setOpen((prev) => !prev)
        }}
        initialDelay={0.2}
        className="flex w-full justify-center"
      >
        {({ isExpanded }) => <DesignSyncCard isExpanded={isExpanded} />}
      </Expandable>
    </div>
  )
}
