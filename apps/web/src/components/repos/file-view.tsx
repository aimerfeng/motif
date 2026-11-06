import type { ReactNode } from 'react'
import { highlightSource, type CodeLine } from '@/lib/code-tokens'

function Lines({ lines }: { lines: CodeLine[] }) {
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
      <div key={index} className="code-line">
        {segments}
      </div>
    )
  })
}

/** 仓库里一个文件的内容：认识的语言高亮，其余按纯文本。和条目页的代码视图同一套样式（行号、配色）。 */
export async function FileView({ path, source, toolbar }: { path: string; source: string; toolbar?: ReactNode }) {
  const highlighted = await highlightSource(path, source)
  const plain = (source.endsWith('\n') ? source.slice(0, -1) : source).split('\n')
  return (
    <div data-theme="dark" className="overflow-hidden rounded-xl border border-line bg-sunken text-ink">
      {highlighted && <style>{highlighted.palette.map((color, index) => `.code-tokens .t${index}{color:${color}}`).join('')}</style>}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span className="truncate font-mono text-[12.5px] text-ink-muted">{path}</span>
        {toolbar}
      </div>
      <pre className="code-tokens max-h-[70vh] overflow-auto py-3 font-mono text-[12.5px] leading-[1.7]" data-testid="repo-file">
        <code className="code-lines">
          {highlighted ? (
            <Lines lines={highlighted.lines} />
          ) : (
            plain.map((line, index) => (
              <div key={index} className="code-line">
                {line}
              </div>
            ))
          )}
        </code>
      </pre>
    </div>
  )
}
