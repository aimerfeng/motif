import { CtaRipplePanel, type CtaRipplePanelProps } from './cta-ripple-panel'

export function Demo(props: CtaRipplePanelProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <div className="my-auto w-full">
        <CtaRipplePanel {...props} />
      </div>
    </div>
  )
}
