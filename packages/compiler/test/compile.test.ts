import { describe, expect, it } from 'vitest'
import { compileItem, forbiddenCss } from '../src/index.ts'
import { compileCss } from '../src/tailwind.ts'

describe('compileItem', () => {
  it('bundles relative files, keeps vendor imports external and emits only the used Tailwind classes', async () => {
    const result = await compileItem({
      entry: 'demo.tsx',
      files: {
        'demo.tsx': `import { Glow } from './glow'\nexport function Demo() { return <Glow /> }`,
        'glow.tsx': `import { motion } from 'motion/react'\nimport frag from './glow.frag'\nexport function Glow() { return <motion.div className="bg-primary animate-glow p-4" data-frag={frag} /> }`,
        'glow.frag': 'void main() {}',
        'glow.css': '@theme { --animate-glow: glow 2s ease-in-out infinite; }\n@keyframes glow { to { opacity: 0.5 } }',
      },
    })
    expect(result.diagnostics).toEqual([])
    expect(result.ok).toBe(true)
    expect(result.js).toMatch(/from ["']motion\/react["']/)
    expect(result.js).toMatch(/from ["']react\/jsx-runtime["']/)
    expect(result.js).toContain('void main() {}')
    expect(result.css).toContain('.bg-primary')
    expect(result.css).toContain('.animate-glow')
    expect(result.css).toContain('@keyframes glow')
    expect(result.css).not.toContain('.bg-red-500')
  })

  it('rejects modules that are not in the sandbox', async () => {
    const result = await compileItem({ entry: 'demo.tsx', files: { 'demo.tsx': `import confetti from 'canvas-confetti'\nexport default confetti` } })
    expect(result.ok).toBe(false)
    expect(result.diagnostics[0]?.message).toContain('"canvas-confetti" is not available in the Motif sandbox')
  })

  it('reports syntax errors with a location', async () => {
    const result = await compileItem({ entry: 'demo.tsx', files: { 'demo.tsx': 'export const x = (' } })
    expect(result.ok).toBe(false)
    expect(result.diagnostics[0]).toMatchObject({ level: 'error', file: 'demo.tsx', line: 1 })
  })

  // 社区投稿的 CSS 不可信：这些指令会让 Tailwind 读服务器上的文件（错误信息还会把内容带出来）或执行插件代码。
  it('refuses style directives that read files or load plugins, before Tailwind sees them', async () => {
    for (const css of ['@import "../../apps/web/.env.local";', '@plugin "./evil.js";', '@config "../tailwind.config.js";', '@source "../../";', '@reference "x.css";', '@\\69mport "x";']) {
      const result = await compileItem({ entry: 'demo.tsx', files: { 'demo.tsx': 'export const Demo = () => null', 'styles.css': css } })
      expect(result.ok, css).toBe(false)
      expect(result.diagnostics[0]).toMatchObject({ level: 'error', file: 'styles.css' })
      expect(result.css).toBe('')
    }
  })

  it('still allows the directives items actually use', () => {
    expect(forbiddenCss('/* glow */ @theme { --x: 1 } @keyframes a { to { opacity: 0 } } @utility b { color: red } @custom-variant c (&:hover);')).toBeNull()
  })

  // 用字符串里的注释符号骗过“先去注释”的检查：中间真实的 @import 一样要被拒绝。
  it('is not fooled by comment markers inside strings', async () => {
    const css = '.a::before { content: "/*" } @import "../../apps/web/.env.local"; .b::before { content: "*/" }'
    expect(forbiddenCss(css)).not.toBeNull()
    const result = await compileItem({ entry: 'demo.tsx', files: { 'demo.tsx': 'export const Demo = () => null', 'styles.css': css } })
    expect(result.ok).toBe(false)
  })
})

// 真正的边界：就算文本检查被绕过，Tailwind 也只能加载那三份基础样式表，插件和配置一律拒绝。
describe('compileCss loaders', () => {
  it('cannot read files or load plugins from item styles', async () => {
    await expect(compileCss({ styles: ['@import "./package.json";'], contents: [] })).rejects.toThrow(/cannot be imported/)
    await expect(compileCss({ styles: ['@import "../../apps/web/.env.local";'], contents: [] })).rejects.toThrow(/cannot be imported/)
    await expect(compileCss({ styles: ['@plugin "./src/worker.ts";'], contents: [] })).rejects.toThrow(/not allowed/)
    await expect(compileCss({ styles: ['@config "./package.json";'], contents: [] })).rejects.toThrow(/not allowed/)
  })

  it('still loads the shared base styles', async () => {
    const css = await compileCss({ styles: [], contents: [{ content: '<div className="animate-in bg-primary" />', extension: 'tsx' }] })
    expect(css).toContain('.animate-in')
    expect(css).toContain('.bg-primary')
  })
})
