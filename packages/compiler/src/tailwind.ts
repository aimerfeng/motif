import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { compile, optimize } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

// 沙箱里所有条目共用的样式基础：Tailwind、tw-animate-css（shadcn 生态的 animate-in 等工具类）、Motif 主题变量。
const BASE_CSS = ['@import "tailwindcss";', '@import "tw-animate-css";', '@import "@motif/runtime/theme.css";'].join('\n')

type Compiler = Awaited<ReturnType<typeof compile>>
const compilers = new Map<string, Promise<Compiler>>()

/** 同样的样式输入复用同一个 Tailwind 编译器（解析 CSS 是主要开销）。 */
function compilerFor(styles: string[]): Promise<Compiler> {
  const css = [BASE_CSS, ...styles].join('\n\n')
  const key = createHash('sha1').update(css).digest('hex')
  let compiler = compilers.get(key)
  if (!compiler) {
    compiler = compile(css, { base: PACKAGE_ROOT, onDependency: () => {} })
    compilers.set(key, compiler)
    // 防止 Studio 长时间运行后缓存无限增长。
    if (compilers.size > 64) compilers.delete(compilers.keys().next().value!)
  }
  return compiler
}

export interface CssInput {
  /** 条目自带的 CSS 文件（@theme、@keyframes 等），追加在基础样式之后。 */
  styles: string[]
  /** 需要扫描 Tailwind 类名的源码。 */
  contents: { content: string; extension: string }[]
  minify?: boolean
}

export async function compileCss({ styles, contents, minify = false }: CssInput): Promise<string> {
  const compiler = await compilerFor(styles)
  const scanner = new Scanner({ sources: [] })
  const candidates = scanner.scanFiles(contents)
  const css = compiler.build(candidates)
  return minify ? optimize(css, { minify: true }).code : css
}
