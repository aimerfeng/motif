// 本地社区链：启动 Hardhat 节点（127.0.0.1:8545）→ 全新部署全部合约 → 导入仓库里的条目。
// 节点保持运行，Ctrl+C 退出。开发模式下站点会自动连上它（见 apps/web/src/lib/community/config.ts）。
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const RPC = 'http://127.0.0.1:8545'

const hardhat = (args) => {
  const result = spawnSync(`pnpm --filter @motif/contracts exec hardhat ${args}`, { cwd: ROOT, shell: true, stdio: 'inherit' })
  if (result.status !== 0) {
    node.kill()
    process.exit(result.status ?? 1)
  }
}

async function rpcReady() {
  try {
    const response = await fetch(RPC, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
    })
    return response.ok
  } catch {
    return false
  }
}

if (await rpcReady()) {
  console.error(`${RPC} is already in use; stop the other node first.`)
  process.exit(1)
}

// 节点每处理一个请求都打印一行，太吵；只保留错误输出。
const node = spawn('pnpm --filter @motif/contracts exec hardhat node', { cwd: ROOT, shell: true, stdio: ['ignore', 'ignore', 'inherit'] })
node.on('exit', (code) => process.exit(code ?? 0))
for (let attempt = 0; !(await rpcReady()); attempt++) {
  if (attempt > 120) {
    console.error('the Hardhat node did not start within 60 seconds')
    node.kill()
    process.exit(1)
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
}

// --reset：节点每次启动都是空链，旧的部署记录作废。
hardhat('ignition deploy ignition/modules/motif.ts --network localhost --parameters ignition/parameters/local.json --reset')
hardhat('run scripts/seed-catalog.ts --network localhost')

console.log(`
Motif 本地社区链已就绪：${RPC}（chain id 31337）
- pnpm dev 启动的站点会自动连接；
- 钱包里添加网络：RPC ${RPC}，链 id 31337，币种 ETH；
- 连上钱包后在社区页领取测试币（1 ETH + 1000 MOTIF）；
- 版主与审核员是 Hardhat 默认账户 #1–#4（私钥见 Hardhat 文档，只能用于本地）。
Ctrl+C 停止。`)

const stop = () => {
  node.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
