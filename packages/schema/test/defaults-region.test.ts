import { describe, expect, it } from 'vitest'
import { bake, DEFAULTS_END, DEFAULTS_START, findDefaultsRegion, paramsHash, printDefaults, type ParamValues } from '../src/index.ts'

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

  it('keeps every value on its own line and the end marker out of strings', () => {
    // 值可能来自分享链接；执行后得到同样的值这一点由 export 包的测试用 node:vm 验证。
    const values: ParamValues = { lines: 'a\nb\r\nc\u2028d', marker: 'x /* @motif:end */ y', odd: { "a':1,'b": 1 } }
    const printed = printDefaults(values).split('\n')
    expect(printed).toHaveLength(9)
    expect(printed.filter((line) => line.includes('*/'))).toEqual([DEFAULTS_START, DEFAULTS_END])
    expect(printed).toContain("  lines: 'a\\nb\\r\\nc\\u2028d',")
    expect(printed).toContain("    'a\\':1,\\'b': 1,")
  })

  it('re-bakes a value containing the end marker without leaving stray code', () => {
    const once = bake(SOURCE, { speed: 1, colors: ['#000000'], label: 'x /* @motif:end */ y' })
    const twice = bake(once, { speed: 2, colors: ['#000000'] })
    expect(twice).toBe(bake(SOURCE, { speed: 2, colors: ['#000000'] }))
  })

  it('refuses numbers that have no literal', () => {
    expect(() => printDefaults({ speed: Number.NaN })).toThrow()
    expect(() => printDefaults({ speed: Number.POSITIVE_INFINITY })).toThrow()
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
