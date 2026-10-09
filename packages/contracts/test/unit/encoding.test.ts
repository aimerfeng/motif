import { ALLOWED_SPDX, type ItemSource } from '@motif/schema'
import { describe, expect, it } from 'vitest'
import { contentHash } from '../../src/content-hash.ts'
import { bytes32ToSpdx, commitToBytes20, spdxToBytes32, versionInput } from '../../src/encoding.ts'
import { orderByLineage } from '../../scripts/lib/seed.ts'

describe('spdxToBytes32', () => {
  it('left-aligns UTF-8 and pads with zeros, like Solidity bytes32("MIT")', () => {
    expect(spdxToBytes32('MIT')).toBe(`0x4d4954${'0'.repeat(58)}`)
  })

  it('round-trips every allowed license', () => {
    for (const spdx of ALLOWED_SPDX) expect(bytes32ToSpdx(spdxToBytes32(spdx))).toBe(spdx)
  })

  it('rejects ids that do not fit in 32 bytes', () => {
    expect(() => spdxToBytes32('')).toThrow(RangeError)
    expect(() => spdxToBytes32('x'.repeat(33))).toThrow(RangeError)
  })
})

describe('commitToBytes20', () => {
  it('accepts only full lowercase git shas', () => {
    expect(commitToBytes20('a'.repeat(40))).toBe(`0x${'a'.repeat(40)}`)
    expect(() => commitToBytes20('abc123')).toThrow(RangeError)
    expect(() => commitToBytes20('A'.repeat(40))).toThrow(RangeError)
  })
})

describe('versionInput', () => {
  const base = { manifest: { slug: 'x', provenance: { kind: 'original', modifications: [], assets: [] } }, files: {} }

  it('uses the community license and no upstream for original items', async () => {
    const item = base as unknown as ItemSource
    expect(await versionInput(item)).toEqual({
      contentHash: await contentHash(item),
      license: spdxToBytes32('MIT'),
      upstreamRepo: '',
      upstreamCommit: `0x${'0'.repeat(40)}`,
    })
  })

  it('carries the upstream license, repo and commit', async () => {
    const sha = '0123456789abcdef0123456789abcdef01234567'
    const item = {
      ...base,
      manifest: {
        ...base.manifest,
        provenance: {
          ...base.manifest.provenance,
          kind: 'upstream',
          upstream: { source: 'paper', repo: 'https://github.com/paper-design/shaders', sha, paths: ['a'], spdx: 'Apache-2.0', copyright: ['x'] },
        },
      },
    } as unknown as ItemSource
    const input = await versionInput(item)
    expect(input.license).toBe(spdxToBytes32('Apache-2.0'))
    expect(input.upstreamRepo).toBe('https://github.com/paper-design/shaders')
    expect(input.upstreamCommit).toBe(`0x${sha}`)
  })
})

describe('orderByLineage', () => {
  const item = (slug: string, basedOn?: string) => ({ manifest: { slug, provenance: { basedOn } } })

  it('puts parents before their remixes', () => {
    const ordered = orderByLineage([item('c', 'b'), item('b', 'a'), item('a'), item('d')])
    expect(ordered.map((entry) => entry.manifest.slug)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('rejects missing parents and cycles', () => {
    expect(() => orderByLineage([item('b', 'a')])).toThrow(/not in the catalog/)
    expect(() => orderByLineage([item('a', 'b'), item('b', 'a')])).toThrow(/cycle/)
  })
})
