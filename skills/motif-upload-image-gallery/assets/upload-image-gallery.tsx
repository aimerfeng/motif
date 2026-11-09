// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/components/comp-546.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import type { CSSProperties, ReactNode } from 'react'
import { useFileUpload, type FileMetadata, type FileWithPreview } from './use-file-upload'

/* @motif:defaults */
export const defaults = {
  mode: 'grid',
  columns: 3,
  aspect: 'square',
  thumbRadius: 6,
  accent: '#fafafa',
  maxFiles: 6,
  maxSizeMB: 5,
}
/* @motif:end */

export type UploadImageGalleryProps = Partial<typeof defaults> & {
  accept?: string
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
  /** Show these files instead of the internal state (used by the demo autoplay). */
  previewFiles?: FileMetadata[]
  /** Force the drag-over look (demo autoplay). */
  dragging?: boolean
  /** Force an error message (demo autoplay). */
  error?: string
  className?: string
  style?: CSSProperties
}

const ASPECT: Record<string, string> = { square: '1 / 1', landscape: '4 / 3', portrait: '3 / 4' }

/** Light or dark ink for text on a solid hex color. */
function inkFor(hex: string) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(hex)
  if (!m) return '#ffffff'
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => {
    const c = Number.parseInt(h!, 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! > 0.4 ? '#0a0a0a' : '#ffffff'
}

type IconProps = { className?: string }
const Icon = ({ className, children }: IconProps & { children: ReactNode }) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)
const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  </Icon>
)
const ImageUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    <path d="m14 19.5 3-3 3 3M17 22v-5.5" />
    <circle cx="9" cy="9" r="2" />
  </Icon>
)
const UploadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v12M7 8l5-5 5 5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </Icon>
)
const XIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)
const AlertCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </Icon>
)

const outlineButton =
  'inline-flex items-center justify-center gap-2 rounded-md border bg-background font-medium whitespace-nowrap shadow-xs outline-none transition-[color,background-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-(--ring-c) disabled:pointer-events-none disabled:opacity-50'

const removeButton =
  'flex cursor-pointer items-center justify-center rounded-full outline-none transition-[color,background-color,box-shadow,opacity] focus-visible:ring-[3px] focus-visible:ring-(--ring-c)'

/** Image uploader: a dropzone that becomes a thumbnail grid (or a single full preview), with remove buttons, a file limit and size errors. */
export function UploadImageGallery({
  accept = 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp',
  initialFiles,
  onFilesChange,
  previewFiles,
  dragging,
  error,
  className,
  style,
  ...props
}: UploadImageGalleryProps) {
  const { mode, columns, maxFiles, maxSizeMB, thumbRadius, aspect, accent } = { ...defaults, ...props }
  const single = mode === 'single'
  const maxSize = maxSizeMB * 1024 * 1024

  const [state, { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps }] = useFileUpload({
    accept,
    initialFiles,
    maxFiles: single ? 1 : maxFiles,
    maxSize,
    multiple: !single,
    onFilesChange,
  })

  const files: FileWithPreview[] = previewFiles ? previewFiles.map((file) => ({ file, id: file.id, preview: file.url })) : state.files
  const isDragging = dragging ?? state.isDragging
  const errors = error ? [error] : state.errors
  const vars = {
    '--accent-c': accent,
    '--accent-ink': inkFor(accent),
    '--ring-c': `color-mix(in oklab, ${accent} 50%, transparent)`,
    '--thumb-r': `${thumbRadius}px`,
    '--cols': columns,
  } as CSSProperties
  const previewUrl = single ? files[0]?.preview || null : null

  const errorRow = errors.length > 0 && (
    <div className="flex items-center gap-1 text-xs text-destructive" role="alert">
      <AlertCircleIcon className="size-3 shrink-0" />
      <span>{errors[0]}</span>
    </div>
  )

  if (single) {
    return (
      <div className={cn('flex flex-col gap-2', className)} style={{ ...vars, ...style }}>
        <div className="relative">
          {/* Drop area */}
          <div
            className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-[calc(var(--thumb-r)+4px)] border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-[img]:border-none has-[input:focus-visible]:border-(--accent-c) has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-(--ring-c) data-[dragging=true]:border-(--accent-c) data-[dragging=true]:bg-accent/50"
            data-dragging={isDragging || undefined}
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="button"
            tabIndex={-1}
          >
            <input {...getInputProps()} aria-label="Upload image" className="sr-only" />
            {previewUrl ? (
              <div className="absolute inset-0">
                <img alt={files[0]?.file.name || 'Uploaded image'} className="size-full object-cover" src={previewUrl} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div aria-hidden className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background">
                  <ImageUpIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">Drop your image here or click to browse</p>
                <p className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB</p>
              </div>
            )}
          </div>
          {previewUrl && (
            <div className="absolute top-4 right-4">
              <button aria-label="Remove image" className={cn(removeButton, 'z-50 size-8 bg-black/60 text-white hover:bg-black/80')} onClick={() => removeFile(files[0]!.id)} type="button">
                <XIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
        {errorRow}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)} style={{ ...vars, ...style }}>
      {/* Drop area */}
      <div
        className="relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors not-data-[files]:justify-center has-[input:focus-visible]:border-(--accent-c) has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-(--ring-c) data-[dragging=true]:border-(--accent-c) data-[dragging=true]:bg-accent/50"
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} aria-label="Upload image file" className="sr-only" />
        {files.length > 0 ? (
          <div className="@container flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Uploaded Files ({files.length}/{maxFiles})
              </h3>
              <button type="button" disabled={files.length >= maxFiles} onClick={openFileDialog} className={cn(outlineButton, 'h-8 px-3 text-xs')}>
                <UploadIcon className="-ms-0.5 size-3.5 opacity-60" />
                Add more
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 @sm:grid-cols-(--cols)">
              {files.map((file) => (
                <div className="relative rounded-(--thumb-r) bg-accent" style={{ aspectRatio: ASPECT[aspect] ?? '1 / 1' }} key={file.id}>
                  <img alt={file.file.name} className="size-full rounded-[inherit] object-cover" src={file.preview} />
                  <button
                    aria-label={`Remove ${file.file.name}`}
                    className={cn(removeButton, 'absolute -top-2 -right-2 size-6 border-2 border-background bg-(--accent-c) text-(--accent-ink) hover:opacity-90')}
                    onClick={() => removeFile(file.id)}
                    type="button"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div aria-hidden className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background">
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)</p>
            <button type="button" className={cn(outlineButton, 'mt-4 h-9 px-4 text-sm')} onClick={openFileDialog}>
              <UploadIcon className="-ms-1 size-4 opacity-60" />
              Select images
            </button>
          </div>
        )}
      </div>
      {errorRow}
    </div>
  )
}
