import { LogosCaseStudyStrip, type LogosCaseStudyStripProps } from './logos-case-study-strip'

export function Demo(props: LogosCaseStudyStripProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f5f4ef' : '#0a0b0d' }}>
      <LogosCaseStudyStrip {...props} className="flex min-h-full flex-col justify-center" />
    </div>
  )
}
