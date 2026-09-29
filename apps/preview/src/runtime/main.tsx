import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { envelope, readHostMessage, type ErrorPhase, type ModuleRef, type PreviewProps, type SandboxMessage } from '../protocol.ts'

const hash = new URLSearchParams(location.hash.slice(1))
const nonce = hash.get('nonce') ?? ''
const hostOrigin = hash.get('host') ?? ''
// 沙箱的 origin 是 null，用文档 URL 的 origin 判断模块是不是沙箱自己托管的。
const ownOrigin = new URL(location.href).origin

function send(message: SandboxMessage) {
  if (!nonce || !hostOrigin) return
  window.parent.postMessage(envelope(nonce, message), hostOrigin)
}

function reportError(phase: ErrorPhase, error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error))
  send(err.stack ? { type: 'error', phase, message: err.message, stack: err.stack } : { type: 'error', phase, message: err.message })
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown, _info: ErrorInfo) {
    renderFailed = true
    reportError('render', error)
  }

  override render() {
    return this.state.failed ? null : this.props.children
  }
}

const root = createRoot(document.getElementById('root')!)
let current: { Comp: ComponentType<PreviewProps>; props: PreviewProps; key: number } | null = null
let mountSeq = 0
// 本次挂载是否在渲染时出错；出错后不再报告 mounted，避免覆盖 error。
let renderFailed = false

function render() {
  if (!current) return
  const { Comp, props, key } = current
  root.render(
    <Boundary key={key}>
      <Comp {...props} />
    </Boundary>,
  )
}

async function loadModule(ref: ModuleRef): Promise<Record<string, unknown>> {
  if (ref.kind === 'url') {
    const url = new URL(ref.url, location.href)
    if (url.origin !== ownOrigin) throw new Error(`refusing to load a module from another origin: ${url.href}`)
    return (await import(url.href)) as Record<string, unknown>
  }
  const blobUrl = URL.createObjectURL(new Blob([ref.code], { type: 'text/javascript' }))
  try {
    return (await import(blobUrl)) as Record<string, unknown>
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

async function mount(ref: ModuleRef, exportName: string, props: PreviewProps) {
  const started = performance.now()
  const seq = ++mountSeq
  try {
    const mod = await loadModule(ref)
    if (seq !== mountSeq) return
    const Comp = mod[exportName]
    if (typeof Comp !== 'function') throw new Error(`module has no component export named "${exportName}"`)
    current = { Comp: Comp as ComponentType<PreviewProps>, props, key: seq }
    renderFailed = false
    render()
    requestAnimationFrame(() => {
      if (seq === mountSeq && !renderFailed) send({ type: 'mounted', ms: Math.round(performance.now() - started) })
    })
  } catch (error) {
    reportError('load', error)
  }
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== hostOrigin) return
  const message = readHostMessage(event.data, nonce)
  if (!message) return
  switch (message.type) {
    case 'mount':
      void mount(message.module, message.exportName, message.props)
      break
    case 'props':
      if (current) {
        current = { ...current, props: message.props }
        render()
      }
      break
    case 'ping':
      send({ type: 'pong', seq: message.seq })
      break
  }
})

window.addEventListener('error', (event) => reportError('runtime', event.error ?? event.message))
window.addEventListener('unhandledrejection', (event) => reportError('runtime', event.reason))

send({ type: 'ready' })
