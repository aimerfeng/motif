import { MorphingText, type MorphingTextProps } from './morphing-text'

const DISPLAY = "'Archivo Black', ui-sans-serif, system-ui, sans-serif"

export function Demo(props: MorphingTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Halden Quartet · Spring tour 2027</p>
        {/* Archivo Black 只有一个字重，用 font-normal 避免浏览器合成假粗体。 */}
        <MorphingText {...props} className="mt-6 text-[clamp(3.5rem,12vw,8rem)] font-normal tracking-[-0.02em]" style={{ fontFamily: DISPLAY }} />
        <p className="mt-7 text-sm text-muted-foreground tabular-nums">14 nights · 5 cities · 3 April – 18 May</p>
      </div>
    </div>
  )
}
