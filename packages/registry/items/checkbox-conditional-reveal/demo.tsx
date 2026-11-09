import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { RevealField, type RevealFieldProps } from './checkbox-conditional-reveal'

/** 6-second loop: the option is selected at 1s and cleared at 4.5s. */
function scripted(time: number): boolean {
  const t = time % 6
  return t >= 1 && t < 4.5
}

export function Demo(props: RevealFieldProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  const [manual, setManual] = useState<boolean | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.5 },
  )

  const radio = props.control === 'radio'
  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-[380px] rounded-xl border bg-card p-5 shadow-xl shadow-black/20">
        <div className="mb-1 text-sm font-semibold text-foreground">Delivery</div>
        <div className="mb-5 text-xs text-muted-foreground">Order #4821 · 2 items</div>
        <RevealField
          {...props}
          label={radio ? 'Send as a gift' : 'Add a gift note'}
          description={radio ? 'Hide prices and include a printed note.' : 'Printed on a card inside the box.'}
          otherLabel="Ship to me"
          otherDescription="Standard packing slip with prices."
          fieldLabel="Gift note"
          placeholder="Happy birthday, Mara!"
          checked={manual ?? auto}
          onCheckedChange={setManual}
          name="gift"
        />
      </div>
    </div>
  )
}
