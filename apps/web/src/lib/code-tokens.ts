import { DEFAULTS_END, DEFAULTS_START } from '@motif/schema'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export interface CodeToken {
  content: string
  color?: string
}
export type CodeLine = CodeToken[]

/**
 * 高亮好的源码文件。组件本体被默认值区域切成前后两段分别高亮，
 * 中间那段在客户端按当前参数重新生成，所以代码视图随调参实时变化。
 */
export interface HighlightedFile {
  path: string
  source: string
  before: CodeLine[]
  /** 只有组件本体（有默认值区域）才有；其余文件整份放在 before。 */
  after: CodeLine[] | null
}

const LANGS: Record<string, string> = { tsx: 'tsx', ts: 'typescript', jsx: 'tsx', js: 'typescript', css: 'css', json: 'json', md: 'markdown' }

let highlighter: Promise<HighlighterCore> | null = null

// 纯 JS 正则引擎：不在服务端打包 oniguruma 的 wasm。
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/vesper.mjs')],
    langs: [import('shiki/langs/tsx.mjs'), import('shiki/langs/typescript.mjs'), import('shiki/langs/css.mjs'), import('shiki/langs/json.mjs'), import('shiki/langs/markdown.mjs')],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

async function tokenize(code: string, lang: string): Promise<CodeLine[]> {
  if (code === '') return []
  const instance = await getHighlighter()
  const { tokens } = instance.codeToTokens(code, { lang, theme: 'vesper' })
  return tokens.map((line) => line.map((token) => (token.color ? { content: token.content, color: token.color } : { content: token.content })))
}

export async function highlightFile(path: string, source: string, isEntry: boolean): Promise<HighlightedFile> {
  const lang = LANGS[path.split('.').pop() ?? ''] ?? 'typescript'
  const lines = source.split('\n')
  if (lines.at(-1) === '') lines.pop()
  const start = isEntry ? lines.findIndex((line) => line.trim() === DEFAULTS_START) : -1
  const end = start === -1 ? -1 : lines.findIndex((line, index) => index > start && line.trim() === DEFAULTS_END)
  if (start === -1 || end === -1) return { path, source, before: await tokenize(lines.join('\n'), lang), after: null }
  const [before, after] = await Promise.all([tokenize(lines.slice(0, start).join('\n'), lang), tokenize(lines.slice(end + 1).join('\n'), lang)])
  return { path, source, before, after }
}
