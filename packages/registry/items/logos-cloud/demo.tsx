import { LogosCloud, type LogosCloudProps } from './logos-cloud'

export function Demo(props: LogosCloudProps) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#08090c' }}>
      <LogosCloud {...props} className="flex min-h-full flex-col justify-center" />
    </div>
  )
}
