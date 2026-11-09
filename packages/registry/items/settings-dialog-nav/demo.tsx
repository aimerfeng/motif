import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SettingsDialog, type SettingsDialogProps } from './settings-dialog-nav'

/** 自动播放：每隔 STEP 秒切到下一个分区；用户点过之后停止。 */
const SEQUENCE = ['Messages & media', 'Appearance', 'Notifications', 'Privacy & visibility']
const STEP = 2

export function Demo(props: SettingsDialogProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [section, setSection] = useState(SEQUENCE[0])

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const next = SEQUENCE[Math.floor(time / STEP) % SEQUENCE.length]
      setSection((s) => (s === next ? s : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div
      ref={host}
      onPointerDownCapture={() => setAuto(false)}
      onKeyDownCapture={() => setAuto(false)}
      className="h-full w-full overflow-y-auto bg-background"
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}
    >
      <SettingsDialog {...props} section={section} onSectionChange={setSection} />
    </div>
  )
}
