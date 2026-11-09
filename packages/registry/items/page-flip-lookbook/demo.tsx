import { PageFlipLookbook, type PageFlipLookbookProps } from './page-flip-lookbook'

export function Demo(props: PageFlipLookbookProps) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-background px-4 py-6 sm:px-10">
      <div className="flex w-full max-w-4xl flex-col gap-5">
        <div className="flex items-baseline justify-between gap-4 text-foreground">
          <p className="text-sm font-medium tracking-[0.2em] uppercase">Maison Ostra</p>
          <p className="text-xs text-muted-foreground">Autumn / Winter 27</p>
        </div>
        <PageFlipLookbook {...props} label="Maison Ostra Autumn Winter 27 lookbook" />
      </div>
    </div>
  )
}
