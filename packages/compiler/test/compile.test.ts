import { describe, expect, it } from 'vitest'
import { compileItem } from '../src/index.ts'

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
})
