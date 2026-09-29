import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const LANGS: Record<string, string> = { tsx: 'tsx', ts: 'typescript', jsx: 'tsx', js: 'typescript', css: 'css', glsl: 'glsl', frag: 'glsl', vert: 'glsl', json: 'json', md: 'markdown', sh: 'bash' }
const THEME = 'vesper'

let highlighter: Promise<HighlighterCore> | null = null

// 用纯 JS 的正则引擎，避免在服务端打包 oniguruma 的 wasm。
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/vesper.mjs')],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/glsl.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/markdown.mjs'),
      import('shiki/langs/bash.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

/** 在服务端把代码高亮成 HTML（零客户端 JS）。 */
export async function highlight(code: string, fileName: string): Promise<string> {
  const extension = fileName.split('.').pop() ?? ''
  const lang = LANGS[extension] ?? 'typescript'
  const instance = await getHighlighter()
  return instance.codeToHtml(code, { lang, theme: THEME })
}
