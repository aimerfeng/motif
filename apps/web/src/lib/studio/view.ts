import type { Evaluation, TranscriptEntry } from '@motif/agent'
import type { ItemSource, ParamValues } from '@motif/schema'
import { HttpError } from '@/lib/community/http'
import { runnerConfig, sessionTokenBudget } from './runner'
import { isRunning } from './sessions'
import { loadSession, type StudioSession } from './store'

/** 发给浏览器的会话：不带运行器的续接状态（可能很大，而且浏览器用不上）。 */
export interface StudioView {
  id: string
  base: string | null
  item: ItemSource
  values: ParamValues
  evaluation: Evaluation | null
  transcript: TranscriptEntry[]
  running: boolean
  agent: { available: boolean; label: string | null }
  usage: { used: number; budget: number }
}

export function toView(session: StudioSession): StudioView {
  const config = runnerConfig()
  return {
    id: session.id,
    base: session.base,
    item: session.item,
    values: session.values,
    evaluation: session.evaluation,
    transcript: session.transcript,
    running: isRunning(session.id),
    agent: { available: config !== null, label: config?.label ?? null },
    usage: { used: session.usage.inputTokens + session.usage.outputTokens, budget: sessionTokenBudget() },
  }
}

export async function requireSession(id: string): Promise<StudioSession> {
  const session = await loadSession(id)
  if (!session) throw new HttpError(404, 'no such studio session')
  return session
}
