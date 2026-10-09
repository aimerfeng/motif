# 社区上线手册

把社区合约部署到 Arbitrum（先测试网 Arbitrum Sepolia，再主网 Arbitrum One），并让站点连上它。设计和风险见 `docs/decisions/0005-decentralized-community.md`，选链和第一阶段方案见 `docs/decisions/0007-chain.md`。

## 0. 上线前必须先定的事

这些不是技术问题，需要项目负责人决定，并留下书面记录：

- [ ] **法律意见。** 发行代币在中国大陆属于被禁止的金融活动。拿到法律意见之前，主网只按第一阶段上线：押金、奖励、奖励池都是 0，创世份额留在项目多签，不对外分发（`arbitrum-one.example.json` 已经这样填好）。
- [x] **部署链。** Arbitrum One（ADR 0007）。服务端读链的 RPC 还要准备：付费服务商的专属节点或自建节点，在部署服务器上实测可达。
- [x] **第一阶段的经济参数。** 见 `arbitrum-one.example.json`。开启代币经济时的分配和奖励数额，到时候通过治理提案再定。
- [ ] **人选。**
  - 应急版主的多签：至少 2/3，签名人分散在不同的人和设备上；
  - 至少 3 位创世审核员；
  - 创世流通份额的接收方（分发合约或多签）。
- [ ] **外部审计。** 合约不可升级，审计要在主网部署之前完成。

## 1. 准备部署账户

部署者只在部署过程中持有权限，部署结束后自动全部放弃（第 3 步的自检会核对）。部署账户只放部署所需的 gas，部署完就不再使用。

```bash
cd packages/contracts
pnpm exec hardhat keystore set MOTIF_DEPLOY_RPC_URL     # 目标链的 RPC
pnpm exec hardhat keystore set MOTIF_DEPLOYER_KEY       # 部署账户私钥（加密保存在本机，不进仓库）
```

## 2. 写部署参数

两份模板，复制后去掉 `.example`，再填上多签、审核员、创世接收方的真实地址：

| 模板 | 用途 |
| --- | --- |
| `ignition/parameters/arbitrum-sepolia.example.json` | 测试网演练。经济参数打开、时间缩短（审核期 1 小时、投票 30 分钟），一天内能走完下面的清单 |
| `ignition/parameters/arbitrum-one.example.json` | 主网第一阶段。押金、奖励、奖励池都是 0 |

- 参数文件里没有任何私钥，可以提交进仓库，方便公开核对。
- 时间参数单位是秒，以 `n` 结尾（例如 `"172800n"` 是 2 天）。

## 3. 先在测试网完整演练

可以先在本机分叉一份 Arbitrum Sepolia 免费演练。不需要私钥和测试币，用的是本地链的开发账户：

```bash
pnpm exec hardhat node --network arbitrumSepoliaFork --port 8547     # 另开一个终端，保持运行
echo y | pnpm exec hardhat ignition deploy ignition/modules/motif.ts --network arbitrumSepoliaForkNode --parameters ignition/parameters/local.json --deployment-id arbitrum-sepolia-fork
MOTIF_DEPLOYMENT_ID=arbitrum-sepolia-fork pnpm exec hardhat run scripts/seed-catalog.ts --network arbitrumSepoliaForkNode
MOTIF_DEPLOYMENT_ID=arbitrum-sepolia-fork pnpm exec hardhat run scripts/check-deployment.ts --network arbitrumSepoliaForkNode
```

然后部署到真正的测试网。部署账户需要一点 Arbitrum Sepolia 的 ETH（从水龙头领）。链 id 已经写死，RPC 填错链时会直接报错：

```bash
pnpm exec hardhat ignition deploy ignition/modules/motif.ts --network arbitrumSepolia --parameters ignition/parameters/arbitrum-sepolia.json
pnpm exec hardhat run scripts/seed-catalog.ts --network arbitrumSepolia       # 导入现有条目，完成后放弃导入权限
pnpm exec hardhat run scripts/check-deployment.ts --network arbitrumSepolia   # 权限结构自检，必须全部 ✓
```

测试网上至少走完一遍下面这些，并记录交易哈希：

- 投稿 → 两位审核员通过 → 作者拿到奖励；
- 一次违规罚没；一次撤回；一次过期关闭；
- 版主下架再恢复、暂停再恢复投稿；
- 治理提案：委托 → 发起 → 投票 → 排队 → 执行（例如任命一位审核员、给奖励池拨款）；
- 维护权转交和接受。

## 4. 主网部署

和测试网相同的三条命令，网络换成 `arbitrumOne`，参数用 `ignition/parameters/arbitrum-one.json`。

- 部署记录 `ignition/deployments/chain-42161/` 要提交进仓库：站点从这里读合约地址，社区也能据此核对合约。
- 部署后在 Arbiscan 上验证源码：先 `pnpm exec hardhat keystore set ETHERSCAN_API_KEY`（Etherscan v2 的 key 通用于各条链），再执行 `pnpm exec hardhat ignition verify chain-42161`。

## 5. 站点连上链

在站点的运行环境里设置：

| 变量 | 值 |
| --- | --- |
| `MOTIF_CHAIN_RPC_URL` | 服务端读链用的 RPC |
| `MOTIF_CHAIN_PUBLIC_RPC_URL` | 给用户钱包“添加网络”用的公开 RPC：`https://arb1.arbitrum.io/rpc`。**非本地链必须设置**：站点不会回落到服务端 RPC（那个地址常常带着服务商的 API key），没设置时社区功能保持关闭 |
| `MOTIF_CHAIN_START_BLOCK` | 合约部署所在的区块（见 `ignition/deployments/chain-42161/journal.jsonl` 里第一笔部署交易的回执） |
| `MOTIF_CHAIN_NAME` | 钱包里显示的网络名：`Arbitrum One` |
| `MOTIF_COMMUNITY_DATA` | 投稿源码和托管文字的存放目录，必须是持久化的磁盘 |

部署记录在默认位置时不需要设置 `MOTIF_CHAIN_DEPLOYMENT`。

上线后检查：
- 社区概览页显示链上条目数；
- 市场详情页显示“链上已验证”；
- 用一个普通钱包完整投一次稿。

## 6. 上线后的待办（生产化）

- **事件索引：** 现在是站点进程内的增量同步，只适合单实例。多实例或历史很长时，换成独立的索引服务写数据库。
- **源码存储：** `.data/community` 换成对象存储，只需要替换 `apps/web/src/lib/community/storage.ts`。
- **限流：** 现在是站点进程内按 IP 的固定窗口限流（预检 20 次/分、上传 10 次/分、托管文字 30 次/分），只防随手刷接口。多实例部署要换成共享存储里的限流，并给托管内容加总量上限。
- **海报与视频：** 社区作品通过后，在服务端自动生成海报和循环视频。
- **监控：** 关注奖励池余额（不足时奖励会按余额打折发放），以及审核队列的积压情况。
