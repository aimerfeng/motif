// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/feature-sections/feature-section-12.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, type CSSProperties, type ReactNode, type SVGProps } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Meridian',
  accent: '#3b82f6',
  tone: 'light',
  hatchAngle: 45,
  hatchDensity: 6,
  columns: 4,
  showSocial: true,
}
/* @motif:end */

export type FooterHatchedRailsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Options = {
  brand: string
  accent: string
  hatchAngle: number
  hatchDensity: number
  columns: number
  showSocial: boolean
  tone: string
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  // 对应上游 gray-* 的 light / dark: 两档写死，保证任何主色下文字都可读（主色只用于标志图形）
  return {
    '--f-bg': dark ? '#030712' : '#ffffff',
    '--f-logo': dark ? '#f9fafb' : '#030712',
    '--f-title': dark ? '#f9fafb' : '#111827',
    '--f-tx': dark ? '#9ca3af' : '#374151',
    '--f-link': dark ? '#9ca3af' : '#4b5563',
    '--f-link-hover': dark ? '#e5e7eb' : '#111827',
    '--f-line': dark ? '#1f2937' : '#d1d5db',
    '--f-hover-bg': dark ? '#111827' : '#e5e7eb',
    '--f-ac': accent,
  } as CSSProperties
}

/** Invented mark (replaces the upstream Solar logo) plus the brand wordmark. */
function BrandLogo({ brand, ...props }: SVGProps<SVGSVGElement> & { brand: string }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 42 42" fill="none" aria-hidden="true" {...props}>
        <path
          d="M21 3v12M21 27v12M3 21h12M27 21h12M8.3 8.3l8.5 8.5M25.2 25.2l8.5 8.5M33.7 8.3l-8.5 8.5M16.8 25.2l-8.5 8.5"
          stroke="var(--f-ac)"
          strokeWidth="3"
          strokeLinecap="square"
        />
        <rect x="17" y="17" width="8" height="8" fill="var(--f-ac)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-[var(--f-logo)]">{brand}</span>
    </span>
  )
}

/** Generic social glyphs; no real brand marks. */
const SOCIAL: { label: string; icon: ReactNode }[] = [
  { label: 'Microblog', icon: <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8.6L7 20.5V17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm4 5v2h8V9H8Z" /> },
  { label: 'Video channel', icon: <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm7 2.5v7l5-3.5-5-3.5Z" /> },
  {
    label: 'Code repository',
    icon: <path d="m8.3 7.3 1.4 1.4L6.4 12l3.3 3.3-1.4 1.4L3.6 12l4.7-4.7Zm7.4 0 4.7 4.7-4.7 4.7-1.4-1.4 3.3-3.3-3.3-3.3 1.4-1.4ZM13 5l1.9.6-3.9 13.4-1.9-.6L13 5Z" />,
  },
  { label: 'Community chat', icon: <path d="M7 3h3v7H3V7a4 4 0 0 1 4-4Zm7 0h3a4 4 0 0 1 4 4v3h-7V3ZM3 14h7v7H7a4 4 0 0 1-4-4v-3Zm11 0h7v3a4 4 0 0 1-4 4h-3v-7Z" /> },
]

const SECTIONS: { title: string; items: { label: string; external?: boolean }[] }[] = [
  {
    title: 'Solutions',
    items: [
      { label: 'Performance Monitoring' },
      { label: 'Resource Management' },
      { label: 'Data Analytics' },
      { label: 'System Integration' },
      { label: 'Documentation' },
      { label: 'Database Guide' },
      { label: 'Infrastructure' },
    ],
  },
  {
    title: 'Company',
    items: [{ label: 'About us' }, { label: 'Blog' }, { label: 'Careers' }, { label: 'Success Stories' }, { label: 'Security' }],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Developer Network' },
      { label: 'Community', external: true },
      { label: 'Contact' },
      { label: 'Support' },
      { label: 'Privacy Policy' },
      { label: 'Terms of Service' },
      { label: 'Report an Issue' },
    ],
  },
  {
    title: 'Partners',
    items: [
      { label: 'Cloud Partners', external: true },
      { label: 'System Status', external: true },
      { label: 'Technology Partners', external: true },
      { label: 'Integration Guide' },
    ],
  },
]

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--f-ac)]'
const CURRENT_YEAR = new Date().getFullYear()
const RAIL_MASK = 'linear-gradient(transparent, white 5rem)'

function Rail({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={cn('absolute inset-y-0 my-[-5rem] w-px', side === 'right' && 'right-0')} style={{ maskImage: RAIL_MASK, WebkitMaskImage: RAIL_MASK }}>
      <svg className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="0" x2="0" y2="100%" stroke="var(--f-line)" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}

export function FooterHatchedRails({ className, style, ...props }: FooterHatchedRailsProps) {
  const o = { ...defaults, ...props } as Options
  const patternId = `diagonal-footer-pattern-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const gap = Math.max(4, Math.min(16, o.hatchDensity))
  const sections = SECTIONS.slice(0, Math.max(1, Math.min(4, Math.round(o.columns))))

  return (
    <div
      className={cn('bg-[var(--f-bg)]', className)}
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", ...palette(o.tone, o.accent), ...style }}
    >
      <div className="px-4 py-20 xl:px-0">
        <footer className="relative mx-auto flex max-w-6xl flex-wrap pt-4">
          {/* Vertical Lines */}
          <div className="pointer-events-none inset-0">
            <Rail side="left" />
            <Rail side="right" />
          </div>
          <svg className="mb-10 h-20 w-full border-y border-dashed border-[var(--f-line)]" aria-hidden="true">
            <defs>
              <pattern id={patternId} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform={`rotate(${o.hatchAngle})`}>
                <line x1="0.5" y1="0" x2="0.5" y2={gap} stroke="var(--f-line)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect stroke="none" width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
          <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
            <a href="#" className={cn('ml-2 flex items-center self-start rounded-sm select-none', FOCUS)}>
              <BrandLogo brand={o.brand} className="size-8" />
              <span className="sr-only"> (go home)</span>
            </a>

            <div>
              {o.showSocial ? (
                <div className="mt-4 flex items-center">
                  {SOCIAL.map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      aria-label={item.label}
                      className={cn('rounded-sm p-2 text-[var(--f-tx)] transition-colors duration-200 hover:bg-[var(--f-hover-bg)]', FOCUS)}
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        {item.icon}
                      </svg>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="ml-2 hidden text-sm text-[var(--f-tx)] lg:mt-2 lg:block">
                &copy; {CURRENT_YEAR} {o.brand}, Inc.
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {sections.map((section) => (
            <div key={section.title} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
              <h3 className="mb-4 font-medium text-[var(--f-title)] sm:text-sm">{section.title}</h3>
              <ul className="space-y-4">
                {section.items.map((item) => (
                  <li key={item.label} className="text-sm">
                    <a href="#" className={cn('rounded-sm text-[var(--f-link)] transition-colors duration-200 hover:text-[var(--f-link-hover)]', FOCUS)}>
                      {item.label}
                      {item.external ? <span className="sr-only"> (external)</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </footer>
      </div>
    </div>
  )
}
