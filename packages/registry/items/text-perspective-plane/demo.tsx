import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PerspectiveText3D, type PerspectiveText3DProps } from './perspective-text-3d'

function luminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) return 1
  const n = parseInt(match[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}

export function Demo(props: PerspectiveText3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>({ x: 0.3, y: 0.3 })
  const [manual, setManual] = useState(false)

  // 自动播放：一个缓慢绕行的虚拟指针；用户真正移动指针后停止。
  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setPointer({ x: 0.5 * Math.sin(time * 0.9), y: 0.45 * Math.sin(time * 0.6 + 1.1) })
    },
    { reducedMotion: 'static', staticTime: 2.2 },
  )

  // 深色文字配浅色纸面，浅色文字配深色背景。
  const paper = luminance(props.color ?? '#f4f1ea') < 0.18
  const ink = paper ? 'text-neutral-600' : 'text-neutral-400'

  return (
    <div
      ref={host}
      onPointerMove={() => {
        if (!manual) {
          setManual(true)
          setPointer(null)
        }
      }}
      className={`grid h-full w-full place-items-center overflow-hidden px-4 py-10 ${paper ? 'bg-[#f3efe6]' : 'bg-background'}`}
    >
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <p className={`text-xs font-medium tracking-[0.2em] uppercase ${ink}`}>Kestrel Radio Week · Hall 4</p>
        <div className="mt-8 w-full">
          <PerspectiveText3D {...props} pointer={pointer} className="max-w-full" />
        </div>
        <p className={`mt-8 max-w-sm text-sm leading-relaxed ${ink}`}>
          Three nights of long-range listening, live decoding and talks from the people who built the dishes.
        </p>
      </div>
    </div>
  )
}
