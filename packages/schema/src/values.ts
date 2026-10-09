import type { ParamSpec } from './params.ts'

// 这个文件不依赖 zod：浏览器里的调参、分享链接和导出都要用它，不能把整个校验库带进客户端。

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type ParamValues = Record<string, JsonValue>

export const HEX_COLOR = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * spring 与 easing 没有逐个参数的 min/max，可调范围统一定在这里：
 * 值的校验、调参面板的滑杆和曲线编辑器、导出 Skill 里的范围说明都从这里取。
 */
export const SPRING_RANGE = {
  visualDuration: { min: 0.05, max: 4, step: 0.01 },
  bounce: { min: 0, max: 0.9, step: 0.01 },
} as const
/** cubic-bezier 的 x 必须在 [0, 1]；y 允许超出一点做回弹。 */
export const EASING_RANGE = { x: [0, 1], y: [-0.6, 1.6] } as const

// 文本参数会写进导出的源码字符串和 SKILL.md 表格，控制字符和行分隔符一律不收。
function hasControlChars(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (code < 0x20 || code === 0x7f || code === 0x2028 || code === 0x2029) return true
  }
  return false
}

const inRange = (value: unknown, [min, max]: readonly [number, number]) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

/** 参数定义里的默认值，按定义顺序。 */
export function defaultsOf(params: readonly ParamSpec[]): ParamValues {
  const values: ParamValues = {}
  for (const param of params) values[param.key] = param.default
  return values
}

/** 校验一个值是否符合参数定义（类型、范围、选项）。返回错误说明，合法时返回 null。 */
export function checkParamValue(param: ParamSpec, value: unknown): string | null {
  switch (param.type) {
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'expected a number'
      if (value < param.min || value > param.max) return `out of range [${param.min}, ${param.max}]`
      return null
    case 'color':
      return typeof value === 'string' && HEX_COLOR.test(value) ? null : 'expected #rrggbb'
    case 'palette':
      if (!Array.isArray(value) || !value.every((c) => typeof c === 'string' && HEX_COLOR.test(c))) return 'expected an array of #rrggbb'
      if (value.length < param.minItems || value.length > param.maxItems) return `expected ${param.minItems}–${param.maxItems} colors`
      return null
    case 'select':
      return typeof value === 'string' && param.options.some((option) => option.value === value) ? null : 'not one of the options'
    case 'boolean':
      return typeof value === 'boolean' ? null : 'expected a boolean'
    case 'text':
      if (typeof value !== 'string' || value.length > param.maxLength) return `expected text up to ${param.maxLength} characters`
      return hasControlChars(value) ? 'text must be a single line without control characters' : null
    case 'easing': {
      if (!Array.isArray(value) || value.length !== 4) return 'expected [x1, y1, x2, y2]'
      const [x1, y1, x2, y2] = value as unknown[]
      return inRange(x1, EASING_RANGE.x) && inRange(x2, EASING_RANGE.x) && inRange(y1, EASING_RANGE.y) && inRange(y2, EASING_RANGE.y)
        ? null
        : `expected x in [${EASING_RANGE.x.join(', ')}] and y in [${EASING_RANGE.y.join(', ')}]`
    }
    case 'spring': {
      // 只认这两个键：多出来的键会原样写进导出代码的对象字面量。
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return 'expected { visualDuration, bounce }'
      const keys = Object.keys(value)
      if (keys.length !== 2 || !keys.includes('visualDuration') || !keys.includes('bounce')) return 'expected exactly { visualDuration, bounce }'
      const { visualDuration, bounce } = value as Record<string, unknown>
      const d = SPRING_RANGE.visualDuration
      const b = SPRING_RANGE.bounce
      return inRange(visualDuration, [d.min, d.max]) && inRange(bounce, [b.min, b.max])
        ? null
        : `expected visualDuration in [${d.min}, ${d.max}] and bounce in [${b.min}, ${b.max}]`
    }
    case 'vec2':
      if (!Array.isArray(value) || value.length !== 2) return 'expected [x, y]'
      return value.every((n) => inRange(n, [param.min, param.max])) ? null : `out of range [${param.min}, ${param.max}]`
    case 'seed':
      return Number.isSafeInteger(value) && (value as number) >= 0 ? null : 'expected a non-negative integer'
  }
}
