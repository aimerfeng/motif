// 本地开发：同时启动站点（localhost:3000）和预览沙箱（127.0.0.1:4100）。
import concurrently from 'concurrently'

const { result } = concurrently(
  [
    { name: 'preview', command: 'pnpm --filter @motif/preview dev', prefixColor: 'magenta' },
    { name: 'web', command: 'pnpm --filter @motif/web dev', prefixColor: 'green' },
  ],
  { killOthersOn: ['failure'], restartTries: 0 },
)

result.catch(() => {
  process.exitCode = 1
})
