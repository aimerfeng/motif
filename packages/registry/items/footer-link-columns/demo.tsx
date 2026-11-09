import { FooterLinkColumns, type FooterLinkColumnsProps } from './footer-link-columns'

export function Demo(props: FooterLinkColumnsProps) {
  const dark = props.tone === 'dark'
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto" style={{ background: dark ? '#0b0d10' : '#ffffff' }}>
      <section
        id="top"
        className="mx-auto w-full max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8"
        style={{ color: dark ? '#f3f4f6' : '#111827', fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}
      >
        <p className="text-sm" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
          Trusted by 1,400 small businesses
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Your books, reconciled every Friday.</h1>
      </section>
      <div className="mt-auto w-full border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }}>
        <FooterLinkColumns {...props} />
      </div>
    </div>
  )
}
