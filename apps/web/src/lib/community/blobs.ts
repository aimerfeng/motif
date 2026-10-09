import { createHash } from 'node:crypto'
import type { Hex } from 'viem'
import { HttpError } from './http'
import { NOTE_LIMIT, PROFILE_LIMITS, type ProfileMetadata } from './shared'

export type BlobKind = 'note' | 'profile'

export function sha256Hex(text: string): Hex {
  return `0x${createHash('sha256').update(text).digest('hex')}`
}

/** 校验要托管的文字：审核意见是纯文本，资料是限定字段的 JSON。不合格时抛 400。 */
export function validateBlob(kind: unknown, text: unknown): string {
  if (typeof text !== 'string' || text.trim() === '') throw new HttpError(400, '"text" must be a non-empty string')
  if (kind === 'note') {
    if (text.length > NOTE_LIMIT) throw new HttpError(400, `notes are limited to ${NOTE_LIMIT} characters`)
    return text
  }
  if (kind === 'profile') {
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new HttpError(400, 'profile metadata must be JSON')
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new HttpError(400, 'profile metadata must be an object')
    const { name, bio, links, ...rest } = data as ProfileMetadata & Record<string, unknown>
    if (Object.keys(rest).length > 0) throw new HttpError(400, `unknown profile fields: ${Object.keys(rest).join(', ')}`)
    if (name !== undefined && (typeof name !== 'string' || name.length > PROFILE_LIMITS.name)) throw new HttpError(400, `name is limited to ${PROFILE_LIMITS.name} characters`)
    if (bio !== undefined && (typeof bio !== 'string' || bio.length > PROFILE_LIMITS.bio)) throw new HttpError(400, `bio is limited to ${PROFILE_LIMITS.bio} characters`)
    if (links !== undefined) {
      if (!Array.isArray(links) || links.length > PROFILE_LIMITS.links) throw new HttpError(400, `up to ${PROFILE_LIMITS.links} links`)
      for (const link of links) {
        if (typeof link !== 'string' || link.length > PROFILE_LIMITS.link || !/^https?:\/\/\S+$/.test(link)) throw new HttpError(400, `invalid link: ${String(link)}`)
      }
    }
    return text
  }
  throw new HttpError(400, '"kind" must be "note" or "profile"')
}
