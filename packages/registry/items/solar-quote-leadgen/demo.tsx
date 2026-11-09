import { SolarQuoteLeadgen, type SolarQuoteLeadgenProps } from './solar-quote-leadgen'

export function Demo(props: SolarQuoteLeadgenProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto" style={{ background: props.dark ? '#08090a' : '#ffffff' }}>
      <SolarQuoteLeadgen {...props} />
    </div>
  )
}
