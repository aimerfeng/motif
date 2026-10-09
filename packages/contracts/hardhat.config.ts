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
    // 正式部署选定 Arbitrum One（docs/decisions/0007-chain.md）。RPC 和部署私钥用 configVariable 从 Hardhat keystore
    // 或环境变量读取，不进仓库；只有用到这个网络时才会去读。写死 chainId：RPC 填错链时直接报错，不会部署到别的链上。
    arbitrumSepolia: { type: 'http', chainType: 'generic', chainId: 421614, url: configVariable('MOTIF_DEPLOY_RPC_URL'), accounts: [configVariable('MOTIF_DEPLOYER_KEY')] },
    arbitrumOne: { type: 'http', chainType: 'generic', chainId: 42161, url: configVariable('MOTIF_DEPLOY_RPC_URL'), accounts: [configVariable('MOTIF_DEPLOYER_KEY')] },
    // 在本地分叉一份 Arbitrum Sepolia 演练部署（真实的链 id、时间和链上状态），不花钱也不需要私钥：
    // `hardhat node --network arbitrumSepoliaFork --port 8547` 开出分叉链，部署和导入脚本再通过 arbitrumSepoliaForkNode 连上去。
    arbitrumSepoliaFork: { type: 'edr-simulated', chainType: 'generic', chainId: 421614, forking: { url: configVariable('MOTIF_FORK_RPC_URL', { default: 'https://sepolia-rollup.arbitrum.io/rpc' }) } },
    arbitrumSepoliaForkNode: { type: 'http', chainType: 'generic', chainId: 421614, url: 'http://127.0.0.1:8547' },
    // 其他兼容 EVM 的链（先确认支持 cancun）。步骤见 docs/deploy-community.md。
    target: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('MOTIF_DEPLOY_RPC_URL'),
      accounts: [configVariable('MOTIF_DEPLOYER_KEY')],
    },
  },
  // 分叉模拟需要知道这条链从哪个区块起按哪套 EVM 规则执行。Arbitrum 自 ArbOS 20 起支持 cancun；
  // 演练只在分叉点之后执行，统一按合约的编译目标 cancun 模拟即可。
  chainDescriptors: { 421614: { name: 'Arbitrum Sepolia', chainType: 'generic', hardforkHistory: { cancun: { blockNumber: 0 } } } },
  // 部署后在 Arbiscan 上验证源码（Etherscan v2 的 key 通用于各条链）。
  verify: { etherscan: { apiKey: configVariable('ETHERSCAN_API_KEY') } },
  paths: {
    tests: { solidity: 'test/solidity', nodejs: 'test/nodejs' },
  },
  test: {
    // 不变量测试每轮随机调用 64 次、跑 128 轮：足够覆盖押金账目的各种交错，又不拖慢 pnpm verify。
    solidity: { invariant: { runs: 128, depth: 64 } },
  },
})
