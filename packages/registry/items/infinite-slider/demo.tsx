import type { ReactNode } from 'react'
import { InfiniteSlider, type InfiniteSliderProps } from './infinite-slider'

type Brand = { name: string; mark: ReactNode }

const mark = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
)

// 虚构的品牌，标识用内联 SVG 简单画出。
const ROW_A: Brand[] = [
  { name: 'Northwind', mark: mark(<><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></>) },
  { name: 'Lumen', mark: mark(<path d="M12 3 21 19H3z" />) },
  { name: 'Quanta', mark: mark(<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />) },
  { name: 'Halcyon', mark: mark(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>) },
]
const ROW_B: Brand[] = [
  { name: 'Meridian', mark: mark(<path d="M12 3l9 9-9 9-9-9z" />) },
  { name: 'Orbit', mark: mark(<><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" /><circle cx="12" cy="12" r="2" /></>) },
  { name: 'Kestrel', mark: mark(<path d="M4 18 12 5l8 13M8 18l4-7 4 7" />) },
  { name: 'Fathom', mark: mark(<path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" />) },
]

// 条目固定宽度 208px，加上 32px 间距，一份 4 个正好 960px：默认速度 80px/s 下 12 秒滚过整一圈，循环视频首尾无缝。
function Item({ brand }: { brand: Brand }) {
  return (
    <div className="flex h-14 w-52 shrink-0 items-center justify-center gap-3 rounded-2xl border bg-card/60 text-muted-foreground">
      {brand.mark}
      <span className="text-base font-medium tracking-tight text-foreground/80">{brand.name}</span>
    </div>
  )
}

export function Demo(props: InfiniteSliderProps) {
  const vertical = props.direction === 'vertical'
  const rows = [ROW_A, ROW_B, [...ROW_A].reverse()]

  if (vertical) {
    return (
      <div className="grid h-full w-full place-items-center bg-background p-8">
        <div className="grid grid-cols-3 gap-5">
          {rows.map((row, index) => (
            <InfiniteSlider key={index} {...props} reverse={index % 2 === 1 ? !props.reverse : props.reverse} className="h-[460px]">
              {row.map((brand) => (
                <Item key={brand.name} brand={brand} />
              ))}
            </InfiniteSlider>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full w-full place-items-center bg-background py-8">
      <div className="w-full min-w-0">
        <p className="mb-8 text-center text-sm text-muted-foreground">Trusted by product teams that ship every week</p>
        <div className="flex flex-col gap-4">
          <InfiniteSlider {...props}>
            {ROW_A.map((brand) => (
              <Item key={brand.name} brand={brand} />
            ))}
          </InfiniteSlider>
          <InfiniteSlider {...props} reverse={!props.reverse}>
            {ROW_B.map((brand) => (
              <Item key={brand.name} brand={brand} />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </div>
  )
}
