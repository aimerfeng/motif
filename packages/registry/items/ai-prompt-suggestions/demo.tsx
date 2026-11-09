import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { PromptSuggestions, type PromptSuggestionsProps } from './ai-prompt-suggestions'

type Scene = { value: string; category: string; active: number }

const QUERY = 'research'

/** 12 秒一轮：点开 Design → 方向键下移两次 → 回车选中 → 清空 → 输入 research 筛选 → 选中 → 回到空闲。 */
function scripted(time: number): Scene {
  const t = time % 12
  if (t < 1.4) return { value: '', category: '', active: -1 }
  if (t < 2.4) return { value: '', category: 'Design', active: -1 }
  if (t < 3.0) return { value: '', category: 'Design', active: 0 }
  if (t < 3.9) return { value: '', category: 'Design', active: 1 }
  if (t < 5.4) return { value: 'Design a hero section', category: 'Design', active: -1 }
  if (t < 6.0) return { value: '', category: '', active: -1 }
  if (t < 7.6) {
    const n = Math.max(0, Math.min(QUERY.length, Math.floor((t - 6.0) / 0.11) + 1))
    return { value: QUERY.slice(0, n), category: '', active: -1 }
  }
  if (t < 8.4) return { value: QUERY, category: '', active: 0 }
  if (t < 9.2) return { value: QUERY, category: '', active: 1 }
  if (t < 11.2) return { value: 'Research the best running shoes', category: '', active: -1 }
  return { value: '', category: '', active: -1 }
}

const same = (a: Scene, b: Scene) => a.value === b.value && a.category === b.category && a.active === b.active

export function Demo(props: PromptSuggestionsProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Scene>(() => scripted(0))
  // 用户一操作就接管，自动播放不再回来。
  const [manual, setManual] = useState<Scene | null>(null)
  const scene = manual ?? auto

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((current) => (same(current, next) ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3.3 },
  )

  const take = (next: Partial<Scene>) => setManual((current) => ({ ...(current ?? scene), ...next }))

  return (
    <div ref={host} className="h-full w-full overflow-hidden bg-background">
      <div className="mx-auto w-full max-w-[640px] px-4 pt-[10%]">
        <h1 className="mb-6 text-center text-2xl font-medium tracking-tight text-balance text-foreground">What are we making today?</h1>
        <PromptSuggestions
          {...props}
          value={scene.value}
          onValueChange={(value) => take({ value })}
          category={scene.category}
          onCategoryChange={(category) => take({ category })}
          activeIndex={scene.active}
          onActiveIndexChange={(active) => take({ active })}
        />
      </div>
    </div>
  )
}
