'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

/** 非安全上下文（比如用局域网 IP 打开开发服务器）没有 navigator.clipboard，只能退回 execCommand。 */
function legacyCopy(text: string) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('copy command was rejected')
}

/**
 * 把文本写进剪贴板。内容需要先取回时传 Promise：用 ClipboardItem 包住，
 * 这样写入仍然算在这次点击的用户手势里（Safari 对异步写入很严格）。
 */
export async function copyText(text: string | Promise<string>): Promise<void> {
  const clipboard = typeof navigator === 'undefined' ? undefined : (navigator.clipboard as Clipboard | undefined)
  if (!clipboard) {
    legacyCopy(await text)
    return
  }
  if (typeof text === 'string') {
    await clipboard.writeText(text)
    return
  }
  if (typeof ClipboardItem !== 'undefined' && typeof clipboard.write === 'function') {
    await clipboard.write([new ClipboardItem({ 'text/plain': text.then((value) => new Blob([value], { type: 'text/plain' })) })])
    return
  }
  await clipboard.writeText(await text)
}

const FEEDBACK_MS = 1800

/**
 * 复制按钮的反馈：成功或失败都显示一会儿再复原。
 * 同一组里有多个按钮时用 key 区分，只有被点的那个变状态。
 */
export function useCopy() {
  const [status, setStatus] = useState<{ key: string; state: Exclude<CopyState, 'idle'> } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async (key: string, text: string | Promise<string>) => {
    let state: Exclude<CopyState, 'idle'> = 'copied'
    try {
      await copyText(text)
    } catch {
      state = 'failed'
    }
    setStatus({ key, state })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus(null), FEEDBACK_MS)
  }, [])

  const stateOf = useCallback((key: string): CopyState => (status?.key === key ? status.state : 'idle'), [status])
  return { copy, stateOf }
}
