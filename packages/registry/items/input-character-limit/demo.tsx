import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputCharacterLimit, type InputCharacterLimitProps } from './input-character-limit'

const BIO = 'Ceramicist in Porto. Glazes, kilns, slow mornings and long walks by the river every weekend.'

/** One 10 s loop: type the bio up to the limit, hold, clear. */
function scripted(time: number, max: number) {
  const t = time % 10
  if (t >= 9.2 || t < 0.6) return ''
  const n = Math.floor((t - 0.6) / 0.09) + 1
  return BIO.slice(0, Math.min(n, max, BIO.length))
}

export function Demo(props: InputCharacterLimitProps) {
  const host = useRef<HTMLDivElement>(null)
  const max = props.maxLength ?? 50
  const [auto, setAuto] = useState('')
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time, max)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 6 },
  )

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[360px] rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Edit profile</h2>
        <p className="mt-1 mb-5 text-[13px] text-muted-foreground">Shown on your public page.</p>
        <InputCharacterLimit {...props} label="Short bio" placeholder="Tell people what you make" value={manual ?? auto} onChange={setManual} />
      </div>
    </div>
  )
}
