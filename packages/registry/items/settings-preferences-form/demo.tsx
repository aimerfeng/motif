import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { SettingsPreferencesForm, initialPrefsState, initialPrefsValues, type PrefsState, type PrefsValues, type SettingsPreferencesFormProps } from './settings-preferences-form'

const v0 = initialPrefsValues
const withSms: PrefsValues = { ...v0, channels: { ...v0.channels, sms: true } }
const badSlug: PrefsValues = { ...withSms, slug: 'alex johnson' }
const fixed: PrefsValues = {
  ...withSms,
  slug: 'alex-johnson-dev',
  matrix: { ...v0.matrix, mentions: { ...v0.matrix.mentions, sms: true } },
}

const STEPS: { at: number; state: PrefsState }[] = [
  { at: 0, state: initialPrefsState },
  { at: 1, state: { values: withSms, saved: v0 } },
  { at: 2.2, state: { values: badSlug, saved: v0 } },
  { at: 3.8, state: { values: fixed, saved: v0 } },
  { at: 5.8, state: { values: fixed, saved: fixed } },
]

/** 8 秒一轮：打开短信 -> 输入非法 slug（报错）-> 修正并勾选矩阵 -> 保存，保存条收起。 */
function scripted(time: number) {
  const t = time % 8
  let i = 0
  for (let k = 0; k < STEPS.length; k++) if (t >= STEPS[k]!.at) i = k
  return i
}

export function Demo(props: SettingsPreferencesFormProps) {
  const host = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [manual, setManual] = useState<PrefsState | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setStep((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div>
          <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Settings · Preferences</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Your preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">Changes apply to your Tidal workspace on every device.</p>
        </div>
        <SettingsPreferencesForm {...props} state={manual ?? STEPS[step]!.state} onStateChange={setManual} />
      </div>
    </div>
  )
}
