// 只导入类型（运行时擦除），浏览器里用这些函数不会带上 zod。
import type { ItemSource } from '@motif/schema'
import { contentHash, type Hex } from './content-hash.ts'

/**
 * 社区投稿的原创条目统一按 MIT 授权（与仓库许可证一致，进来什么许可证、出去就是什么许可证）。
 * 上游条目用清单里记录的上游许可证。
 */
export const COMMUNITY_LICENSE = 'MIT'

/** SPDX 标识符转成合约里的 bytes32：UTF-8 左对齐、右补零，与 Solidity 的 bytes32("MIT") 相同。 */
export function spdxToBytes32(spdx: string): Hex {
  const bytes = new TextEncoder().encode(spdx)
  if (bytes.length === 0 || bytes.length > 32) throw new RangeError(`SPDX id must be 1–32 bytes: "${spdx}"`)
  const padded = new Uint8Array(32)
  padded.set(bytes)
  return toHex(padded)
}

export function bytes32ToSpdx(value: Hex): string {
  const bytes = fromHex(value)
  if (bytes.length !== 32) throw new RangeError(`expected 32 bytes: ${value}`)
  const end = bytes.indexOf(0)
  return new TextDecoder().decode(end === -1 ? bytes : bytes.subarray(0, end))
}

/** git 的 40 位十六进制 commit 转成合约里的 bytes20。 */
export function commitToBytes20(sha: string): Hex {
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new RangeError(`not a full git commit sha: "${sha}"`)
  return `0x${sha}`
}

/** 与 MotifRegistry.VersionInput 对应。 */
export interface VersionInput {
  contentHash: Hex
  license: Hex
  upstreamRepo: string
  upstreamCommit: Hex
}

const ZERO_BYTES20: Hex = `0x${'0'.repeat(40)}`

/** 由 ItemSource 生成投稿参数：内容哈希、许可证和上游来源都从条目本身推出来，不手填。 */
export async function versionInput(item: ItemSource): Promise<VersionInput> {
  const upstream = item.manifest.provenance.upstream
  return {
    contentHash: await contentHash(item),
    license: spdxToBytes32(upstream?.spdx ?? COMMUNITY_LICENSE),
    upstreamRepo: upstream?.repo ?? '',
    upstreamCommit: upstream ? commitToBytes20(upstream.sha) : ZERO_BYTES20,
  }
}

function toHex(bytes: Uint8Array): Hex {
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

function fromHex(value: Hex): Uint8Array {
  const digits = value.slice(2)
  if (digits.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(digits)) throw new RangeError(`not hex: ${value}`)
  return Uint8Array.from(digits.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16))
}
