import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'
import { MotifMark } from './motif-mark'

const REPO_URL = 'https://github.com/aimerfeng/motif'

export function SiteHeader() {
  const t = useTranslations('nav')
  const links = [
    { href: '/market', label: t('market') },
    { href: '/studio', label: t('studio') },
    { href: '/skills', label: t('skills') },
    { href: '/docs', label: t('docs') },
  ] as const

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" aria-label={t('home')} className="flex items-center gap-2.5 rounded-md">
          <MotifMark className="size-6" />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            Motif <span className="font-sans text-[15px] font-normal text-ink-muted">母题</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-[14px] text-ink-muted sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-1.5 transition-colors duration-150 hover:bg-white/5 hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher label={t('language')} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('github')}
            className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="size-[18px]" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
