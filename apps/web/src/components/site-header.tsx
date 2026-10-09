import { REPO_URL } from '@motif/export'
import { useTranslations } from 'next-intl'
import { GitHubIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'
import { WalletButton } from './community/wallet-button'
import { LocaleSwitcher } from './locale-switcher'
import { MotifMark } from './motif-mark'
import { DesktopNav, MobileNav, type NavLink } from './site-nav'

export function SiteHeader() {
  const t = useTranslations('nav')
  const links: NavLink[] = [
    { href: '/market', label: t('market') },
    { href: '/community', label: t('community') },
    { href: '/studio', label: t('studio'), badge: t('soon') },
    { href: '/docs', label: t('docs') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-[1400px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" aria-label={t('home')} className="flex items-center gap-2.5 rounded-md">
          <MotifMark className="size-6" />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            Motif <span className="font-sans text-[15px] font-normal text-ink-muted">母题</span>
          </span>
        </Link>
        <DesktopNav links={links} />
        <div className="ml-auto flex items-center gap-2">
          <WalletButton />
          <LocaleSwitcher label={t('language')} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('github')}
            // 手机上头部放不下；页脚里也有仓库链接。
            className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink max-sm:hidden"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
          <MobileNav links={links} label={t('menu')} />
        </div>
      </div>
    </header>
  )
}
