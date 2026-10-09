/**
 * e2e 用的服务：
 * 1. 起一条独立的本地社区链（8546），全新部署合约、导入目录；
 * 2. 完整构建一次预览沙箱（不 watch），再用同一份 catalog.json 构建并启动站点。
 *    两边必须来自同一次构建，否则静态生成的详情页引用的条目文件名（带内容哈希）会对不上。
 */
import { spawn, spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { E2E } from './env.ts'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const shell = (command: string, env: NodeJS.ProcessEnv = {}) => spawnSync(command, { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, ...env } })
const must = (result: ReturnType<typeof shell>) => {
  if (result.status !== 0) {
    stop(result.status ?? 1)
  }
}

const children: ReturnType<typeof spawn>[] = []
function stop(code = 0) {
  for (const child of children) child.kill()
  process.exit(code)
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

async function chainReady() {
  try {
    const response = await fetch(E2E.chainUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
    })
    return response.ok
  } catch {
    return false
  }
}

// 1. 社区链。节点每次都是空链，所以部署记录用 --reset 重来，站点的社区数据目录也清空。
children.push(
  spawn(`pnpm --filter @motif/contracts exec hardhat node --port ${E2E.chainPort}`, { cwd: ROOT, shell: true, stdio: ['ignore', 'ignore', 'inherit'] }),
)
for (let attempt = 0; !(await chainReady()); attempt++) {
  if (attempt > 120) stop(1)
  await new Promise((resolve) => setTimeout(resolve, 500))
}
must(shell('pnpm --filter @motif/contracts exec hardhat ignition deploy ignition/modules/motif.ts --network e2e --parameters ignition/parameters/local.json --deployment-id e2e --reset'))
must(shell('pnpm --filter @motif/contracts exec hardhat run scripts/seed-catalog.ts --network e2e', { MOTIF_DEPLOYMENT_ID: 'e2e' }))
const communityData = path.join(ROOT, '.data/e2e-community')
rmSync(communityData, { recursive: true, force: true })
// Studio 的会话也放独立目录；agent 用脚本运行器，不调任何模型。
const studioData = path.join(ROOT, '.data/e2e-studio')
rmSync(studioData, { recursive: true, force: true })

// 2. 沙箱和站点。条目检查不通过时 build 以非 0 退出，但失败的条目只是不进市场，e2e 照常跑剩下的。
shell('pnpm --filter @motif/preview build')
const webEnv = {
  NEXT_PUBLIC_MOTIF_PREVIEW_URL: E2E.previewUrl,
  MOTIF_NEXT_DIST: '.next-e2e',
  MOTIF_CHAIN_RPC_URL: E2E.chainUrl,
  MOTIF_CHAIN_DEPLOYMENT: path.join(ROOT, 'packages/contracts/ignition/deployments/e2e/deployed_addresses.json'),
  MOTIF_COMMUNITY_DATA: communityData,
  MOTIF_STUDIO_DATA: studioData,
  MOTIF_AGENT_PROVIDER: 'scripted',
}
must(shell('pnpm --filter @motif/web exec next build', webEnv))

children.push(
  spawn('pnpm --filter @motif/preview start', { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, MOTIF_PREVIEW_PORT: String(E2E.previewPort) } }),
  spawn(`pnpm --filter @motif/web exec next start -p ${E2E.webPort}`, { cwd: ROOT, shell: true, stdio: 'inherit', env: { ...process.env, ...webEnv } }),
)
