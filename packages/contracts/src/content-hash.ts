// 只导入类型（运行时擦除），浏览器里用这些函数不会带上 zod。
import type { ItemSource } from '@motif/schema'

export type Hex = `0x${string}`

/**
 * RFC 8785（JCS）JSON 规范化：对象键按 UTF-16 码元排序，没有空白，数字和字符串按 ECMAScript 的
 * JSON.stringify 规则输出。同一份数据无论键的书写顺序如何，结果都逐字节相同，任何语言都能独立实现。
 * 值为 undefined 的字段视为不存在，与 JSON.stringify 一致（条目清单里的可选字段就是这样省略的）。
 */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((entry: unknown) => canonicalJson(entry ?? null)).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const members = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    return `{${members.join(',')}}`
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError(`JCS cannot encode ${value}`)
  const json = JSON.stringify(value) as string | undefined
  if (json === undefined) throw new TypeError(`JCS cannot encode a ${typeof value}`)
  return json
}

/**
 * 条目的内容哈希：sha256(JCS({ manifest, files }))，即 MotifRegistry 里每个版本的 contentHash。
 *
 * 站点托管源码，链上只存这个哈希。任何人拿到站点给的 ItemSource 重算一遍，就能确认它和社区审核通过的
 * 是同一份内容。文件内容按原样参与计算，换行由加载器统一成 LF。
 * 用 sha256 而不是 keccak256，是为了不装任何以太坊库也能复算（浏览器、Node、命令行都自带）。
 */
export async function contentHash(item: ItemSource): Promise<Hex> {
  const bytes = new TextEncoder().encode(canonicalJson({ manifest: item.manifest, files: item.files }))
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
  return `0x${Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}
