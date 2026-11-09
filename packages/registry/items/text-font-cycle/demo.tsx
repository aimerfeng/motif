import { defaults, PixelHeading, type PixelHeadingProps } from './text-font-cycle'

const BODY = "'Geist Variable', ui-sans-serif, system-ui, sans-serif"

export function Demo(props: PixelHeadingProps) {
  const { text, size } = { ...defaults, ...props }
  // 按字符数把字号收进容器宽度：360px 宽也不溢出。
  const chars = Math.max(Array.from(text).length, 4)
  const fontSize = `min(${size}px, ${(100 / (chars * 0.66 + 0.6)).toFixed(2)}cqw)`

  return (
    <div className="flex h-full w-full items-center justify-center bg-background text-foreground" style={{ fontFamily: BODY }}>
      <div className="@container flex w-full max-w-[960px] flex-col items-center gap-6 px-4 text-center">
        <p className="text-[12px] tracking-[0.2em] text-muted-foreground uppercase">Kiln Type Foundry — Specimen 04</p>
        <PixelHeading {...props} as="h1" className="whitespace-nowrap text-foreground" style={{ fontSize }} />
        <p className="max-w-[420px] text-[14px] leading-relaxed text-muted-foreground">
          Five families, one headline. Hover or focus the heading to shuffle the cut on every letter.
        </p>
      </div>
    </div>
  )
}
