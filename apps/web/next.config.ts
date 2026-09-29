import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // 工作区包直接导出 TS 源码，由 Next 编译。
  transpilePackages: ['@motif/preview'],
  reactStrictMode: true,
}

export default withNextIntl(nextConfig)
