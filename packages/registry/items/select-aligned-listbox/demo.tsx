import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SelectAlignedListbox, type SelectAlignedListboxProps } from './select-aligned-listbox'

type Auto = { open: boolean; highlighted?: string; value: string }

/** 一轮 9 秒：展开（选中项压在按钮上），向下经过几项，再回到 Mango 选中后收起。 */
function scripted(time: number, grouped: boolean): Auto {
  const t = time % 9
  const start = grouped ? 'kiwi' : 'fuji'
  const end = grouped ? 'mango' : 'granny-smith'
  const steps = grouped ? ['kiwi', 'grape', 'orange', 'grape', 'kiwi', 'mango'] : ['fuji', 'honeycrisp', 'granny-smith', 'pink-lady', 'granny-smith']
  if (t < 1) return { open: false, value: start }
  if (t < 6.6) {
    const i = Math.min(steps.length - 1, Math.floor((t - 1) / 0.85))
    return { open: true, highlighted: steps[i], value: start }
  }
  return { open: false, value: end }
}

export function Demo(props: SelectAlignedListboxProps) {
  const host = useRef<HTMLDivElement>(null)
  const grouped = props.grouped ?? true
  const [auto, setAuto] = useState<Auto>({ open: false, value: grouped ? 'kiwi' : 'fuji' })
  const [manual, setManual] = useState(false)
  const [value, setValue] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, grouped)
      setAuto((prev) => (prev.open === next.open && prev.highlighted === next.highlighted && prev.value === next.value ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const takeOver = () => {
    if (!manual) {
      setValue(auto.value)
      setManual(true)
    }
  }

  return (
    <div ref={host} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[400px] border bg-card p-6 pt-40 pl-10">
        <SelectAlignedListbox
          {...props}
          label={grouped ? 'Produce' : 'Apple'}
          placeholder={grouped ? 'Select produce' : 'Select apple'}
          {...(manual ? { value, onValueChange: setValue } : { value: auto.value, open: auto.open, highlighted: auto.highlighted })}
        />
        <p className="mt-4 text-xs text-muted-foreground">Delivered with Thursday’s market box.</p>
      </div>
    </div>
  )
}
