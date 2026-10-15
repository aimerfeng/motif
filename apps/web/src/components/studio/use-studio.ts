'use client'

import { appendEvent, type AgentEvent, type PreviewReport, type TranscriptEntry } from '@motif/agent/client'
import type { ItemSource, ParamValues } from '@motif/schema/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Hunk } from '@/lib/studio/diff'
import type { Attachment } from '@/lib/studio/images'
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
  /** 这个页面正在读这一轮的事件流。没有在读、服务端却说在运行（刷新过页面、流断了、别的标签页发起的），就轮询。 */
  const [streaming, setStreaming] = useState(false)
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

  // 服务端在跑、这里却没有事件流（页面刷新过、网络断过、别的标签页发起的）：轮询到这一轮结束。
  useEffect(() => {
    if (!running || streaming) return
    const timer = window.setInterval(() => void refresh().catch(() => {}), 2000)
    return () => window.clearInterval(timer)
  }, [running, streaming, refresh])

  const apply = (event: AgentEvent) => {
    setView((current) => {
      // appendEvent 会改动记录里的条目，先复制一份，别动 React 的旧状态。
      const transcript: TranscriptEntry[] = current.transcript.map((entry) => ({ ...entry }))
      appendEvent(transcript, event)
      const next: StudioView = { ...current, transcript }
      if (event.type === 'workspace') {
        next.item = event.item
        next.evaluation = event.evaluation
        next.values = event.values
      } else if (event.type === 'params') {
        next.values = event.values
      } else if (event.type === 'usage') {
        next.usage = { ...current.usage, used: current.usage.used + event.inputTokens + event.outputTokens }
      }
      return next
    })
  }

  /** 发一句话给 agent。返回服务端是否接受了（被拒绝时输入框里的话要留着）。 */
  const run = async (prompt: string, attachments: Attachment[] = []): Promise<boolean> => {
    setError(null)
    setRunning(true)
    let accepted = false
    try {
      const images = attachments.map(({ mediaType, data }) => ({ mediaType, data }))
      const thumbnails = attachments.map((attachment) => attachment.thumbnail)
      const response = await fetch(`${base}/run`, { method: 'POST', body: JSON.stringify(attachments.length > 0 ? { prompt, images, thumbnails } : { prompt }) })
      if (!response.ok || !response.body) throw new Error(await readError(response))
      accepted = true
      setStreaming(true)
      setView((current) => ({ ...current, transcript: [...current.transcript, { role: 'user', text: prompt, at: Date.now(), ...(thumbnails.length > 0 ? { images: thumbnails } : {}) }] }))
      for await (const event of readEvents(response)) apply(event)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setStreaming(false)
      // 是否还在跑以服务端为准：流断了但服务端还在跑时，上面的轮询会接着跟。
      await refresh().catch(() => setRunning(false))
    }
    return accepted
  }

  const abort = async () => {
    try {
      const response = await fetch(`${base}/abort`, { method: 'POST' })
      if (!response.ok) throw new Error(await readError(response))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
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
  const revert = (snapshot: number, label: string) => mutate('revert', { method: 'POST', body: JSON.stringify({ snapshot, label }) })

  // 调参：本地立即生效，停下来再存到服务端。
  const saveTimer = useRef<number | undefined>(undefined)
  const setValues = (values: ParamValues) => {
    setView((current) => ({ ...current, values }))
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => void fetch(`${base}/values`, { method: 'PUT', body: JSON.stringify({ values }) }), 600)
  }

  /** 某一轮里一个文件的逐行差异。 */
  const loadDiff = useCallback(
    async (snapshot: number, path: string): Promise<Hunk[]> => {
      const response = await fetch(`${base}/diff?snapshot=${snapshot}&path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error(await readError(response))
      return ((await response.json()) as { hunks: Hunk[] }).hunks
    },
    [base],
  )

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

  return { view, running, error, busy, run, abort, save, applyDefaults, revert, setValues, report, loadDiff, dismissError: () => setError(null) }
}
