import type { JsonValue, ParamValues } from './params.ts'

// 组件文件里有一段由参数生成的默认值区域：
//
//   /* @motif:defaults */
//   export const defaults = { … }
//   /* @motif:end */
//
// 这段文本完全由参数值决定（printDefaults），所以校验只需比较文本；导出时把用户调好的值写回这里（bake）。
export const DEFAULTS_START = '/* @motif:defaults */'
export const DEFAULTS_END = '/* @motif:end */'

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

function printValue(value: JsonValue, indent: string): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return `[${value.map((item) => printValue(item, indent)).join(', ')}]`
  const inner = `${indent}  `
  const entries = Object.entries(value).map(([key, item]) => `${inner}${IDENTIFIER.test(key) ? key : `'${key}'`}: ${printValue(item, inner)},`)
  return entries.length === 0 ? '{}' : `{\n${entries.join('\n')}\n${indent}}`
}

/** 生成默认值区域的完整文本（含首尾标记）。 */
export function printDefaults(values: ParamValues): string {
  return `${DEFAULTS_START}\nexport const defaults = ${printValue(values, '')}\n${DEFAULTS_END}`
}

export interface DefaultsRegion {
  start: number
  end: number
  text: string
}

/** 找到源码里的默认值区域；没有或者有多个时返回错误说明。 */
export function findDefaultsRegion(source: string): DefaultsRegion | string {
  const start = source.indexOf(DEFAULTS_START)
  if (start === -1) return 'missing /* @motif:defaults */ region'
  if (source.indexOf(DEFAULTS_START, start + 1) !== -1) return 'more than one /* @motif:defaults */ region'
  const endMarker = source.indexOf(DEFAULTS_END, start)
  if (endMarker === -1) return 'unterminated /* @motif:defaults */ region'
  const end = endMarker + DEFAULTS_END.length
  return { start, end, text: source.slice(start, end) }
}

/** 把参数值写进组件源码的默认值区域。 */
export function bake(source: string, values: ParamValues): string {
  const region = findDefaultsRegion(source)
  if (typeof region === 'string') throw new Error(region)
  return source.slice(0, region.start) + printDefaults(values) + source.slice(region.end)
}

function canonical(value: JsonValue): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key]!)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

/** 参数值的短哈希（sha-256 前 8 位十六进制），写进导出的 SKILL.md，方便比对是不是同一组参数。 */
export async function paramsHash(values: ParamValues): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(values))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest).slice(0, 4), (b) => b.toString(16).padStart(2, '0')).join('')
}
