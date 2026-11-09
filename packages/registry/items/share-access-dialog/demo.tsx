import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ShareAccessDialog, type ShareAccessDialogProps } from './share-access-dialog'

/** One 10 s cycle: closed -> open -> closed. */
const scripted = (time: number) => {
  const t = time % 10
  return t >= 0.8 && t < 8.6
}

const INVITEES = ['sam@northwind.dev']

export function Demo(props: ShareAccessDialogProps) {
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
    { reducedMotion: 'static', staticTime: 4.5 },
  )

  const inline = props.presentation === 'inline'
  return (
    <div ref={host} className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background p-4">
      {inline ? (
        <div className="flex w-full justify-center">
          <ShareAccessDialog {...props} className="flex justify-center" defaultInvitees={INVITEES} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-sm font-medium">Q2 review runbook</div>
          <div className="text-xs text-muted-foreground">Edited 2 hours ago by Lena</div>
          <ShareAccessDialog {...props} contained open={manual ?? auto} onOpenChange={setManual} defaultInvitees={INVITEES} />
        </div>
      )}
    </div>
  )
}
