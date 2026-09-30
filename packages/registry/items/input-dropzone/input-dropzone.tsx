// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/dropzone/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'dashed',
  color: '#38bdf8',
  radius: 18,
  height: 156,
  spring: {
    visualDuration: 0.34,
    bounce: 0.25,
  },
  title: 'Drop files here or',
  hint: 'PNG, JPG or PDF up to 10 MB',
}
/* @motif:end */

export type DropzoneFile = {
  id: string
  name: string
  /** 字节数。 */
  size: number
  /** 0 到 1；到 1 表示上传完成。 */
  progress: number
}

export type InputDropzoneProps = Partial<typeof defaults> & {
  files?: DropzoneFile[]
  onFilesChange?: (files: DropzoneFile[]) => void
  /** 收到原始 File 对象（真实上传交给你）。 */
  onDrop?: (files: File[]) => void
  /** 强制显示拖入状态（演示自动播放用）。 */
  dragActive?: boolean
  accept?: string
  maxFiles?: number
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)

const extensionOf = (name: string) => (name.includes('.') ? name.split('.').pop()!.slice(0, 4).toUpperCase() : 'FILE')

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase()
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r)
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1))
    return file.type === r
  })
}

/** 拖放上传区：拖入时边框流动、图标弹起；点击或 Enter / Space 打开文件选择；下方是带进度条的文件列表。 */
export function InputDropzone({ files, onFilesChange, onDrop, dragActive, accept, maxFiles = 5, disabled, className, style, ...props }: InputDropzoneProps) {
  const { variant, color, radius, height, spring, title, hint } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const uid = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const depth = useRef(0)
  const [over, setOver] = useState(false)
  const [inner, setInner] = useState<DropzoneFile[]>([])
  const [box, setBox] = useState({ w: 0, h: 0 })
  const list = files ?? inner
  const active = (dragActive ?? over) && !disabled

  useEffect(() => {
    const el = zoneRef.current
    if (!el) return
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 非受控时模拟上传进度；真实项目里由你更新 files。
  const pending = files === undefined && inner.some((file) => file.progress < 1)
  useEffect(() => {
    if (!pending) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1)
      last = now
      setInner((prev) => prev.map((file) => (file.progress < 1 ? { ...file, progress: Math.min(1, file.progress + dt * (0.35 + (file.size % 7) * 0.05)) } : file)))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pending])

  const commit = (next: DropzoneFile[]) => {
    if (files === undefined) setInner(next)
    onFilesChange?.(next)
  }

  const accepted = (incoming: File[]) => {
    const okay = incoming.filter((file) => matchesAccept(file, accept))
    if (okay.length === 0) return
    onDrop?.(okay)
    const room = Math.max(0, maxFiles - list.length)
    commit([...list, ...okay.slice(0, room).map((file, i) => ({ id: `${uid}-${Date.now()}-${i}`, name: file.name, size: file.size, progress: 0 }))])
  }

  const stop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const open = () => !disabled && inputRef.current?.click()

  return (
    <div className={cn('w-full', className)} style={{ '--c': color, ...style } as CSSProperties}>
      <motion.div
        ref={zoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label="Upload files"
        aria-describedby={`${uid}-hint`}
        onClick={open}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            open()
          }
        }}
        onDragEnter={(event) => {
          stop(event)
          depth.current += 1
          setOver(true)
        }}
        onDragOver={stop}
        onDragLeave={(event) => {
          stop(event)
          depth.current = Math.max(0, depth.current - 1)
          if (depth.current === 0) setOver(false)
        }}
        onDrop={(event) => {
          stop(event)
          depth.current = 0
          setOver(false)
          accepted(Array.from(event.dataTransfer.files))
        }}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 px-6 text-center outline-none select-none',
          'transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c)',
          variant === 'soft' && 'border border-border/80',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        style={{
          height,
          borderRadius: radius,
          backgroundColor: active ? 'color-mix(in oklab, var(--c) 10%, transparent)' : variant === 'soft' ? 'color-mix(in oklab, var(--foreground) 4%, transparent)' : 'transparent',
        }}
        animate={{ scale: active && !reduced ? 1.015 : 1 }}
        transition={transition}
      >
        {variant === 'dashed' && box.w > 0 && (
          <svg aria-hidden className="pointer-events-none absolute inset-0" width={box.w} height={box.h}>
            <motion.rect
              x="1"
              y="1"
              width={box.w - 2}
              height={box.h - 2}
              rx={radius}
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="7 7"
              animate={{ strokeDashoffset: active && !reduced ? [0, -28] : 0 }}
              transition={active && !reduced ? { duration: 1.1, ease: 'linear', repeat: Infinity } : { duration: 0.2 }}
              style={{ stroke: active ? color : 'color-mix(in oklab, var(--foreground) 22%, transparent)', transition: 'stroke 0.2s' }}
            />
          </svg>
        )}
        <motion.div
          aria-hidden
          className="grid size-12 place-items-center rounded-2xl"
          style={{ backgroundColor: 'color-mix(in oklab, var(--c) 16%, transparent)', color }}
          animate={active && !reduced ? { y: [0, -6, 0], scale: 1.08 } : { y: 0, scale: 1 }}
          transition={active && !reduced ? { y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }, scale: transition } : transition}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.5 18.5a4.5 4.5 0 0 1-.6-8.96 5.5 5.5 0 0 1 10.6-.9A4.8 4.8 0 0 1 17 18.5" />
            <path d="M12 20.5v-8m0 0-3 3m3-3 3 3" />
          </svg>
        </motion.div>
        <div>
          <div className="relative h-5 text-sm font-medium text-foreground">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active ? 'active' : 'idle'}
                initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                transition={{ duration: 0.18 }}
              >
                {active ? (
                  'Release to upload'
                ) : (
                  <>
                    {title} <span className="text-(--c) underline decoration-[color-mix(in_oklab,var(--c)_50%,transparent)] underline-offset-[3px]">browse</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div id={`${uid}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</div>
        </div>
        <input ref={inputRef} type="file" multiple accept={accept} tabIndex={-1} aria-hidden className="sr-only" onChange={(event) => { accepted(Array.from(event.target.files ?? [])); event.target.value = '' }} />
      </motion.div>

      <ul aria-label="Uploaded files" className="mt-3 space-y-2 empty:hidden">
        <AnimatePresence initial={false}>
          {list.map((file) => {
            const done = file.progress >= 1
            return (
              <motion.li
                key={file.id}
                layout={!reduced}
                initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                transition={transition}
                className="flex items-center gap-3 rounded-xl border bg-card/60 py-2.5 pr-2.5 pl-3"
                style={{ borderRadius: Math.max(radius - 6, 8) }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold tracking-wide" style={{ backgroundColor: 'color-mix(in oklab, var(--c) 16%, transparent)', color }}>
                  {extensionOf(file.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] font-medium">{file.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{done ? formatSize(file.size) : `${Math.round(file.progress * 100)}%`}</span>
                  </div>
                  <div role="progressbar" aria-label={`Uploading ${file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(file.progress * 100)} className="mt-1.5 h-1 overflow-hidden rounded-full bg-foreground/10">
                    <div className="h-full origin-left rounded-full" style={{ transform: `scaleX(${file.progress})`, backgroundColor: done ? '#34d399' : color }} />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => commit(list.filter((f) => f.id !== file.id))}
                  className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--c)"
                >
                  {done ? (
                    <svg viewBox="0 0 16 16" className="size-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m3.5 8.5 3 3 6-7" /></svg>
                  ) : (
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="m4 4 8 8M12 4l-8 8" /></svg>
                  )}
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
