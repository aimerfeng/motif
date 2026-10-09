/**
 * 截图 / 录屏用的宿主页面（dist/capture.html）。它像站点一样把条目挂进不透明源的沙箱 iframe，
 * 并把协议包装成 window.motifCapture 上的异步方法，供 Playwright 调用。
 */
import { envelope, readSandboxMessage, sandboxUrl, type HostMessage, type ModuleRef, type MountMessage, type SandboxMessage, type StyleRef } from '../protocol.ts'

type Waiter = { match: (message: SandboxMessage) => boolean; resolve: (message: SandboxMessage) => void }

export interface CaptureMountOptions {
  /** 市场条目是沙箱上的产物 URL，Studio 的截图直接给编译好的代码。 */
  module: ModuleRef
  styles: StyleRef
  exportName: string
  theme: 'dark' | 'light'
  props: MountMessage['props']
  clock: 'real' | 'manual'
}

export interface CaptureApi {
  /** 重建 iframe 并挂载条目；返回挂载耗时，失败时抛出沙箱报告的错误。 */
  mount(options: CaptureMountOptions): Promise<number>
  advance(ms: number): Promise<void>
  measure(ms: number): Promise<{ fps: number; slowFrames: number }>
  /** 挂载以来沙箱报告的全部错误。 */
  errors(): string[]
}

declare global {
  interface Window {
    motifCapture: CaptureApi
  }
}

let iframe: HTMLIFrameElement | null = null
let nonce = ''
let waiters: Waiter[] = []
let errors: string[] = []

window.addEventListener('message', (event) => {
  if (!iframe || event.source !== iframe.contentWindow) return
  const message = readSandboxMessage(event.data, nonce)
  if (!message) return
  if (message.type === 'error') errors.push(`${message.phase}: ${message.message}`)
  const pending = waiters
  waiters = []
  for (const waiter of pending) {
    if (waiter.match(message)) waiter.resolve(message)
    else waiters.push(waiter)
  }
})

function waitFor(match: (message: SandboxMessage) => boolean, timeoutMs = 20_000): Promise<SandboxMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out waiting for the sandbox')), timeoutMs)
    waiters.push({
      match,
      resolve: (message) => {
        clearTimeout(timer)
        resolve(message)
      },
    })
  })
}

function post(message: HostMessage) {
  iframe?.contentWindow?.postMessage(envelope(nonce, message), '*')
}

window.motifCapture = {
  async mount(options) {
    iframe?.remove()
    errors = []
    waiters = []
    nonce = crypto.randomUUID()
    iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.title = 'capture'
    const ready = waitFor((message) => message.type === 'ready')
    iframe.src = sandboxUrl(location.origin, nonce, location.origin)
    document.body.append(iframe)
    await ready

    const done = waitFor((message) => message.type === 'mounted' || (message.type === 'error' && message.phase !== 'runtime'))
    post({
      type: 'mount',
      module: options.module,
      styles: options.styles,
      exportName: options.exportName,
      props: options.props,
      theme: options.theme,
      clock: options.clock,
    })
    const result = await done
    if (result.type === 'error') throw new Error(result.message)
    return result.type === 'mounted' ? result.ms : 0
  },

  async advance(ms) {
    const done = waitFor((message) => message.type === 'advanced' && message.to === ms)
    post({ type: 'advance', to: ms })
    await done
  },

  async measure(ms) {
    const done = waitFor((message) => message.type === 'measured', ms + 10_000)
    post({ type: 'measure', ms })
    const result = await done
    return result.type === 'measured' ? { fps: result.fps, slowFrames: result.slowFrames } : { fps: 0, slowFrames: 0 }
  },

  errors: () => [...errors],
}
