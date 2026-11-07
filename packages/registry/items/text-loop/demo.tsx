import { TextLoop, type TextLoopProps } from './text-loop'

const DISPLAY = "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif"

export function Demo(props: TextLoopProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8" style={{ fontFamily: DISPLAY }}>
      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground">Slotwise · appointments for small studios</p>
        {/* 轮换的词单独占一行并左对齐：换词时宽度变化不会推动其他文字。 */}
        <h1 className="mt-4 text-5xl leading-[1.08] font-semibold tracking-[-0.035em] text-foreground sm:text-6xl md:text-7xl">
          Online booking for
          <br />
          <TextLoop {...props} className="text-[#f2b880]" />
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Clients pick a slot, pay a deposit and get a reminder the day before. You get your evenings back.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <button type="button" className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background">
            Start a free month
          </button>
          <span className="text-sm text-muted-foreground">No card needed · 2 minutes to set up</span>
        </div>
      </div>
    </div>
  )
}
