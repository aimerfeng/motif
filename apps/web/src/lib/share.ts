import { checkParamValue, type JsonValue, type ParamSpec, type ParamValues } from '@motif/schema/core'

/** 调好的参数编码进 URL（base64url 的 JSON），只放和默认值不同的键，链接更短。 */
export function encodeValues(values: ParamValues, defaults: ParamValues): string {
  const changed: ParamValues = {}
  for (const [key, value] of Object.entries(values)) {
    if (JSON.stringify(value) !== JSON.stringify(defaults[key])) changed[key] = value
  }
  if (Object.keys(changed).length === 0) return ''
  const bytes = new TextEncoder().encode(JSON.stringify(changed))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

/**
 * 解码并逐个校验；不认识的键、类型或范围不对的值直接丢掉，返回合并了默认值的完整参数。
 * 链接可能被手改或来自旧版本，不能信任。
 */
export function decodeValues(encoded: string, params: readonly ParamSpec[], defaults: ParamValues): ParamValues {
  const values: ParamValues = { ...defaults }
  if (!encoded) return values
  let parsed: unknown
  try {
    const binary = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'))
    parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))))
  } catch {
    return values
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return values
  for (const param of params) {
    const value = (parsed as Record<string, unknown>)[param.key]
    if (value !== undefined && checkParamValue(param, value) === null) values[param.key] = value as JsonValue
  }
  return values
}
