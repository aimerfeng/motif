import { FooterHatchedRails, type FooterHatchedRailsProps } from './footer-hatched-rails'

export function Demo(props: FooterHatchedRailsProps) {
  const dark = props.tone === 'dark'
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto" style={{ background: dark ? '#030712' : '#ffffff' }}>
      <section
        className="mx-auto w-full max-w-6xl px-6 pt-20 pb-8 xl:px-2"
        style={{ color: dark ? '#f9fafb' : '#111827', fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}
      >
        <p className="text-sm" style={{ color: dark ? '#9ca3af' : '#4b5563' }}>
          Changelog · v4.2
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Query latency down 38% across every region.</h1>
      </section>
      <div className="mt-auto w-full">
        <FooterHatchedRails {...props} />
      </div>
    </div>
  )
}
