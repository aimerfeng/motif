import { CtaCircuitPulse, type CtaCircuitPulseProps } from './cta-circuit-pulse'

export function Demo(props: CtaCircuitPulseProps) {
  return (
    <div className={props.tone === 'light' ? 'h-full w-full overflow-y-auto bg-neutral-50' : 'h-full w-full overflow-y-auto bg-neutral-950'}>
      <CtaCircuitPulse
        {...props}
        description="Track page views and visitors in real time with a lightweight, privacy-first script made for developers. Under 2 KB, no cookies."
      />
    </div>
  )
}
