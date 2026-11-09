// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/hooks/use-file-upload.ts
// Modified by Motif; see the item's provenance.
import { type ChangeEvent, type InputHTMLAttributes, type RefObject, useCallback, useEffect, useRef, useState } from 'react'

// 精简版：只保留单文件模式（头像、封面够用），去掉拖放、多文件和大小限制。

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
  accept?: string
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
}

export type FileUploadState = {
  files: FileWithPreview[]
  errors: string[]
}

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (props?: InputHTMLAttributes<HTMLInputElement>) => InputHTMLAttributes<HTMLInputElement> & {
    ref: RefObject<HTMLInputElement | null>
  }
}

export const useFileUpload = (options: FileUploadOptions = {}): [FileUploadState, FileUploadActions] => {
  const { accept = '*', initialFiles = [], onFilesChange } = options

  const [state, setState] = useState<FileUploadState>({
    errors: [],
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
  })

  const inputRef = useRef<HTMLInputElement>(null)
  // 这里创建的 object URL，卸载时统一释放。
  const created = useRef(new Set<string>())

  useEffect(() => {
    const urls = created.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
      urls.clear()
    }
  }, [])

  const revoke = useCallback((file: FileWithPreview) => {
    if (file.preview && file.file instanceof File && created.current.has(file.preview)) {
      URL.revokeObjectURL(file.preview)
      created.current.delete(file.preview)
    }
  }, [])

  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map((type) => type.trim())
        const fileType = file.type || ''
        const fileExtension = `.${file.name.split('.').pop()}`

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith('.')) return fileExtension.toLowerCase() === type.toLowerCase()
          if (type.endsWith('/*')) return fileType.startsWith(`${type.split('/')[0]}/`)
          return fileType === type
        })

        if (!isAccepted) return `File "${file.name}" is not an accepted file type.`
      }
      return null
    },
    [accept],
  )

  const clearFiles = useCallback(() => {
    setState((prev) => {
      for (const file of prev.files) revoke(file)
      if (inputRef.current) inputRef.current.value = ''
      onFilesChange?.([])
      return { errors: [], files: [] }
    })
  }, [onFilesChange, revoke])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const file = Array.from(newFiles)[0]
      if (!file) return

      // 选完就清空，同一个文件可以再选一次。
      if (inputRef.current) inputRef.current.value = ''

      const error = validateFile(file)
      if (error) {
        setState((prev) => ({ ...prev, errors: [error] }))
        return
      }

      const preview = URL.createObjectURL(file)
      created.current.add(preview)
      const next: FileWithPreview[] = [{ file, id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, preview }]
      setState((prev) => {
        for (const old of prev.files) revoke(old)
        onFilesChange?.(next)
        return { errors: [], files: next }
      })
    },
    [validateFile, onFilesChange, revoke],
  )

  const removeFile = useCallback(
    (id: string) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((file) => file.id === id)
        if (fileToRemove) revoke(fileToRemove)
        const newFiles = prev.files.filter((file) => file.id !== id)
        onFilesChange?.(newFiles)
        return { errors: [], files: newFiles }
      })
    },
    [onFilesChange, revoke],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [addFiles],
  )

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      accept: props.accept || accept,
      multiple: false,
      onChange: handleFileChange,
      ref: inputRef,
      type: 'file' as const,
    }),
    [accept, handleFileChange],
  )

  return [state, { addFiles, clearFiles, getInputProps, handleFileChange, openFileDialog, removeFile }]
}
