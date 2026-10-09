import { REPO, REPO_URL } from '@motif/export'
import type { Locale } from '@/i18n/routing'
import { SITE_URL } from './site'

/**
 * 文档页的内容。行内的 `代码` 和 [链接](地址) 由页面渲染；
 * 命令块带复制按钮，general-skills 块渲染成一排可复制的通用 Skill。
 */
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'command'; text: string }
  | { type: 'general-skills' }

export interface DocSection {
  id: string
  title: string
  blocks: DocBlock[]
}

const AUTHORING = `${REPO_URL}/blob/main/docs/authoring-items.md`
const REGISTRY_EXAMPLE = `npx shadcn@latest add "${SITE_URL}/r/border-beam.json"`
const SKILL_EXAMPLE = `npx skills add ${REPO} --skill motif-border-beam`

export const DOCS: Record<Locale, { lead: string; sections: DocSection[] }> = {
  'zh-CN': {
    lead: '怎么在市场里找到合适的效果、调到刚好，再把代码或 Skill 带回自己的项目。',
    sections: [
      {
        id: 'market',
        title: '逛市场',
        blocks: [
          { type: 'p', text: '市场按五个层级组织：整站模板、设计风格、页面区块、功能组件、视觉效果。先选层级，再按分类筛选；搜索会同时匹配名称、分类和标签，按 `/` 就能聚焦搜索框。' },
          { type: 'p', text: '筛选条件写在链接里（`?kind=component&category=button&q=…`），可以直接分享给别人。' },
          { type: 'p', text: '卡片右上角的「复制 Skill」复制这个条目的 SKILL.md；筛选栏上的「通用 Skill」是按当前层级和分类挑好的设计规范。' },
        ],
      },
      {
        id: 'tune',
        title: '调参',
        blocks: [
          {
            type: 'list',
            items: [
              '预设是几套调好的完整风格，点一下整组参数一起换。',
              '每个参数的范围都收紧过；数值变成橙色，说明离开了推荐区间，效果可能不如默认值。',
              '双击参数名，把这一项恢复成默认值；「重置」恢复全部。',
              '改过的参数会写进地址栏（`#v=…`）。「复制链接」把这组参数分享出去，对方打开就是同样的效果；切换语言也不会丢。',
              '只播一次的入场动画，可以用预览右下角的按钮重播。',
            ],
          },
        ],
      },
      {
        id: 'export',
        title: '带走代码',
        blocks: [
          { type: 'p', text: '下面三种方式拿到的代码都带着你调好的参数：它们写在组件文件开头的 `defaults` 对象里，以后也可以直接改那里，或者通过 props 覆盖。' },
          {
            type: 'list',
            items: [
              '下载项目：一个 Vite + React + Tailwind v4 项目，解压后 `npm install`、`npm run dev` 就能看到全屏效果，里面也放好了对应的 Skill。',
              'shadcn：在已经配置了 shadcn/ui 的项目里运行「安装」标签页里的命令。组件装到 `components/motif/<条目名>/`，共用的 motif-runtime 装到 `lib/`。',
              '手动复制：按「安装」标签页列出的路径逐个复制文件，再装上列出的依赖。',
            ],
          },
          { type: 'command', text: REGISTRY_EXAMPLE },
        ],
      },
      {
        id: 'skills',
        title: '把效果交给 agent',
        blocks: [
          { type: 'p', text: 'Skill 是一份写给 agent 的说明：什么时候用这个效果、怎么安装、你调好的参数，以及不能破坏的规则。放进项目后，Claude Code、Codex、Cursor 等 agent 就能在你的代码里做出同样的效果。' },
          {
            type: 'list',
            items: [
              'Claude Code 读 `.claude/skills/<名字>/`；Codex、Cursor、Gemini CLI 读 `.agents/skills/<名字>/`。',
              '详情页的「Skill」标签页可以下载完整的 Skill 文件夹（含组件文件），也可以只复制 SKILL.md。',
              '只粘贴了 SKILL.md 时，agent 会按里面的说明用 `npx skills add` 取回组件文件，再套用表格里调好的参数。',
            ],
          },
          { type: 'command', text: SKILL_EXAMPLE },
          { type: 'p', text: '通用 Skill 不绑定某个条目，讲的是动效、排版、着色器这些方向上的做法，可以和条目 Skill 一起用：' },
          { type: 'general-skills' },
        ],
      },
      {
        id: 'license',
        title: '来源与许可证',
        blocks: [
          { type: 'p', text: '市场里的代码只来自允许再分发的开源许可证：MIT、Apache-2.0、ISC、BSD、Zlib、Unlicense、CC0。每个文件都保留原作者的版权声明；详情页的「来源与许可证」写着上游仓库、固定的提交，以及 Motif 做过的改动。' },
          { type: 'p', text: '把代码用进自己的项目时，请保留文件开头的这些注释。Motif 自己的代码使用 MIT 许可证。' },
        ],
      },
      {
        id: 'community',
        title: '社区投稿与审核',
        blocks: [
          { type: 'p', text: '任何人都可以把作品投到 Motif。投稿时押上 MOTIF 押金，由 DAO 任命的审核员投票；通过后作品进入市场，作者得到奖励和声誉。源码由站点托管，链上记录内容哈希、许可证、来源和 Remix 关系：详情页上的「链上已验证」是浏览器自己重算哈希后和链上比对的结果。' },
          {
            type: 'list',
            items: [
              '准备条目文件：在仓库里按编写指南建好条目目录，运行 `pnpm item:pack <slug>` 打包成 `.motif.json`；Remix 现有条目用 `pnpm item:remix <原 slug> <新 slug>`。',
              '投稿：在 [社区 → 投稿](/community/submit) 拖入文件，站点用和市场条目相同的检查器和编译器检查并给出实时预览；连接钱包后签名上传、押上押金、提交上链。',
              '审核：同一份投稿哪一方先达到法定票数就按哪一方结算。质量问题退回押金；抄袭、伪造许可证、恶意代码会罚没押金。投稿者和被 Remix 的作者需要回避。',
              '治理：MOTIF 委托投票权后可以在 [社区 → 治理](/community/governance) 发起和表决提案，例如任免审核员、调整押金和奖励。',
            ],
          },
          { type: 'p', text: '本地试用：另开一个终端运行 `pnpm dev:chain`，它会启动本地链、部署合约并导入现有条目；连上钱包后在社区页领取测试币。合约设计和风险见 `docs/decisions/0005-decentralized-community.md`。' },
          { type: 'command', text: 'pnpm dev:chain' },
        ],
      },
      {
        id: 'contribute',
        title: '参与贡献',
        blocks: [
          { type: 'p', text: `仓库在 [GitHub](${REPO_URL}) 上公开。本地开发需要 Node 22 和 pnpm：` },
          { type: 'command', text: 'pnpm install && pnpm dev' },
          { type: 'p', text: '`pnpm dev` 同时启动站点（`localhost:3000`）和预览沙箱（`127.0.0.1:4100`）。提交前运行 `pnpm verify`（类型检查、ESLint、单元测试和构建）。' },
          { type: 'p', text: `新增条目的写法、质量要求和许可证规则见 [编写市场条目](${AUTHORING})。` },
        ],
      },
    ],
  },
  en: {
    lead: 'How to find the right effect in the market, tune it until it feels right, and take the code or the skill back to your own project.',
    sections: [
      {
        id: 'market',
        title: 'Browsing the market',
        blocks: [
          { type: 'p', text: 'The market has five levels: templates, styles, sections, components and effects. Pick a level, then narrow it down by category. Search matches names, categories and tags; press `/` to focus it.' },
          { type: 'p', text: 'Filters live in the link (`?kind=component&category=button&q=…`), so you can share a filtered view as is.' },
          { type: 'p', text: '"Copy skill" on a card copies that item’s SKILL.md. The general skills in the filter bar are design guides picked for the current level and category.' },
        ],
      },
      {
        id: 'tune',
        title: 'Tuning',
        blocks: [
          {
            type: 'list',
            items: [
              'Presets are complete, tuned looks; one click swaps every parameter at once.',
              'Every range has been tightened. A value turns orange when it leaves the recommended range, where the effect may look worse than the default.',
              'Double-click a parameter’s name to reset just that one; Reset restores everything.',
              'Changed values are written to the address bar (`#v=…`). Copy link shares them, and whoever opens it sees the same result. Switching language keeps them too.',
              'Entrance animations that play once can be replayed with the button in the preview’s bottom-right corner.',
            ],
          },
        ],
      },
      {
        id: 'export',
        title: 'Taking the code',
        blocks: [
          { type: 'p', text: 'All three ways below carry your tuned values: they are written into the `defaults` object at the top of the component file, where you can edit them later or override them with props.' },
          {
            type: 'list',
            items: [
              'Download the project: a Vite + React + Tailwind v4 app. Unzip it, run `npm install` and `npm run dev`, and the effect runs full screen. The matching skill is included.',
              'shadcn: in a project already set up with shadcn/ui, run the command from the Install tab. The component goes to `components/motif/<item>/` and the shared motif-runtime to `lib/`.',
              'Copy by hand: copy each file to the path listed in the Install tab, then install the listed dependencies.',
            ],
          },
          { type: 'command', text: REGISTRY_EXAMPLE },
        ],
      },
      {
        id: 'skills',
        title: 'Handing effects to your agent',
        blocks: [
          { type: 'p', text: 'A skill is a guide written for agents: when to use the effect, how to install it, the values you tuned and the rules it must not break. Put it in your project and agents such as Claude Code, Codex and Cursor can build the same effect in your code.' },
          {
            type: 'list',
            items: [
              'Claude Code reads `.claude/skills/<name>/`; Codex, Cursor and Gemini CLI read `.agents/skills/<name>/`.',
              'The Skill tab on an item page downloads the whole skill folder (component files included) or copies just the SKILL.md.',
              'When only the SKILL.md was pasted, the agent follows it to fetch the component files with `npx skills add`, then applies the tuned values from its table.',
            ],
          },
          { type: 'command', text: SKILL_EXAMPLE },
          { type: 'p', text: 'General skills are not tied to one item. They cover motion, typography, shaders and other directions, and work alongside item skills:' },
          { type: 'general-skills' },
        ],
      },
      {
        id: 'license',
        title: 'Sources and licenses',
        blocks: [
          { type: 'p', text: 'Code in the market comes only from licenses that allow redistribution: MIT, Apache-2.0, ISC, BSD, Zlib, Unlicense and CC0. Every file keeps its authors’ copyright notice; the Source & license tab of each item names the upstream repository, the pinned commit and what Motif changed.' },
          { type: 'p', text: 'Keep those header comments when you use the code in your project. Motif’s own code is MIT licensed.' },
        ],
      },
      {
        id: 'community',
        title: 'Community submissions and review',
        blocks: [
          { type: 'p', text: 'Anyone can submit work to Motif. You post a MOTIF bond, curators appointed by the DAO vote, and approved work goes into the market while its author earns a reward and reputation. The site hosts the source; the chain records its content hash, license, provenance and remix lineage. The “verified on chain” badge on an item page is your browser recomputing the hash and comparing it with the chain.' },
          {
            type: 'list',
            items: [
              'Prepare the item file: create the item folder following the authoring guide, then run `pnpm item:pack <slug>` to get a `.motif.json`. To remix an existing item, run `pnpm item:remix <source slug> <new slug>`.',
              'Submit: drop the file on [Community → Submit](/en/community/submit). The site checks it with the same checker and compiler as the market items and shows a live preview; connect a wallet to sign the upload, post the bond and submit on chain.',
              'Review: whichever side reaches the quorum first decides. Quality problems get the bond back; plagiarism, fake licenses and malicious code forfeit it. Submitters and remixed authors sit the review out.',
              'Governance: once you delegate your MOTIF, you can make and vote on proposals in [Community → Governance](/en/community/governance), such as appointing curators or changing the bond and rewards.',
            ],
          },
          { type: 'p', text: 'Try it locally: run `pnpm dev:chain` in another terminal. It starts a local chain, deploys the contracts and imports the existing items; connect a wallet and claim test tokens on the community page. The contract design and its risks are in `docs/decisions/0005-decentralized-community.md`.' },
          { type: 'command', text: 'pnpm dev:chain' },
        ],
      },
      {
        id: 'contribute',
        title: 'Contributing',
        blocks: [
          { type: 'p', text: `The repository is public on [GitHub](${REPO_URL}). Local development needs Node 22 and pnpm:` },
          { type: 'command', text: 'pnpm install && pnpm dev' },
          { type: 'p', text: '`pnpm dev` starts the site (`localhost:3000`) and the preview sandbox (`127.0.0.1:4100`) together. Run `pnpm verify` (types, ESLint, unit tests and build) before you commit.' },
          { type: 'p', text: `How to write a new item, the quality bar and the license rules are in [Writing market items](${AUTHORING}) (in Chinese).` },
        ],
      },
    ],
  },
}
