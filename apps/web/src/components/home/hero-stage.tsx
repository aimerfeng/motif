'use client'

import type { PreviewProps, PreviewTheme } from '@motif/preview/protocol'
import { useState } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'

/**
 * 首页首屏的实时效果。沙箱挂载成功前先显示海报，避免首屏闪黑；
 * 用户开启「减少动态效果」时效果本身会停在静态画面。
 */
export function HeroStage({ build, exportName, theme, props, poster, title }: { build: { js: string; css: string }; exportName: string; theme: PreviewTheme; props: PreviewProps; poster: string | null; title: string }) {
  const [status, setStatus] = useState<PreviewStatus>({ state: 'loading' })
  const ready = status.state === 'mounted'

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-sunken">
      {poster && (
        // 海报是预先生成的 webp，挂载完成后淡出。
        <img src={poster} alt="" className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`} />
      )}
      <PreviewFrame
        title={title}
        module={{ kind: 'url', url: build.js }}
        styles={{ kind: 'url', url: build.css }}
        exportName={exportName}
        theme={theme}
        props={props}
        onStatus={setStatus}
        className={`absolute inset-0 size-full transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
