import { SparklesText, type SparklesTextProps } from './sparkles-text'

const DISPLAY = "'Fraunces Variable', ui-serif, Georgia, serif"

export function Demo(props: SparklesTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <p className="text-xs text-muted-foreground">Inbox · Friday, 17:42</p>
        <h2 className="mt-5 text-7xl leading-none tracking-[-0.02em] text-foreground" style={{ fontFamily: DISPLAY }}>
          <SparklesText {...props} className="font-semibold italic" />
        </h2>
        <p className="mt-8 text-[15px] leading-relaxed text-balance text-muted-foreground">
          You cleared 48 threads today. Nothing else needs you before Monday’s 9:30 stand-up.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <button type="button" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
            Plan Monday
          </button>
          <button type="button" className="rounded-full border px-4 py-2 text-sm text-foreground">
            Review 3 snoozed
          </button>
        </div>
      </div>
    </div>
  )
}
