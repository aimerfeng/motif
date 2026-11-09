import { WaitlistCountdownSite, type WaitlistCountdownSiteProps } from './waitlist-countdown-site'

// 固定的「现在」：倒计时从这一刻按帧时间往下数，海报和录屏每次都一样。
const NOW = Date.parse('2026-10-24T14:12:08Z')

export function Demo(props: WaitlistCountdownSiteProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto" style={{ background: props.dark === false ? '#ffffff' : '#08090a' }}>
      <WaitlistCountdownSite {...props} now={NOW} />
    </div>
  )
}
