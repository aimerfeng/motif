// 本地开发：同时启动站点（localhost:3000）和预览沙箱（127.0.0.1:4100）。
import concurrently from 'concurrently'

const { result } = concurrently(
  [
    { name: 'preview', command: 'pnpm --filter @motif/preview dev', prefixColor: 'magenta' },
    { name: 'web', command: 'pnpm --filter @motif/web dev', prefixColor: 'green' },
    // 站点自己分发 motif 命令行（/cli/…）：开发时跟着源码重新打包。
    { name: 'cli', command: 'pnpm --filter @motif/cli dev', prefixColor: 'cyan' },
  ],
  { killOthersOn: ['failure'], restartTries: 0 },
)

result.catch(() => {
  process.exitCode = 1
})
