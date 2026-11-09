// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/hooks/use-file-upload.ts
// Modified by Motif; see the item's provenance.
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type InputHTMLAttributes, type RefObject } from 'react'

export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

export type FileUploadOptions = {
  maxFiles?: number // Only used when multiple is true, defaults to Infinity
  maxSize?: number // in bytes
  accept?: string
  multiple?: boolean // Defaults to false
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
}

export type FileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
}

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  openFileDialog: () => void
  getInputProps: () => InputHTMLAttributes<HTMLInputElement> & { ref: RefObject<HTMLInputElement | null> }
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / k ** i).toFixed(dm)) + sizes[i]!
}

let uid = 0

function isAccepted(file: File, accept: string) {
  if (accept === '*') return true
  const fileExtension = `.${file.name.split('.').pop()}`
  return accept
    .split(',')
    .map((type) => type.trim())
    .some((type) => {
      if (type.startsWith('.')) return fileExtension.toLowerCase() === type.toLowerCase()
      if (type.endsWith('/*')) return file.type.startsWith(`${type.split('/')[0]}/`)
      return file.type === type
    })
}

/** Trimmed port of Origin UI's useFileUpload: validation, previews, drag state and a hidden input. */
export const useFileUpload = (options: FileUploadOptions = {}): [FileUploadState, FileUploadActions] => {
  const { maxFiles = Number.POSITIVE_INFINITY, maxSize = Number.POSITIVE_INFINITY, accept = '*', multiple = false, initialFiles = [], onFilesChange } = options

  const [state, setState] = useState<FileUploadState>({
    errors: [],
    files: initialFiles.map((file) => ({ file, id: file.id, preview: file.url })),
    isDragging: false,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef(state.files)
  filesRef.current = state.files

  const revoke = (file: FileWithPreview) => {
    if (file.preview && file.file instanceof File) URL.revokeObjectURL(file.preview)
  }

  useEffect(() => () => filesRef.current.forEach(revoke), [])

  const commit = useCallback(
    (files: FileWithPreview[], errors: string[]) => {
      setState((prev) => ({ ...prev, errors, files }))
      onFilesChange?.(files)
    },
    [onFilesChange],
  )

  const clearFiles = useCallback(() => {
    filesRef.current.forEach(revoke)
    if (inputRef.current) inputRef.current.value = ''
    commit([], [])
  }, [commit])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const newFilesArray = Array.from(newFiles)
      if (newFilesArray.length === 0) return
      const current = filesRef.current
      const errors: string[] = []

      // Check if adding these files would exceed maxFiles (only in multiple mode)
      if (multiple && current.length + newFilesArray.length > maxFiles) {
        setState((prev) => ({ ...prev, errors: [`You can only upload a maximum of ${maxFiles} files.`] }))
        return
      }

      const validFiles: FileWithPreview[] = []
      for (const file of newFilesArray) {
        if (multiple && current.some((existing) => existing.file.name === file.name && existing.file.size === file.size)) continue
        if (file.size > maxSize) {
          errors.push(multiple ? `Some files exceed the maximum size of ${formatBytes(maxSize)}.` : `File exceeds the maximum size of ${formatBytes(maxSize)}.`)
          continue
        }
        if (!isAccepted(file, accept)) {
          errors.push(`File "${file.name}" is not an accepted file type.`)
          continue
        }
        validFiles.push({ file, id: `${file.name}-${++uid}`, preview: URL.createObjectURL(file) })
      }

      if (validFiles.length > 0) {
        if (!multiple) current.forEach(revoke)
        commit(multiple ? [...current, ...validFiles] : validFiles, errors)
      } else {
        setState((prev) => ({ ...prev, errors }))
      }
      if (inputRef.current) inputRef.current.value = ''
    },
    [accept, commit, maxFiles, maxSize, multiple],
  )

  const removeFile = useCallback(
    (id: string) => {
      const target = filesRef.current.find((file) => file.id === id)
      if (target) revoke(target)
      commit(
        filesRef.current.filter((file) => file.id !== id),
        [],
      )
    },
    [commit],
  )

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState((prev) => ({ ...prev, isDragging: false }))
      if (inputRef.current?.disabled) return
      const dropped = e.dataTransfer.files
      if (dropped && dropped.length > 0) addFiles(multiple ? dropped : [dropped[0]!])
    },
    [addFiles, multiple],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [addFiles],
  )

  const openFileDialog = useCallback(() => inputRef.current?.click(), [])

  const getInputProps = useCallback(() => ({ accept, multiple, onChange: handleFileChange, ref: inputRef, type: 'file' as const }), [accept, multiple, handleFileChange])

  return [state, { addFiles, removeFile, clearFiles, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps }]
}
