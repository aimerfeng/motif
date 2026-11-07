// SPDX-License-Identifier: MIT
// Copyright (c) 2025 kokonutUI
// Source: https://github.com/kokonut-labs/kokonutui/blob/83eec6d/components/kokonutui/ai-prompt.tsx
// Modified by Motif; see the item's provenance.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn, cssVars } from '@motif/runtime'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#ece8e1',
  surface: 'soft',
  radius: 22,
  minHeight: 64,
  maxHeight: 220,
  placeholder: 'Ask anything, or drop a file…',
  showBanner: true,
  banner: 'Sable Deep is free on every plan this week',
  sendOnEnter: true,
}
/* @motif:end */

export type AiModel = { id: string; name: string; description?: string; icon?: ReactNode }
export type AiAttachment = { id: string; name: string; size?: string }
export type AiPromptMessage = { text: string; model: string; attachments: AiAttachment[] }

export type AiPromptProps = Partial<typeof defaults> & {
  models?: AiModel[]
  /** 受控：当前模型 id。 */
  model?: string
  defaultModel?: string
  onModelChange?: (id: string) => void
  /** 受控：输入框的文字。 */
  value?: string
  onValueChange?: (value: string) => void
  /** 受控：附件列表。 */
  attachments?: AiAttachment[]
  onAttachmentsChange?: (attachments: AiAttachment[]) => void
  onSubmit?: (message: AiPromptMessage) => void
  /** streaming 时发送键变成停止键。 */
  status?: 'idle' | 'streaming'
  onStop?: () => void
  /** 横幅右侧的按钮会切换到这个模型；不传则不显示按钮。 */
  bannerModel?: string
  bannerAction?: string
  /** 模型菜单往哪边弹：输入框在页面底部时用 top。 */
  menuSide?: 'top' | 'bottom'
  /** 演示用：强制打开模型菜单、强制高亮某个模型、强制显示聚焦外观。 */
  menuOpen?: boolean
  highlightedModel?: string
  focused?: boolean
  className?: string
  style?: CSSProperties
}

const glyph = (children: ReactNode) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
    {children}
  </svg>
)

// 虚构的模型家族，图标是中性的几何符号：一个点、两个圈、圈中有点。
export const SAMPLE_MODELS: AiModel[] = [
  { id: 'lite', name: 'Sable Lite', description: 'Fastest, for quick edits', icon: glyph(<circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />) },
  {
    id: 'standard',
    name: 'Sable 2',
    description: 'Balanced for everyday work',
    icon: glyph(
      <>
        <circle cx="6" cy="8" r="3.4" />
        <circle cx="10" cy="8" r="3.4" />
      </>,
    ),
  },
  {
    id: 'deep',
    name: 'Sable Deep',
    description: 'Thinks longer on hard problems',
    icon: glyph(
      <>
        <circle cx="8" cy="8" r="5.6" />
        <circle cx="8" cy="8" r="2.4" fill="currentColor" stroke="none" />
      </>,
    ),
  },
]

const SURFACE: Record<string, { frame: string; field: string }> = {
  soft: { frame: 'bg-foreground/[0.045]', field: 'bg-foreground/[0.055]' },
  solid: { frame: 'border bg-card shadow-[0_24px_60px_-30px_rgb(0_0_0/0.75)]', field: 'bg-background/50' },
  outline: { frame: 'border bg-transparent', field: 'bg-transparent' },
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * AI 对话输入框：自动长高的文本框、附件、模型选择（listbox）、发送 / 停止。
 * 文字、模型、附件都可以受控，也可以交给组件自己管。
 */
export function AiPrompt({
  models = SAMPLE_MODELS,
  model,
  defaultModel,
  onModelChange,
  value,
  onValueChange,
  attachments,
  onAttachmentsChange,
  onSubmit,
  status = 'idle',
  onStop,
  bannerModel = 'deep',
  bannerAction = 'Try it',
  menuSide = 'top',
  menuOpen: forcedMenu,
  highlightedModel,
  focused,
  className,
  style,
  ...props
}: AiPromptProps) {
  const { accent, surface, radius, minHeight, maxHeight, placeholder, showBanner, banner, sendOnEnter } = { ...defaults, ...props }
  const reduced = Boolean(useReducedMotion())
  const uid = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  const [innerText, setInnerText] = useState('')
  const text = value ?? innerText
  const setText = (next: string) => {
    if (value === undefined) setInnerText(next)
    onValueChange?.(next)
  }

  const [innerModel, setInnerModel] = useState(defaultModel ?? models[1]?.id ?? models[0]?.id ?? '')
  const modelId = model ?? innerModel
  const current = models.find((candidate) => candidate.id === modelId) ?? models[0]
  const selectModel = (id: string) => {
    if (model === undefined) setInnerModel(id)
    onModelChange?.(id)
  }

  const [innerFiles, setInnerFiles] = useState<AiAttachment[]>([])
  const files = attachments ?? innerFiles
  const setFiles = (next: AiAttachment[]) => {
    if (attachments === undefined) setInnerFiles(next)
    onAttachmentsChange?.(next)
  }

  const streaming = status === 'streaming'
  const canSend = text.trim().length > 0 || files.length > 0

  // 文本框随内容长高：先压到最小高度量 scrollHeight，再设回去，夹在 min / max 之间。
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = `${minHeight}px`
    textarea.style.height = `${Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight))}px`
  }, [text, minHeight, maxHeight])

  const submit = () => {
    if (!canSend || streaming) return
    onSubmit?.({ text: text.trim(), model: modelId, attachments: files })
    setText('')
    setFiles([])
  }

  const onTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 输入法正在组字时的回车是确认候选词，不是发送。
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    const send = sendOnEnter ? !event.shiftKey : event.metaKey || event.ctrlKey
    if (!send) return
    event.preventDefault()
    submit()
  }

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).map((file) => ({ id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, size: formatBytes(file.size) }))
    if (picked.length) setFiles([...files, ...picked.filter((file) => !files.some((existing) => existing.id === file.id))])
    event.target.value = ''
  }

  // ---- 模型菜单（listbox）----
  const [menuInner, setMenuInner] = useState(false)
  const menuOpen = forcedMenu ?? menuInner
  const [active, setActive] = useState(0)
  const userOpened = useRef(false)
  const activeIndex = highlightedModel !== undefined ? Math.max(0, models.findIndex((candidate) => candidate.id === highlightedModel)) : active

  const openMenu = () => {
    userOpened.current = true
    setActive(Math.max(0, models.findIndex((candidate) => candidate.id === modelId)))
    setMenuInner(true)
  }
  const closeMenu = (refocus: boolean) => {
    setMenuInner(false)
    if (refocus) triggerRef.current?.focus()
  }

  // 用户打开菜单时把焦点移到列表上（方向键直接可用）；强制打开（演示）时不抢焦点。
  useEffect(() => {
    if (menuInner && userOpened.current) listRef.current?.focus()
  }, [menuInner])

  useEffect(() => {
    if (!menuInner) return
    const onPointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setMenuInner(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuInner])

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = models.length - 1
    if (event.key === 'ArrowDown') setActive((i) => (i >= last ? 0 : i + 1))
    else if (event.key === 'ArrowUp') setActive((i) => (i <= 0 ? last : i - 1))
    else if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(last)
    else if (event.key === 'Enter' || event.key === ' ') {
      const picked = models[activeIndex]
      if (picked) selectModel(picked.id)
      closeMenu(true)
    } else if (event.key === 'Escape') closeMenu(true)
    else if (event.key === 'Tab') {
      setMenuInner(false)
      return
    } else return
    event.preventDefault()
  }

  const shell = SURFACE[surface] ?? SURFACE.soft!
  const inner = Math.max(8, radius - 6)
  const fromTop = menuSide === 'top'
  const isFocused = focused ?? false
  // 第一次渲染不播：只有换模型时才有入场。
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
  }, [])
  const swapFrom = !mounted.current ? false : reduced ? { opacity: 0 } : { opacity: 0, y: -6 }

  return (
    <div className={cn('w-full text-foreground', className)} style={cssVars({ '--ap-accent': accent }, style)}>
      <div className={cn('p-1.5', shell.frame)} style={{ borderRadius: radius }}>
        {showBanner && banner && (
          <div className="flex items-center gap-2 px-2.5 pt-1 pb-2 text-xs">
            <span className="text-(--ap-accent)">{models.find((candidate) => candidate.id === bannerModel)?.icon ?? models[0]?.icon}</span>
            <p className="min-w-0 flex-1 truncate text-muted-foreground">{banner}</p>
            {bannerModel && models.some((candidate) => candidate.id === bannerModel) && (
              <button
                type="button"
                onClick={() => selectModel(bannerModel)}
                className="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-foreground outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-(--ap-accent)/60"
              >
                {bannerAction}
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative transition-[box-shadow] duration-200 focus-within:shadow-[0_0_0_1px_color-mix(in_oklab,var(--ap-accent)_45%,transparent),0_0_0_5px_color-mix(in_oklab,var(--ap-accent)_12%,transparent)]',
            isFocused && 'shadow-[0_0_0_1px_color-mix(in_oklab,var(--ap-accent)_45%,transparent),0_0_0_5px_color-mix(in_oklab,var(--ap-accent)_12%,transparent)]',
            shell.field,
          )}
          style={{ borderRadius: inner }}
        >
          {files.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-2 px-3 pt-3 pb-0" aria-label="Attachments">
              <AnimatePresence initial={false}>
                {files.map((file) => (
                  <motion.li
                    key={file.id}
                    layout={!reduced}
                    initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduced ? 1 : 0.92, transition: { duration: 0.12 } }}
                    transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.1 }}
                    className="flex max-w-60 items-center gap-2 rounded-lg border bg-background/60 py-1.5 pr-1.5 pl-2"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground/[0.07] text-muted-foreground">
                      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
                        <path d="M4 1.8h5.2L12.5 5v9.2H4zM9 1.8V5.2h3.4" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{file.name}</span>
                      {file.size && <span className="block text-[11px] text-muted-foreground tabular-nums">{file.size}</span>}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles(files.filter((candidate) => candidate.id !== file.id))}
                      className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--ap-accent)/60"
                    >
                      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                        <path d="m3 3 6 6M9 3l-6 6" />
                      </svg>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <textarea
            ref={textareaRef}
            id={`${uid}-input`}
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onTextKeyDown}
            placeholder={placeholder}
            aria-label="Message"
            className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
            style={{ height: minHeight, caretColor: accent }}
          />

          <div className="flex items-center justify-between gap-2 px-2.5 pt-1 pb-2.5">
            <div className="flex items-center gap-1.5">
              <div ref={pickerRef} className="relative">
                <button
                  ref={triggerRef}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={menuOpen}
                  aria-controls={menuOpen ? `${uid}-models` : undefined}
                  aria-label={`Model: ${current?.name ?? ''}`}
                  onClick={() => (menuInner ? closeMenu(false) : openMenu())}
                  onKeyDown={(event) => {
                    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !menuInner) {
                      event.preventDefault()
                      openMenu()
                    }
                  }}
                  className={cn(
                    'flex h-8 items-center gap-1.5 rounded-lg pr-2 pl-2 text-xs font-medium outline-none transition-colors duration-150 hover:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-(--ap-accent)/60',
                    menuOpen && 'bg-foreground/[0.06]',
                  )}
                >
                  {/* 换模型时新名字从上方落下来；旧的直接让位，不等退场动画（截图时钟下退场永远不会「结束」）。 */}
                  <motion.span key={current?.id} className="flex items-center gap-1.5" initial={swapFrom} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                    <span className="text-(--ap-accent)">{current?.icon}</span>
                    {current?.name}
                  </motion.span>
                  <svg viewBox="0 0 12 12" className={cn('size-3 opacity-50 transition-transform duration-200', menuOpen && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m3 4.5 3 3 3-3" />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      ref={listRef}
                      id={`${uid}-models`}
                      role="listbox"
                      tabIndex={-1}
                      aria-label="Model"
                      aria-activedescendant={`${uid}-model-${activeIndex}`}
                      onKeyDown={onListKeyDown}
                      initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : fromTop ? 6 : -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: reduced ? 1 : 0.98, transition: { duration: 0.1 } }}
                      transition={reduced ? { duration: 0.12 } : { type: 'spring', visualDuration: 0.24, bounce: 0.08 }}
                      className={cn('absolute left-0 z-30 w-72 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[0_18px_48px_-16px_rgb(0_0_0/0.7)] outline-none', fromTop ? 'bottom-full mb-2' : 'top-full mt-2')}
                      style={{ transformOrigin: fromTop ? 'bottom left' : 'top left' }}
                    >
                      {models.map((candidate, index) => {
                        const selected = candidate.id === modelId
                        return (
                          <div
                            key={candidate.id}
                            id={`${uid}-model-${index}`}
                            role="option"
                            aria-selected={selected}
                            onPointerMove={() => setActive(index)}
                            onClick={() => {
                              selectModel(candidate.id)
                              closeMenu(true)
                            }}
                            className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2', index === activeIndex && 'bg-foreground/[0.07]')}
                          >
                            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-foreground/[0.06] text-(--ap-accent)">{candidate.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">{candidate.name}</span>
                              {candidate.description && <span className="block truncate text-xs text-muted-foreground">{candidate.description}</span>}
                            </span>
                            {selected && (
                              <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-(--ap-accent)" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="m3.5 8.5 3 3 6-7" />
                              </svg>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="mx-0.5 h-4 w-px bg-foreground/10" aria-hidden />

              <input ref={fileRef} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={onFiles} />
              <button
                type="button"
                aria-label="Attach files"
                onClick={() => fileRef.current?.click()}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-(--ap-accent)/60"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m13.2 7.4-5.3 5.3a3.2 3.2 0 0 1-4.6-4.6l5.6-5.5a2.1 2.1 0 0 1 3 3L6.4 11a1 1 0 0 1-1.5-1.5l5-5" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              aria-label={streaming ? 'Stop generating' : 'Send message'}
              disabled={!streaming && !canSend}
              onClick={() => (streaming ? onStop?.() : submit())}
              className={cn(
                'relative grid size-9 shrink-0 place-items-center rounded-full outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-(--ap-accent)/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95',
                streaming || canSend ? 'bg-(--ap-accent) text-background' : 'bg-foreground/[0.08] text-muted-foreground',
              )}
            >
              {streaming && (
                // 生成中：按钮外圈一段弧在转；减少动态效果时停住。
                <motion.svg
                  viewBox="0 0 44 44"
                  className="pointer-events-none absolute -inset-1 size-11 text-(--ap-accent)"
                  aria-hidden
                  animate={reduced ? undefined : { rotate: 360 }}
                  transition={reduced ? undefined : { repeat: Infinity, duration: 1.1, ease: 'linear' }}
                >
                  <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
                  <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 98" />
                </motion.svg>
              )}
              {streaming ? (
                <span className="size-3 rounded-[3px] bg-current" aria-hidden />
              ) : (
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M8 13V3.5M4 7.5l4-4 4 4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
