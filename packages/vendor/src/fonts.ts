import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FONTS } from './manifest.ts'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(path.join(PACKAGE_ROOT, 'package.json'))

function packageDir(pkg: string): string {
  return path.dirname(require.resolve(`${pkg}/package.json`))
}

/**
 * 把字体包的 CSS 与 woff2 复制到 outDir（沙箱的 /fonts/），生成一个汇总的 fonts.css。
 * 只复制 CSS 里实际引用的 woff2；返回字体包名 → 版本。
 */
export async function buildFonts(options: { outDir: string; basePath?: string }): Promise<Record<string, string>> {
  const { outDir, basePath = '/fonts/' } = options
  await mkdir(outDir, { recursive: true })
  const sheets: string[] = []
  const versions: Record<string, string> = {}

  for (const font of FONTS) {
    const dir = packageDir(font.pkg)
    const safe = font.pkg.replace(/^@/, '').replaceAll('/', '__')
    const pkgJson = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as { version: string }
    versions[font.pkg] = pkgJson.version
    await mkdir(path.join(outDir, safe), { recursive: true })

    for (const cssFile of font.css) {
      const css = await readFile(path.join(dir, cssFile), 'utf8')
      if (!css.includes(`font-family: '${font.family}'`)) throw new Error(`${font.pkg}/${cssFile} does not declare font-family '${font.family}'`)
      const rewritten = await rewriteUrls(css, dir, path.join(outDir, safe), `${basePath}${safe}/`)
      sheets.push(`/* ${font.pkg}/${cssFile} (OFL-1.1) */\n${rewritten}`)
    }
  }

  await writeFile(path.join(outDir, 'fonts.css'), `${sheets.join('\n')}\n`)
  return versions
}

/** 只保留 woff2 源（去掉 woff 回退），把相对路径改成沙箱里的绝对路径，并复制文件。 */
async function rewriteUrls(css: string, sourceDir: string, targetDir: string, urlBase: string): Promise<string> {
  const copies: Promise<void>[] = []
  const result = css.replace(/src:\s*([^;]+);/g, (_match, sources: string) => {
    const woff2 = sources
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.includes('.woff2'))
      .map((part) =>
        part.replace(/url\(\.\/files\/([^)]+)\)/, (_m, file: string) => {
          copies.push(copyFile(path.join(sourceDir, 'files', file), path.join(targetDir, file)))
          return `url(${urlBase}${file})`
        }),
      )
    return `src: ${woff2.join(', ')};`
  })
  await Promise.all(copies)
  return result
}
