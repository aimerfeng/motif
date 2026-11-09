import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ConfigResourceForm, type ConfigResourceFormProps, type Provider } from './config-resource-form'

// 自动播放：存储滑块缓慢来回，服务商 / 套餐每 4 秒轮换；用户一操作就交还控制
const PROVIDERS: Provider[] = ['nimbus', 'stratus', 'kelvin', 'harbor']
const PLANS = ['Premium', 'Hobby', 'Enterprise']
const PERIOD = 4

export function Demo(props: ConfigResourceFormProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const max = Math.max(8, Math.round(props.storageRange ?? 128))
  const [storage, setStorage] = useState(Math.min(32, max))
  const [provider, setProvider] = useState<Provider>('nimbus')
  const [plan, setPlan] = useState('Premium')

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const s = Math.max(1, Math.round(max * (0.25 + 0.2 * (1 - Math.cos(time * 0.9)))))
      setStorage((p) => (p === s ? p : s))
      const step = Math.floor(time / PERIOD)
      const nextProvider = PROVIDERS[step % PROVIDERS.length]
      setProvider((p) => (p === nextProvider ? p : nextProvider))
      const nextPlan = PLANS[step % PLANS.length]
      setPlan((p) => (p === nextPlan ? p : nextPlan))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const stop = () => setAuto(false)

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDownCapture={stop} onKeyDownCapture={stop}>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8" style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
        <ConfigResourceForm
          {...props}
          provider={provider}
          onProviderChange={setProvider}
          storage={Math.min(storage, max)}
          onStorageChange={setStorage}
          plan={plan}
          onPlanChange={setPlan}
        />
      </div>
    </div>
  )
}
