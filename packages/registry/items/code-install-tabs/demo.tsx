import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { CliCommands, type CliCommandsProps, type PackageManager } from './code-install-tabs'

const ORDER: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun']

/** 一轮 8 秒：每 2 秒换一个包管理器，每段中间点一次复制。 */
function scripted(time: number): { manager: PackageManager; copied: boolean } {
  const t = time % 8
  const step = Math.floor(t / 2)
  const local = t - step * 2
  return { manager: ORDER[step], copied: local > 0.9 && local < 1.6 }
}

export function Demo(props: CliCommandsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(() => scripted(0))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev.manager === next.manager && prev.copied === next.copied ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  const driven = manual ? {} : { manager: auto.manager }
  return (
    <div
      ref={host}
      onPointerDown={() => setManual(true)}
      onKeyDown={() => setManual(true)}
      className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4 sm:p-6"
    >
      <div className="w-full max-w-[520px] min-w-0 space-y-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Installation</div>
          <div className="text-xs text-muted-foreground">Add the component to your project with the CLI.</div>
        </div>
        <CliCommands {...props} {...driven} copied={manual ? undefined : auto.copied} />
        <div className="pt-2 text-xs text-muted-foreground">Then add the motion runtime:</div>
        <CliCommands {...props} {...driven} command="tiller@latest add runtime" />
      </div>
    </div>
  )
}
