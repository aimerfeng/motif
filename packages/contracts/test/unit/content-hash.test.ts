import { createHash } from 'node:crypto'
import { loadAllItems } from '@motif/registry'
import type { ItemSource } from '@motif/schema'
import { describe, expect, it } from 'vitest'
import { canonicalJson, contentHash } from '../../src/content-hash.ts'

describe('canonicalJson', () => {
  it('sorts keys recursively, drops undefined and adds no whitespace', () => {
    expect(canonicalJson({ b: 1, a: { d: [3, { y: true, x: null }], c: undefined }, e: 'é' })).toBe(
      '{"a":{"d":[3,{"x":null,"y":true}]},"b":1,"e":"é"}',
    )
  })

  it('sorts keys by UTF-16 code units, as RFC 8785 requires', () => {
    // 😀 的第一个 UTF-16 码元是 0xD83D，小于 ｡（U+FF61）；按码点排序则 ｡ 在前。
    expect(canonicalJson({ '｡': 2, '😀': 1, a: 3, B: 4 })).toBe('{"B":4,"a":3,"😀":1,"｡":2}')
  })

  it('serializes numbers the ECMAScript way', () => {
    expect(canonicalJson([1e21, 1.5, -0, 0.000001])).toBe('[1e+21,1.5,0,0.000001]')
  })

  it('rejects values JSON cannot represent', () => {
    expect(() => canonicalJson(Number.NaN)).toThrow(TypeError)
    expect(() => canonicalJson(() => 0)).toThrow(TypeError)
  })
})

describe('contentHash', () => {
  const fixture = {
    manifest: { slug: 'demo', schemaVersion: 1, provenance: { kind: 'original', modifications: [], assets: [] } },
    files: { 'demo.tsx': 'export const Demo = () => null\n', 'b.ts': '' },
  } as unknown as ItemSource
  // 手写的规范化结果：独立于 canonicalJson 的实现，用来锁住格式。
  const expected =
    '{"files":{"b.ts":"","demo.tsx":"export const Demo = () => null\\n"},' +
    '"manifest":{"provenance":{"assets":[],"kind":"original","modifications":[]},"schemaVersion":1,"slug":"demo"}}'

  it('is the sha256 of the canonical { manifest, files } document', async () => {
    expect(canonicalJson({ manifest: fixture.manifest, files: fixture.files })).toBe(expected)
    expect(await contentHash(fixture)).toBe(`0x${createHash('sha256').update(expected).digest('hex')}`)
  })

  it('does not depend on key order', async () => {
    const reordered = {
      files: { 'b.ts': '', 'demo.tsx': fixture.files['demo.tsx'] },
      manifest: { provenance: { assets: [], modifications: [], kind: 'original' }, slug: 'demo', schemaVersion: 1 },
    } as unknown as ItemSource
    expect(await contentHash(reordered)).toBe(await contentHash(fixture))
  })

  it('changes when any byte of any file changes', async () => {
    const edited = { ...fixture, files: { ...fixture.files, 'b.ts': ' ' } }
    expect(await contentHash(edited)).not.toBe(await contentHash(fixture))
  })

  it('gives every catalog item a distinct hash', async () => {
    const { items, failures } = await loadAllItems()
    expect(failures).toEqual([])
    const hashes = await Promise.all(items.map((item) => contentHash(item)))
    for (const hash of hashes) expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(new Set(hashes).size).toBe(items.length)
  })
})
