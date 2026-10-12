import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimize } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { compile } from 'tailwindcss'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

// 沙箱里所有条目共用的样式基础：Tailwind、tw-animate-css（shadcn 生态的 animate-in 等工具类）、Motif 主题变量。
const BASE_CSS = ['@import "tailwindcss";', '@import "tw-animate-css";', '@import "@motif/runtime/theme.css";'].join('\n')

/**
 * 编译时唯一能读的三份样式表（都是本包的依赖，自身不再 @import 别的文件）。
 * 条目 CSS 和基础样式拼在一起交给 Tailwind；Tailwind 遇到 @import / @plugin / @config 会回调加载器，
 * 这里的加载器只认这张表、拒绝一切插件和配置——即使文本检查（forbiddenCss）被绕过，投稿也读不到服务器上的文件、执行不了代码。
 */
const STYLESHEETS: Record<string, string> = {
  tailwindcss: path.join(PACKAGE_ROOT, 'node_modules/tailwindcss/index.css'),
  'tw-animate-css': path.join(PACKAGE_ROOT, 'node_modules/tw-animate-css/dist/tw-animate.css'),
  '@motif/runtime/theme.css': path.join(PACKAGE_ROOT, 'node_modules/@motif/runtime/src/theme.css'),
}
const contents = new Map<string, Promise<string>>()

async function loadStylesheet(id: string) {
  const file = Object.hasOwn(STYLESHEETS, id) ? STYLESHEETS[id] : undefined
  if (!file) throw new Error(`"${id}" cannot be imported in item styles`)
  let content = contents.get(file)
  if (!content) {
    content = readFile(file, 'utf8')
    contents.set(file, content)
  }
  return { path: file, base: path.dirname(file), content: await content }
}

function loadModule(id: string): never {
  throw new Error(`plugins and configs ("${id}") are not allowed in item styles`)
}

type Compiler = Awaited<ReturnType<typeof compile>>
const compilers = new Map<string, Promise<Compiler>>()

/** 同样的样式输入复用同一个 Tailwind 编译器（解析 CSS 是主要开销）。 */
function compilerFor(styles: string[]): Promise<Compiler> {
  const css = [BASE_CSS, ...styles].join('\n\n')
  const key = createHash('sha1').update(css).digest('hex')
  let compiler = compilers.get(key)
  if (!compiler) {
    compiler = compile(css, { base: PACKAGE_ROOT, loadStylesheet, loadModule })
    // 编译失败的不留在缓存里，下次重新报错（也不占位置）。
    compiler.catch(() => compilers.delete(key))
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

export async function compileCss({ styles, contents: sources, minify = false }: CssInput): Promise<string> {
  const compiler = await compilerFor(styles)
  const scanner = new Scanner({ sources: [] })
  const candidates = scanner.scanFiles(sources)
  const css = compiler.build(candidates)
  return minify ? optimize(css, { minify: true }).code : css
}
