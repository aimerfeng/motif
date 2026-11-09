// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Keenthemes Inc
// Source: https://github.com/keenthemes/reui/blob/6e433dd/registry-reui/bases/base/components/field/c-field-10.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#6366f1',
  layout: 'stacked',
  density: 'comfortable',
  radius: 12,
  saveBarPosition: 'bottom',
  spring: {
    visualDuration: 0.35,
    bounce: 0.2,
  },
  showDescriptions: true,
}
/* @motif:end */

type Options = typeof defaults & {
  accent: string
  layout: string
  density: string
  radius: number
  saveBarPosition: string
  spring: { visualDuration: number; bounce: number }
  showDescriptions: boolean
}

export type ChannelKey = 'push' | 'email' | 'sms'
export type EventKey = 'comments' | 'mentions' | 'updates'

export type PrefsValues = {
  name: string
  slug: string
  bio: string
  channels: Record<ChannelKey, boolean>
  digest: string
  matrix: Record<EventKey, Record<ChannelKey, boolean>>
  editor: { autoSave: boolean; spellCheck: boolean; lineNumbers: boolean }
  indent: string
}

export type PrefsState = { values: PrefsValues; saved: PrefsValues }

export const initialPrefsValues: PrefsValues = {
  name: 'Alex Johnson',
  slug: 'alex-johnson',
  bio: 'Software engineer & open source contributor.',
  channels: { push: true, email: true, sms: false },
  digest: 'daily',
  matrix: {
    comments: { push: true, email: true, sms: false },
    mentions: { push: true, email: false, sms: false },
    updates: { push: false, email: true, sms: false },
  },
  editor: { autoSave: true, spellCheck: true, lineNumbers: false },
  indent: '2',
}

export const initialPrefsState: PrefsState = { values: initialPrefsValues, saved: initialPrefsValues }

export type SettingsPreferencesFormProps = Partial<Options> & {
  /** Controlled form state (current values + last saved values). Uncontrolled when omitted. */
  state?: PrefsState
  onStateChange?: (state: PrefsState) => void
  onSave?: (values: PrefsValues) => void
  className?: string
  style?: CSSProperties
}

const CHANNELS: { id: ChannelKey; title: string; description: string; short: string }[] = [
  { id: 'push', title: 'Push Notifications', description: 'Alerts sent to your device in real time.', short: 'Push' },
  { id: 'email', title: 'Email Digest', description: 'A daily summary of activity sent to your inbox.', short: 'Email' },
  { id: 'sms', title: 'SMS Alerts', description: 'Text messages for critical notifications only.', short: 'SMS' },
]

const EVENTS: { id: EventKey; title: string; description: string }[] = [
  { id: 'comments', title: 'Comments', description: 'When someone comments on your posts.' },
  { id: 'mentions', title: 'Mentions', description: 'When someone mentions you in a conversation.' },
  { id: 'updates', title: 'Product Updates', description: 'News about new features and improvements.' },
]

const EDITOR: { id: keyof PrefsValues['editor']; label: string; description: string }[] = [
  { id: 'autoSave', label: 'Auto-save', description: 'Save changes automatically' },
  { id: 'spellCheck', label: 'Spell check', description: 'Highlight spelling errors' },
  { id: 'lineNumbers', label: 'Line numbers', description: 'Show line numbers in editor' },
]

const DIGEST = [
  { value: 'realtime', label: 'As it happens' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily at 9:00' },
  { value: 'weekly', label: 'Weekly on Monday' },
]

const INDENT = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
  { value: 'tab', label: 'Tabs' },
]

/** 按亮度选深 / 浅字色，任何主色上的文字都可读。 */
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

export function validatePrefs(v: PrefsValues) {
  const errors: Partial<Record<'name' | 'slug' | 'bio', string>> = {}
  if (!v.name.trim()) errors.name = 'Display name is required.'
  if (!/^[a-z0-9-]+$/.test(v.slug)) errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.'
  if (v.bio.length > 160) errors.bio = 'Keep your bio under 160 characters.'
  return errors
}

/** 逐个叶子值比较，得到改动数量。 */
function countChanges(a: unknown, b: unknown): number {
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    let n = 0
    for (const k of Object.keys(a)) n += countChanges((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    return n
  }
  return a === b ? 0 : 1
}

/* ---------- 手写的 Switch / Checkbox / Select，替代 base-ui，沿用上游 cn-* 样式的类名 ---------- */

function Switch({ id, checked, onChange, size = 'default', disabled }: { id: string; checked: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'default'; disabled?: boolean }) {
  const state = checked ? { 'data-checked': '' } : { 'data-unchecked': '' }
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      data-slot="switch"
      data-size={size}
      {...state}
      onClick={() => onChange(!checked)}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs outline-none transition-[background-color,box-shadow] after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80',
        'data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]',
      )}
    >
      <span
        data-slot="switch-thumb"
        {...state}
        className={cn(
          'pointer-events-none block rounded-full bg-background ring-0 transition-transform motion-reduce:transition-none dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground',
          'group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0',
        )}
      />
    </button>
  )
}

function Checkbox({ id, checked, onChange, disabled, label }: { id?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-slot="checkbox"
      {...(checked ? { 'data-checked': '' } : {})}
      onClick={() => onChange(!checked)}
      className={cn(
        'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-input shadow-xs outline-none transition-shadow after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-input/30',
        'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
      )}
    >
      {checked && (
        <svg data-slot="checkbox-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  )
}

function Select({ id, value, options, onChange, r }: { id: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; r: string }) {
  return (
    <div className="relative w-full sm:w-44">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ borderRadius: r }}
        className="h-9 w-full cursor-pointer appearance-none border border-input bg-transparent pr-8 pl-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-popover text-popover-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

function FieldError({ id, children }: { id: string; children?: string }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          key="err"
          id={id}
          role="alert"
          initial={{ opacity: 0, y: reduce ? 0 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          data-slot="field-error"
          className="text-sm font-normal text-destructive"
        >
          {children}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function Group({ title, description, children, o }: { title: string; description: string; children: ReactNode; o: Options }) {
  const split = o.layout === 'split'
  return (
    <section className={cn('grid gap-3', split && 'md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-8')}>
      <div className="min-w-0">
        <h2 data-slot="field-legend" className="text-sm font-medium">
          {title}
        </h2>
        {o.showDescriptions && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div style={{ borderRadius: `${o.radius}px` }} className={cn('min-w-0 border bg-card text-card-foreground shadow-xs', o.density === 'compact' ? 'p-4' : 'p-5 sm:p-6')}>
        {children}
      </div>
    </section>
  )
}

function Desc({ children, show }: { children: ReactNode; show: boolean }) {
  return show ? (
    <p data-slot="field-description" className="text-left text-sm text-muted-foreground">
      {children}
    </p>
  ) : null
}

export function SettingsPreferencesForm({ state: controlled, onStateChange, onSave, className, style, ...props }: SettingsPreferencesFormProps) {
  const o: Options = { ...defaults, ...props }
  const reduce = useReducedMotion()
  const uid = useId()
  const [inner, setInner] = useState<PrefsState>(initialPrefsState)
  const state = controlled ?? inner
  const { values, saved } = state

  const commit = (next: PrefsState) => {
    if (!controlled) setInner(next)
    onStateChange?.(next)
  }
  const set = (patch: Partial<PrefsValues>) => commit({ ...state, values: { ...values, ...patch } })

  const errors = validatePrefs(values)
  const errorCount = Object.keys(errors).length
  const changes = countChanges(values, saved)
  const dirty = changes > 0
  const compact = o.density === 'compact'
  const r = `${o.radius}px`
  const inputR = `${Math.max(2, o.radius - 4)}px`
  const top = o.saveBarPosition === 'top'

  const vars = {
    '--primary': o.accent,
    '--primary-foreground': inkFor(o.accent),
    '--ring': o.accent,
  } as CSSProperties

  const sep = <div data-slot="field-separator" role="separator" className={cn('h-px bg-border', compact ? 'my-4' : 'my-6')} />
  const fieldGap = compact ? 'gap-3' : 'gap-4'

  const saveBar = (
    <AnimatePresence initial={false}>
      {dirty && (
        <motion.div
          key="savebar"
          role="region"
          aria-label="Unsaved changes"
          initial={{ opacity: 0, y: reduce ? 0 : top ? -24 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : top ? -24 : 24 }}
          transition={reduce ? { duration: 0.15 } : { type: 'spring', ...o.spring }}
          style={{ borderRadius: r }}
          className={cn('sticky z-10 flex flex-wrap items-center gap-3 border bg-popover/95 px-4 py-3 text-popover-foreground shadow-lg backdrop-blur', top ? 'top-3' : 'bottom-3')}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="font-medium">Unsaved changes</span>
            <span className="text-muted-foreground" aria-live="polite">
              {errorCount ? `· Fix ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} to save` : `· ${changes} ${changes === 1 ? 'field' : 'fields'} edited`}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => commit({ ...state, values: saved })}
              style={{ borderRadius: inputR }}
              className="h-8 border border-input bg-transparent px-3 text-sm font-medium outline-none transition-[background-color,box-shadow] hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={errorCount > 0}
              style={{ borderRadius: inputR }}
              className="h-8 bg-primary px-3 text-sm font-medium text-primary-foreground outline-none transition-[opacity,box-shadow] hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const id = (s: string) => `${uid}-${s}`

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (errorCount) return
        onSave?.(values)
        commit({ values, saved: values })
      }}
      style={{ ...vars, ...style }}
      className={cn('flex w-full flex-col', compact ? 'gap-6' : 'gap-8', className)}
    >
      {top && saveBar}

      <Group o={o} title="Profile" description="How you appear to teammates and on your public page.">
        <div className={cn('flex flex-col', compact ? 'gap-5' : 'gap-7')}>
          <div data-slot="field" className="flex flex-col gap-3">
            <label htmlFor={id('name')} className="text-sm leading-snug font-medium">
              Display Name <span className="text-destructive">*</span>
            </label>
            <input
              id={id('name')}
              value={values.name}
              onChange={(e) => set({ name: e.target.value })}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? id('name-err') : undefined}
              style={{ borderRadius: inputR }}
              className="h-9 w-full border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
            />
            {!errors.name && <Desc show={o.showDescriptions}>This is your public display name.</Desc>}
            <FieldError id={id('name-err')}>{errors.name}</FieldError>
          </div>
          <div data-slot="field" data-invalid={Boolean(errors.slug)} className="flex flex-col gap-3 data-[invalid=true]:text-destructive">
            <label htmlFor={id('slug')} className="text-sm leading-snug font-medium">
              URL Slug
            </label>
            <div style={{ borderRadius: inputR }} className={cn('flex h-9 w-full items-center overflow-hidden border shadow-xs transition-[border-color,box-shadow] focus-within:ring-3 dark:bg-input/30', errors.slug ? 'border-destructive focus-within:ring-destructive/30' : 'border-input focus-within:border-ring focus-within:ring-ring/50')}>
              <span className="shrink-0 border-r border-input px-3 text-sm text-muted-foreground">tidal.so/</span>
              <input
                id={id('slug')}
                value={values.slug}
                onChange={(e) => set({ slug: e.target.value })}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? id('slug-err') : undefined}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none"
              />
            </div>
            <FieldError id={id('slug-err')}>{errors.slug}</FieldError>
          </div>
          <div data-slot="field" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor={id('bio')} className="text-sm leading-snug font-medium">
                Bio
              </label>
              <span className={cn('text-xs', errors.bio ? 'text-destructive' : 'text-muted-foreground')}>{values.bio.length}/160</span>
            </div>
            <textarea
              id={id('bio')}
              value={values.bio}
              onChange={(e) => set({ bio: e.target.value })}
              aria-invalid={Boolean(errors.bio)}
              style={{ borderRadius: inputR }}
              className="min-h-[80px] w-full resize-y border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
            />
            {!errors.bio && <Desc show={o.showDescriptions}>Brief description for your profile.</Desc>}
            <FieldError id={id('bio-err')}>{errors.bio}</FieldError>
          </div>
        </div>
      </Group>

      <Group o={o} title="Notifications" description="Pick where alerts reach you, then fine-tune each event.">
        <fieldset data-slot="field-set" className="flex flex-col">
          <legend data-slot="field-legend" data-variant="label" className="mb-3 text-sm font-medium">
            Notification Channels
          </legend>
          <div data-slot="field-group" className={cn('flex flex-col', fieldGap)}>
            {CHANNELS.map((c) => (
              <div key={c.id} data-slot="field" data-orientation="horizontal" className="flex items-center gap-3">
                <div data-slot="field-content" className="flex min-w-0 flex-1 flex-col gap-1">
                  <label htmlFor={id(`ch-${c.id}`)} className="w-fit cursor-pointer text-sm leading-snug font-medium">
                    {c.title}
                  </label>
                  <Desc show={o.showDescriptions}>{c.description}</Desc>
                </div>
                <Switch id={id(`ch-${c.id}`)} checked={values.channels[c.id]} onChange={(v) => set({ channels: { ...values.channels, [c.id]: v } })} />
              </div>
            ))}
            <div data-slot="field" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor={id('digest')} className="text-sm leading-snug font-medium">
                Digest frequency
              </label>
              <Select id={id('digest')} value={values.digest} options={DIGEST} onChange={(v) => set({ digest: v })} r={inputR} />
            </div>
          </div>
        </fieldset>
        {sep}
        <fieldset data-slot="field-set" className="flex min-w-0 flex-col">
          <legend data-slot="field-legend" data-variant="label" className="mb-3 text-sm font-medium">
            Notify me about
          </legend>
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className="pb-2 text-left font-normal text-muted-foreground">
                  <span className="sr-only">Event</span>
                </th>
                {CHANNELS.map((c) => (
                  <th key={c.id} scope="col" className={cn('w-12 pb-2 text-center text-xs font-medium text-muted-foreground sm:w-16', !values.channels[c.id] && 'opacity-50')}>
                    {c.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((ev) => (
                <tr key={ev.id} className="border-t">
                  <th scope="row" className={cn('pr-2 text-left font-normal', compact ? 'py-2' : 'py-3')}>
                    <div className="text-sm leading-snug font-medium">{ev.title}</div>
                    {o.showDescriptions && <div className="mt-0.5 text-xs text-muted-foreground">{ev.description}</div>}
                  </th>
                  {CHANNELS.map((c) => (
                    <td key={c.id} className="text-center align-middle">
                      <span className="inline-flex">
                        <Checkbox
                          label={`${ev.title} via ${c.short}`}
                          checked={values.matrix[ev.id][c.id] && values.channels[c.id]}
                          disabled={!values.channels[c.id]}
                          onChange={(v) => set({ matrix: { ...values.matrix, [ev.id]: { ...values.matrix[ev.id], [c.id]: v } } })}
                        />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
      </Group>

      <Group o={o} title="Editor" description="Defaults for every document you open.">
        <p className="mb-3 text-sm font-medium">Editor Preferences</p>
        <div className="h-px bg-border" role="separator" />
        <div className="flex flex-col">
          {EDITOR.map((s) => (
            <label key={s.id} htmlFor={id(`ed-${s.id}`)} className={cn('flex cursor-pointer items-center justify-between gap-3 border-b last:border-b-0', compact ? 'py-2.5' : 'py-3')}>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">{s.label}</span>
                {o.showDescriptions && <span className="text-xs text-muted-foreground">{s.description}</span>}
              </div>
              <Switch id={id(`ed-${s.id}`)} size="sm" checked={values.editor[s.id]} onChange={(v) => set({ editor: { ...values.editor, [s.id]: v } })} />
            </label>
          ))}
          <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor={id('indent')} className="text-sm font-medium">
              Indentation
            </label>
            <Select id={id('indent')} value={values.indent} options={INDENT} onChange={(v) => set({ indent: v })} r={inputR} />
          </div>
        </div>
      </Group>

      {!top && saveBar}
    </form>
  )
}
