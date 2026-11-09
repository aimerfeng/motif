import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ChangelogWeeklyDigest, type ChangelogWeeklyDigestProps } from './changelog-weekly-digest'

/** 演示：过一会儿自动展开本周的小修复，让海报和循环视频里看得到折叠包；用户点过之后交还控制。 */
export function Demo(props: ChangelogWeeklyDigestProps) {
  const host = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const opened = useRef(false)
  const touched = useRef(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (touched.current || opened.current || time < 2.2) return
      opened.current = true
      setExpanded((s) => ({ ...s, w45: true }))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <ChangelogWeeklyDigest
        {...props}
        expanded={expanded}
        onExpandedChange={(week, open) => {
          touched.current = true
          setExpanded((s) => ({ ...s, [week]: open }))
        }}
      />
    </div>
  )
}
