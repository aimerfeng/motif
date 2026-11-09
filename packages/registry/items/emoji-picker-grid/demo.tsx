import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { EmojiPickerGrid, emojiCategories, type EmojiPickerGridProps } from './emoji-picker-grid'

const BASE = 'Picnic on Saturday? I’ll bring snacks '
const SMILEYS = emojiCategories[0]!.emojis.map((e) => e.name)
type Auto = { open: boolean; highlighted: string | null; query: string; text: string }

/** 一轮 9 秒：打开 → 方向键走几格 → 搜索 straw → 回车插入 🍓 → 收起。 */
function scripted(time: number, cols: number): Auto {
  const t = time % 9
  if (t < 0.6) return { open: false, highlighted: null, query: '', text: BASE }
  if (t >= 6.4) return { open: false, highlighted: null, query: '', text: BASE + '🍓' }
  if (t < 4.4) {
    const path = [0, 1, 2, 2 + cols, 2 + 2 * cols, 1 + 2 * cols]
    const step = Math.floor((t - 1.2) / 0.5)
    const highlighted = step < 0 ? null : SMILEYS[path[Math.min(path.length - 1, step)]!]!
    return { open: true, highlighted, query: '', text: BASE }
  }
  const word = 'straw'
  const n = Math.min(word.length, Math.floor((t - 4.4) / 0.18) + 1)
  return { open: true, highlighted: t >= 5.6 ? 'strawberry' : null, query: word.slice(0, n), text: BASE }
}

export function Demo(props: EmojiPickerGridProps) {
  const host = useRef<HTMLDivElement>(null)
  const cols = Math.round(props.columns ?? 5)
  const [auto, setAuto] = useState<Auto>({ open: false, highlighted: null, query: '', text: BASE })
  const [manual, setManual] = useState(false)
  const [text, setText] = useState(BASE)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, cols)
      setAuto((prev) =>
        prev.open === next.open && prev.highlighted === next.highlighted && prev.query === next.query && prev.text === next.text ? prev : next,
      )
    },
    { reducedMotion: 'static', staticTime: 3.4 },
  )

  const takeOver = () => {
    if (!manual) {
      setText(auto.text)
      setManual(true)
    }
  }

  return (
    <div ref={host} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="flex h-full w-full justify-center overflow-hidden bg-background px-4 pt-[8vh]">
      <div className="w-full max-w-[22rem]">
        <div className="mb-3 flex items-end gap-2">
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#f472b6,#fb923c)] text-[11px] font-semibold text-white">MO</div>
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground">Weather looks clear all weekend ☀️</div>
        </div>
        <EmojiPickerGrid
          {...props}
          className="w-full"
          {...(manual
            ? { value: text, onValueChange: setText }
            : { value: auto.text, open: auto.open, highlighted: auto.highlighted, query: auto.query })}
        />
      </div>
    </div>
  )
}
