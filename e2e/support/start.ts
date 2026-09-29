/**
 * e2e 用的服务：先完整构建一次预览沙箱（不 watch），再用同一份 catalog.json 构建并启动站点。
 * 两边必须来自同一次构建，否则静态生成的详情页引用的条目文件名（带内容哈希）会对不上。
 */
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { E2E } from './env.ts'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const shell = (command: string, env: NodeJS.ProcessEnv = {}) => spawnSync(command, { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, ...env } })

// 条目检查不通过时 build 以非 0 退出，但失败的条目只是不进市场，e2e 照常跑剩下的。
shell('pnpm --filter @motif/preview build')
const webEnv = { NEXT_PUBLIC_MOTIF_PREVIEW_URL: E2E.previewUrl, MOTIF_NEXT_DIST: '.next-e2e' }
const built = shell('pnpm --filter @motif/web exec next build', webEnv)
if (built.status !== 0) process.exit(built.status ?? 1)

const children = [
  spawn('pnpm --filter @motif/preview start', { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, MOTIF_PREVIEW_PORT: String(E2E.previewPort) } }),
  spawn(`pnpm --filter @motif/web exec next start -p ${E2E.webPort}`, { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, ...webEnv } }),
]
const stop = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
