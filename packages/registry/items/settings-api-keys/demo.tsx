import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SettingsApiKeys, initialApiKeysState, type ApiKeysState, type SettingsApiKeysProps } from './settings-api-keys'

/** 8 秒一轮：显示密钥 -> 复制 -> 新建密钥 -> 复制新密钥 -> 吊销旧密钥 -> 复位。 */
function scripted(time: number): ApiKeysState {
  const t = time % 8
  if (t < 1) return initialApiKeysState
  if (t < 2) return { ...initialApiKeysState, revealed: 'prod' }
  if (t < 3) return { ...initialApiKeysState, revealed: 'prod', copied: 'prod' }
  if (t < 4.5) return { ...initialApiKeysState, created: true, revealed: 'new' }
  if (t < 5.8) return { ...initialApiKeysState, created: true, revealed: 'new', copied: 'new' }
  return { ...initialApiKeysState, created: true, revoked: ['legacy'] }
}

function same(a: ApiKeysState, b: ApiKeysState) {
  return a.revealed === b.revealed && a.copied === b.copied && a.created === b.created && a.revoked.join() === b.revoked.join()
}

export function Demo(props: SettingsApiKeysProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<ApiKeysState>(initialApiKeysState)
  const [manual, setManual] = useState<ApiKeysState | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 4 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div>
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Settings · Developers</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">API access</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the keys your services use to call the Northwind Ledger API.</p>
        </div>
        <SettingsApiKeys {...props} state={manual ?? auto} onStateChange={setManual} />
        <p className="text-xs text-muted-foreground">Revoked keys stop working within 60 seconds. Rotate production keys every 90 days.</p>
      </div>
    </div>
  )
}
