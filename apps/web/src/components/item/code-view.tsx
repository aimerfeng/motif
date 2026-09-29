'use client'

import { bake, printDefaults, type ParamValues } from '@motif/schema'
import { useState } from 'react'
import type { CodeLine, HighlightedFile } from '@/lib/code-tokens'

// 与 shiki 的 vesper 主题一致的颜色，用来给客户端生成的默认值区域着色。
const COLORS = { comment: '#8b8b8b94', keyword: '#A0A0A0', string: '#99FFE4', number: '#FFC799', plain: '#FFF' }

/** 默认值区域的格式固定（printDefaults 生成），用一个很小的分词器就能正确着色。 */
function tokenizeDefaults(values: ParamValues): CodeLine[] {
  return printDefaults(values)
    .split('\n')
    .map((line) => {
      if (line.startsWith('/*')) return [{ content: line, color: COLORS.comment }]
      if (line.startsWith('export const')) {
        return [
          { content: 'export const ', color: COLORS.keyword },
          { content: 'defaults', color: COLORS.plain },
          { content: ' = {', color: COLORS.keyword },
        ]
      }
      const tokens: CodeLine = []
      const pattern = /('(?:[^'\\]|\\.)*')|(-?\d+(?:\.\d+)?(?:e-?\d+)?)|(true|false|null)|([A-Za-z_$][\w$]*)(?=:)|(\s+)|(.)/g
      for (const match of line.matchAll(pattern)) {
        const [text, string, number, literal, key] = match
        const color = string ? COLORS.string : number || literal ? COLORS.number : key ? COLORS.plain : /\s/.test(text) ? undefined : COLORS.keyword
        tokens.push(color ? { content: text, color } : { content: text })
      }
      return tokens
    })
}

function Lines({ lines, start, highlight }: { lines: CodeLine[]; start: number; highlight?: boolean }) {
  return (
    <>
      {lines.map((line, index) => (
        <div key={start + index} className={`grid grid-cols-[3.25rem_1fr] ${highlight ? 'bg-[oklch(0.84_0.07_285/0.07)]' : ''}`}>
          <span aria-hidden className="pr-4 text-right text-ink-faint/50 select-none">
            {start + index}
          </span>
          <span className="whitespace-pre">
            {line.length === 0 ? '​' : line.map((token, i) => <span key={i} style={token.color ? { color: token.color } : undefined}>{token.content}</span>)}
          </span>
        </div>
      ))}
    </>
  )
}

/**
 * 条目的源码。组件本体里的默认值区域按当前参数实时重新生成——
 * 用户在这里看到、复制的代码，就是下载得到的代码。
 */
export function CodeView({ files, entry, values, labels }: { files: HighlightedFile[]; entry: string; values: ParamValues; labels: { copy: string; copied: string; tuned: string } }) {
  const [active, setActive] = useState(files[0]?.path)
  const [copied, setCopied] = useState<string | null>(null)
  const file = files.find((f) => f.path === active) ?? files[0]
  if (!file) return null

  const isEntry = file.path === entry && file.after !== null
  const region = isEntry ? tokenizeDefaults(values) : []
  const text = isEntry ? bake(file.source, values) : file.source

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(file.path)
    window.setTimeout(() => setCopied((current) => (current === file.path ? null : current)), 1600)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
        {files.map((f) => (
          <button
            key={f.path}
            type="button"
            aria-pressed={f.path === file.path}
            onClick={() => setActive(f.path)}
            className="shrink-0 rounded-md px-2.5 py-1 font-mono text-[12px] text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:bg-white/8 aria-pressed:text-ink"
          >
            {f.path}
          </button>
        ))}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {isEntry && <span className="hidden text-[11.5px] text-ink-faint sm:inline">{labels.tuned}</span>}
          <button type="button" onClick={() => void copy()} className="rounded-md px-2.5 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
            {copied === file.path ? labels.copied : labels.copy}
          </button>
        </span>
      </div>
      <pre className="max-h-[560px] overflow-auto py-3 font-mono text-[12.5px] leading-[1.7]" data-testid="code-view">
        <code>
          <Lines lines={file.before} start={1} />
          {isEntry && (
            <>
              <Lines lines={region} start={file.before.length + 1} highlight />
              <Lines lines={file.after ?? []} start={file.before.length + region.length + 1} />
            </>
          )}
        </code>
      </pre>
    </div>
  )
}
