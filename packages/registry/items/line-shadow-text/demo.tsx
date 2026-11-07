import { LineShadowText, type LineShadowTextProps } from './line-shadow-text'

const DISPLAY = "'Syne Variable', ui-sans-serif, system-ui, sans-serif"

const DETAILS = [
  { label: 'Distance', value: '21.1 km' },
  { label: 'Pace groups', value: '5:00 · 5:45 · 6:30 /km' },
  { label: 'Meet', value: 'Boathouse, Pier 4' },
]

export function Demo(props: LineShadowTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground">Harbour Run Club · Sunday 07:30</p>
        <LineShadowText
          {...props}
          as="h2"
          className="mt-4 text-[clamp(3.75rem,11vw,7rem)] leading-[0.95] font-extrabold tracking-[-0.03em] text-foreground"
          style={{ fontFamily: DISPLAY }}
        />
        <p className="mt-7 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          From the boathouse to the lighthouse and back. Three pace groups, coffee after, and nobody runs alone.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t pt-5">
          {DETAILS.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs text-muted-foreground">{detail.label}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground tabular-nums">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
