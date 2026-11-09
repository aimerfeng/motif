// SPDX-License-Identifier: MIT
// Copyright (c) Mark Mead
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/marketing/footers/1.html
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  brand: 'Ledgerly',
  accent: '#0d9488',
  tone: 'light',
  variant: 'plain',
  columns: 5,
  showNewsletter: true,
  showSocial: true,
}
/* @motif:end */

export type FooterLinkColumnsProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

type Options = {
  brand: string
  accent: string
  variant: string
  columns: number
  showNewsletter: boolean
  showSocial: boolean
  tone: string
}

function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1, 7), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum > 0.56 ? '#0a0a0d' : '#ffffff'
}

function palette(tone: string, accent: string): CSSProperties {
  const dark = tone === 'dark'
  return {
    '--f-bg': dark ? '#0b0d10' : '#ffffff',
    '--f-fg': dark ? '#f3f4f6' : '#111827',
    '--f-tx': dark ? '#d1d5db' : '#374151',
    '--f-mu': dark ? '#9ca3af' : '#6b7280',
    '--f-ln': dark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    '--f-ac': accent,
    '--f-on': onColor(accent),
  } as CSSProperties
}

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Services', links: ['Bookkeeping', 'Payroll runs', 'Tax filing', 'Audit prep', 'Advisory calls'] },
  { title: 'Company', links: ['About', 'Meet the team', 'Careers'] },
  { title: 'Helpful Links', links: ['Contact', 'FAQs', 'Live chat'] },
  { title: 'Legal', links: ['Accessibility', 'Returns policy', 'Refund policy', 'Security'] },
  { title: 'Downloads', links: ['Tax calendar', 'Expense template'] },
]

/** Generic social glyphs; no real brand marks. */
const SOCIAL: { label: string; icon: ReactNode }[] = [
  {
    label: 'Newsletter archive',
    icon: <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2.2V18h16V7.2l-8 5.3-8-5.3ZM5.8 7 12 11.1 18.2 7H5.8Z" />,
  },
  {
    label: 'Community forum',
    icon: <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8.6L7 20.5V17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2v9h4v1.9L11 15h8V6H5Zm3 3h8v2H8V9Z" />,
  },
  {
    label: 'Video channel',
    icon: <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 0v12h14V6H5Zm5 2.5 5 3.5-5 3.5v-7Z" />,
  },
  {
    label: 'Code repository',
    icon: <path d="m8.3 7.3 1.4 1.4L6.4 12l3.3 3.3-1.4 1.4L3.6 12l4.7-4.7Zm7.4 0 4.7 4.7-4.7 4.7-1.4-1.4 3.3-3.3-3.3-3.3 1.4-1.4ZM13 5l1.9.6-3.9 13.4-1.9-.6L13 5Z" />,
  },
  {
    label: 'RSS feed',
    icon: <path d="M5 4a15 15 0 0 1 15 15h-2.5A12.5 12.5 0 0 0 5 6.5V4Zm0 5a10 10 0 0 1 10 10h-2.5A7.5 7.5 0 0 0 5 11.5V9Zm1.75 6.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Z" />,
  },
]

function Mark() {
  return (
    <svg className="h-8" viewBox="0 0 28 24" fill="none" aria-hidden="true">
      <path d="M2 20 9 6l5 9 3-5 9 10H2Z" fill="currentColor" />
      <circle cx="21" cy="5" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

const LINK = 'rounded-sm transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--f-ac)]'
const LEGAL = ['Terms & Conditions', 'Privacy Policy', 'Cookies']

export function FooterLinkColumns({ className, style, ...props }: FooterLinkColumnsProps) {
  const o = { ...defaults, ...props } as Options
  const emailId = useId()
  const columns = COLUMNS.slice(0, Math.max(2, Math.min(5, Math.round(o.columns))))

  return (
    <footer
      className={cn('relative bg-[var(--f-bg)] text-[var(--f-tx)]', className)}
      style={{ fontFamily: "'Geist Variable', ui-sans-serif, system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif", ...palette(o.tone, o.accent), ...style }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {o.variant === 'top' ? (
          <div className="absolute end-4 top-4 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
            <a
              className="inline-block rounded-full bg-[var(--f-ac)] p-2 text-[var(--f-on)] shadow-sm transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--f-ac)] sm:p-3 lg:p-4"
              href="#top"
            >
              <span className="sr-only">Back to top</span>
              <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        ) : null}

        {o.variant === 'cta' ? (
          <div className="mb-16 flex flex-col items-center gap-4 rounded-lg bg-[var(--f-ac)] p-6 text-center shadow-lg sm:flex-row sm:justify-between sm:text-left">
            <strong className="text-xl text-[var(--f-on)]">Close your books in a day, not a week.</strong>
            <a
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--f-on)] bg-[var(--f-on)] px-8 py-3 text-[var(--f-ac)] transition-colors hover:bg-transparent hover:text-[var(--f-on)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--f-on)]"
              href="#"
            >
              <span className="text-sm font-medium">Book a call</span>
              <svg aria-hidden="true" className="size-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        ) : null}

        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="flex shrink-0 items-center gap-2 text-[var(--f-ac)]">
            <Mark />
            <span className="text-lg font-semibold tracking-tight text-[var(--f-fg)]">{o.brand}</span>
          </div>

          <div className="mt-8 grid min-w-0 flex-1 grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16">
            {o.showNewsletter ? (
              <>
                <div className="col-span-2">
                  <h2 className="text-2xl font-bold text-[var(--f-fg)]">Get the monthly ledger</h2>
                  <p className="mt-4 text-[var(--f-mu)]">Deadlines, rule changes and one practical tip for small finance teams. Once a month.</p>
                </div>

                <div className="col-span-2 lg:col-span-3 lg:flex lg:items-end">
                  <form className="w-full" onSubmit={(event) => event.preventDefault()}>
                    <label htmlFor={emailId} className="sr-only">
                      Email
                    </label>
                    <div className="border border-[var(--f-ln)] p-2 focus-within:ring-3 focus-within:ring-[var(--f-ac)] sm:flex sm:items-center sm:gap-4">
                      <input
                        type="email"
                        id={emailId}
                        placeholder="you@company.com"
                        className="w-full min-w-0 border-none bg-transparent px-2 py-2 text-[var(--f-fg)] outline-none placeholder:text-[var(--f-mu)] sm:text-sm"
                      />
                      <button
                        type="submit"
                        className="mt-1 w-full bg-[var(--f-ac)] px-6 py-3 text-sm font-bold tracking-wide text-[var(--f-on)] uppercase transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--f-ac)] sm:mt-0 sm:w-auto sm:shrink-0"
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : null}

            {columns.map((column) => (
              <div key={column.title} className="col-span-2 sm:col-span-1">
                <p className="font-medium text-[var(--f-fg)]">{column.title}</p>
                <ul className="mt-6 space-y-4 text-sm">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className={cn('text-[var(--f-tx)]', LINK)}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {o.showSocial ? (
              <ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end">
                {SOCIAL.map((item) => (
                  <li key={item.label}>
                    <a href="#" className={cn('block text-[var(--f-tx)]', LINK)}>
                      <span className="sr-only">{item.label}</span>
                      <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        {item.icon}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--f-ln)] pt-8">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-[var(--f-mu)]">&copy; 2026. {o.brand}. All rights reserved.</p>
            <ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
              {LEGAL.map((link) => (
                <li key={link}>
                  <a href="#" className={cn('text-[var(--f-mu)]', LINK)}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
