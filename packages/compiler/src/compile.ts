import path from 'node:path'
import * as esbuild from 'esbuild'
import { VENDOR_IDS } from '@motif/vendor'
import { compileCss } from './tailwind.ts'

export interface Diagnostic {
  level: 'error' | 'warning'
  message: string
  file?: string
  line?: number
  column?: number
}

export interface CompileInput {
  /** 条目的全部文件：相对路径 → 文本。 */
  files: Record<string, string>
  /** 作为模块入口的文件（预览时是 demo 文件）。 */
  entry: string
  minify?: boolean
}

export interface CompileResult {
  ok: boolean
  js: string
  css: string
  diagnostics: Diagnostic[]
}

const NAMESPACE = 'motif-item'
const RESOLVE_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts']
const LOADERS: Record<string, esbuild.Loader> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.jsx': 'jsx',
  '.js': 'js',
  '.glsl': 'text',
  '.frag': 'text',
  '.vert': 'text',
}
const vendorIds = new Set(VENDOR_IDS)

/**
 * 把条目的文件编译成一个 ES 模块和一份样式表。
 * 相对导入在给定文件之间解析；裸模块只允许 vendor 清单里的（保持 external，由沙箱的 import map 提供）。
 * 市场条目的构建和 Studio 的实时编译都走这里，保证两边行为一致。
 */
export async function compileItem(input: CompileInput): Promise<CompileResult> {
  const { files, entry, minify = false } = input
  const diagnostics: Diagnostic[] = []

  if (!Object.hasOwn(files, entry)) {
    return { ok: false, js: '', css: '', diagnostics: [{ level: 'error', message: `entry file "${entry}" does not exist` }] }
  }

  let js: string
  try {
    const result = await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
      jsx: 'automatic',
      minify,
      legalComments: 'eof',
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
      plugins: [virtualFiles(files)],
    })
    js = result.outputFiles[0]?.text ?? ''
    diagnostics.push(...result.warnings.map((message) => toDiagnostic('warning', message)))
  } catch (error) {
    const failure = error as Partial<esbuild.BuildFailure>
    if (!failure.errors) throw error
    diagnostics.push(...failure.errors.map((message) => toDiagnostic('error', message)))
    diagnostics.push(...(failure.warnings ?? []).map((message) => toDiagnostic('warning', message)))
    return { ok: false, js: '', css: '', diagnostics }
  }

  const styleFiles = Object.entries(files).filter(([file]) => file.endsWith('.css'))
  // 这些指令会让 Tailwind 去读服务器上的文件或执行插件代码；条目的样式只需要自身的 CSS，一律拒绝，不交给 Tailwind。
  for (const [file, text] of styleFiles) {
    const problem = forbiddenCss(text)
    if (problem) diagnostics.push({ level: 'error', message: problem, file })
  }
  if (diagnostics.some((diagnostic) => diagnostic.level === 'error')) return { ok: false, js, css: '', diagnostics }
  const styles = styleFiles.map(([, text]) => text)
  const scanned = Object.entries(files)
    .filter(([file]) => /\.(tsx?|jsx?)$/.test(file))
    .map(([file, content]) => ({ content, extension: path.extname(file).slice(1) }))

  let css: string
  try {
    css = await compileCss({ styles, contents: scanned, minify })
  } catch (error) {
    diagnostics.push({ level: 'error', message: `tailwind: ${error instanceof Error ? error.message : String(error)}` })
    return { ok: false, js, css: '', diagnostics }
  }

  return { ok: true, js, css, diagnostics }
}

function virtualFiles(files: Record<string, string>): esbuild.Plugin {
  const resolveRelative = (importer: string, specifier: string): string | null => {
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier))
    for (const extension of RESOLVE_EXTENSIONS) {
      const candidate = `${base}${extension}`
      if (Object.hasOwn(files, candidate)) return candidate
    }
    return null
  }

  return {
    name: 'motif-virtual-files',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return { path: args.path, namespace: NAMESPACE }
        if (args.path.startsWith('./') || args.path.startsWith('../')) {
          const resolved = resolveRelative(args.importer, args.path)
          if (resolved) return { path: resolved, namespace: NAMESPACE }
          return { errors: [{ text: `cannot find "${args.path}" imported from ${args.importer}` }] }
        }
        if (vendorIds.has(args.path)) return { path: args.path, external: true }
        return {
          errors: [
            {
              text: `"${args.path}" is not available in the Motif sandbox. Available modules: ${[...vendorIds].join(', ')}`,
            },
          ],
        }
      })
      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
        const loader = LOADERS[path.posix.extname(args.path)]
        if (!loader) return { errors: [{ text: `unsupported file type: ${args.path} (styles go in .css files listed in the item)` }] }
        return { contents: files[args.path] ?? '', loader, resolveDir: '/' }
      })
    },
  }
}

const FORBIDDEN_AT_RULES = /@(import|plugin|config|source|reference)\b/i

/**
 * 条目 CSS 里不允许的指令。直接查原文、不先去注释：用正则“去注释”分不清字符串里的注释符号和真正的注释，
 * 一对写在字符串里的注释开头、结尾就能把中间真实的 @import 藏过去。注释里提到这些词也一并拒绝，代价很小。
 * 这只是第一道检查，真正的边界在 tailwind.ts 的加载器里。转义过的 at 规则名也拒绝。
 */
export function forbiddenCss(css: string): string | null {
  const match = FORBIDDEN_AT_RULES.exec(css)
  if (match) return `${match[0]} is not allowed in item styles (not even in comments); everything an item needs is already available in the sandbox`
  if (/@[\w-]*\\/.test(css)) return 'escaped at-rule names are not allowed in item styles'
  return null
}

function toDiagnostic(level: Diagnostic['level'], message: esbuild.Message): Diagnostic {
  const diagnostic: Diagnostic = { level, message: message.text }
  if (message.location) {
    // esbuild 会在虚拟文件名前加命名空间前缀，报告给用户（和 agent）时去掉。
    diagnostic.file = message.location.file.replace(`${NAMESPACE}:`, '')
    diagnostic.line = message.location.line
    diagnostic.column = message.location.column
  }
  return diagnostic
}
