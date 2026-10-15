import type { SVGProps } from 'react'

/** 站点用到的几个线性图标：16 网格、1.5 线宽、跟随文字颜色。 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  )
}

export function CopyIcon({ state = 'idle', ...props }: IconProps & { state?: 'idle' | 'copied' | 'failed' }) {
  return (
    <Icon {...props}>
      {state === 'copied' ? (
        <path d="m3.5 8.5 3 3 6-7" />
      ) : state === 'failed' ? (
        <path d="M8 4.5v4.25M8 11.25v.25M8 1.75 14.5 13.5h-13z" />
      ) : (
        <>
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
        </>
      )}
    </Icon>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12.5 5V3.5a1 1 0 0 0-1-1h-8a1.5 1.5 0 0 0 0 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-10A1.5 1.5 0 0 1 2 12V4M11 9.25h.5" />
    </Icon>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2.5v8m0 0 3.25-3.25M8 10.5 4.75 7.25M3 13.5h10" />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7.25" cy="7.25" r="4.5" />
      <path d="m10.75 10.75 2.75 2.75" />
    </Icon>
  )
}

export function ArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8h10m0 0L9 4m4 4-4 4" />
    </Icon>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 8a5 5 0 1 1-1.46-3.54M13 2.75v2.5h-2.5" />
    </Icon>
  )
}

export function MenuIcon({ open, ...props }: IconProps & { open: boolean }) {
  return <Icon {...props}>{open ? <path d="m4 4 8 8m0-8-8 8" /> : <path d="M2.5 5h11M2.5 11h11" />}</Icon>
}

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 10.5v-8m0 0L4.75 5.75M8 2.5l3.25 3.25M3 13.5h10" />
    </Icon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3.5 8.5 3 3 6-7" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3v10M3 8h10" />
    </Icon>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </Icon>
  )
}

/** 审核：盾牌里一个勾。 */
export function ReviewIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 1.75 13 3.5v4c0 3-2.1 5.4-5 6.75C5.1 12.9 3 10.5 3 7.5v-4z" />
      <path d="m5.75 7.75 1.6 1.6 3-3.35" />
    </Icon>
  )
}

/** 治理：投票箱。 */
export function BallotIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 8.5h11v5h-11zM5 8.5V3.5h6v5M6.75 6l1 1 1.75-2" />
    </Icon>
  )
}

export function CoinsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="6" cy="5" rx="3.5" ry="1.75" />
      <path d="M2.5 5v3c0 1 1.55 1.75 3.5 1.75S9.5 9 9.5 8V5M6.5 11.25c.5 1 2 1.75 3.75 1.75 1.95 0 3.25-.75 3.25-1.75v-3c0-.9-1.1-1.6-2.7-1.72" />
    </Icon>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 2.5 7.6 5.9 11 7 7.6 8.1 6.5 11.5 5.4 8.1 2 7l3.4-1.1zM12 10.5l.55 1.45L14 12.5l-1.45.55L12 14.5l-.55-1.45L10 12.5l1.45-.55z" />
    </Icon>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.75 13.5c.4-2.3 2.1-3.75 4.25-3.75s3.85 1.45 4.25 3.75M10.5 3.25a2.5 2.5 0 0 1 0 4.5M12 9.95c1.25.55 2 1.7 2.25 3.55" />
    </Icon>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 4.75V8l2.25 1.5" />
    </Icon>
  )
}

/** 空状态：一个空托盘。 */
export function InboxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 9.5 3.75 3.5h8.5L14 9.5v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2 9.5h3.25l1 1.5h3.5l1-1.5H14" />
    </Icon>
  )
}

export function CodeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5.5 4.5-3.5 3.5 3.5 3.5M10.5 4.5 14 8l-3.5 3.5" />
    </Icon>
  )
}

export function TerminalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" />
      <path d="m4.5 6.5 2 1.5-2 1.5M8 10h3" />
    </Icon>
  )
}

/** 给 agent 接入：插头。 */
export function PlugIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 1.75v3M10.5 1.75v3M3.75 4.75h8.5v2.5a4.25 4.25 0 0 1-8.5 0zM8 11.5v2.75" />
    </Icon>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 4.5h6M11.5 4.5h2M2.5 11.5h2M7.5 11.5h6" />
      <circle cx="10" cy="4.5" r="1.5" />
      <circle cx="6" cy="11.5" r="1.5" />
    </Icon>
  )
}

export function LayersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2 14 5.25 8 8.5 2 5.25zM2 8.25l6 3.25 6-3.25M2 11.25l6 3.25 6-3.25" />
    </Icon>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 3.25c1.75-.75 3.75-.75 5.5.5 1.75-1.25 3.75-1.25 5.5-.5v9.5c-1.75-.75-3.75-.75-5.5.5-1.75-1.25-3.75-1.25-5.5-.5zM8 3.75v9.5" />
    </Icon>
  )
}

/** 提示：圆圈里一个 i。 */
export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4M8 4.9v.1" />
    </Icon>
  )
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

/** 收藏：心形，filled 时填满。 */
export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M8 13.5S2.25 10.1 2.25 6.1A3.1 3.1 0 0 1 8 4.4a3.1 3.1 0 0 1 5.75 1.7C13.75 10.1 8 13.5 8 13.5Z" />
    </Icon>
  )
}

/** 图片：附参考图。 */
export function ImageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="2.75" width="12" height="10.5" rx="1.75" />
      <circle cx="5.75" cy="6.25" r="1.1" />
      <path d="m2.5 11.5 3.25-3.25 2.5 2.5 2-2 3.25 3.25" />
    </Icon>
  )
}

/** 太阳：切到浅色。 */
export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.6 3.6l1.05 1.05M11.35 11.35l1.05 1.05M3.6 12.4l1.05-1.05M11.35 4.65l1.05-1.05" />
    </Icon>
  )
}

/** 月亮：切到暗色。 */
export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.25 9.6A5.5 5.5 0 0 1 6.4 2.75a5.5 5.5 0 1 0 6.85 6.85Z" />
    </Icon>
  )
}
