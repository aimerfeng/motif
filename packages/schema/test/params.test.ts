import { describe, expect, it } from 'vitest'
import { checkParamValue, type ParamSpec } from '../src/index.ts'

const label = { 'zh-CN': '参数', en: 'Param' }
const spring: ParamSpec = { key: 'spring', type: 'spring', label, default: { visualDuration: 0.4, bounce: 0.2 } }
const easing: ParamSpec = { key: 'ease', type: 'easing', label, default: [0.22, 1, 0.36, 1] }
const text: ParamSpec = { key: 'title', type: 'text', label, default: 'Hello', maxLength: 20 }
const seed: ParamSpec = { key: 'seed', type: 'seed', label, default: 7 }
const vec2: ParamSpec = { key: 'origin', type: 'vec2', label, default: [0, 0], min: -1, max: 1, step: 0.1 }

describe('checkParamValue', () => {
  it('accepts a spring with exactly its two fields inside the tunable range', () => {
    expect(checkParamValue(spring, { visualDuration: 0.4, bounce: 0.2 })).toBeNull()
    expect(checkParamValue(spring, { bounce: 0, visualDuration: 4 })).toBeNull()
  })

  it('rejects springs with extra keys or values outside the range', () => {
    expect(checkParamValue(spring, { visualDuration: 0.4, bounce: 0.2, "a':1,'b": 1 })).not.toBeNull()
    expect(checkParamValue(spring, { visualDuration: 0.4 })).not.toBeNull()
    expect(checkParamValue(spring, { visualDuration: -5, bounce: 0.2 })).not.toBeNull()
    expect(checkParamValue(spring, { visualDuration: 0.4, bounce: 99 })).not.toBeNull()
    expect(checkParamValue(spring, { visualDuration: Number.NaN, bounce: 0.2 })).not.toBeNull()
  })

  it('keeps easing curves valid for cubic-bezier()', () => {
    expect(checkParamValue(easing, [0.34, 1.56, 0.64, 1])).toBeNull()
    expect(checkParamValue(easing, [1.2, 0, 0.5, 1])).not.toBeNull()
    expect(checkParamValue(easing, [0.5, 0, 0.5, Number.POSITIVE_INFINITY])).not.toBeNull()
    expect(checkParamValue(easing, [0.5, 0, 0.5])).not.toBeNull()
  })

  it('takes single-line text only', () => {
    expect(checkParamValue(text, 'Ship it 🚀')).toBeNull()
    expect(checkParamValue(text, 'a\nb')).not.toBeNull()
    expect(checkParamValue(text, 'a\u2028b')).not.toBeNull()
    expect(checkParamValue(text, 'x'.repeat(21))).not.toBeNull()
  })

  it('bounds seeds and vectors to finite numbers', () => {
    expect(checkParamValue(seed, 1e300)).not.toBeNull()
    expect(checkParamValue(seed, 42)).toBeNull()
    expect(checkParamValue(vec2, [0.5, Number.NaN])).not.toBeNull()
    expect(checkParamValue(vec2, [0.5, -1])).toBeNull()
  })
})
