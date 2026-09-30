import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { InputDropzone, type DropzoneFile, type InputDropzoneProps } from './input-dropzone'

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (v: number) => 1 - (1 - clamp(v)) ** 3

/** 一轮 11 秒：文件被拖入 -> 松手 -> 两个文件依次上传完成 -> 清空。 */
function scripted(time: number) {
  const t = time % 11
  const dragging = t >= 1.0 && t < 3.3
  const files: DropzoneFile[] = []
  if (t >= 3.3 && t < 9.6) {
    files.push({ id: 'a', name: 'design-brief.pdf', size: 2_400_000, progress: clamp((t - 3.5) / 1.9) })
    if (t >= 3.9) files.push({ id: 'b', name: 'mockup-v3.png', size: 860_000, progress: clamp((t - 4.1) / 2.6) })
  }
  const ghost = dragging ? ease((t - 1.0) / 1.8) : 0
  return { dragging, files, ghost, showGhost: t >= 1.0 && t < 3.3 }
}

export function Demo(props: InputDropzoneProps) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      setState(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 4.9 },
  )

  return (
    <div
      ref={host}
      onPointerDown={() => setManual(true)}
      className="grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(55%_55%_at_50%_0%,oklch(0.32_0.09_235/0.4),transparent)] bg-background p-6"
    >
      <div className="relative w-full max-w-[460px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <h2 className="text-base font-semibold">New support ticket</h2>
        <p className="mt-0.5 mb-5 text-xs text-muted-foreground">Screenshots and documents help us reproduce the issue.</p>
        <div className="mb-2 text-xs font-medium">Attachments</div>
        <div className="relative">
          {state.showGhost && !manual && (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-10 flex items-center gap-2 rounded-lg border bg-popover px-3 py-2 shadow-xl shadow-black/40"
              style={{ transform: `translate(-30%, ${-70 + state.ghost * 92}px) rotate(${-7 + state.ghost * 7}deg)`, opacity: 0.35 + state.ghost * 0.65 }}
            >
              <span className="grid size-6 place-items-center rounded bg-sky-400/20 text-[9px] font-bold text-sky-300">PDF</span>
              <span className="text-xs font-medium">design-brief.pdf</span>
            </div>
          )}
          <InputDropzone
            {...props}
            files={manual ? undefined : state.files}
            dragActive={manual ? undefined : state.dragging}
          />
        </div>
      </div>
    </div>
  )
}
