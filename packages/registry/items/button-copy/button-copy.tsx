// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Spell UI
// Source: https://github.com/xxtomm/spell-ui/blob/fffe96d/registry/spell-ui/copy-button.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'snippet',
  color: '#34d399',
  radius: 12,
  size: 'md',
  spring: {
    visualDuration: 0.34,
    bounce: 0.3,
  },
  value: 'npx motif add tabs-animated',
  label: 'Copy',
  feedback: 2,
}
/* @motif:end */

export type ButtonCopyProps = Partial<typeof defaults> & {
  /** 强制显示已复制状态（演示自动播放用）。 */
  copied?: boolean
  onCopy?: (value: string) => void
  className?: string
  style?: CSSProperties
}

const HEIGHTS = { sm: 36, md: 44, lg: 52 } as const

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 权限被拒或在 iframe 里：退回到 execCommand。
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(area)
    area.select()
    let ok: boolean
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    area.remove()
    return ok
  }
}

/** 复制按钮：点击写入剪贴板，图标从「复制」变形成描出来的对勾，扩散一圈光环，文案上滑替换；失败时给出提示。 */
export function ButtonCopy({ copied: forced, onCopy, className, style, ...props }: ButtonCopyProps) {
  const { variant, color, radius, size, spring, value, label, feedback } = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const timer = useRef<number>(0)
  const shown = forced === undefined ? status : forced ? 'copied' : 'idle'
  const done = shown === 'copied'
  const failed = shown === 'error'
  const height = HEIGHTS[size as keyof typeof HEIGHTS] ?? 44
  const transition = reduced ? { duration: 0.1 } : { type: 'spring' as const, visualDuration: spring.visualDuration, bounce: spring.bounce }
  const tone = failed ? '#f43f5e' : color

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    window.clearTimeout(timer.current)
    const ok = await writeClipboard(value)
    setStatus(ok ? 'copied' : 'error')
    if (ok) onCopy?.(value)
    timer.current = window.setTimeout(() => setStatus('idle'), feedback * 1000)
  }

  const words = value.split(' ')
  const iconSize = Math.round(height * 0.42)

  const glyph = (
    <span className="relative grid place-items-center" style={{ width: iconSize, height: iconSize }}>
      <AnimatePresence initial={false}>
        {done ? (
          <motion.svg key="done" className="absolute inset-0" viewBox="0 0 20 20" width={iconSize} height={iconSize} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ scale: reduced ? 1 : 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={transition}>
            <motion.path d="m4.5 10.5 3.5 3.5 7.5-8.5" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.28, delay: 0.06 }} />
          </motion.svg>
        ) : failed ? (
          <motion.svg key="fail" className="absolute inset-0" viewBox="0 0 20 20" width={iconSize} height={iconSize} fill="none" stroke={tone} strokeWidth="2.2" strokeLinecap="round" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
            <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
          </motion.svg>
        ) : (
          <motion.svg key="copy" className="absolute inset-0" viewBox="0 0 20 20" width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={transition}>
            <rect x="7" y="7" width="9.5" height="9.5" rx="2.2" />
            <path d="M13 7V5.7A1.7 1.7 0 0 0 11.3 4H5.7A1.7 1.7 0 0 0 4 5.7v5.6A1.7 1.7 0 0 0 5.7 13H7" />
          </motion.svg>
        )}
      </AnimatePresence>
      {done && !reduced && (
        <motion.span aria-hidden className="pointer-events-none absolute rounded-full border-2" style={{ width: iconSize, height: iconSize, borderColor: color }} initial={{ scale: 0.6, opacity: 0.7 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      )}
    </span>
  )

  const words2 = (
    <span className="relative inline-grid overflow-hidden" style={{ lineHeight: `${height - 8}px` }}>
      <AnimatePresence initial={false}>
        <motion.span className="col-start-1 row-start-1" key={done ? 'done' : failed ? 'fail' : 'idle'} initial={{ y: reduced ? 0 : '80%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : '-80%', opacity: 0 }} transition={transition}>
          {done ? 'Copied' : failed ? 'Press ⌘C' : label}
        </motion.span>
      </AnimatePresence>
    </span>
  )

  const button = (
    <motion.button
      type="button"
      layout={!reduced && variant === 'button'}
      onClick={copy}
      aria-label={variant === 'button' ? undefined : `${label}: ${value}`}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-medium outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--c)',
        done || failed ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        variant === 'icon' || variant === 'snippet' ? 'aspect-square' : 'px-4',
      )}
      style={{
        height: variant === 'snippet' ? height - 12 : height - 4,
        borderRadius: Math.max(radius - (variant === 'snippet' ? 4 : 0), 4),
        borderColor: done || failed ? `color-mix(in oklab, ${tone} 55%, transparent)` : 'var(--border)',
        backgroundColor: done || failed ? `color-mix(in oklab, ${tone} 14%, transparent)` : variant === 'snippet' ? 'transparent' : 'var(--card)',
      }}
    >
      {glyph}
      {variant === 'button' && words2}
    </motion.button>
  )

  return (
    <div className={cn('relative', variant === 'snippet' ? 'w-full' : 'w-fit', className)} style={{ '--c': color, ...style } as CSSProperties}>
      <span role="status" aria-live="polite" className="sr-only">{done ? 'Copied to clipboard' : failed ? 'Copy failed' : ''}</span>
      {variant === 'snippet' ? (
        <div className="flex items-center gap-3 border bg-card/80 py-1.5 pr-1.5 pl-4 font-mono text-[13px]" style={{ height, borderRadius: radius }}>
          <span aria-hidden className="text-muted-foreground/60 select-none">$</span>
          <code className="min-w-0 flex-1 truncate text-foreground/90">
            {words.map((word, i) => (
              <span key={i} className={i === 0 ? 'text-foreground' : word.startsWith('-') ? 'text-muted-foreground' : i === words.length - 1 ? 'text-(--c)' : 'text-foreground/80'}>
                {word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </code>
          {button}
        </div>
      ) : (
        button
      )}
      <AnimatePresence>
        {done && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-full mb-2 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-lg shadow-black/30"
            initial={{ opacity: 0, y: reduced ? 0 : 6, scale: reduced ? 1 : 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4 }}
            transition={transition}
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
