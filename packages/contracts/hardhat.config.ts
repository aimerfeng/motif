import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem'
import { configVariable, defineConfig } from 'hardhat/config'

// cancun：OpenZeppelin 5.6 的 Governor 依赖的 SignatureChecker 用到了 mcopy。以太坊主网和主流 L2 都已支持；
// 部署到其他 EVM 链（例如国内联盟链）之前，先确认那条链支持 cancun。
// 测试和部署用同一套编译设置，测到的就是部署出去的字节码。
const settings = { evmVersion: 'cancun', optimizer: { enabled: true, runs: 200 } }

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: { version: '0.8.34', settings },
      production: { version: '0.8.34', settings },
    },
  },
  networks: {
    // `hardhat node`（pnpm dev:chain）用的本地链：除了有交易就出块，每秒也出一个空块，让链上时间像真实的链一样往前走。
    // 否则链空闲时，按“上一秒”计票的治理合约会一直读到旧的时间点（刚委托完立刻发提案会被拒）。测试用的网络不受影响。
    node: { type: 'edr-simulated', chainType: 'l1', mining: { auto: true, interval: 1000 } },
    // 端到端测试单独起一个节点（e2e/support/start.ts），和开发用的 8545 互不干扰。
    e2e: { type: 'http', chainType: 'l1', url: 'http://127.0.0.1:8546' },
    // 正式部署（测试网或主网）：RPC 和部署私钥用 configVariable 从 Hardhat keystore 或环境变量读取，不进仓库。
    // 只有用到这个网络时才会去读，测试和本地开发不需要配置。步骤见 docs/deploy-community.md。
    target: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('MOTIF_DEPLOY_RPC_URL'),
      accounts: [configVariable('MOTIF_DEPLOYER_KEY')],
    },
  },
  paths: {
    tests: { solidity: 'test/solidity', nodejs: 'test/nodejs' },
  },
  test: {
    // 不变量测试每轮随机调用 64 次、跑 128 轮：足够覆盖押金账目的各种交错，又不拖慢 pnpm verify。
    solidity: { invariant: { runs: 128, depth: 64 } },
  },
})
