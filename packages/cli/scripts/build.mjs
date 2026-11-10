// 把 CLI 打成一个没有依赖的文件（dist/motif.mjs）：站点原样分发它（apps/web/src/app/cli/[file]/route.ts），
// 用户的机器上只需要 Node，不用装任何包。不压缩——用户 npx 之前应该能读懂自己要运行的是什么。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build, context } from 'esbuild'

const root = fileURLToPath(new URL('..', import.meta.url))
const { version } = JSON.parse(readFileSync(`${root}package.json`, 'utf8'))

const options = {
  absWorkingDir: root,
  entryPoints: ['src/main.ts'],
  outfile: 'dist/motif.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  // 用户机器上的 Node 可能比仓库要求的旧：只用 Node 18 就有的东西（fetch、util.parseArgs）。
  target: 'node18',
  banner: { js: '#!/usr/bin/env node' },
  define: { __MOTIF_CLI_VERSION__: JSON.stringify(version) },
  legalComments: 'none',
  logLevel: 'warning',
}

if (process.argv.includes('--watch')) {
  // pnpm dev 用：改了源码就重新打包，站点下一次分发的就是新的。
  const watcher = await context({ ...options, logLevel: 'info' })
  await watcher.watch()
} else {
  await build(options)
  console.log(`[cli] built dist/motif.mjs (v${version})`)
}
