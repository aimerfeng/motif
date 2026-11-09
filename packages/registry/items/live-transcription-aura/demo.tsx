import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { LiveTranscriptionAura, type LiveTranscriptionAuraProps, type TranscriptionStatus } from './live-transcription-aura'

/** 一段会议口述。guess：这个词刚听到时的误识别，后面的词进来后被改正。 */
const SEGMENTS: { text: string; guesses?: Record<number, string> }[] = [
  { text: 'Okay, quick recap from the design review.' },
  { text: "We're moving the onboarding checklist to the second screen, and Priya will send new copy by Thursday.", guesses: { 8: 'scream,', 10: 'pria' } },
  { text: 'Open question: do we keep dark mode as the default?', guesses: { 6: 'mood' } },
]

const IDLE_END = 0.8
const CONNECT_END = 1.5
const FIRST_WORD = 2
const WORD = 0.2
const COMMIT_GAP = 0.4
const NEXT_GAP = 0.3
const CYCLE = 12
const STOP_AT = 11.3

type Feed = { status: TranscriptionStatus; committed: number; partial: string }

/** 脚本化的识别源：按时间给出状态、已确认片段数和 partial。真实应用里换成语音识别 SDK 的回调。 */
function scripted(time: number): Feed {
  const t = ((time % CYCLE) + CYCLE) % CYCLE
  if (t < IDLE_END || t >= STOP_AT) return { status: 'idle', committed: 0, partial: '' }
  if (t < CONNECT_END) return { status: 'connecting', committed: 0, partial: '' }
  let start = FIRST_WORD
  for (let s = 0; s < SEGMENTS.length; s++) {
    const words = SEGMENTS[s]!.text.split(' ')
    const end = start + words.length * WORD
    if (t < start) return { status: 'connected', committed: s, partial: '' }
    if (t < end + COMMIT_GAP) {
      const heard = Math.min(words.length, Math.floor((t - start) / WORD) + 1)
      const shown = words.slice(0, heard)
      // 最新的一两个词还可能听错：guess 只在它是最后一个或倒数第二个词时显示。
      for (const [index, guess] of Object.entries(SEGMENTS[s]!.guesses ?? {})) {
        const i = Number(index)
        if (i < heard && i >= heard - 2 && t < end) shown[i] = guess
      }
      return { status: 'connected', committed: s, partial: shown.join(' ') }
    }
    start = end + COMMIT_GAP + NEXT_GAP
  }
  return { status: 'connected', committed: SEGMENTS.length, partial: '' }
}

const same = (a: Feed, b: Feed) => a.status === b.status && a.committed === b.committed && a.partial === b.partial

export function Demo(props: LiveTranscriptionAuraProps) {
  const host = useRef<HTMLDivElement>(null)
  const now = useRef(0)
  // 用户点了开始 / 停止之后：offset 把脚本拨到「连接中」，stopped 让它停在开始面板。
  const control = useRef({ offset: 0, stopped: false })
  const [feed, setFeed] = useState<Feed>(() => scripted(0))

  useFrameLoop(
    host,
    ({ time }) => {
      now.current = time
      const next = control.current.stopped ? scripted(0) : scripted(time - control.current.offset)
      setFeed((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 9.5 },
  )

  return (
    <div ref={host} className="h-full w-full">
      <LiveTranscriptionAura
        {...props}
        status={feed.status}
        committed={SEGMENTS.slice(0, feed.committed).map((segment) => segment.text)}
        partial={feed.partial}
        onStart={() => {
          control.current = { offset: now.current - IDLE_END, stopped: false }
        }}
        onStop={() => {
          control.current = { offset: control.current.offset, stopped: true }
        }}
        labels={{ title: 'Meeting notes', description: 'Dictate a recap and it lands in your notes as you speak.', start: 'Start dictating' }}
      />
    </div>
  )
}
