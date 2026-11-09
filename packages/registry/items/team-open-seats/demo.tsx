import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TeamOpenSeats, type TeamOpenSeatsProps } from './team-open-seats'

type Beat = { seat: string | null; department: string }

/** 一轮 12 秒（与循环视频等长）：先看一个空位，再按部门筛选看另外两个，最后回到全员。 */
function scripted(time: number, filters: boolean): Beat {
  const t = time % 12
  const department = !filters ? 'all' : t >= 3.9 && t < 6.9 ? 'design' : t >= 6.9 && t < 10.6 ? 'eng' : 'all'
  let seat: string | null = null
  if (t >= 0.8 && t < 3.4) seat = 'backend'
  else if (t >= 4.4 && t < 6.5) seat = 'content'
  else if (t >= 7.5 && t < 10.1) seat = 'ios'
  return { seat, department }
}

export function Demo(props: TeamOpenSeatsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [beat, setBeat] = useState<Beat>({ seat: null, department: 'all' })
  const [manual, setManual] = useState(false)
  const filters = props.showDepartments ?? true

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, filters)
      setBeat((prev) => (prev.seat === next.seat && prev.department === next.department ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.4 },
  )

  // 用户真正动了指针、键盘或触屏，就交还控制，组件回到非受控状态。
  const takeOver = () => {
    if (!manual) setManual(true)
  }

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background" onPointerMove={takeOver} onPointerDown={takeOver} onKeyDown={takeOver}>
      <TeamOpenSeats {...props} className="min-h-full" activeSeat={manual ? undefined : beat.seat} department={manual ? undefined : beat.department} />
    </div>
  )
}
