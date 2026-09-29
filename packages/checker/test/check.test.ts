import { describe, expect, it } from 'vitest'
import { printDefaults, type ItemSource } from '@motif/schema'
import { checkItem, importsOf } from '../src/index.ts'

const SHA = 'a'.repeat(40)
const context = {
  sources: [{ id: 'up', repo: 'owner/up', sha: SHA, spdx: 'MIT', copyright: ['Copyright (c) Up'] }],
  vendorIds: ['react', 'react/jsx-runtime', 'motion/react', '@motif/runtime'],
}

const header = '// SPDX-License-Identifier: MIT\n// Copyright (c) Up\n'
const component = `${header}import { motion } from 'motion/react'\nimport { useFrameLoop } from '@motif/runtime'\n${printDefaults({ speed: 1 })}\nexport function Glow() { return null }\n`

function item(overrides: Partial<ItemSource['manifest']> = {}, files: Record<string, string> = {}): ItemSource {
  return {
    manifest: {
      schemaVersion: 1,
      slug: 'glow',
      status: 'draft',
      title: { 'zh-CN': '光', en: 'Glow' },
      summary: { 'zh-CN': '光', en: 'Glow' },
      category: 'background',
      tags: [],
      runtime: ['motion'],
      entry: { file: 'glow.tsx', export: 'Glow' },
      demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
      files: [
        { path: 'glow.tsx', role: 'component' },
        { path: 'demo.tsx', role: 'demo' },
      ],
      params: [{ key: 'speed', label: { 'zh-CN': '速度', en: 'Speed' }, type: 'number', default: 1, min: 0, max: 2, step: 0.1 }],
      presets: [],
      dependencies: ['motion/react', '@motif/runtime'],
      perf: { webgl: false, maxDpr: 2 },
      a11y: { reducedMotion: 'static' },
      provenance: {
        kind: 'upstream',
        upstream: { source: 'up', repo: 'owner/up', sha: SHA, paths: ['glow.tsx'], spdx: 'MIT', copyright: ['Copyright (c) Up'] },
        modifications: [],
        assets: [],
      },
      ...overrides,
    },
    files: { 'glow.tsx': component, 'demo.tsx': `import { Glow } from './glow'\nexport function Demo() { return <Glow /> }\n`, ...files },
  }
}

describe('checkItem', () => {
  it('passes a well-formed upstream item', () => {
    expect(checkItem(item(), context)).toEqual([])
  })

  it('flags a stale defaults region, unavailable modules, CDN urls and missing license headers', () => {
    const broken = item(
      {},
      {
        'glow.tsx': `import confetti from 'canvas-confetti'\nimport { useFrameLoop } from '@motif/runtime'\n${printDefaults({ speed: 2 })}\nconst font = 'https://fonts.googleapis.com/css2'\n`,
      },
    )
    const rules = checkItem(broken, context).map((finding) => finding.rule)
    expect(rules).toEqual(
      expect.arrayContaining(['defaults/mismatch', 'deps/unavailable', 'network/cdn', 'license/header', 'license/copyright', 'deps/unused']),
    )
  })

  it('requires the upstream source to be registered at the pinned sha', () => {
    const findings = checkItem(
      item({
        provenance: {
          kind: 'upstream',
          upstream: { source: 'up', repo: 'owner/up', sha: 'b'.repeat(40), paths: ['x'], spdx: 'MIT', copyright: ['Copyright (c) Up'] },
          modifications: [],
          assets: [],
        },
      }),
      context,
    )
    expect(findings.map((finding) => finding.rule)).toContain('provenance/sha')
  })

  it('requires animated items to handle reduced motion', () => {
    const findings = checkItem(item({}, { 'glow.tsx': component.replace("import { useFrameLoop } from '@motif/runtime'\n", '') }), context)
    expect(findings.map((finding) => finding.rule)).toEqual(expect.arrayContaining(['a11y/reduced-motion', 'deps/unused']))
  })
})

describe('importsOf', () => {
  it('finds static, re-export, side-effect and dynamic imports', () => {
    const code = `import a from 'a'\nimport { b } from "b"\nexport * from './c'\nimport 'd'\nconst e = await import('e')\n`
    expect(importsOf(code)).toEqual(['a', 'b', './c', 'd', 'e'])
  })
})
