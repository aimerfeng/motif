import { HackathonTerminalSite, type HackathonTerminalSiteProps } from './hackathon-terminal-site'

// 固定的「现在」：开场前 41 天，海报和录屏每次都一样。
const NOW = Date.parse('2027-01-30T10:47:52Z')

export function Demo(props: HackathonTerminalSiteProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto">
      <HackathonTerminalSite {...props} now={NOW} className="min-h-full" />
    </div>
  )
}
