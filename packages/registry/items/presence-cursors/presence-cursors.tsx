// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/cursor/index.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@motif/runtime'
import { Children, useRef, useState, type CSSProperties, type HTMLAttributes, type SVGProps } from 'react'

/* @motif:defaults */
export const defaults = {
  count: 3,
  palette: ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#6366f1'],
  tagStyle: 'soft',
  cursorSize: 14,
  showMessages: true,
  speed: 1,
  wander: 0.35,
}
/* @motif:end */

export type CursorProps = HTMLAttributes<HTMLSpanElement>

export const Cursor = ({ className, children, ...props }: CursorProps) => (
  <span className={cn('pointer-events-none relative select-none', className)} {...props}>
    {children}
  </span>
)

export type CursorPointerProps = SVGProps<SVGSVGElement>

export const CursorPointer = ({ className, ...props }: CursorPointerProps) => (
  <svg aria-hidden="true" className={cn('size-3.5', className)} fill="none" focusable="false" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M19.438 6.716 1.115.05A.832.832 0 0 0 .05 1.116L6.712 19.45a.834.834 0 0 0 1.557.025l3.198-8 7.995-3.2a.833.833 0 0 0 0-1.559h-.024Z"
      fill="currentColor"
    />
  </svg>
)

export type CursorBodyProps = HTMLAttributes<HTMLSpanElement>

export const CursorBody = ({ children, className, ...props }: CursorBodyProps) => (
  <span
    className={cn(
      'relative ml-3.5 flex flex-col whitespace-nowrap rounded-xl py-1 pr-3 pl-2.5 text-xs',
      Children.count(children) > 1 && 'rounded-tl [&>:first-child]:opacity-70',
      'bg-secondary text-foreground',
      className,
    )}
    {...props}
  >
    {children}
  </span>
)

export type CursorNameProps = HTMLAttributes<HTMLSpanElement>

export const CursorName = (props: CursorNameProps) => <span {...props} />

export type CursorMessageProps = HTMLAttributes<HTMLSpanElement>

export const CursorMessage = (props: CursorMessageProps) => <span {...props} />

/* ---------- Motif: a simulated multiplayer layer built from the primitives above ---------- */

export type Collaborator = { name: string; messages: string[] }

const PEOPLE: Collaborator[] = [
  { name: '@mira', messages: ['Can we adjust the color?', 'Love this spacing'] },
  { name: '@theo', messages: ['One more thing...', 'Moving this up'] },
  { name: '@juno', messages: ['Another new component?!', 'Ship it'] },
  { name: '@kasper', messages: ['Looks great!', 'Check the mobile view'] },
  { name: '@ines', messages: ['Is this the final copy?', 'Nice'] },
  { name: '@ravi', messages: ['Try 24px here', 'Aligned now'] },
]

/** One cycle per cursor: travel to the next spot, rest, maybe type a message. */
const CYCLE = 8
const TRAVEL = 2.6
const TYPE_START = 3.1
const TYPE_END = 7.3
const CHARS_PER_SECOND = 16

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function rgb(hex: string): [number, number, number] {
  const v = Number.parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrast(a: [number, number, number], b: [number, number, number]) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Upstream look (`bg-x-50 text-x-700`) for any color, with the ink darkened until it reads. */
function tagColors(hex: string, tagStyle: string) {
  const base = rgb(hex)
  if (tagStyle === 'solid') {
    return { background: hex, color: luminance(base) > 0.36 ? '#0a0a0a' : '#ffffff' }
  }
  const bg = mix(base, [255, 255, 255], 0.88)
  let ink = mix(base, [0, 0, 0], 0.3)
  for (let i = 0; i < 12 && contrast(ink, bg) < 4.8; i++) ink = mix(ink, [0, 0, 0], 0.18)
  return { background: toHex(bg), color: toHex(ink) }
}

export type PresenceCursorsProps = Partial<typeof defaults> & {
  people?: Collaborator[]
  className?: string
  style?: CSSProperties
}

/**
 * An overlay of other people's cursors drifting over its parent (which needs `position: relative`),
 * pausing now and then to type a message. Purely decorative: hidden from assistive tech.
 */
export function PresenceCursors({ people = PEOPLE, className, style, ...props }: PresenceCursorsProps) {
  const { count, palette, speed, showMessages, tagStyle, cursorSize, wander } = { ...defaults, ...props }
  const hostRef = useRef<HTMLDivElement>(null)
  const cursorRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [texts, setTexts] = useState<string[]>([])
  const textsRef = useRef('')
  const n = Math.max(1, Math.min(count, people.length))

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const host = hostRef.current
      if (!host) return
      const w = host.clientWidth
      const h = host.clientHeight
      const next: string[] = []
      for (let i = 0; i < n; i++) {
        const local = time + i * (CYCLE / n) + 0.7
        const seg = Math.floor(local / CYCLE)
        const t = local - seg * CYCLE
        // 每个人有自己的「家」，漫游幅度决定离家多远。
        const homeX = 0.12 + ((i * 0.37 + 0.21) % 1) * 0.6
        const homeY = 0.14 + ((i * 0.53 + 0.33) % 1) * 0.62
        const spot = (k: number) => ({
          x: homeX + (hash(i * 97 + k) - 0.5) * wander,
          y: homeY + (hash(i * 61 + k + 0.5) - 0.5) * wander * 0.9,
        })
        const a = spot(seg)
        const b = spot(seg + 1)
        const p = ease(Math.min(1, t / TRAVEL))
        const arc = Math.sin(Math.PI * p) * 0.18
        let x = a.x + (b.x - a.x) * p - (b.y - a.y) * arc
        let y = a.y + (b.y - a.y) * p + (b.x - a.x) * arc
        // 停下时也轻轻晃动，像人手搭在鼠标上。
        x += Math.sin(time * 1.3 + i * 2.1) * 0.006
        y += Math.cos(time * 1.1 + i * 1.7) * 0.006
        const px = Math.min(Math.max(x, 0.03) * w, Math.max(8, w - 150))
        const py = Math.min(Math.max(y, 0.04) * h, Math.max(8, h - 60))
        const el = cursorRefs.current[i]
        if (el) el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`

        let text = ''
        const person = people[i]!
        if (showMessages && tagStyle !== 'pointer' && person.messages.length > 0 && (seg + i) % 3 !== 2 && t > TYPE_START && t < TYPE_END) {
          const message = person.messages[seg % person.messages.length]!
          text = message.slice(0, Math.floor((t - TYPE_START) * CHARS_PER_SECOND))
        }
        next.push(text)
      }
      const key = next.join('\u0000')
      if (key !== textsRef.current) {
        textsRef.current = key
        setTexts(next)
      }
    },
    { speed, reducedMotion: 'static', staticTime: 5.6 },
  )

  return (
    <div ref={hostRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={style}>
      {people.slice(0, n).map((person, i) => {
        const color = palette[i % palette.length] ?? '#10b981'
        const colors = tagColors(color, tagStyle)
        const text = texts[i] ?? ''
        return (
          <span
            key={person.name}
            ref={(el) => {
              cursorRefs.current[i] = el
            }}
            className="absolute top-0 left-0 will-change-transform"
          >
            <Cursor className="block">
              <CursorPointer style={{ color, width: cursorSize, height: cursorSize }} />
              {tagStyle !== 'pointer' && (
                <CursorBody style={{ ...colors, marginLeft: cursorSize }} className="w-max shadow-sm">
                  <CursorName>{person.name}</CursorName>
                  {text && <CursorMessage>{text}</CursorMessage>}
                </CursorBody>
              )}
            </Cursor>
          </span>
        )
      })}
    </div>
  )
}
