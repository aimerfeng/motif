import { describe, expect, it } from 'vitest'
import { CATEGORIES, ItemManifestSchema, type ItemManifest } from '../src/index.ts'

const base: ItemManifest = {
  schemaVersion: 1,
  slug: 'demo-effect',
  status: 'draft',
  title: { 'zh-CN': '示例', en: 'Demo' },
  summary: { 'zh-CN': '示例效果', en: 'A demo effect' },
  kind: 'effect',
  category: 'background',
  tags: [],
  runtime: ['react'],
  entry: { file: 'demo-effect.tsx', export: 'DemoEffect' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
  files: [
    { path: 'demo-effect.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    { key: 'speed', label: { 'zh-CN': '速度', en: 'Speed' }, type: 'number', default: 1, min: 0, max: 2, step: 0.01 },
    { key: 'tint', label: { 'zh-CN': '色调', en: 'Tint' }, type: 'color', default: '#6a5cff' },
  ],
  presets: [{ id: 'calm', name: { 'zh-CN': '平静', en: 'Calm' }, values: { speed: 0.3 } }],
  dependencies: [],
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  provenance: { kind: 'original', modifications: [], assets: [] },
}

describe('ItemManifestSchema', () => {
  it('accepts a valid manifest', () => {
    expect(ItemManifestSchema.safeParse(base).success).toBe(true)
  })

  it('rejects defaults and presets outside the param ranges', () => {
    const result = ItemManifestSchema.safeParse({
      ...base,
      params: [{ ...base.params[0]!, default: 5 }],
      presets: [{ id: 'bad', name: base.presets[0]!.name, values: { speed: -1, nope: 1 } }],
    })
    expect(result.success).toBe(false)
    const messages = result.error!.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    expect(messages).toEqual(
      expect.arrayContaining([
        'params.0.default: out of range [0, 2]',
        'presets.0.values.speed: out of range [0, 2]',
        'presets.0.values.nope: unknown param "nope"',
      ]),
    )
  })

  it('requires upstream details for upstream items and listed entry files', () => {
    const result = ItemManifestSchema.safeParse({
      ...base,
      entry: { file: 'missing.tsx', export: 'X' },
      provenance: { kind: 'upstream', modifications: [], assets: [] },
    })
    expect(result.success).toBe(false)
    const paths = result.error!.issues.map((issue) => issue.path.join('.'))
    expect(paths).toEqual(expect.arrayContaining(['entry.file', 'provenance.upstream']))
  })
})

describe('kinds and categories', () => {
  it('category names are unique across kinds', () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length)
  })

  it('rejects a category from another kind', () => {
    const result = ItemManifestSchema.safeParse({ ...base, kind: 'component' })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0]!.message).toBe('category "background" does not belong to kind "component"')
  })
})
