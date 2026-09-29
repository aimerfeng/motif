'use client'

import {
  envelope,
  readSandboxMessage,
  sandboxUrl,
  type HostMessage,
  type ModuleRef,
  type PreviewProps,
  type PreviewTheme,
  type SandboxMessage,
  type StyleRef,
} from '@motif/preview/protocol'
import { useEffect, useMemo, useRef, useState } from 'react'

export const PREVIEW_BASE = process.env.NEXT_PUBLIC_MOTIF_PREVIEW_URL ?? 'http://127.0.0.1:4100'

export type PreviewStatus =
  | { state: 'loading' }
  | { state: 'mounted'; ms: number }
  | { state: 'error'; phase: string; message: string }
  | { state: 'hung' }

interface PreviewFrameProps {
  module: ModuleRef
  exportName?: string
  props?: PreviewProps
  styles?: StyleRef
  theme?: PreviewTheme
  title: string
  className?: string
  onStatus?: (status: PreviewStatus) => void
}

const HEARTBEAT_MS = 2000
const HEARTBEAT_TIMEOUT_MS = 5000

/** 在跨源、不透明源的沙箱 iframe 里挂载一个组件模块。模块变化时重新挂载，props 变化时只发新 props。 */
export function PreviewFrame({ module, exportName = 'default', props = {}, styles, theme, title, className, onStatus }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const nonce = useMemo(() => crypto.randomUUID(), [])
  const [src, setSrc] = useState<string | null>(null)
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const readyRef = useRef(false)
  const latest = useRef({ module, exportName, props, styles, theme, onStatus })
  latest.current = { module, exportName, props, styles, theme, onStatus }

  const mountMessage = (): HostMessage => {
    const { module: mod, exportName: name, props: current, styles: css, theme: mode } = latest.current
    return { type: 'mount', module: mod, exportName: name, props: current, ...(css ? { styles: css } : {}), ...(mode ? { theme: mode } : {}) }
  }

  useEffect(() => {
    setSrc(sandboxUrl(PREVIEW_BASE, nonce, window.location.origin))
  }, [nonce])

  useEffect(() => {
    latest.current.onStatus?.(status)
  }, [status])

  const post = (message: HostMessage) => {
    iframeRef.current?.contentWindow?.postMessage(envelope(nonce, message), '*')
  }

  useEffect(() => {
    let lastPong = performance.now()
    let seq = 0

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const message: SandboxMessage | null = readSandboxMessage(event.data, nonce)
      if (!message) return
      lastPong = performance.now()
      switch (message.type) {
        case 'ready':
          readyRef.current = true
          post(mountMessage())
          break
        case 'mounted':
          setStatus({ state: 'mounted', ms: message.ms })
          break
        case 'error':
          setStatus({ state: 'error', phase: message.phase, message: message.message })
          break
        case 'pong':
          break
      }
    }
    window.addEventListener('message', onMessage)

    // 心跳：沙箱卡死（死循环）时 host 自己不会被拖住，超时后重建 iframe。
    const timer = window.setInterval(() => {
      if (!readyRef.current) return
      if (performance.now() - lastPong > HEARTBEAT_TIMEOUT_MS) {
        readyRef.current = false
        setStatus({ state: 'hung' })
        setReloadKey((key) => key + 1)
        return
      }
      post({ type: 'ping', seq: ++seq })
    }, HEARTBEAT_MS)

    return () => {
      window.removeEventListener('message', onMessage)
      window.clearInterval(timer)
    }
    // post 只依赖 ref 和 nonce。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])

  const moduleKey = module.kind === 'url' ? module.url : module.code
  const stylesKey = styles ? (styles.kind === 'url' ? styles.url : styles.text) : ''
  useEffect(() => {
    if (!readyRef.current) return
    setStatus({ state: 'loading' })
    post(mountMessage())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, stylesKey, exportName, theme])

  const propsKey = JSON.stringify(props)
  useEffect(() => {
    if (readyRef.current) post({ type: 'props', props: latest.current.props })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsKey])

  return (
    <iframe
      key={reloadKey}
      ref={iframeRef}
      title={title}
      src={src ?? undefined}
      sandbox="allow-scripts"
      className={className}
      data-preview-state={status.state}
    />
  )
}
