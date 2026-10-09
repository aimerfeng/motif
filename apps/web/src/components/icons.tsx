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

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
