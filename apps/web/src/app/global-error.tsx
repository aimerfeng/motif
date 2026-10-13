'use client'

import { useEffect } from 'react'
import './globals.css'

/**
 * 根布局本身出错时的兜底（Next 的 global-error 约定）：它替换掉整个文档，拿不到语言和翻译，
 * 所以中英文各说一句；样式表单独引入，保持和站点一样的暗色外观。
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="zh-CN">
      <body className="flex min-h-dvh items-center">
        <title>Motif 母题</title>
        <main className="mx-auto max-w-2xl px-5 sm:px-8" role="alert">
          <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em]">出错了 · Something went wrong</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">页面没能加载出来，可以再试一次。The page failed to load; try again.</p>
          {error.digest && <p className="mt-3 font-mono text-[12px] text-ink-faint">{error.digest}</p>}
          <button
            type="button"
            onClick={retry}
            className="mt-8 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90"
          >
            重试 · Try again
          </button>
        </main>
      </body>
    </html>
  )
}
