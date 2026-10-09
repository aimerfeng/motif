import { randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
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
  /** 改动前的版本：每轮对话、每次手动保存、应用默认值和回退之前各存一份，只留最近的几份。 */
  snapshots?: Snapshot[]
  /** 回退以后要在下一轮告诉 agent 的话（它的对话历史里还是回退前的样子）。 */
  pendingNote?: string | null
}

export interface Snapshot {
  id: number
  at: number
  item: ItemSource
  values: ParamValues
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

const HOUR = 3_600_000

/**
 * 清理很久没动过的会话（默认 30 天，MOTIF_STUDIO_RETENTION_DAYS 可调）。
 * 会话是临时工作区，做好的条目应该下载或投稿带走；新建会话时顺手清，每小时最多一次。
 */
export async function pruneSessions(now = Date.now()): Promise<number> {
  const shared = ((globalThis as { __motifStudioPrune?: { last: number } }).__motifStudioPrune ??= { last: 0 })
  if (now - shared.last < HOUR) return 0
  shared.last = now
  const days = Number(process.env.MOTIF_STUDIO_RETENTION_DAYS)
  const maxAge = (Number.isFinite(days) && days > 0 ? days : 30) * 24 * HOUR
  let removed = 0
  const names = await readdir(SESSIONS_DIR).catch(() => [] as string[])
  for (const name of names) {
    if (!name.endsWith('.json')) continue
    const file = path.join(/*turbopackIgnore: true*/ SESSIONS_DIR, name)
    try {
      if (now - (await stat(file)).mtimeMs > maxAge) {
        await rm(file)
        removed++
      }
    } catch {
      // 并发删除或权限问题：跳过这一个。
    }
  }
  return removed
}

/** 先写临时文件再改名：写到一半进程退出也不会留下半个 JSON。 */
export async function saveSession(session: StudioSession): Promise<void> {
  await mkdir(SESSIONS_DIR, { recursive: true })
  const target = fileOf(session.id)
  const temp = `${target}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify({ ...session, updatedAt: Date.now() }))
  await rename(temp, target)
}
