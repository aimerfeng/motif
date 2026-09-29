import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // e2e 用独立的构建目录，不和本地开发、正式构建互相覆盖。
  distDir: process.env.MOTIF_NEXT_DIST ?? '.next',
  // 工作区包直接导出 TS 源码，由 Next 编译。
  transpilePackages: ['@motif/preview', '@motif/registry', '@motif/schema', '@motif/export', '@motif/vendor', '@motif/skills'],
  reactStrictMode: true,
}

export default withNextIntl(nextConfig)
