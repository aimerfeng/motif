/**
 * 站点（host）与预览沙箱（sandbox iframe）之间的消息协议。
 *
 * 沙箱是 `sandbox="allow-scripts"` 的 iframe，源是不透明的 `null`，所以双方都不能靠 origin 认人：
 * - host 只接受 `event.source === iframe.contentWindow` 且 nonce 匹配的消息；
 * - 沙箱只接受 `event.source === window.parent` 且 origin 等于 URL 里声明的 host origin 的消息，回消息也只发给这个 origin。
 */
export const PREVIEW_PROTOCOL = 'motif-preview/1'

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
export type PreviewProps = Record<string, JsonValue>

/** 要挂载的模块：沙箱自己托管的 URL（预编译的条目），或者一段已编译的 ESM 代码（Studio 生成的代码）。 */
export type ModuleRef = { kind: 'url'; url: string } | { kind: 'code'; code: string }

export type HostMessage =
  | { type: 'mount'; module: ModuleRef; exportName: string; props: PreviewProps }
  | { type: 'props'; props: PreviewProps }
  | { type: 'ping'; seq: number }

export type ErrorPhase = 'load' | 'render' | 'runtime'

export type SandboxMessage =
  | { type: 'ready' }
  | { type: 'mounted'; ms: number }
  | { type: 'error'; phase: ErrorPhase; message: string; stack?: string }
  | { type: 'pong'; seq: number }

export interface Envelope<T> {
  protocol: typeof PREVIEW_PROTOCOL
  nonce: string
  message: T
}

export function envelope<T>(nonce: string, message: T): Envelope<T> {
  return { protocol: PREVIEW_PROTOCOL, nonce, message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEnvelope(data: unknown, nonce: string): data is Envelope<Record<string, unknown>> {
  return isRecord(data) && data.protocol === PREVIEW_PROTOCOL && data.nonce === nonce && isRecord(data.message)
}

function isModuleRef(value: unknown): value is ModuleRef {
  if (!isRecord(value)) return false
  if (value.kind === 'url') return typeof value.url === 'string'
  if (value.kind === 'code') return typeof value.code === 'string'
  return false
}

export function readHostMessage(data: unknown, nonce: string): HostMessage | null {
  if (!isEnvelope(data, nonce)) return null
  const message = data.message
  switch (message.type) {
    case 'mount':
      return isModuleRef(message.module) && typeof message.exportName === 'string' && isRecord(message.props)
        ? { type: 'mount', module: message.module, exportName: message.exportName, props: message.props as PreviewProps }
        : null
    case 'props':
      return isRecord(message.props) ? { type: 'props', props: message.props as PreviewProps } : null
    case 'ping':
      return typeof message.seq === 'number' ? { type: 'ping', seq: message.seq } : null
    default:
      return null
  }
}

export function readSandboxMessage(data: unknown, nonce: string): SandboxMessage | null {
  if (!isEnvelope(data, nonce)) return null
  const message = data.message
  switch (message.type) {
    case 'ready':
      return { type: 'ready' }
    case 'mounted':
      return typeof message.ms === 'number' ? { type: 'mounted', ms: message.ms } : null
    case 'error': {
      const phase = message.phase
      if ((phase !== 'load' && phase !== 'render' && phase !== 'runtime') || typeof message.message !== 'string') return null
      return typeof message.stack === 'string'
        ? { type: 'error', phase, message: message.message, stack: message.stack }
        : { type: 'error', phase, message: message.message }
    }
    case 'pong':
      return typeof message.seq === 'number' ? { type: 'pong', seq: message.seq } : null
    default:
      return null
  }
}

/** 沙箱 URL 的 hash 里带 nonce 和 host origin：`runtime.html#nonce=…&host=…`。 */
export function sandboxUrl(previewBase: string, nonce: string, hostOrigin: string): string {
  const params = new URLSearchParams({ nonce, host: hostOrigin })
  return `${previewBase.replace(/\/$/, '')}/runtime.html#${params.toString()}`
}
