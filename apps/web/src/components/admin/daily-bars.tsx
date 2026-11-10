/**
 * 按天的小柱状图：一块里一个指标（标题、这段时间的合计、每天一根柱子）。
 *
 * - 纯 div，没有脚本也没有依赖：柱子的高度是相对这一块里最大值的百分比。三个指标量级差得远，各画各的，不共用一条纵轴。
 * - 只有一个系列，不需要图例，标题就是它的名字；柱子用墨色，状态色（成功 / 警告）留给状态用。
 * - 鼠标移到某一天（整列都算，比柱子本身好瞄准），底下的起止日期换成那一天的日期和数值。
 * - 读屏软件读到的是每天一行的文字；精确数字页面上另有一张表。
 */
export function DailyBars({ label, total, days, values, formatValue, formatDay }: { label: string; total: string; days: string[]; values: number[]; formatValue: (value: number) => string; formatDay: (day: string) => string }) {
  const max = Math.max(1, ...values)
  const firstDay = days[0]
  const lastDay = days.at(-1)
  return (
    <figure className="relative min-w-0 bg-canvas px-5 py-4">
      <figcaption className="text-[12px] text-ink-faint">{label}</figcaption>
      <p className="mt-1 truncate font-display text-[19px] font-semibold tracking-[-0.02em] tabular-nums sm:text-[22px]">{total}</p>
      <ol className="mt-4 flex h-16 items-stretch gap-[2px] border-b border-line">
        {days.map((day, index) => {
          const value = values[index] ?? 0
          return (
            <li key={day} className="group flex min-w-0 flex-1 items-end justify-center">
              {/* 0 就不画；有值的至少 4% 高，不然一两个人的那天看不见。负数（取消收藏多于收藏）按 0 画，数字照实显示。 */}
              {value > 0 && <span aria-hidden className="w-full max-w-[24px] rounded-t-[4px] bg-ink-muted transition-colors duration-(--duration-fast) group-hover:bg-ink" style={{ height: `${Math.max(4, (value / max) * 100)}%` }} />}
              <span aria-hidden className="pointer-events-none absolute inset-x-5 bottom-4 hidden justify-between bg-canvas font-mono text-[11px] leading-4 text-ink tabular-nums group-hover:flex">
                <span>{formatDay(day)}</span>
                <span>{formatValue(value)}</span>
              </span>
              <span className="sr-only">
                {formatDay(day)}: {formatValue(value)}
              </span>
            </li>
          )
        })}
      </ol>
      <p aria-hidden className="mt-1.5 flex justify-between font-mono text-[11px] leading-4 text-ink-faint">
        <span>{firstDay ? formatDay(firstDay) : ''}</span>
        <span>{lastDay ? formatDay(lastDay) : ''}</span>
      </p>
    </figure>
  )
}
