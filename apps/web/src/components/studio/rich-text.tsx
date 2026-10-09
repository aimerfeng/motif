import type { ReactNode } from 'react'

/** 行内：**加粗** 和 `代码`。只生成 React 元素，不插入 HTML。 */
function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`/g)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      match[1] !== undefined ? (
        <strong key={match.index} className="font-semibold text-ink">
          {match[1]}
        </strong>
      ) : (
        <code key={match.index} className="rounded bg-white/8 px-1 py-px font-mono text-[0.9em]">
          {match[2]}
        </code>
      ),
    )
    last = match.index + match[0].length
  }
  parts.push(text.slice(last))
  return parts
}

/**
 * agent 回复里常见的那一点 Markdown：段落、「- 」列表、加粗、行内代码。
 * 不追求完整的 Markdown，只让常见的回复读起来不像源码。
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/)
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        const lines = block.split('\n')
        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 marker:text-ink-faint">
              {lines.map((line, item) => (
                <li key={item}>{inline(line.replace(/^\s*[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index} className="whitespace-pre-wrap">
            {inline(block.replace(/^#{1,6}\s+/gm, ''))}
          </p>
        )
      })}
    </div>
  )
}
