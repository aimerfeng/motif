// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/table/c-table-12.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  maskStyle: 'dots',
  density: 'comfortable',
  radius: 12,
  showScopes: true,
  rows: 4,
  spring: {
    visualDuration: 0.35,
    bounce: 0.15,
  },
}
/* @motif:end */

type Defaults = typeof defaults & {
  accent?: string
  maskStyle?: string
  density?: string
  radius?: number
  showScopes?: boolean
  rows?: number
  spring?: { visualDuration: number; bounce: number }
}

export type ApiKey = {
  id: string
  name: string
  secret: string
  permissions: string[]
  lastUsed: string
  status: 'Active' | 'Expired'
  expires: string
}

export type ApiKeysState = {
  revealed: string | null
  copied: string | null
  created: boolean
  revoked: string[]
}

export const initialApiKeysState: ApiKeysState = { revealed: null, copied: null, created: false, revoked: [] }

export type SettingsApiKeysProps = Partial<Defaults> & {
  keys?: ApiKey[]
  /** Controlled state (reveal / copy / create / revoke). Uncontrolled when omitted. */
  state?: ApiKeysState
  onStateChange?: (state: ApiKeysState) => void
  className?: string
  style?: CSSProperties
}

const apiKeys: ApiKey[] = [
  {
    id: 'prod',
    name: 'Production API',
    secret: 'sk_live_9Qm2Lr7Tx0Vd4f3a',
    permissions: ['read', 'write'],
    lastUsed: '2 minutes ago',
    status: 'Active',
    expires: 'Expires in 84 days',
  },
  {
    id: 'staging',
    name: 'Staging API',
    secret: 'sk_test_Hb61Kq0Zw3Ns8b2c',
    permissions: ['read', 'write', 'admin'],
    lastUsed: '1 hour ago',
    status: 'Active',
    expires: 'Expires in 12 days',
  },
  {
    id: 'ci',
    name: 'CI/CD Pipeline',
    secret: 'sk_ci_Pe4Yt8Mu2Gj71d9e',
    permissions: ['read'],
    lastUsed: '3 days ago',
    status: 'Active',
    expires: 'No expiry',
  },
  {
    id: 'legacy',
    name: 'Legacy Integration',
    secret: 'sk_old_Wc5Ra9Lx6Fo27a5f',
    permissions: ['read', 'write'],
    lastUsed: '30 days ago',
    status: 'Expired',
    expires: 'Expired Oct 10',
  },
]

const createdKey: ApiKey = {
  id: 'new',
  name: 'Webhooks worker',
  secret: 'sk_live_Tn3Vb8Qe1Xa6Kz0w5Jd2',
  permissions: ['read', 'write'],
  lastUsed: 'Never used',
  status: 'Active',
  expires: 'Expires in 90 days',
}

const permissionVariant: Record<string, string> = {
  read: 'border-border text-muted-foreground',
  write: 'border-transparent bg-sky-500/12 text-sky-700 dark:text-sky-300',
  admin: 'border-transparent bg-amber-500/14 text-amber-700 dark:text-amber-300',
}

const statusVariant: Record<ApiKey['status'], string> = {
  Active: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  Expired: 'bg-red-500/12 text-red-700 dark:text-red-300',
}

function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1]!, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? '#0a0a0a' : '#ffffff'
}

function mask(secret: string, style: string) {
  const prefix = secret.slice(0, secret.indexOf('_', 3) + 1)
  const tail = secret.slice(-4)
  if (style === 'stars') return `${prefix}********${tail}`
  return `${prefix}••••••••${tail}`
}

function Icon({ d, className }: { d: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-3.5', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  )
}

const CopyIcon = <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>
const CheckIcon = <path d="M20 6 9 17l-5-5" />
const EyeIcon = <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>
const EyeOffIcon = <><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" /><path d="m2 2 20 20" /></>
const TrashIcon = <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>
const PlusIcon = <path d="M12 5v14M5 12h14" />

const iconButton =
  'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-[background-color,color] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50'

export function SettingsApiKeys({ keys = apiKeys, state: controlled, onStateChange, className, style, ...props }: SettingsApiKeysProps) {
  const o = { ...defaults, ...props } as Defaults
  const accent = o.accent ?? '#6366f1'
  const maskStyle = o.maskStyle ?? 'dots'
  const compact = (o.density ?? 'comfortable') === 'compact'
  const radius = o.radius ?? 12
  const showScopes = o.showScopes ?? true
  const rows = Math.max(1, Math.min(keys.length, Math.round(o.rows ?? 4)))
  const spring = o.spring ?? { visualDuration: 0.35, bounce: 0.15 }
  const reduced = useReducedMotion()
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, ...spring }

  const [local, setLocal] = useState<ApiKeysState>(initialApiKeysState)
  const state = controlled ?? local
  const update = (patch: Partial<ApiKeysState>) => {
    const next = { ...state, ...patch }
    if (!controlled) setLocal(next)
    onStateChange?.(next)
  }

  const copy = (key: ApiKey) => {
    try {
      void navigator.clipboard?.writeText(key.secret).catch(() => {})
    } catch {
      /* clipboard unavailable */
    }
    update({ copied: key.id })
  }

  const list = [...(state.created ? [createdKey] : []), ...keys.slice(0, rows)].filter((k) => !state.revoked.includes(k.id))
  const cell = compact ? 'px-3 py-2' : 'px-4 py-3'
  const head = compact ? 'h-8 px-3' : 'h-10 px-4'

  return (
    <div
      className={cn('mx-auto flex w-full max-w-3xl flex-col overflow-hidden border bg-card text-card-foreground shadow-sm', className)}
      style={{ borderRadius: radius, ...style }}
    >
      <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b', compact ? 'px-3 py-3' : 'px-4 py-4')}>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">API keys</h2>
          <p className="text-xs text-muted-foreground">Keys grant access to your workspace. Keep them out of client code.</p>
        </div>
        <button
          type="button"
          onClick={() => update({ created: true, revealed: createdKey.id, copied: null, revoked: state.revoked.filter((id) => id !== createdKey.id) })}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition-[opacity] hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50"
          style={{ backgroundColor: accent, color: inkFor(accent) }}
        >
          <Icon d={PlusIcon} />
          Create key
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b">
              <th className={cn(head, 'text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground')}>Name</th>
              <th className={cn(head, 'text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground')}>Key</th>
              {showScopes && <th className={cn(head, 'hidden text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground md:table-cell')}>Permissions</th>}
              <th className={cn(head, 'hidden text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground lg:table-cell')}>Status</th>
              <th className={cn(head, 'text-right align-middle text-xs font-medium whitespace-nowrap text-muted-foreground')}>Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            <AnimatePresence initial={false}>
              {list.map((key) => {
                const fresh = key.id === createdKey.id
                const revealed = state.revealed === key.id
                const copied = state.copied === key.id
                return (
                  <motion.tr
                    key={key.id}
                    layout={!reduced}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={transition}
                    className="border-b transition-[background-color] hover:bg-muted/50"
                    style={fresh ? { backgroundColor: `color-mix(in oklab, ${accent} 10%, transparent)` } : undefined}
                  >
                    <td className={cn(cell, 'align-middle')}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium whitespace-nowrap">{key.name}</span>
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                          {fresh ? 'Copy it now, it will not be shown again' : `Last used: ${key.lastUsed}`}
                        </span>
                      </div>
                    </td>
                    <td className={cn(cell, 'align-middle')}>
                      <button
                        type="button"
                        onClick={() => update({ revealed: revealed ? null : key.id })}
                        aria-pressed={revealed}
                        aria-label={revealed ? `Hide ${key.name} key` : `Reveal ${key.name} key`}
                        className="group inline-flex items-center gap-1.5 rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <code
                          className="rounded bg-muted px-1.5 py-0.5 text-left font-mono text-xs break-all"
                          style={fresh ? { boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 55%, transparent)` } : undefined}
                        >
                          {revealed ? (
                            key.secret
                          ) : maskStyle === 'blur' ? (
                            <span className="inline-block blur-[3px] select-none">{key.secret}</span>
                          ) : (
                            mask(key.secret, maskStyle)
                          )}
                        </code>
                        <Icon d={revealed ? EyeOffIcon : EyeIcon} className="text-muted-foreground opacity-70 group-hover:opacity-100" />
                      </button>
                    </td>
                    {showScopes && (
                      <td className={cn(cell, 'hidden align-middle md:table-cell')}>
                        <div className="flex gap-1">
                          {key.permissions.map((perm) => (
                            <span
                              key={perm}
                              className={cn('inline-flex h-5 items-center rounded-sm border px-1.5 text-[11px] font-medium', permissionVariant[perm] ?? permissionVariant.read)}
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    <td className={cn(cell, 'hidden align-middle lg:table-cell')}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={cn('inline-flex h-5 items-center rounded-md px-2 text-xs font-medium', statusVariant[key.status])}>{key.status}</span>
                        <span className="text-[11px] whitespace-nowrap text-muted-foreground">{key.expires}</span>
                      </div>
                    </td>
                    <td className={cn(cell, 'text-right align-middle')}>
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => copy(key)} className={iconButton} aria-label={copied ? 'Copied' : `Copy ${key.name} key`}>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={copied ? 'check' : 'copy'}
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.6 }}
                              transition={transition}
                              className="inline-flex"
                              style={copied ? { color: accent } : undefined}
                            >
                              <Icon d={copied ? CheckIcon : CopyIcon} />
                            </motion.span>
                          </AnimatePresence>
                        </button>
                        <button
                          type="button"
                          onClick={() => update({ revoked: [...state.revoked, key.id], revealed: null, copied: null, created: fresh ? false : state.created })}
                          className={cn(iconButton, 'hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400')}
                          aria-label={`Revoke ${key.name} key`}
                        >
                          <Icon d={TrashIcon} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div aria-live="polite" className="sr-only">
        {state.copied ? 'Key copied to clipboard' : ''}
      </div>
    </div>
  )
}
