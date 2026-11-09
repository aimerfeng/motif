import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // e2e 用独立的构建目录，不和本地开发、正式构建互相覆盖。
  distDir: process.env.MOTIF_NEXT_DIST ?? '.next',
  // 工作区包直接导出 TS 源码，由 Next 编译。
  transpilePackages: ['@motif/agent', '@motif/preview', '@motif/registry', '@motif/schema', '@motif/export', '@motif/vendor', '@motif/skills', '@motif/contracts', '@motif/checker'],
  reactStrictMode: true,
  // 海报和循环视频（public/media）文件名固定，只在重新截图时变：线上缓存一天，过期后先用旧的、后台再更新。
  // 默认的 max-age=0 让每次打开都要逐个文件回源确认，服务器离用户远时很慢。开发时不缓存，重新截图马上能看到。
  async headers() {
    if (process.env.NODE_ENV !== 'production') return []
    return [{ source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }]
  },
  // Skill 不再单独成页：每个市场条目和筛选栏上都能直接复制。旧链接转到市场。
  async redirects() {
    return [
      { source: '/skills', destination: '/market', permanent: false },
      { source: '/:locale(en|zh-CN)/skills', destination: '/:locale/market', permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
