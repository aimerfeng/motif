# 0007 社区部署链：Arbitrum One，第一阶段不开代币经济

- 状态：已决定（2026-10-09），未部署
- 验证：
  - 在本机分叉一份 Arbitrum Sepolia（`arbitrumSepoliaFork`），按上线手册跑完部署 → 导入 139 个条目 → `check-deployment`。
    - 测试网参数：27 项全部通过。
    - 第一阶段参数（押金、奖励、奖励池都是 0）：26 项全部通过，奖励池那一项按设计跳过。
  - Solidity 测试 `test_ZeroEconomicsIsPlainRegistrationAndReview`：押金和奖励为 0 时，没有代币也能投稿；通过后只记声誉，奖励池不动。
- 代码：`packages/contracts/hardhat.config.ts`（网络、链描述、验证）、`ignition/parameters/arbitrum-*.example.json`、`scripts/check-deployment.ts`

## 决定

### 1. 链：Arbitrum One（测试网 Arbitrum Sepolia）

| 考虑 | 结论 |
| --- | --- |
| 合约要求 | 需要 cancun（`mcopy`）。Arbitrum 自 ArbOS 20 起支持。 |
| 稳定性 | 合约不可升级，链本身不应处在大迁移中。Arbitrum 是存量最大、最成熟的 L2，技术栈没有在迁移。 |
| 费用 | 投票、投稿每笔约 1 美分量级（ADR 0005 的 gas 测量），对审核员可以忽略。 |
| 国内可达 | 2026-10-09 在本机绕过代理直连测试：`arb1.arbitrum.io/rpc`、`sepolia-rollup.arbitrum.io/rpc` 和 publicnode 的 Arbitrum 节点都能直接访问。 |
| 钱包与工具 | 主流钱包（MetaMask、OKX、imToken）都内置；Arbiscan 验证源码，Hardhat 自带链描述。 |

没有选 Base：它原本是第一候选（费用最低、用户多）。但 Base 在 2026 年 2 月宣布离开 OP Stack，改用自己的技术栈和证明系统，并有自己的硬分叉计划。2026 年 4 月它已从 Superchain 注册表中移除。Hardhat 的 OP 链支持因此不再跟踪它的升级。没有选 Optimism：官方 RPC 在国内直连不通。

### 2. 第一阶段：只上登记和审核，不开代币经济

ADR 0005 已经写明：在中国大陆，代币发行融资和虚拟货币相关业务属于被禁止的金融活动。合约在设计上让代币可以拆开，所以第一阶段这样上线：

- 押金 `bond`、发布奖励、Remix 奖励、奖励池拨款都设为 0（`arbitrum-one.example.json`）。
- 投稿不需要代币，只需要付 gas（ETH）。通过后作者和审核员只记声誉。声誉不可转让。
- 创世流通份额先打到项目多签，不对外分发、不出售、不上交易所。
- 治理合约照常部署，由多签持有的投票权推动。

拿到法律意见、确定由境外主体运营之后，再通过治理提案开启经济：改 `setParams` 设置押金和奖励，再从金库给奖励池拨款。不需要重新部署任何合约。

### 3. RPC

- 服务端读链（`MOTIF_CHAIN_RPC_URL`）：用付费服务商的专属节点，或者自建节点。上线前在部署服务器上实测可达性和延迟，公共节点有限流。
- 给用户钱包「添加网络」（`MOTIF_CHAIN_PUBLIC_RPC_URL`）：`https://arb1.arbitrum.io/rpc`。

## 仍需项目负责人完成

以下这些不能由开发代劳，详见 `docs/deploy-community.md` 第 0 节：

- 法律意见；
- 版主多签和创世审核员的真实地址；
- 外部审计；
- 部署账户：私钥只存在本机的 Hardhat keystore，账户里只放部署所需的少量 ETH。
