import { DEFAULTS_END, DEFAULTS_START } from '@motif/schema'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

/**
 * 一行高亮好的代码：[颜色序号, 文本, 颜色序号, 文本, …]，序号指向 HighlightedCode.palette。
 * 用紧凑数组而不是 { content, color } 对象：模板条目有上千行，对象写法会让页面大好几倍。
 */
export type CodeLine = (number | string)[]

/**
 * 高亮好的源码文件。组件本体被默认值区域切成前后两段分别高亮，
 * 中间那段在客户端按当前参数重新生成，所以代码视图随调参实时变化。
 */
export interface HighlightedFile {
  path: string
  before: CodeLine[]
  /** 只有组件本体（有默认值区域）才有；其余文件整份放在 before。 */
  after: CodeLine[] | null
}

export interface HighlightedCode {
  /** 这一页用到的颜色；所有主题颜色按首次出现的顺序编号，各页一致。 */
  palette: string[]
  files: HighlightedFile[]
}

const LANGS: Record<string, string> = { tsx: 'tsx', ts: 'typescript', jsx: 'tsx', js: 'typescript', css: 'css', json: 'json', md: 'markdown' }
const THEME = 'vesper'

let highlighter: Promise<HighlighterCore> | null = null
const palette: string[] = []

// 纯 JS 正则引擎：不在服务端打包 oniguruma 的 wasm。
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/vesper.mjs')],
    langs: [import('shiki/langs/tsx.mjs'), import('shiki/langs/typescript.mjs'), import('shiki/langs/css.mjs'), import('shiki/langs/json.mjs'), import('shiki/langs/markdown.mjs')],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

function colorIndex(color: string): number {
  const normalized = color.toUpperCase()
  let index = palette.indexOf(normalized)
  if (index === -1) index = palette.push(normalized) - 1
  return index
}

async function tokenize(code: string, lang: string): Promise<CodeLine[]> {
  if (code === '') return []
  const instance = await getHighlighter()
  const { tokens, fg = '#FFF' } = instance.codeToTokens(code, { lang, theme: THEME })
  return tokens.map((line) => {
    const out: CodeLine = []
    for (const token of line) {
      // 空白看不出颜色：并进前一段，行首缩进则跟着后一段的颜色；颜色相同的相邻片段合成一段。
      const index = colorIndex(token.color ?? fg)
      const last = out.length - 2
      if (last >= 0) {
        const previous = out[last + 1] as string
        if (token.content.trim() === '' || out[last] === index) {
          out[last + 1] = previous + token.content
          continue
        }
        if (previous.trim() === '') {
          out[last] = index
          out[last + 1] = previous + token.content
          continue
        }
      }
      out.push(index, token.content)
    }
    return out
  })
}

async function highlightFile(path: string, source: string, isEntry: boolean): Promise<HighlightedFile> {
  const lang = LANGS[path.split('.').pop() ?? ''] ?? 'typescript'
  const lines = source.split('\n')
  if (lines.at(-1) === '') lines.pop()
  const start = isEntry ? lines.findIndex((line) => line.trim() === DEFAULTS_START) : -1
  const end = start === -1 ? -1 : lines.findIndex((line, index) => index > start && line.trim() === DEFAULTS_END)
  if (start === -1 || end === -1) return { path, before: await tokenize(lines.join('\n'), lang), after: null }
  const [before, after] = await Promise.all([tokenize(lines.slice(0, start).join('\n'), lang), tokenize(lines.slice(end + 1).join('\n'), lang)])
  return { path, before, after }
}

/** 高亮一个条目的若干文件，连同调色板一起交给客户端的代码视图。 */
export async function highlightFiles(files: { path: string; source: string; isEntry: boolean }[]): Promise<HighlightedCode> {
  const highlighted = await Promise.all(files.map((file) => highlightFile(file.path, file.source, file.isEntry)))
  return { palette: [...palette], files: highlighted }
}
