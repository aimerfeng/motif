import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  envelope,
  readHostMessage,
  type ErrorPhase,
  type MountMessage,
  type ModuleRef,
  type PreviewProps,
  type PreviewTheme,
  type SandboxMessage,
  type StyleRef,
} from '../protocol.ts'
import { advanceTo, installManualClock, isManualClock, measureFrames } from './clock.ts'

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

let styleElement: HTMLLinkElement | HTMLStyleElement | null = null

/** 换上新条目的样式表；URL 形式要等样式加载完再渲染，避免先闪一下无样式的画面。 */
async function applyStyles(ref: StyleRef | undefined): Promise<void> {
  styleElement?.remove()
  styleElement = null
  if (!ref) return
  if (ref.kind === 'text') {
    const style = document.createElement('style')
    style.textContent = ref.text
    document.head.append(style)
    styleElement = style
    return
  }
  const url = new URL(ref.url, location.href)
  if (url.origin !== ownOrigin) throw new Error(`refusing to load a stylesheet from another origin: ${url.href}`)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url.href
  styleElement = link
  await new Promise<void>((resolve, reject) => {
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`failed to load stylesheet ${url.href}`))
    document.head.append(link)
  })
}

function applyTheme(theme: PreviewTheme | undefined) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme ?? 'light'
}

async function mount({ module: ref, exportName, props, styles, theme, clock }: MountMessage) {
  const started = performance.now()
  const seq = ++mountSeq
  try {
    // 手动时钟必须在条目模块（以及它第一次引入的 motion 等库）加载之前装好。
    if (clock === 'manual') installManualClock()
    applyTheme(theme)
    const [mod] = await Promise.all([loadModule(ref), applyStyles(styles)])
    if (seq !== mountSeq) return
    const Comp = mod[exportName]
    if (typeof Comp !== 'function') throw new Error(`module has no component export named "${exportName}"`)
    current = { Comp: Comp as ComponentType<PreviewProps>, props, key: seq }
    renderFailed = false
    render()
    const reportMounted = () => {
      if (seq === mountSeq && !renderFailed) send({ type: 'mounted', ms: Math.round(performance.now() - started) })
    }
    // 手动时钟下 rAF 不会自己触发，等 React 提交后直接报告。
    if (isManualClock()) setTimeout(reportMounted, 0)
    else requestAnimationFrame(reportMounted)
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
      void mount(message)
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
    case 'advance':
      void advanceTo(message.to, (error) => reportError('runtime', error)).then(() => send({ type: 'advanced', to: message.to }))
      break
    case 'measure':
      void measureFrames(message.ms).then((result) => send({ type: 'measured', ...result }))
      break
  }
})

window.addEventListener('error', (event) => reportError('runtime', event.error ?? event.message))
window.addEventListener('unhandledrejection', (event) => reportError('runtime', event.reason))

send({ type: 'ready' })
