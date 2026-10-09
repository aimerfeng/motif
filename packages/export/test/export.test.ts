import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import * as esbuild from 'esbuild'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { defaultsOf, printDefaults, type ItemSource, type ParamValues } from '@motif/schema'
import { loadItemSource, ITEMS_DIR } from '@motif/registry'
import { bundleRuntime, componentFiles, exportRegistryItem, exportSkillZip, exportStarterZip, prepareExport, skillMarkdown, viteStarter, type ExportContext } from '../src/index.ts'

const RUNTIME_SRC = fileURLToPath(new URL('../../runtime/src/', import.meta.url))
const runtimeFiles = Object.fromEntries(
  readdirSync(RUNTIME_SRC)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => [file, readFileSync(path.join(RUNTIME_SRC, file), 'utf8')]),
)

const context: ExportContext = {
  origin: 'https://motif.example',
  vendor: { react: '19.3.0', 'react-dom': '19.3.0', motion: '13.4.6', '@paper-design/shaders-react': '0.0.81', three: '0.186.1', cobe: '2.0.1' },
  runtime: { files: runtimeFiles, dependencies: { clsx: '^2.1.1', 'tailwind-merge': '^3.7.0' }, themeCss: readFileSync(path.join(RUNTIME_SRC, 'theme.css'), 'utf8') },
}

const load = (slug: string): Promise<ItemSource> => loadItemSource(path.join(ITEMS_DIR, slug))

/** 用 esbuild 在内存里打包导出的项目，确认所有相对导入都能解析、语法正确（npm 包保持 external）。 */
async function bundleCheck(files: Record<string, string>, entry: string) {
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'esm',
    jsx: 'automatic',
    logLevel: 'silent',
    plugins: [
      {
        name: 'memory',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === 'entry-point') return { path: args.path, namespace: 'mem' }
            if (args.path.startsWith('.')) {
              const base = path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path))
              for (const ext of ['', '.ts', '.tsx', '.css']) if (`${base}${ext}` in files) return { path: `${base}${ext}`, namespace: 'mem' }
              return { errors: [{ text: `missing ${args.path} from ${args.importer}` }] }
            }
            return { path: args.path, external: true }
          })
          build.onLoad({ filter: /.*/, namespace: 'mem' }, (args) => ({
            contents: files[args.path],
            loader: args.path.endsWith('.css') ? 'empty' : args.path.endsWith('.tsx') ? 'tsx' : 'ts',
          }))
        },
      },
    ],
  })
  return result.outputFiles[0]!.text
}

describe('bundleRuntime', () => {
  it('merges the runtime modules into one file without relative imports', async () => {
    const code = bundleRuntime(runtimeFiles)
    expect(code).not.toMatch(/from '\.\//)
    for (const name of ['cn', 'cssVars', 'usePrefersReducedMotion', 'useIsActive', 'useFrameLoop', 'useCanvasSize', 'createProgram', 'bindFullscreenQuad', 'releaseContext']) {
      expect(code).toMatch(new RegExp(`export function ${name}\\b`))
    }
    expect(code.match(/from 'react'/g)).toHaveLength(1)
    await esbuild.transform(code, { loader: 'ts' })
  })
})

describe('item exports', () => {
  it('bakes tuned values into the component defaults', async () => {
    const item = await load('border-beam')
    const values = { ...defaultsOf(item.manifest.params), size: 300, colorFrom: '#00ff88' }
    const { bakedEntry, hash } = await prepareExport(item, values)
    expect(bakedEntry).toContain('size: 300,')
    expect(bakedEntry).toContain("colorFrom: '#00ff88',")
    expect(hash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('produces a Vite starter whose imports all resolve', async () => {
    for (const slug of ['border-beam', 'liquid-form', 'mesh-gradient']) {
      const item = await load(slug)
      const values = defaultsOf(item.manifest.params)
      const files = viteStarter(item, values, context, await prepareExport(item, values))
      const pkg = JSON.parse(files['package.json']!) as { dependencies: Record<string, string> }
      expect(pkg.dependencies.react).toBe('^19.3.0')
      expect(pkg.dependencies.clsx).toBe('^2.1.1')
      expect(files['src/lib/motif-runtime.ts']).toBeDefined()
      expect(Object.values(files).join('\n')).not.toContain('@motif/runtime')
      await bundleCheck(files, 'src/main.tsx')
    }
  })

  it('writes a standard SKILL.md with the tuned parameter table', async () => {
    const item = await load('liquid-form')
    const values = { ...defaultsOf(item.manifest.params), metal: 1.4 }
    const markdown = skillMarkdown(item, values, context, { hash: 'abcd1234' })
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(markdown)![1]!
    expect(frontmatter).toMatch(/^name: motif-liquid-form$/m)
    const description = JSON.parse(/^description: (.*)$/m.exec(frontmatter)![1]!) as string
    expect(description.length).toBeLessThanOrEqual(1024)
    expect(markdown).toContain('| `metal` | 1.4 | 1 |')
    expect(markdown).toContain('License: MIT')
    expect(markdown.split('\n').length).toBeLessThan(500)
  })

  it('zips the starter and the skill into single folders', async () => {
    const item = await load('mesh-gradient')
    const values = defaultsOf(item.manifest.params)
    const starter = unzipSync((await exportStarterZip(item, values, context)).data)
    expect(Object.keys(starter)).toContain('motif-mesh-gradient/package.json')
    expect(Object.keys(starter)).toContain('motif-mesh-gradient/.claude/skills/motif-mesh-gradient/SKILL.md')
    const skill = unzipSync((await exportSkillZip(item, values, context)).data)
    expect(strFromU8(skill['motif-mesh-gradient/SKILL.md']!)).toContain('name: motif-mesh-gradient')
    expect(Object.keys(skill)).toContain('motif-mesh-gradient/assets/mesh-gradient.tsx')
  })

  it('builds a shadcn registry item that depends on motif-runtime', async () => {
    const item = await load('liquid-form')
    const json = await exportRegistryItem(item, defaultsOf(item.manifest.params), context)
    expect(json.registryDependencies).toEqual(['https://motif.example/r/motif-runtime.json'])
    expect(json.files.map((file) => file.target)).toEqual(['components/motif/liquid-form/liquid-form.tsx', 'components/motif/liquid-form/shaders.ts'])
    expect(json.files[0]!.content).toContain("from '@/lib/motif-runtime'")
    expect(json.dependencies).toEqual([])
  })

  it('writes hostile text values into exported code as plain strings', () => {
    // 分享链接里的参数会写进别人项目里的源码：执行后只能得到同样的值，不能多出任何语句。
    const values: ParamValues = {
      quote: "it's \\ \"both\"",
      lines: 'a\nb\r\nc\u2028d\u2029e',
      control: 'tab\there\u0000\u001b',
      marker: 'x /* @motif:end */ y */ *\\/',
      unicode: '母题 🎨',
      odd: { "a':globalThis.pwned=1,'b": 1, 'x-y': 2 },
    }
    const sandbox: Record<string, unknown> = {}
    const result: unknown = runInNewContext(`${printDefaults(values).replace('export const', 'const')}; defaults`, sandbox)
    expect(JSON.parse(JSON.stringify(result))).toEqual(values)
    expect(sandbox.pwned).toBeUndefined()
  })

  it('lists every component file for manual copy, with the tuned entry', async () => {
    const item = await load('liquid-form')
    const values = defaultsOf(item.manifest.params)
    const { bakedEntry } = await prepareExport(item, values)
    const files = componentFiles(item, bakedEntry)
    expect(files.map((file) => file.target)).toEqual(['components/motif/liquid-form/liquid-form.tsx', 'components/motif/liquid-form/shaders.ts'])
    expect(files[0]!.content).toContain("from '@/lib/motif-runtime'")
  })
})
