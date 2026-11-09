// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-gradient-text.tsx
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/animated-shiny-text.tsx
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/example/animated-gradient-text-demo.tsx
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/example/animated-shiny-text-demo.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  variant: 'gradient',
  text: 'Introducing Lumen 2.0',
  colorFrom: '#ffaa40',
  colorTo: '#9c40ff',
  speed: 1,
  shimmerWidth: 100,
  radius: 999,
  leadIcon: 'party',
  arrow: true,
}
/* @motif:end */

export type BadgeAnnouncementProps = Partial<typeof defaults> & {
  /** 优先于 text。 */
  children?: ReactNode
  /** 有 href 时渲染为链接，否则是按钮。 */
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  style?: CSSProperties
}

function LeadIcon({ icon }: { icon: string }) {
  if (icon === 'none') return null
  if (icon === 'sparkles') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-amber-300" fill="currentColor" aria-hidden>
        <path d="M10 2.5 11.6 8a3 3 0 0 0 2.1 2.1l5.5 1.6-5.5 1.6a3 3 0 0 0-2.1 2.1L10 20.9l-1.6-5.5a3 3 0 0 0-2.1-2.1L.8 11.7l5.5-1.6A3 3 0 0 0 8.4 8Z" transform="translate(1 0) scale(.92)" />
        <path d="M19 2l.7 2.3L22 5l-2.3.7L19 8l-.7-2.3L16 5l2.3-.7Z" />
        <path d="M19 16l.5 1.5L21 18l-1.5.5L19 20l-.5-1.5L17 18l1.5-.5Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path d="M3 21 8.2 6.8l9 9Z" fill="#f5b83d" />
      <path d="M3 21 5.6 13.9l4.5 4.5Z" fill="#e8702a" />
      <circle cx="15" cy="4" r="1.3" fill="#ff5c8a" />
      <circle cx="20" cy="9" r="1.3" fill="#4cc9f0" />
      <circle cx="19" cy="3" r="1" fill="#a3e635" />
      <path d="M11.5 8.5c1-2 3-3 5-2.5M15.5 12.5c2-1 3-3 2.5-5" fill="none" stroke="#9c40ff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * 首屏标题上方的公告胶囊。gradient：流动的渐变细边框 + 渐变文字；shiny：一道光扫过灰色文字。
 */
export function BadgeAnnouncement({ children, href, onClick, className, style, ...props }: BadgeAnnouncementProps) {
  const { variant, text, colorFrom, colorTo, speed, shimmerWidth, radius, leadIcon, arrow } = { ...defaults, ...props }
  const Tag = href ? 'a' : 'button'
  const label = children ?? text
  const focus = 'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  if (variant === 'shiny') {
    return (
      <Tag
        {...(href ? { href } : { type: 'button' as const })}
        onClick={onClick}
        className={cn(
          'group inline-flex cursor-pointer border border-foreground/5 bg-muted text-base text-white transition-colors ease-in hover:bg-accent',
          focus,
          className,
        )}
        style={{ borderRadius: radius, ...style }}
      >
        <span
          style={{ '--shiny-width': `${shimmerWidth}px` } as CSSProperties}
          className={cn(
            'mx-auto max-w-md text-muted-foreground/70',
            // Shine effect
            'ba-anim animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',
            // Shine gradient
            'bg-linear-to-r from-transparent via-foreground/80 via-50% to-transparent',
            'inline-flex items-center justify-center px-4 py-1 transition-colors ease-out hover:text-muted-foreground hover:duration-300',
          )}
        >
          <LeadIcon icon={leadIcon} />
          <span className={cn(leadIcon !== 'none' && 'ml-1.5')}>{label}</span>
          {arrow && (
            <svg viewBox="0 0 15 15" className="ml-1 size-3 shrink-0 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" fill="none" aria-hidden>
              <path d="M8.15 3.15a.5.5 0 0 1 .7 0l4 4a.5.5 0 0 1 0 .7l-4 4a.5.5 0 0 1-.7-.7L11.29 8H2.5a.5.5 0 0 1 0-1h8.8L8.14 3.85a.5.5 0 0 1 0-.7Z" fill="currentColor" />
            </svg>
          )}
        </span>
      </Tag>
    )
  }

  return (
    <Tag
      {...(href ? { href } : { type: 'button' as const })}
      onClick={onClick}
      className={cn(
        'group relative mx-auto inline-flex cursor-pointer items-center justify-center px-4 py-1.5 text-foreground shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]',
        focus,
        className,
      )}
      style={{ borderRadius: radius, ...style }}
    >
      <span
        className="ba-anim animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-linear-to-r from-(--color-from)/50 via-(--color-to)/50 to-(--color-from)/50 bg-size-[300%_100%] p-px"
        style={
          {
            '--color-from': colorFrom,
            '--color-to': colorTo,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'subtract',
          } as CSSProperties
        }
        aria-hidden
      />
      <LeadIcon icon={leadIcon} />
      {leadIcon !== 'none' && <span className="mx-2 h-4 w-px shrink-0 bg-neutral-500" aria-hidden />}
      <span
        style={
          {
            '--bg-size': `${speed * 300}%`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
          } as CSSProperties
        }
        className="ba-anim animate-gradient inline bg-linear-to-r from-(--color-from) via-(--color-to) to-(--color-from) bg-size-[var(--bg-size)_100%] bg-clip-text text-sm font-medium text-transparent"
      >
        {label}
      </span>
      {arrow && (
        <svg viewBox="0 0 24 24" className="ml-1 size-4 shrink-0 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </Tag>
  )
}
