import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { AuthMagicLink, defaults, type AuthMagicLinkProps, type MagicLinkPreview } from './auth-magic-link'

const EMAIL = 'ines@larkspur.dev'
const CYCLE = 10

/** 一轮 10 秒：输入邮箱 -> 发送中 -> 信封动画和重发倒计时 -> 换个邮箱，回到空表单。 */
function scripted(time: number, total: number): MagicLinkPreview {
  const t = time % CYCLE
  if (t < 0.5) return { step: 'email', email: '', resendIn: total, focused: true }
  if (t < 2.3) return { step: 'email', email: EMAIL.slice(0, Math.floor((t - 0.5) / 0.085) + 1), resendIn: total, focused: true }
  if (t < 3.2) return { step: 'sending', email: EMAIL, resendIn: total }
  if (t < 9.5) return { step: 'sent', email: EMAIL, resendIn: Math.max(0, total - Math.floor(t - 3.2)) }
  return { step: 'email', email: '', resendIn: total, focused: true }
}

const same = (a: MagicLinkPreview, b: MagicLinkPreview) => a.step === b.step && a.email === b.email && a.resendIn === b.resendIn && a.focused === b.focused

export function Demo(props: AuthMagicLinkProps) {
  const host = useRef<HTMLDivElement>(null)
  const total = props.resendSeconds ?? defaults.resendSeconds
  const [auto, setAuto] = useState<MagicLinkPreview>(() => scripted(0, total))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, total)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.4 },
  )

  // 用户一碰就停掉自动播放，组件从当前画面接着用内部状态。
  const takeOver = () => {
    if (!manual) setManual(true)
  }

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
      <AuthMagicLink {...props} preview={manual ? undefined : auto} className="min-h-full" />
    </div>
  )
}
