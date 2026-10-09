import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Evaluation, TranscriptEntry } from '@motif/agent'
import type { ItemSource, ParamValues } from '@motif/schema'

/*
 * Studio 的会话：一个正在做的条目、预览里的参数、对话记录和运行器的续接状态。
 * 每个会话一个 JSON 文件，放在 .data/studio/sessions/（不进版本库）；会话 id 本身就是访问凭证，没有列表接口。
 */

const DATA_DIR = process.env.MOTIF_STUDIO_DATA ?? path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', '.data/studio')
const SESSIONS_DIR = path.join(/*turbopackIgnore: true*/ DATA_DIR, 'sessions')
const ID = /^[a-z0-9]{12}$/

export interface StudioSession {
  id: string
  createdAt: number
  updatedAt: number
  /** Remix 的来源条目；从零开始时为 null。 */
  base: string | null
  item: ItemSource
  values: ParamValues
  evaluation: Evaluation | null
  transcript: TranscriptEntry[]
  /** 上一轮用的运行器和它的续接状态；换了运行器就从头开始（各家的状态互不认）。 */
  runner: { id: string; state: unknown } | null
  usage: { inputTokens: number; outputTokens: number }
}

export function newSessionId(): string {
  // 12 位 base36，约 62 位随机数：够当分享链接里的凭证。
  return Array.from(randomBytes(12), (byte) => (byte % 36).toString(36)).join('')
}

export function isSessionId(value: string): boolean {
  return ID.test(value)
}

function fileOf(id: string): string {
  return path.join(/*turbopackIgnore: true*/ SESSIONS_DIR, `${id}.json`)
}

export async function loadSession(id: string): Promise<StudioSession | null> {
  if (!isSessionId(id)) return null
  try {
    return JSON.parse(await readFile(fileOf(id), 'utf8')) as StudioSession
  } catch {
    return null
  }
}

/** 先写临时文件再改名：写到一半进程退出也不会留下半个 JSON。 */
export async function saveSession(session: StudioSession): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true })
  const target = fileOf(session.id)
  const temp = `${target}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify({ ...session, updatedAt: Date.now() }))
  await rename(temp, target)
}
