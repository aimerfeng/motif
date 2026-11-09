import { DesignConferenceSite, type DesignConferenceSiteProps } from './design-conference-site'

// 固定的「现在」：开场前 45 天，海报和录屏每次都一样。
const NOW = Date.parse('2027-05-02T14:12:08Z')

export function Demo(props: DesignConferenceSiteProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto" style={{ background: props.dark ? '#08090a' : '#ffffff' }}>
      <DesignConferenceSite {...props} now={NOW} />
    </div>
  )
}
