'use client'

import { useState } from 'react'

export interface HighlightedFile {
  path: string
  html: string
  source: string
}

/** 条目的源码文件：文件名切换 + 复制。高亮 HTML 在服务端生成。 */
export function CodeFiles({ files, copyLabel, copiedLabel }: { files: HighlightedFile[]; copyLabel: string; copiedLabel: string }) {
  const [active, setActive] = useState(files[0]?.path)
  const [copied, setCopied] = useState<string | null>(null)
  const file = files.find((f) => f.path === active) ?? files[0]
  if (!file) return null

  const copy = async () => {
    await navigator.clipboard.writeText(file.source)
    setCopied(file.path)
    window.setTimeout(() => setCopied((current) => (current === file.path ? null : current)), 1600)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        {files.map((f) => (
          <button
            key={f.path}
            type="button"
            aria-pressed={f.path === file.path}
            onClick={() => setActive(f.path)}
            className="rounded-md px-2.5 py-1 font-mono text-[12px] text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:bg-white/8 aria-pressed:text-ink"
          >
            {f.path}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void copy()}
          className="ml-auto rounded-md px-2.5 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
        >
          {copied === file.path ? copiedLabel : copyLabel}
        </button>
      </div>
      <div
        className="max-h-[560px] overflow-auto p-4 text-[12.5px] leading-[1.7] [&_pre]:!bg-transparent [&_pre]:font-mono"
        // shiki 在服务端生成的高亮 HTML，内容来自仓库里的条目源码。
        dangerouslySetInnerHTML={{ __html: file.html }}
      />
    </div>
  )
}
