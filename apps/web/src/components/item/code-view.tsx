'use client'

import { bake, printDefaults, type ParamValues } from '@motif/schema/core'
import { useState } from 'react'
import { useCopy } from '@/lib/clipboard'
import type { CodeLine, HighlightedCode } from '@/lib/code-tokens'

// 与 shiki 的 vesper 主题一致的颜色，用来给客户端生成的默认值区域着色。
const COLORS = { comment: '#8B8B8B94', keyword: '#A0A0A0', string: '#99FFE4', number: '#FFC799', plain: '#FFF' }

/** 默认值区域的格式固定（printDefaults 生成），用一个很小的分词器就能正确着色。 */
function tokenizeDefaults(values: ParamValues, palette: string[]): CodeLine[] {
  const index = (color: string) => Math.max(0, palette.indexOf(color))
  return printDefaults(values)
    .split('\n')
    .map((line) => {
      if (line.startsWith('/*')) return [index(COLORS.comment), line]
      if (line.startsWith('export const')) return [index(COLORS.keyword), 'export const ', index(COLORS.plain), 'defaults', index(COLORS.keyword), ' = {']
      const out: CodeLine = []
      const pattern = /('(?:[^'\\]|\\.)*')|(-?\d+(?:\.\d+)?(?:e-?\d+)?)|(true|false|null)|([A-Za-z_$][\w$]*)(?=:)|(\s+)|(.)/g
      for (const match of line.matchAll(pattern)) {
        const [text, string, number, literal, key, space] = match
        const color = string ? COLORS.string : number || literal ? COLORS.number : key || space ? COLORS.plain : COLORS.keyword
        out.push(index(color), text)
      }
      return out
    })
}

function Lines({ lines, tuned }: { lines: CodeLine[]; tuned?: boolean }) {
  return lines.map((line, index) => {
    const segments = []
    for (let i = 0; i < line.length; i += 2) {
      segments.push(
        <span key={i} className={`t${line[i] as number}`}>
          {line[i + 1]}
        </span>,
      )
    }
    return (
      <div key={index} className="code-line" data-tuned={tuned || undefined}>
        {segments}
      </div>
    )
  })
}

/**
 * 条目的源码。组件本体里的默认值区域按当前参数实时重新生成——
 * 用户在这里看到、复制的代码，就是下载得到的代码。
 */
export function CodeView({
  code,
  sources,
  entry,
  values,
  labels,
}: {
  code: HighlightedCode
  /** 条目文件的原文（复制用），和导出共用同一份。 */
  sources: Record<string, string>
  entry: string
  values: ParamValues
  labels: { copy: string; copied: string; failed: string; tuned: string }
}) {
  const [active, setActive] = useState(code.files[0]?.path)
  const { copy, stateOf } = useCopy()
  const file = code.files.find((f) => f.path === active) ?? code.files[0]
  if (!file) return null

  const isEntry = file.path === entry && file.after !== null
  const source = sources[file.path] ?? ''
  const text = isEntry ? bake(source, values) : source
  const state = stateOf(file.path)
  const paletteCss = code.palette.map((color, index) => `.code-tokens .t${index}{color:${color}}`).join('')

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken">
      <style>{paletteCss}</style>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
        {code.files.map((f) => (
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
          <button type="button" onClick={() => void copy(file.path, text)} className="rounded-md px-2.5 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
            <span aria-live="polite">{state === 'copied' ? labels.copied : state === 'failed' ? labels.failed : labels.copy}</span>
          </button>
        </span>
      </div>
      <pre className="code-tokens max-h-[560px] overflow-auto py-3 font-mono text-[12.5px] leading-[1.7]" data-testid="code-view">
        <code className="code-lines">
          <Lines lines={file.before} />
          {isEntry && (
            <>
              <Lines lines={tokenizeDefaults(values, code.palette)} tuned />
              <Lines lines={file.after ?? []} />
            </>
          )}
        </code>
      </pre>
    </div>
  )
}
