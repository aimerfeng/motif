import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DEFAULT_VALUES, FeaturesApiPlayground, type EndpointId, type FeaturesApiPlaygroundProps, type Language, type RequestValues } from './features-api-playground'

// 自动播放：12 秒一轮，像一个开发者在试接口——改重量、点 Run、切语言、换接口、再点 Run，最后回到起点。
// 节奏全部来自 useFrameLoop 的 time（截图时只接管 rAF），不用 setTimeout；用户按下指针或键盘后交还控制。
const CYCLE = 12
const LANGS: Language[] = ['curl', 'javascript', 'python']
const RUNS = [1.9, 5.4, 8.4, 10.5]
const TYPING: [number, string][] = [
  [0, '2.4'],
  [0.8, ''],
  [1.0, '1'],
  [1.15, '12'],
  [1.3, '12.'],
  [1.45, '12.5'],
  [9.9, '2.4'],
]

type Frame = { endpoint: EndpointId; values: RequestValues; step: number; runKey: number; focus: string | null }

function scripted(time: number): Frame {
  const cycle = Math.floor(time / CYCLE)
  const t = time - cycle * CYCLE
  let weight = '2.4'
  for (const [at, value] of TYPING) if (t >= at) weight = value
  const endpoint: EndpointId = t < 4.4 || t >= 9.9 ? 'rates' : t < 7.4 ? 'track' : 'labels'
  const values: RequestValues = {
    rates: { ...DEFAULT_VALUES.rates, weight_kg: weight },
    track: { ...DEFAULT_VALUES.track, expand: t >= 4.9 && t < 9.9 },
    labels: { ...DEFAULT_VALUES.labels, format: t >= 7.9 && t < 9.9 ? 'zpl' : 'pdf' },
  }
  const step = t < 3.3 || t >= 9.9 ? 0 : t < 6.6 ? 1 : 2
  const runs = RUNS.filter((at) => t >= at).length
  const pressing = RUNS.some((at) => t >= at - 0.22 && t < at)
  const focus = pressing ? 'run' : t >= 0.7 && t < 1.7 ? 'weight_kg' : t >= 4.75 && t < 5.1 ? 'expand' : t >= 7.75 && t < 8.1 ? 'format' : null
  return { endpoint, values, step, runKey: cycle * RUNS.length + runs, focus }
}

const same = (a: Frame, b: Frame) => a.endpoint === b.endpoint && a.step === b.step && a.runKey === b.runKey && a.focus === b.focus && JSON.stringify(a.values) === JSON.stringify(b.values)

export function Demo(props: FeaturesApiPlaygroundProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [frame, setFrame] = useState<Frame>(() => scripted(0))
  const [endpoint, setEndpoint] = useState<EndpointId>('rates')
  const [values, setValues] = useState<RequestValues>(DEFAULT_VALUES)
  const [language, setLanguage] = useState<Language | null>(null)

  const base = Math.max(0, LANGS.indexOf((props.defaultLanguage ?? 'curl') as Language))

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const next = scripted(time)
      setFrame((prev) => (same(prev, next) ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3.8 },
  )

  // 接管时把自动播放停下的那一刻当作用户的起点。
  const takeOver = () => {
    if (!auto) return
    setAuto(false)
    setEndpoint(frame.endpoint)
    setValues(frame.values)
    setLanguage(LANGS[(base + frame.step) % LANGS.length])
  }

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
      <FeaturesApiPlayground
        {...props}
        className="flex min-h-full flex-col justify-center"
        endpoint={auto ? frame.endpoint : endpoint}
        values={auto ? frame.values : values}
        language={auto ? LANGS[(base + frame.step) % LANGS.length] : (language ?? undefined)}
        runKey={auto ? frame.runKey : undefined}
        focusField={auto ? frame.focus : null}
        onEndpointChange={setEndpoint}
        onValuesChange={setValues}
        onLanguageChange={setLanguage}
      />
    </div>
  )
}
