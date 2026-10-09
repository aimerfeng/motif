'use client'

import { appendEvent, type AgentEvent, type PreviewReport, type TranscriptEntry } from '@motif/agent/client'
import type { ItemSource, ParamValues } from '@motif/schema/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { StudioView } from '@/lib/studio/view'

async function readError(response: Response): Promise<string> {
  try {
    return ((await response.json()) as { error?: string }).error ?? response.statusText
  } catch {
    return response.statusText
  }
}

/** 逐行读 NDJSON 事件流。 */
async function* readEvents(response: Response): AsyncGenerator<AgentEvent> {
  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += value
    let newline = buffer.indexOf('\n')
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim()
      buffer = buffer.slice(newline + 1)
      if (line) yield JSON.parse(line) as AgentEvent
      newline = buffer.indexOf('\n')
    }
  }
}

/**
 * 工作台的状态：会话、正在进行的一轮、保存与「应用为默认值」，以及给 agent 的预览回报。
 * 服务端是唯一的事实来源：每轮结束、每次保存都用服务端返回的会话覆盖本地状态。
 */
export function useStudio(initial: StudioView) {
  const [view, setView] = useState(initial)
  const [running, setRunning] = useState(initial.running)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const id = initial.id
  const base = `/api/studio/sessions/${id}`

  const refresh = useCallback(async () => {
    const response = await fetch(base, { cache: 'no-store' })
    if (!response.ok) return
    const next = (await response.json()) as StudioView
    setView(next)
    setRunning(next.running)
  }, [base])

  // 页面在一轮进行中被刷新：事件流接不回来了，轮询到这一轮结束。
  useEffect(() => {
    if (!running || initial.running === false) return
    const timer = window.setInterval(() => void refresh(), 2000)
    return () => window.clearInterval(timer)
  }, [running, initial.running, refresh])

  const apply = (event: AgentEvent) => {
    setView((current) => {
      // appendEvent 会改动记录里的条目，先复制一份，别动 React 的旧状态。
      const transcript: TranscriptEntry[] = current.transcript.map((entry) => ({ ...entry }))
      appendEvent(transcript, event)
      const next: StudioView = { ...current, transcript }
      if (event.type === 'workspace') {
        next.item = event.item
        next.evaluation = event.evaluation
      } else if (event.type === 'params') {
        next.values = event.values
      } else if (event.type === 'usage') {
        next.usage = { ...current.usage, used: current.usage.used + event.inputTokens + event.outputTokens }
      }
      return next
    })
  }

  const run = async (prompt: string) => {
    setError(null)
    setRunning(true)
    setView((current) => ({ ...current, transcript: [...current.transcript, { role: 'user', text: prompt, at: Date.now() }] }))
    try {
      const response = await fetch(`${base}/run`, { method: 'POST', body: JSON.stringify({ prompt }) })
      if (!response.ok || !response.body) throw new Error(await readError(response))
      for await (const event of readEvents(response)) apply(event)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      await refresh()
      setRunning(false)
    }
  }

  const abort = async () => {
    await fetch(`${base}/abort`, { method: 'POST' })
  }

  const mutate = async (path: string, init: RequestInit) => {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`${base}/${path}`, init)
      if (!response.ok) throw new Error(await readError(response))
      setView((await response.json()) as StudioView)
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
      return false
    } finally {
      setBusy(false)
    }
  }

  const save = (item: ItemSource) => mutate('item', { method: 'PUT', body: JSON.stringify({ item }) })
  const applyDefaults = (values: ParamValues) => mutate('defaults', { method: 'POST', body: JSON.stringify({ values }) })

  // 调参：本地立即生效，停下来再存到服务端。
  const saveTimer = useRef<number | undefined>(undefined)
  const setValues = (values: ParamValues) => {
    setView((current) => ({ ...current, values }))
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => void fetch(`${base}/values`, { method: 'PUT', body: JSON.stringify({ values }) }), 600)
  }

  // 预览回报和心跳：agent 的 check_preview 靠它知道浏览器里的情况。
  const report = useCallback(
    (version: number, preview: PreviewReport) => {
      void fetch(`${base}/preview`, { method: 'POST', body: JSON.stringify({ version, report: preview }) })
    },
    [base],
  )
  useEffect(() => {
    const beat = () => {
      if (!document.hidden) void fetch(`${base}/preview`, { method: 'POST', body: '{}' })
    }
    beat()
    const timer = window.setInterval(beat, 10_000)
    return () => window.clearInterval(timer)
  }, [base])

  return { view, running, error, busy, run, abort, save, applyDefaults, setValues, report, dismissError: () => setError(null) }
}
