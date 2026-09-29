import { describe, expect, it } from 'vitest'
import { bake, findDefaultsRegion, paramsHash, printDefaults } from '../src/index.ts'

const SOURCE = `import { thing } from 'x'

${printDefaults({ speed: 1, colors: ['#000000', '#ffffff'] })}

export function Effect() {}
`

describe('defaults region', () => {
  it('prints values deterministically with identifier keys unquoted', () => {
    expect(printDefaults({ speed: 0.5, label: "it's", spring: { visualDuration: 0.4, bounce: 0.2 }, 'odd-key': true })).toBe(
      [
        '/* @motif:defaults */',
        'export const defaults = {',
        '  speed: 0.5,',
        "  label: 'it\\'s',",
        '  spring: {',
        '    visualDuration: 0.4,',
        '    bounce: 0.2,',
        '  },',
        "  'odd-key': true,",
        '}',
        '/* @motif:end */',
      ].join('\n'),
    )
  })

  it('bakes new values into the region and leaves the rest untouched', () => {
    const baked = bake(SOURCE, { speed: 2, colors: ['#ff0000'] })
    expect(baked).toContain("colors: ['#ff0000'],")
    expect(baked).toContain('speed: 2,')
    expect(baked.startsWith("import { thing } from 'x'")).toBe(true)
    expect(baked.endsWith('export function Effect() {}\n')).toBe(true)
  })

  it('reports missing or duplicated regions', () => {
    expect(findDefaultsRegion('export const x = 1')).toBe('missing /* @motif:defaults */ region')
    expect(findDefaultsRegion(`${SOURCE}\n${SOURCE}`)).toBe('more than one /* @motif:defaults */ region')
  })

  it('hashes values independent of key order', async () => {
    const a = await paramsHash({ a: 1, b: { c: 2, d: 3 } })
    const b = await paramsHash({ b: { d: 3, c: 2 }, a: 1 })
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{8}$/)
  })
})
