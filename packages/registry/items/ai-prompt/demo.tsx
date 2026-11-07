import { useFrameLoop } from '@motif/runtime'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { AiPrompt, type AiAttachment, type AiPromptProps } from './ai-prompt'

const NOTE = 'Group these interviews into five themes and pull one quote for each.'
const FILE: AiAttachment = { id: 'churn', name: 'churn-interviews.pdf', size: '2.4 MB' }

type Scene = { text: string; files: AiAttachment[]; menu: boolean; highlight: string; model: string; streaming: boolean }

/** 12 秒一轮：放进一个文件 → 打字 → 打开模型菜单 → 选 Sable Deep → 发送 → 生成中 → 回到空闲。 */
function scripted(time: number): Scene {
  const t = time % 12
  const sent = t >= 6.6
  const typed = NOTE.slice(0, Math.max(0, Math.min(NOTE.length, Math.floor((t - 1.1) / 0.045) + 1)))
  return {
    text: sent || t < 1.1 ? '' : typed,
    files: t >= 0.7 && !sent ? [FILE] : [],
    menu: t >= 4.5 && t < 5.9,
    highlight: t < 5.1 ? 'standard' : 'deep',
    model: t >= 5.9 && t < 11.4 ? 'deep' : 'standard',
    streaming: sent && t < 9.8,
  }
}

const same = (a: Scene, b: Scene) =>
  a.text === b.text && a.files.length === b.files.length && a.menu === b.menu && a.highlight === b.highlight && a.model === b.model && a.streaming === b.streaming

export function Demo(props: AiPromptProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<Scene>(() => scripted(0))
  // 用户一碰就接管：从当前的状态接着走，自动播放不再回来。
  const [manual, setManual] = useState<Scene | null>(null)
  const scene = manual ?? auto

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((current) => (same(current, next) ? current : next))
    },
    { reducedMotion: 'static', staticTime: 5.5 },
  )

  const take = (next: Partial<Scene>) => setManual({ ...scene, menu: false, ...next })

  // 手动发送后模拟 2.4 秒的生成。
  useEffect(() => {
    if (!manual?.streaming) return
    const timer = window.setTimeout(() => setManual((current) => (current ? { ...current, streaming: false } : current)), 2400)
    return () => window.clearTimeout(timer)
  }, [manual?.streaming])

  const modelName = scene.model === 'deep' ? 'Sable Deep' : scene.model === 'lite' ? 'Sable Lite' : 'Sable 2'

  return (
    <div ref={host} className="h-full w-full overflow-hidden bg-background">
      <div className="mx-auto w-full max-w-[600px] px-6 pt-[13%]">
        <h1 className="mb-5 text-center text-2xl font-medium tracking-tight text-balance text-foreground">Good afternoon, Mira</h1>
        <AiPrompt
          {...props}
          menuSide="bottom"
          value={scene.text}
          onValueChange={(text) => take({ text })}
          attachments={scene.files}
          onAttachmentsChange={(files) => take({ files })}
          model={scene.model}
          onModelChange={(model) => take({ model })}
          status={scene.streaming ? 'streaming' : 'idle'}
          onStop={() => take({ streaming: false })}
          onSubmit={() => take({ text: '', files: [], streaming: true })}
          menuOpen={manual ? undefined : scene.menu}
          highlightedModel={manual ? undefined : scene.highlight}
          focused={manual ? undefined : true}
        />
        <div className="mt-3 h-5 text-center text-xs text-muted-foreground" aria-live="polite">
          {scene.streaming && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              {modelName} is reading churn-interviews.pdf…
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
