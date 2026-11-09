// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/components/cli-commands.tsx
// Modified by Motif; see the item's provenance.
import { cn, cssVars } from '@/lib/motif-runtime'
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  command: 'shadcn@latest add comp-149',
  defaultManager: 'pnpm',
  rememberChoice: true,
  accent: '#fafafa',
  radius: 6,
  font: 'geist',
}
/* @motif:end */

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'
const MANAGERS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun']

export type CliCommandsProps = Partial<typeof defaults> & {
  /** Controlled package manager (overrides the remembered choice). */
  manager?: PackageManager
  onManagerChange?: (manager: PackageManager) => void
  /** Force the copied state (used by the demo autoplay). */
  copied?: boolean
  className?: string
  style?: CSSProperties
}

const FONT_STACKS: Record<string, string> = {
  geist: "'Geist Mono Variable', ui-monospace, monospace",
  jetbrains: "'JetBrains Mono Variable', ui-monospace, monospace",
  plex: "'IBM Plex Mono', ui-monospace, monospace",
}

/* Replaces upstream useConfig (jotai atomWithStorage): a tiny shared store, optionally persisted. */
const STORAGE_KEY = 'motif:package-manager'
let current: PackageManager | null = null
const listeners = new Set<() => void>()
function readStored(): PackageManager | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return MANAGERS.includes(value as PackageManager) ? (value as PackageManager) : null
  } catch {
    return null
  }
}
function setShared(value: PackageManager, persist: boolean) {
  current = value
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* storage blocked */
    }
  }
  listeners.forEach((l) => l())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return { copied, copy }
}

function CopyButton({ componentSource, copied: forced, className }: { componentSource: string; copied?: boolean; className?: string }) {
  const { copied: state, copy } = useCopy()
  const copied = forced ?? state
  return (
    <div className={cn('absolute top-2 right-2', className)}>
      <button
        type="button"
        aria-label={copied ? 'Copied' : 'Copy command'}
        title="Copy"
        className="relative inline-flex size-9 items-center justify-center rounded-md text-zinc-400 outline-none hover:text-zinc-50 focus-visible:ring-2 focus-visible:ring-[var(--cli-accent)] disabled:opacity-100"
        disabled={copied}
        onClick={() => copy(componentSource)}
      >
        <div className={cn('transition-[opacity,transform] motion-reduce:transition-none', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}>
          <svg aria-hidden="true" fill="none" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.548 3.488a.75.75 0 0 1-.036 1.06l-8.572 8a.75.75 0 0 1-1.023 0l-3.429-3.2a.75.75 0 0 1 1.024-1.096l2.917 2.722 8.06-7.522a.75.75 0 0 1 1.06.036Z"
              fill="#10B981"
            />
          </svg>
        </div>
        <div className={cn('absolute transition-[opacity,transform] motion-reduce:transition-none', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}>
          <svg aria-hidden="true" className="fill-current" fill="none" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5ZM10 1H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm3 5.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5v-1H5v1a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1v1.5Z" />
          </svg>
        </div>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}

export function CliCommands({ manager, onManagerChange, copied, className, style, ...props }: CliCommandsProps) {
  const options = { ...defaults, ...props }
  const defaultManager = (MANAGERS.includes(options.defaultManager as PackageManager) ? options.defaultManager : 'pnpm') as PackageManager
  const id = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const shared = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )
  const [local, setLocal] = useState<PackageManager | null>(null)

  useEffect(() => {
    if (options.rememberChoice && current === null) {
      const stored = readStored()
      if (stored) setShared(stored, false)
    }
  }, [options.rememberChoice])

  const active: PackageManager = manager ?? (options.rememberChoice ? (shared ?? defaultManager) : (local ?? defaultManager))

  const commands: Record<PackageManager, string> = {
    pnpm: `pnpm dlx ${options.command}`,
    npm: `npx ${options.command}`,
    yarn: `yarn dlx ${options.command}`,
    bun: `bunx --bun ${options.command}`,
  }

  const select = (value: PackageManager) => {
    if (options.rememberChoice) setShared(value, true)
    else setLocal(value)
    onManagerChange?.(value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1
    if (event.key === 'ArrowRight') next = (index + 1) % MANAGERS.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + MANAGERS.length) % MANAGERS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = MANAGERS.length - 1
    if (next < 0) return
    event.preventDefault()
    select(MANAGERS[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      className={cn('relative', className)}
      style={cssVars(
        { '--cli-accent': options.accent, '--cli-radius': `${options.radius}px`, '--cli-font': FONT_STACKS[options.font] ?? FONT_STACKS.geist },
        style,
      )}
    >
      <div className="rounded-[var(--cli-radius)] bg-zinc-950">
        <div
          role="tablist"
          aria-label="Package manager"
          className="flex h-auto w-full justify-start rounded-none border-b border-zinc-800 bg-transparent px-4 py-0 pr-12"
        >
          {MANAGERS.map((pkg, index) => {
            const selected = pkg === active
            return (
              <button
                key={pkg}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${pkg}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${pkg}`}
                tabIndex={selected ? 0 : -1}
                data-state={selected ? 'active' : 'inactive'}
                onClick={() => select(pkg)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className="relative rounded-none px-2 py-3 text-sm font-medium text-zinc-400 outline-none transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:text-zinc-100 focus-visible:text-zinc-50 focus-visible:ring-2 focus-visible:ring-[var(--cli-accent)] focus-visible:ring-inset data-[state=active]:text-zinc-50 data-[state=active]:after:bg-[var(--cli-accent)]"
              >
                {pkg}
              </button>
            )
          })}
        </div>
        {MANAGERS.map((pkg) => (
          <div key={pkg} role="tabpanel" id={`${id}-panel-${pkg}`} aria-labelledby={`${id}-tab-${pkg}`} hidden={pkg !== active} className="m-0">
            <pre className="overflow-auto p-4 text-[12.8px] text-zinc-100" style={{ fontFamily: 'var(--cli-font)' }}>
              {commands[pkg]}
            </pre>
          </div>
        ))}
      </div>
      <CopyButton className="top-1" componentSource={commands[active]} copied={copied} />
    </div>
  )
}
