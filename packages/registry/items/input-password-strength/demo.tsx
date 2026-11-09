import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputPasswordStrength, type InputPasswordStrengthProps } from './input-password-strength'

const PASSWORD = 'harbor7Lantern!'

/** 一轮 10 秒：逐字输入密码 -> 中途切到明文 -> 停留 -> 清空。 */
function scripted(time: number) {
  const t = time % 10
  if (t >= 9.2) return { text: '', visible: false }
  const n = t < 0.8 ? 0 : Math.min(PASSWORD.length, Math.floor((t - 0.8) / 0.32) + 1)
  return { text: PASSWORD.slice(0, n), visible: t > 3.4 && t < 8.4 }
}

export function Demo(props: InputPasswordStrengthProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(scripted(0))
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev.text === next.text && prev.visible === next.visible ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.5 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[360px] rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Create your account</h2>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Choose a password for kestrel@fieldnote.app</p>
        <InputPasswordStrength
          {...props}
          label="New password"
          value={manual ?? auto.text}
          visible={manual !== null ? undefined : auto.visible}
          onChange={setManual}
        />
      </div>
    </div>
  )
}
