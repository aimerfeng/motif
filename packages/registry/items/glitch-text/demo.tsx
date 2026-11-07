import { GlitchText, type GlitchTextProps } from './glitch-text'

const MONO = "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"

export function Demo(props: GlitchTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex max-w-xl flex-col items-center text-center">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: MONO }}>
          404 · page not found
        </p>
        <GlitchText {...props} as="h1" className="mt-5 text-7xl leading-none font-extrabold tracking-[-0.04em]" style={{ fontFamily: MONO }} />
        <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-balance text-muted-foreground">
          This page moved or never existed. Check the address, or pick up where you left off in the archive.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <a href="#home" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
            Back to home
          </a>
          <a href="#archive" className="rounded-md border px-4 py-2 text-sm text-foreground">
            Browse the archive
          </a>
        </div>
      </div>
    </div>
  )
}
