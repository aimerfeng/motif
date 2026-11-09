import { useReducedMotion } from 'motion/react'
import { useCallback, useId, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@motif/runtime'
import { PROJECTS } from './data'
import { Atlas, Footer, Header, IndexTable, Intro, Offices, PlanPanel, Practice, rowsFor, Spread, type Filter, type ProjectId } from './sections'
import { domainOf, themeStyle } from './theme'

/* @motif:defaults */
export const defaults = {
  studioName: 'Arden Vos',
  statement: 'is an architecture practice in Rotterdam and Porto. We design libraries, schools and housing, and the public ground between them.',
  accent: '#c8432a',
  groundTone: 'paper',
  planLineWeight: 1.1,
  fontPairing: 'swiss',
  showCoordinates: true,
  dark: false,
}
/* @motif:end */

export type ArchitecturePracticeIndexProps = Partial<typeof defaults> & {
  /** 没有悬停的行时，平面面板显示哪个项目（演示里用它自动轮播）；不在当前筛选结果里时不生效。 */
  previewId?: string | null
  /** 筛选变化时通知外部（演示据此只轮播筛选后还看得见的行）。 */
  onFilterChange?: (filter: Filter) => void
  className?: string
  style?: CSSProperties
}

// 宽屏时平面面板吸顶：图框高度不超过「视口 − 吸顶位置 − 面板标题和说明」，整块面板始终在一屏之内；
// 手机上叠在索引上方，限制高度；从 672px 起就分两栏，悬停的行旁边总能看到面板。cqw 在面板自己的容器里解析。
const PANEL = '[--plan-h:min(72cqw,340px)] @2xl:[--plan-h:min(80cqw,max(220px,calc(100dvh_-_400px)))]'

/**
 * 建筑事务所官网：首屏介绍 + 项目索引表（悬停的行在右侧逐笔画出平面图）、选中项目的剖面与资料、平面图集、
 * 事务所与奖项、办公室、页脚。布局全部用容器查询，放进任何宽度的容器都能正确响应。
 */
export function ArchitecturePracticeIndex({ className, style, previewId, onFilterChange, ...props }: ArchitecturePracticeIndexProps) {
  const options = { ...defaults, ...props }
  const name = options.studioName.trim() || defaults.studioName
  const statement = options.statement.trim() || defaults.statement
  const root = useRef<HTMLDivElement>(null)
  const uid = `apx${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const reduced = useReducedMotion() ?? false
  const [filter, setFilter] = useState<Filter>('all')
  const [hovered, setHovered] = useState<ProjectId | null>(null)
  const [selected, setSelected] = useState<ProjectId>(PROJECTS[0]!.id)

  const rows = rowsFor(filter)
  // 面板只预览当前列表里看得见的项目：筛选掉了就退回到第一行
  const wanted = hovered ?? previewId ?? selected
  const shown = rows.find((p) => p.id === wanted) ?? rows[0] ?? PROJECTS[0]!
  const current = PROJECTS.find((p) => p.id === selected) ?? PROJECTS[0]!
  const weight = Math.min(2, Math.max(0.6, options.planLineWeight))
  const domain = domainOf(name)

  const changeFilter = (next: Filter) => {
    setFilter(next)
    setHovered(null)
    onFilterChange?.(next)
  }

  const go = useCallback(
    (target: string) => {
      const element = target === 'top' ? root.current : document.getElementById(`${uid}-${target}`)
      element?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [uid, reduced],
  )
  const open = (id: ProjectId) => {
    setSelected(id)
    setHovered(null)
    go('project')
  }

  return (
    <div ref={root} className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header name={name} uid={uid} onNav={go} />
      <main className="mx-auto max-w-[1360px] px-5 @3xl:px-8 @6xl:px-10">
        <div className="grid @2xl:grid-cols-12 @2xl:gap-x-8 @4xl:gap-x-10 @6xl:gap-x-14">
          <Intro name={name} statement={statement} className="@2xl:col-span-7 @2xl:row-start-1" />
          <div className={cn('mb-12 @2xl:col-span-5 @2xl:col-start-8 @2xl:row-span-2 @2xl:row-start-1 @2xl:mb-0 @2xl:mt-14 @2xl:self-start @2xl:[@media(min-height:600px)]:sticky @2xl:[@media(min-height:600px)]:top-[88px]', PANEL)}>
            <PlanPanel project={shown} weight={weight} coords={options.showCoordinates} onOpen={() => open(shown.id)} />
          </div>
          <IndexTable
            id={`${uid}-index`}
            className="@2xl:col-span-7 @2xl:row-start-2"
            rows={rows}
            filter={filter}
            onFilter={changeFilter}
            shownId={shown.id}
            selectedId={selected}
            onHover={setHovered}
            onSelect={open}
            coords={options.showCoordinates}
          />
        </div>
        <Spread id={`${uid}-project`} project={current} weight={weight} coords={options.showCoordinates} onBack={() => go('index')} />
        <Atlas id={`${uid}-plans`} weight={weight} selectedId={selected} onSelect={open} />
        <Practice id={`${uid}-practice`} awardsId={`${uid}-awards`} />
        <Offices id={`${uid}-offices`} careersId={`${uid}-careers`} domain={domain} coords={options.showCoordinates} />
      </main>
      <Footer id={`${uid}-contact`} uid={uid} name={name} domain={domain} onNav={go} />
    </div>
  )
}
