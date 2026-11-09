// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-331.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useCharacterLimit } from './use-character-limit'
import { useFileUpload, type FileMetadata } from './use-file-upload'

/* @motif:defaults */
export const defaults = {
  presentation: 'dialog',
  coverStyle: 'aurora',
  avatarShape: 'circle',
  accent: '#6366f1',
  radius: 10,
  bioLimit: 180,
  showWebsite: true,
}
/* @motif:end */

export type SettingsProfileFormProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 弹窗初始是否打开（上游默认关闭）。 */
  defaultOpen?: boolean
  /** 受控的简介文字；不传时组件自己管理。 */
  bio?: string
  onBioChange?: (value: string) => void
  onSave?: () => void
}

export const INITIAL_BIO = 'Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!'

// 上游用两张照片当初始文件；这里不放图片，用两个「生成的」占位条目，选了图片后才换成真实预览。
const GENERATED_COVER = 'profile-bg-generated'
const GENERATED_AVATAR = 'avatar-generated'
const initialBgImage: FileMetadata[] = [{ id: GENERATED_COVER, name: 'cover.svg', size: 0, type: 'image/svg+xml', url: '' }]
const initialAvatarImage: FileMetadata[] = [{ id: GENERATED_AVATAR, name: 'avatar.svg', size: 0, type: 'image/svg+xml', url: '' }]

/* lucide 图标的内联版本（24 网格，stroke）。 */
const ICONS = {
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  imagePlus: 'M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
}

function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d={ICONS[name]} />
    </svg>
  )
}

/* ---- 颜色：封面和头像按主色生成；保存按钮的文字按亮度选深浅 ---- */

function rgbOf(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [99, 102, 241]
  const v = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function hslOf(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex).map((c) => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 在主色基础上转色相、调明度；饱和度保持，灰色主色就生成灰色封面。 */
function tone(base: [number, number, number], dh: number, l: number, a = 1) {
  const [h, s] = base
  return `hsl(${(((h + dh) % 360) + 360) % 360} ${clamp(s, 0, 92).toFixed(1)}% ${clamp(l, 6, 92).toFixed(1)}% / ${a})`
}

function inkFor(hex: string) {
  const ch = rgbOf(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  return l > 0.18 ? '#0a0a0b' : '#ffffff'
}

function GeneratedCover({ variant, accent }: { variant: string; accent: string }) {
  const c = hslOf(accent)
  const l = c[2]
  const base = `linear-gradient(120deg, ${tone(c, -14, clamp(l - 24, 12, 36))}, ${tone(c, 22, clamp(l - 8, 22, 52))})`
  if (variant === 'waves') {
    return (
      <svg aria-hidden="true" viewBox="0 0 512 128" preserveAspectRatio="none" className="size-full" style={{ background: base }}>
        <path d="M0 64C84 34 164 98 258 70S430 34 512 60V128H0Z" fill={tone(c, 28, l + 6, 0.55)} />
        <path d="M0 88C98 66 182 116 292 92S452 70 512 86V128H0Z" fill={tone(c, 0, l + 18, 0.6)} />
        <path d="M0 108C122 94 224 128 334 110S462 98 512 106V128H0Z" fill={tone(c, -26, l + 32, 0.72)} />
      </svg>
    )
  }
  if (variant === 'grid') {
    const line = 'rgb(255 255 255 / 0.14)'
    return (
      <div
        aria-hidden="true"
        className="size-full"
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${line} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
            `radial-gradient(70% 130% at 78% 0%, ${tone(c, 30, l + 14, 0.9)}, transparent 70%)`,
            `radial-gradient(50% 120% at 8% 110%, ${tone(c, -30, l + 6, 0.7)}, transparent 70%)`,
            base,
          ].join(','),
          backgroundSize: '24px 24px, 24px 24px, 100% 100%, 100% 100%, 100% 100%',
          backgroundPosition: '-1px -1px, -1px -1px, 0 0, 0 0, 0 0',
        }}
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="size-full"
      style={{
        background: [
          `radial-gradient(55% 140% at 16% 8%, ${tone(c, 40, l + 16, 0.95)} 0%, transparent 62%)`,
          `radial-gradient(45% 120% at 84% 0%, ${tone(c, -36, l + 8, 0.9)} 0%, transparent 60%)`,
          `radial-gradient(60% 160% at 58% 125%, ${tone(c, 12, l + 28, 0.85)} 0%, transparent 66%)`,
          base,
        ].join(','),
      }}
    />
  )
}

function GeneratedAvatar({ accent }: { accent: string }) {
  const c = hslOf(accent)
  const l = c[2]
  return (
    <div
      aria-hidden="true"
      className="size-full"
      style={{
        background: [
          `radial-gradient(circle at 30% 26%, ${tone(c, 36, l + 26, 1)} 0%, transparent 52%)`,
          `radial-gradient(circle at 78% 82%, ${tone(c, -32, clamp(l, 38, 62), 1)} 0%, transparent 58%)`,
          `linear-gradient(140deg, ${tone(c, 10, clamp(l - 6, 30, 56))}, ${tone(c, -18, clamp(l - 26, 14, 36))})`,
        ].join(','),
      }}
    />
  )
}

/* ---- 上游 ui/ 原语的类名，内联成普通元素 ---- */

const inputClass =
  'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
const textareaClass =
  'flex min-h-19.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'
const labelClass = 'block select-none font-medium text-foreground text-sm leading-4'
const buttonClass =
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 font-medium text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50'
const outlineClass = 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground'
const primaryClass = 'bg-[var(--pf-accent)] text-[var(--pf-ink)] shadow-sm hover:bg-[var(--pf-accent)]/90'
const iconButtonClass =
  'z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

function ProfileBg({ coverStyle, accent }: { coverStyle: string; accent: string }) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] = useFileUpload({
    accept: 'image/*',
    initialFiles: initialBgImage,
  })

  const current = files[0]
  const generated = current?.id === GENERATED_COVER
  const currentImage = current ? (generated ? 'generated' : current.preview || null) : null

  return (
    <div className="h-32">
      <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
        {currentImage &&
          (generated ? (
            <GeneratedCover variant={coverStyle} accent={accent} />
          ) : (
            <img alt="Upload preview" className="size-full object-cover" height={96} src={currentImage} width={512} />
          ))}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button aria-label={currentImage ? 'Change image' : 'Upload image'} className={iconButtonClass} onClick={openFileDialog} type="button">
            <Icon name="imagePlus" />
          </button>
          {currentImage && current && (
            <button aria-label="Remove image" className={iconButtonClass} onClick={() => removeFile(current.id)} type="button">
              <Icon name="x" />
            </button>
          )}
        </div>
      </div>
      <input {...getInputProps()} aria-label="Upload image file" className="sr-only" tabIndex={-1} />
    </div>
  )
}

function Avatar({ shape, accent }: { shape: string; accent: string }) {
  const [{ files }, { openFileDialog, getInputProps }] = useFileUpload({
    accept: 'image/*',
    initialFiles: initialAvatarImage,
  })

  const current = files[0]
  const generated = current?.id === GENERATED_AVATAR

  return (
    <div className="-mt-10 px-6">
      <div
        className={cn(
          'relative flex size-20 items-center justify-center overflow-hidden border-4 border-background bg-muted shadow-black/10 shadow-xs',
          shape === 'rounded' ? 'rounded-xl' : 'rounded-full',
        )}
      >
        {current &&
          (generated ? (
            <GeneratedAvatar accent={accent} />
          ) : (
            current.preview && <img alt="Profile" className="size-full object-cover" height={80} src={current.preview} width={80} />
          ))}
        <button
          aria-label="Change profile picture"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={openFileDialog}
          type="button"
        >
          <Icon name="imagePlus" />
        </button>
        <input {...getInputProps()} aria-label="Upload profile picture" className="sr-only" tabIndex={-1} />
      </div>
    </div>
  )
}

type BodyProps = {
  coverStyle: string
  avatarShape: string
  accent: string
  bioLimit: number
  showWebsite: boolean
  bio?: string
  onBioChange?: (value: string) => void
}

function ProfileBody({ coverStyle, avatarShape, accent, bioLimit, showWebsite, bio, onBioChange }: BodyProps) {
  const id = useId()
  const maxLength = Math.round(bioLimit)
  const {
    value: ownValue,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    initialValue: INITIAL_BIO,
    maxLength,
  })
  // 受控时用外面给的值；上限调小时截断，剩余字数不会变成负数。
  const value = (bio ?? ownValue).slice(0, limit)
  const characterCount = value.length

  return (
    <div className="overflow-y-auto">
      <ProfileBg coverStyle={coverStyle} accent={accent} />
      <Avatar shape={avatarShape} accent={accent} />
      <div className="px-6 pt-4 pb-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-2">
              <label className={labelClass} htmlFor={`${id}-first-name`}>
                First name
              </label>
              <input className={inputClass} defaultValue="Margaret" id={`${id}-first-name`} placeholder="Matt" required type="text" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className={labelClass} htmlFor={`${id}-last-name`}>
                Last name
              </label>
              <input className={inputClass} defaultValue="Villard" id={`${id}-last-name`} placeholder="Welsh" required type="text" />
            </div>
          </div>
          <div className="*:not-first:mt-2">
            <label className={labelClass} htmlFor={`${id}-username`}>
              Username
            </label>
            <div className="relative">
              <input className={cn(inputClass, 'peer ps-7 pe-9')} defaultValue="margaret-villard-69" id={`${id}-username`} placeholder="Username" required type="text" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
                @
              </span>
              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Icon name="check" className="text-emerald-500" />
              </div>
            </div>
          </div>
          {showWebsite && (
            <div className="*:not-first:mt-2">
              <label className={labelClass} htmlFor={`${id}-website`}>
                Website
              </label>
              <div className="flex rounded-md shadow-xs">
                <span className="inline-flex items-center rounded-s-md border border-input bg-background px-3 text-muted-foreground text-sm">https://</span>
                <input className={cn(inputClass, '-ms-px rounded-s-none shadow-none')} defaultValue="www.villard.studio" id={`${id}-website`} placeholder="yourwebsite.com" type="text" />
              </div>
            </div>
          )}
          <div className="*:not-first:mt-2">
            <label className={labelClass} htmlFor={`${id}-bio`}>
              Biography
            </label>
            <textarea
              aria-describedby={`${id}-description`}
              className={textareaClass}
              id={`${id}-bio`}
              maxLength={limit}
              onChange={(e) => {
                handleChange(e)
                if (e.target.value.length <= limit) onBioChange?.(e.target.value)
              }}
              placeholder="Write a few sentences about yourself"
              value={value}
            />
            <p aria-live="polite" className="mt-2 text-right text-muted-foreground text-xs" id={`${id}-description`} role="status">
              <span className="tabular-nums">{limit - characterCount}</span> characters left
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end">{children}</div>
}

export function SettingsProfileForm({ className, style, defaultOpen = false, bio, onBioChange, onSave, ...props }: SettingsProfileFormProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(defaultOpen)
  // 卡片模式下「取消」用 key 重新挂载表单，恢复初始值。
  const [resetKey, setResetKey] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)
  const titleId = useId()
  const descId = useId()

  const isCard = options.presentation === 'card'

  // 打开时把焦点移进弹窗（落在弹窗本身，不在第一个按钮上画出焦点环），关闭时还给触发按钮。
  useEffect(() => {
    if (isCard) return
    if (open) dialogRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current) triggerRef.current?.focus()
    wasOpen.current = open
  }, [open, isCard])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      return
    }
    if (e.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([type="file"]), select, textarea, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const cssVars = {
    '--radius': `${options.radius}px`,
    '--pf-accent': options.accent,
    '--pf-ink': inkFor(options.accent),
    ...style,
  } as CSSProperties

  const body = (
    <ProfileBody
      key={resetKey}
      coverStyle={options.coverStyle}
      avatarShape={options.avatarShape}
      accent={options.accent}
      bioLimit={options.bioLimit}
      showWebsite={options.showWebsite}
      bio={bio}
      onBioChange={onBioChange}
    />
  )

  if (isCard) {
    return (
      <section
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn('flex w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-lg', className)}
        style={cssVars}
      >
        <h2 id={titleId} className="border-b px-6 py-4 font-semibold text-base leading-none">
          Edit profile
        </h2>
        <p id={descId} className="sr-only">
          Make changes to your profile here. You can change your photo and set a username.
        </p>
        {body}
        <Footer>
          <button
            type="button"
            className={cn(buttonClass, outlineClass)}
            onClick={() => {
              setResetKey((k) => k + 1)
              onBioChange?.(INITIAL_BIO)
            }}
          >
            Cancel
          </button>
          <button type="button" className={cn(buttonClass, primaryClass)} onClick={onSave}>
            Save changes
          </button>
        </Footer>
      </section>
    )
  }

  const zoom = reduced ? {} : { scale: 0.95 }

  return (
    <div className={className} style={cssVars}>
      <div inert={open}>
        <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-expanded={open} className={cn(buttonClass, outlineClass)} onClick={() => setOpen(true)}>
          Edit profile
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            aria-hidden="true"
            className="fixed inset-0 z-50 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            key="content"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, x: '-50%', y: '-50%', ...zoom }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, x: '-50%', y: '-50%', ...zoom }}
            transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-y-visible rounded-xl border bg-background p-0 text-foreground shadow-lg outline-none sm:max-w-lg"
          >
            <h2 id={titleId} className="border-b px-6 py-4 font-semibold text-base leading-none">
              Edit profile
            </h2>
            <p id={descId} className="sr-only">
              Make changes to your profile here. You can change your photo and set a username.
            </p>
            {body}
            <Footer>
              <button type="button" className={cn(buttonClass, outlineClass)} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={cn(buttonClass, primaryClass)}
                onClick={() => {
                  onSave?.()
                  setOpen(false)
                }}
              >
                Save changes
              </button>
            </Footer>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="group absolute top-3.5 right-3 flex size-7 items-center justify-center rounded outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Icon name="x" className="opacity-60 transition-opacity group-hover:opacity-100" />
              <span className="sr-only">Close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
