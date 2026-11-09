// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Next.js Templates
// Source: https://github.com/NextJSTemplates/startup-nextjs/blob/e730b6a/src/app/blog/page.tsx
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { themeStyle } from './parts'
import { Article, CoverStory, Footer, Header, Latest } from './sections'

/* @motif:defaults */
export const defaults = {
  masthead: 'The Longhand',
  accent: '#4a6cf7',
  headlineFont: 'sans',
  coverStyle: 'mixed',
  dark: true,
  density: 'comfortable',
  columns: 3,
  showSidebar: true,
}
/* @motif:end */

export type OnlineMagazineProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 多作者在线杂志：刊头与栏目导航、封面故事 + 本周最多阅读、按栏目筛选的文章网格与分页、
 * 带侧栏（搜索、相关文章、栏目、标签、订阅）的文章页、页脚。布局用容器查询，放进任何宽度都能响应。
 */
export function OnlineMagazine({ className, style, ...props }: OnlineMagazineProps) {
  const options = { ...defaults, ...props }
  const layout = { compact: options.density === 'compact', coverStyle: options.coverStyle }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header name={options.masthead} />
      <main>
        <CoverStory {...layout} />
        <Latest {...layout} columns={options.columns} />
        <Article {...layout} showSidebar={options.showSidebar} accent={options.accent} dark={options.dark} />
      </main>
      <Footer name={options.masthead} />
    </div>
  )
}
