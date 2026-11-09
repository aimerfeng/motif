import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { VoiceDictationButton, type VoiceDictationButtonProps, type VoiceDictationState } from './voice-dictation-button'

const BEFORE = 'Standup notes, Thursday. '
const SPOKEN = 'Ship the export fix today, then pair with Mara on the billing migration.'
const LOOP = 10
const SPEAK = 3.6

type Session = { start: number; stop: number | null; cancelled: boolean }

/** 一次录音：start 后说话，stop 后处理 1 秒，再反馈 1.6 秒。 */
function phase(session: Session | null, t: number): { state: VoiceDictationState; transcript: string; committed: string } {
  if (!session || t < session.start) return { state: 'idle', transcript: '', committed: '' }
  const said = (until: number) => {
    const p = Math.min(1, Math.max(0, (until - session.start - 0.5) / SPEAK))
    const words = SPOKEN.split(' ')
    return words.slice(0, Math.floor(p * words.length)).join(' ')
  }
  if (session.stop === null || t < session.stop) return { state: 'recording', transcript: said(t), committed: '' }
  const text = session.cancelled ? '' : said(session.stop)
  if (session.cancelled) return { state: 'idle', transcript: '', committed: '' }
  if (t < session.stop + 1) return { state: 'processing', transcript: text, committed: '' }
  if (t < session.stop + 2.6) return { state: 'success', transcript: text, committed: text }
  return { state: 'idle', transcript: '', committed: text }
}

export function Demo(props: VoiceDictationButtonProps) {
  const host = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(0)
  const [manual, setManual] = useState<{ base: string; session: Session | null } | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      const next = Math.round(time * 30) / 30
      setNow((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.0 },
  )

  let base = BEFORE
  let current: ReturnType<typeof phase>
  if (manual) {
    base = manual.base
    current = phase(manual.session, now)
  } else {
    const t = now % LOOP
    current = phase({ start: 0.8, stop: 0.8 + SPEAK + 0.6, cancelled: false }, t)
  }
  const value = base + (current.committed || current.transcript)

  const session = manual?.session ?? null
  const start = () => setManual({ base: value.endsWith(' ') || value === '' ? value : `${value} `, session: { start: now, stop: null, cancelled: false } })
  const stop = () => session && setManual({ base, session: { ...session, stop: now } })
  const cancel = () => session && setManual({ base, session: { ...session, stop: now, cancelled: true } })

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_55%_at_50%_100%,oklch(0.3_0.03_260/0.45),transparent)] bg-background p-4">
      <div className="relative w-full max-w-[440px]">
        <label htmlFor="voice-notes" className="mb-2 block text-xs font-medium text-muted-foreground">
          Meeting notes
        </label>
        <textarea
          id="voice-notes"
          value={value}
          onChange={(e) => setManual({ base: e.target.value, session: null })}
          placeholder="Jot down some thoughts..."
          className="block min-h-[132px] w-full resize-none rounded-2xl border border-input bg-card/60 px-3.5 pt-3 pb-14 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <VoiceDictationButton {...props} state={current.state} transcript={current.transcript} onStart={start} onStop={stop} onCancel={cancel} />
        </div>
      </div>
    </div>
  )
}
