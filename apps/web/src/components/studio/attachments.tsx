'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, type ClipboardEvent, type DragEvent } from 'react'
import { ImageIcon } from '@/components/icons'
import { MAX_ATTACHMENTS, prepareAttachment, type Attachment } from '@/lib/studio/images'

/**
 * 附参考图：点按钮选文件、往输入框里粘贴截图、或者拖进来。最多两张，在浏览器里缩小后再上传。
 * 对话框和工作台首页共用。
 */
export function useAttachments() {
  const t = useTranslations('studio.attach')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const add = async (files: Iterable<File>) => {
    setError(null)
    const images = [...files].filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) return
    const room = MAX_ATTACHMENTS - attachments.length
    if (images.length > room) setError(t('tooMany', { max: MAX_ATTACHMENTS }))
    const prepared: Attachment[] = []
    for (const file of images.slice(0, Math.max(0, room))) {
      try {
        prepared.push(await prepareAttachment(file))
      } catch (cause) {
        setError(cause instanceof Error && cause.message === 'too-large' ? t('tooLarge') : t('notImage'))
      }
    }
    if (prepared.length > 0) setAttachments((current) => [...current, ...prepared].slice(0, MAX_ATTACHMENTS))
  }

  return {
    attachments,
    error,
    input,
    add,
    remove: (index: number) => setAttachments((current) => current.filter((_, position) => position !== index)),
    clear: () => {
      setAttachments([])
      setError(null)
    },
    /** 输入框里粘贴截图。只拦截带图片的粘贴，普通文字照常。 */
    onPaste: (event: ClipboardEvent) => {
      const files = [...event.clipboardData.files].filter((file) => file.type.startsWith('image/'))
      if (files.length === 0) return
      event.preventDefault()
      void add(files)
    },
    onDrop: (event: DragEvent) => {
      if (event.dataTransfer.files.length === 0) return
      event.preventDefault()
      void add(event.dataTransfer.files)
    },
  }
}

export type AttachmentState = ReturnType<typeof useAttachments>

/** 附图按钮（藏着一个文件选择框）。 */
export function AttachButton({ state, disabled }: { state: AttachmentState; disabled?: boolean }) {
  const t = useTranslations('studio.attach')
  return (
    <>
      <button
        type="button"
        onClick={() => state.input.current?.click()}
        disabled={disabled || state.attachments.length >= MAX_ATTACHMENTS}
        title={t('button')}
        aria-label={t('button')}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-sunken hover:text-ink disabled:opacity-40"
        data-testid="studio-attach"
      >
        <ImageIcon className="size-4" />
      </button>
      <input
        ref={state.input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          if (event.target.files) void state.add(event.target.files)
          event.target.value = ''
        }}
      />
    </>
  )
}

/** 已附上的图：缩略图和移除按钮，以及最近一次的错误。 */
export function AttachmentStrip({ state }: { state: AttachmentState }) {
  const t = useTranslations('studio.attach')
  if (state.attachments.length === 0 && !state.error) return null
  return (
    <div className="flex flex-wrap items-center gap-2 px-1.5 pb-2">
      {state.attachments.map((attachment, index) => (
        <span key={index} className="relative">
          {/* 缩略图是浏览器里生成的 data URL。 */}
          <img src={attachment.thumbnail} alt={t('alt', { index: index + 1 })} className="size-14 rounded-md border border-line object-cover" />
          <button
            type="button"
            onClick={() => state.remove(index)}
            aria-label={t('remove')}
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-line bg-raised text-[11px] text-ink-muted hover:text-ink"
          >
            ×
          </button>
        </span>
      ))}
      {state.error && <span className="text-[12px] text-danger">{state.error}</span>}
    </div>
  )
}
