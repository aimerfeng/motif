import { AuroraText, type AuroraTextProps } from './aurora-text'

const DISPLAY = "'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif"

const READINGS = [
  { label: 'Kp index', value: '6.3', note: 'Strong storm' },
  { label: 'Cloud cover', value: '12%', note: 'Clearing by 21:00' },
  { label: 'Peak', value: '22:40', note: 'Look north-east' },
]

export function Demo(props: AuroraTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-3xl">
        <p className="text-sm text-muted-foreground">Aurora forecast · Tromsø · updated 19:05</p>
        <h1 className="mt-4 text-5xl leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-6xl" style={{ fontFamily: DISPLAY }}>
          Tonight the <AuroraText {...props} /> reach as far south as Oslo.
        </h1>
        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t pt-6">
          {READINGS.map((reading) => (
            <div key={reading.label}>
              <dt className="text-xs text-muted-foreground">{reading.label}</dt>
              <dd className="mt-1 text-2xl font-medium text-foreground tabular-nums">{reading.value}</dd>
              <dd className="mt-0.5 text-xs text-muted-foreground">{reading.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
