import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { VoiceCallBar, type ConversationStatus, type VoiceCallBarProps } from './voice-call-bar'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SCRIPT: [number, ChatMessage][] = [
  [3.2, { role: 'assistant', content: 'Hi, this is Fernway support. How can I help?' }],
  [5.0, { role: 'user', content: 'My order hasn’t shipped yet.' }],
  [6.3, { role: 'assistant', content: 'Order #4821 left our warehouse this morning. It should arrive Thursday.' }],
  [9.6, { role: 'user', content: 'Can I change the delivery address?' }],
  [10.7, { role: 'assistant', content: 'Yes. I’ve emailed you a link to update it.' }],
]
const TYPED = 'Can I change the delivery address?'
const LOOP = 14

interface View {
  status: ConversationStatus
  muted: boolean
  keyboardOpen: boolean
  text: string
  messages: ChatMessage[]
}

/** 一轮 12 秒：拨通、对话、打开键盘输入一句、静音片刻、挂断。 */
function scripted(time: number): View {
  // 剧本按 14 秒写，压进 12 秒的循环播放。
  const t = ((time % 12) / 12) * LOOP
  const status: ConversationStatus = t < 1.2 || t >= 13 ? 'disconnected' : t < 2.6 ? 'connecting' : 'connected'
  const typing = t >= 7.8 && t < 9.6 ? TYPED.slice(0, Math.ceil(((t - 7.8) / 1.5) * TYPED.length)) : ''
  return {
    status,
    muted: t >= 11.6 && t < 12.5,
    keyboardOpen: t >= 7.4 && t < 10.4,
    text: typing,
    messages: status === 'disconnected' ? [] : SCRIPT.filter(([at]) => t >= at).map(([, m]) => m),
  }
}

const same = (a: View, b: View) =>
  a.status === b.status && a.muted === b.muted && a.keyboardOpen === b.keyboardOpen && a.text === b.text && a.messages.length === b.messages.length

export function Demo(props: VoiceCallBarProps) {
  const host = useRef<HTMLDivElement>(null)
  const now = useRef(0)
  const [auto, setAuto] = useState<View>(() => scripted(0))
  const [manual, setManual] = useState<View | null>(null)
  const pending = useRef<{ connectAt?: number; replyAt?: number }>({})

  useFrameLoop(
    host,
    ({ time }) => {
      now.current = time
      if (!manual) {
        const next = scripted(time)
        setAuto((prev) => (same(prev, next) ? prev : next))
        return
      }
      const p = pending.current
      if (p.connectAt !== undefined && time >= p.connectAt) {
        p.connectAt = undefined
        setManual((v) => (v && v.status === 'connecting' ? { ...v, status: 'connected' } : v))
      }
      if (p.replyAt !== undefined && time >= p.replyAt) {
        p.replyAt = undefined
        setManual((v) => (v ? { ...v, messages: [...v.messages, { role: 'assistant', content: 'Got it. I’ve added that to your ticket.' }] } : v))
      }
    },
    { reducedMotion: 'static', staticTime: 6 },
  )

  const view = manual ?? auto
  const takeOver = () => {
    if (!manual) setManual(auto)
  }
  const update = (patch: Partial<View>) => setManual((v) => ({ ...(v ?? auto), ...patch }))

  return (
    <div ref={host} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="grid h-full w-full place-items-center bg-background p-4 sm:p-6">
      <div className="relative flex h-[440px] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 border-b px-5 py-3">
          <div className="size-7 shrink-0 rounded-full bg-[conic-gradient(from_200deg,#a78bfa,#38bdf8,#34d399,#a78bfa)]" aria-hidden="true" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Fernway Help</div>
            <div className="text-xs text-muted-foreground">{view.status === 'connected' ? 'On a call' : view.status === 'connecting' ? 'Connecting…' : 'Usually replies instantly'}</div>
          </div>
        </div>
        <div className={`flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-5 ${props.position === 'floating' ? 'pb-[96px]' : 'pb-0'}`} aria-live="polite">
          {view.messages.length === 0 ? (
            <div className="m-auto text-center">
              <div className="text-sm font-medium">Start a conversation</div>
              <div className="mt-1 text-xs text-muted-foreground">Tap the phone button or type a message</div>
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-2">
              {view.messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] self-end rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground'
                      : 'max-w-[85%] self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground'
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
          )}
        </div>
        <VoiceCallBar
          {...props}
          status={view.status}
          muted={view.muted}
          keyboardOpen={view.keyboardOpen}
          text={view.text}
          onStartSession={() => {
            pending.current.connectAt = now.current + 1.2
            update({ status: 'connecting', messages: [] })
          }}
          onEndSession={() => {
            pending.current = {}
            update({ status: 'disconnected', muted: false, keyboardOpen: false, text: '', messages: [] })
          }}
          onMutedChange={(muted) => update({ muted })}
          onKeyboardOpenChange={(keyboardOpen) => update({ keyboardOpen })}
          onTextChange={(text) => update({ text })}
          onSendMessage={(content) => {
            pending.current.replyAt = now.current + 1.2
            setManual((v) => {
              const base = v ?? auto
              return { ...base, text: '', messages: [...base.messages, { role: 'user', content }] }
            })
          }}
        />
      </div>
    </div>
  )
}
