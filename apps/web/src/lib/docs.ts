import { REPO, REPO_URL } from '@motif/export'
import type { Locale } from '@/i18n/routing'
import { SITE_URL } from './site'

/**
 * 文档页的内容。行内的 `代码` 和 [链接](地址) 由页面渲染；
 * 命令块带复制按钮，general-skills 块渲染成一排可复制的通用 Skill。
 * 写法：一条只说一件用户找不到、猜不到的事；界面上一眼能看懂的操作不写。
 */
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  /** 有先后顺序的步骤，带编号。 */
  | { type: 'steps'; items: { title: string; text: string }[] }
  /** 几种并列的做法，排成一行卡片。 */
  | { type: 'options'; items: { title: string; text: string }[] }
  /** 需要特别留意的一句话。 */
  | { type: 'note'; text: string }
  | { type: 'command'; text: string }
  | { type: 'general-skills' }

export interface DocSection {
  id: string
  title: string
  blocks: DocBlock[]
}

/** 页首的快速入口：每个指向下面的一节。 */
export interface DocStart {
  section: string
  icon: 'market' | 'export' | 'studio' | 'agent'
  title: string
  text: string
}

const AUTHORING = `${REPO_URL}/blob/main/docs/authoring-items.md`
const REGISTRY_EXAMPLE = `npx shadcn@latest add "${SITE_URL}/r/border-beam.json"`
const SKILL_EXAMPLE = `npx skills add ${REPO} --skill motif-border-beam`
const MCP_EXAMPLE = `claude mcp add --transport http motif ${SITE_URL}/mcp`

export const DOCS: Record<Locale, { lead: string; start: DocStart[]; sections: DocSection[] }> = {
  'zh-CN': {
    lead: '从找到效果到用进项目：调参、导出，或者交给 agent。',
    start: [
      { section: 'market', icon: 'market', title: '找一个效果', text: '按层级和分类筛选，按 / 搜索。' },
      { section: 'export', icon: 'export', title: '调好再带走', text: '调好的参数跟着代码一起走。' },
      { section: 'studio', icon: 'studio', title: '让 agent 来做', text: '一句话描述，工作台写好组件。' },
      { section: 'mcp', icon: 'agent', title: '接入你的 agent', text: '通过 MCP 搜索、预览、下单。' },
    ],
    sections: [
      {
        id: 'market',
        title: '逛市场',
        blocks: [
          {
            type: 'list',
            items: [
              '市场分五个层级：整站模板、设计风格、页面区块、功能组件、视觉效果。先选层级，再按分类筛选。',
              '搜索同时匹配名称、分类和标签，按 `/` 聚焦搜索框。筛选条件写在链接里，复制地址就能分享。',
              '卡片上的「复制 Skill」复制这个条目的 SKILL.md；筛选栏的「通用 Skill」是按当前分类挑好的设计规范。',
            ],
          },
        ],
      },
      {
        id: 'tune',
        title: '调参',
        blocks: [
          {
            type: 'list',
            items: [
              '数值变成橙色，说明离开了推荐区间，效果可能不如默认值。',
              '双击参数名恢复这一项的默认值；「重置」恢复全部。',
              '改过的参数写在地址栏（`#v=…`）。「复制链接」分享出去，对方看到的就是同样的效果。',
              '只播一次的入场动画，用预览右下角的按钮重播。',
            ],
          },
        ],
      },
      {
        id: 'export',
        title: '带走代码',
        blocks: [
          { type: 'p', text: '三种方式拿到的代码都带着你调好的参数：写在组件开头的 `defaults` 里，之后可以直接改，或者用 props 覆盖。' },
          {
            type: 'options',
            items: [
              { title: '下载项目', text: 'Vite + React + Tailwind v4，`npm install && npm run dev` 就能跑，附带对应的 Skill。' },
              { title: 'shadcn 安装', text: '运行「安装」页的命令，组件装到 `components/motif/<条目名>/`。' },
              { title: '手动复制', text: '按「安装」页列出的路径复制文件，再装上依赖。' },
            ],
          },
          { type: 'command', text: REGISTRY_EXAMPLE },
        ],
      },
      {
        id: 'studio',
        title: '工作台',
        blocks: [
          { type: 'p', text: '在[工作台](/studio)里用一句话描述效果，agent 写好组件、参数和预设，边改边预览。条目页的「在工作台里改」会带着你调好的参数进来。' },
          {
            type: 'list',
            items: [
              'agent 的每次修改都过一遍和市场相同的检查和编译，出错它会自己修。',
              '「应用为默认值」把预览里调好的参数写回组件。',
              '想自己改：在「代码」里编辑，Ctrl / ⌘ + S 保存并编译。',
              '做好后和市场条目一样导出（shadcn 地址是 `/r/s/<会话>.json`），或者一键投稿到社区。',
            ],
          },
          { type: 'note', text: '会话链接就是工作区的钥匙：拿到链接的人都能继续改，只分享给信任的人。' },
        ],
      },
      {
        id: 'skills',
        title: '把效果交给 agent',
        blocks: [
          { type: 'p', text: 'Skill 是写给 agent 的说明：什么时候用、怎么装、你调好的参数和不能破坏的规则。放进项目后，Claude Code、Codex、Cursor 等 agent 就能在你的代码里做出同样的效果。' },
          {
            type: 'list',
            items: [
              'Claude Code 读 `.claude/skills/<名字>/`；Codex、Cursor、Gemini CLI 读 `.agents/skills/<名字>/`。',
              '条目页的「Skill」标签可以下载完整的 Skill 文件夹，也可以只复制 SKILL.md：agent 会按说明用 `npx skills add` 取回组件。',
            ],
          },
          { type: 'command', text: SKILL_EXAMPLE },
          { type: 'p', text: '通用 Skill 讲动效、排版、着色器这些方向的做法，可以和条目 Skill 一起用：' },
          { type: 'general-skills' },
        ],
      },
      {
        id: 'mcp',
        title: 'Agent 接入（MCP）',
        blocks: [
          { type: 'p', text: 'Motif 也是给 agent 用的商店：你的 agent 可以自己搜索条目、看预览、按参数取回代码，找不到合适的就下定制单。' },
          { type: 'command', text: MCP_EXAMPLE },
          {
            type: 'steps',
            items: [
              { title: '找', text: '`search_ui` 按需求搜索，`get_ui` 看参数和预设。' },
              { title: '看', text: '`preview_ui` 用指定参数截图。' },
              { title: '取', text: '`place_order` 下单。开源条目免费，立即交付全部文件、安装命令和 Skill。' },
              { title: '定制', text: '没有合适的就带上需求下定制单，用 `get_order` 查进度。交付的条目过同样的检查。' },
            ],
          },
          { type: 'p', text: '不用 MCP 的 agent 读 [llms.txt](/llms.txt)，或者直接 `POST /api/agent/<工具名>`。' },
          { type: 'note', text: '定制单和社区作品以 USDC 计价，用 MOTIF 支付有折扣。支付还没开放，现阶段只交付免费订单。' },
        ],
      },
      {
        id: 'license',
        title: '来源与许可证',
        blocks: [
          { type: 'p', text: '市场的代码只来自允许再分发的许可证：MIT、Apache-2.0、ISC、BSD、Zlib、Unlicense、CC0。条目页的「来源与许可证」写着上游仓库、固定的提交和 Motif 的改动。' },
          { type: 'note', text: '用进自己的项目时，请保留文件开头的版权注释。Motif 自己的代码使用 MIT 许可证。' },
        ],
      },
      {
        id: 'community',
        title: '社区投稿与审核',
        blocks: [
          { type: 'p', text: '任何人都可以投稿：押上 MOTIF 押金，审核员投票通过后进入市场，作者得到奖励和声誉。链上记录内容哈希、许可证和来源；条目页的「链上已验证」是你的浏览器重算哈希后和链上比对的结果。' },
          {
            type: 'steps',
            items: [
              { title: '准备', text: '在[工作台](/studio)里做一个，或者用 `pnpm item:pack <slug>` 打包成 `.motif.json`。' },
              { title: '投稿', text: '在[社区 → 投稿](/community/submit)拖入文件，检查和预览通过后签名提交。' },
              { title: '审核', text: '先达到法定票数的一方决定结果。质量问题退回押金；抄袭、伪造许可证、恶意代码罚没押金。' },
              { title: '治理', text: '委托 MOTIF 投票权后，在[社区 → 治理](/community/governance)发起和表决提案。' },
            ],
          },
          { type: 'p', text: '本地试用：运行 `pnpm dev:chain` 启动本地链并导入条目，连上钱包后领取测试币。合约设计见 `docs/decisions/0005-decentralized-community.md`。' },
          { type: 'command', text: 'pnpm dev:chain' },
        ],
      },
      {
        id: 'contribute',
        title: '参与贡献',
        blocks: [
          { type: 'p', text: `仓库在 [GitHub](${REPO_URL}) 上公开，本地开发需要 Node 22 和 pnpm：` },
          { type: 'command', text: 'pnpm install && pnpm dev' },
          { type: 'p', text: `\`pnpm dev\` 同时启动站点和预览沙箱，提交前运行 \`pnpm verify\`。新增条目的写法和质量要求见 [编写市场条目](${AUTHORING})。` },
        ],
      },
    ],
  },
  en: {
    lead: 'From finding an effect to shipping it: tune it, take the code, or hand it to an agent.',
    start: [
      { section: 'market', icon: 'market', title: 'Find an effect', text: 'Filter by level and category; press / to search.' },
      { section: 'export', icon: 'export', title: 'Tune and take it', text: 'Your tuned values travel with the code.' },
      { section: 'studio', icon: 'studio', title: 'Let an agent build it', text: 'Describe it once; Studio writes the component.' },
      { section: 'mcp', icon: 'agent', title: 'Connect your agent', text: 'Search, preview and order over MCP.' },
    ],
    sections: [
      {
        id: 'market',
        title: 'Browsing the market',
        blocks: [
          {
            type: 'list',
            items: [
              'The market has five levels: templates, styles, sections, components and effects. Pick a level, then narrow it down by category.',
              'Search matches names, categories and tags; press `/` to focus it. Filters live in the link, so copying the address shares them.',
              '"Copy skill" on a card copies that item’s SKILL.md. The general skills in the filter bar are design guides picked for the current category.',
            ],
          },
        ],
      },
      {
        id: 'tune',
        title: 'Tuning',
        blocks: [
          {
            type: 'list',
            items: [
              'A value turns orange when it leaves the recommended range, where the effect may look worse than the default.',
              'Double-click a parameter’s name to reset just that one; Reset restores everything.',
              'Changed values live in the address bar (`#v=…`). Copy link shares them, and whoever opens it sees the same result.',
              'Entrance animations that play once can be replayed with the button in the preview’s bottom-right corner.',
            ],
          },
        ],
      },
      {
        id: 'export',
        title: 'Taking the code',
        blocks: [
          { type: 'p', text: 'Every option carries your tuned values: they sit in the `defaults` object at the top of the component, where you can edit them later or override them with props.' },
          {
            type: 'options',
            items: [
              { title: 'Download the project', text: 'Vite + React + Tailwind v4. `npm install && npm run dev` runs it; the matching skill is included.' },
              { title: 'Install with shadcn', text: 'Run the command from the Install tab; the component goes to `components/motif/<item>/`.' },
              { title: 'Copy by hand', text: 'Copy each file to the path in the Install tab, then install the dependencies.' },
            ],
          },
          { type: 'command', text: REGISTRY_EXAMPLE },
        ],
      },
      {
        id: 'studio',
        title: 'Studio',
        blocks: [
          { type: 'p', text: 'In [Studio](/en/studio), describe the effect in a sentence: the agent writes the component, its parameters and presets while you watch the preview. "Open in Studio" on an item page brings your tuned values along.' },
          {
            type: 'list',
            items: [
              'Every change the agent makes goes through the same checks and build as the market, and it fixes its own errors.',
              '"Apply as defaults" writes the values you tuned in the preview back into the component.',
              'Prefer to do it yourself? Edit under Code and press Ctrl / ⌘ + S to save and build.',
              'When it is ready, export it like any market item (the shadcn URL is `/r/s/<session>.json`) or submit it to the community in one step.',
            ],
          },
          { type: 'note', text: 'A session link is the key to its workspace: anyone with it can keep editing, so share it only with people you trust.' },
        ],
      },
      {
        id: 'skills',
        title: 'Handing effects to your agent',
        blocks: [
          { type: 'p', text: 'A skill is a guide written for agents: when to use the effect, how to install it, your tuned values and the rules it must not break. Put it in your project and agents such as Claude Code, Codex and Cursor can build the same effect in your code.' },
          {
            type: 'list',
            items: [
              'Claude Code reads `.claude/skills/<name>/`; Codex, Cursor and Gemini CLI read `.agents/skills/<name>/`.',
              'The Skill tab on an item page downloads the whole skill folder or copies just the SKILL.md; with only the SKILL.md, the agent fetches the component with `npx skills add`.',
            ],
          },
          { type: 'command', text: SKILL_EXAMPLE },
          { type: 'p', text: 'General skills cover motion, typography, shaders and other directions, and work alongside item skills:' },
          { type: 'general-skills' },
        ],
      },
      {
        id: 'mcp',
        title: 'Connecting agents (MCP)',
        blocks: [
          { type: 'p', text: 'Motif is also a store for agents: yours can search the catalogue, see previews, fetch code with your values, and place a custom order when nothing fits.' },
          { type: 'command', text: MCP_EXAMPLE },
          {
            type: 'steps',
            items: [
              { title: 'Find', text: '`search_ui` searches by need; `get_ui` shows parameters and presets.' },
              { title: 'See', text: '`preview_ui` takes screenshots with the values you pass.' },
              { title: 'Take', text: '`place_order` orders it. Open-source items are free and delivered at once: every file, an install command and a skill.' },
              { title: 'Custom', text: 'Nothing fits? Order with a brief and poll `get_order`. Delivered items pass the same checks.' },
            ],
          },
          { type: 'p', text: 'Agents without MCP can read [llms.txt](/llms.txt) or call `POST /api/agent/<tool>` directly.' },
          { type: 'note', text: 'Custom orders and community works are priced in USDC, with a discount for paying in MOTIF. Payment is not open yet, so only free orders are delivered for now.' },
        ],
      },
      {
        id: 'license',
        title: 'Sources and licenses',
        blocks: [
          { type: 'p', text: 'Code in the market comes only from licenses that allow redistribution: MIT, Apache-2.0, ISC, BSD, Zlib, Unlicense and CC0. The Source & license tab of each item names the upstream repository, the pinned commit and what Motif changed.' },
          { type: 'note', text: 'Keep the copyright comments at the top of each file when you use the code. Motif’s own code is MIT licensed.' },
        ],
      },
      {
        id: 'community',
        title: 'Community submissions and review',
        blocks: [
          { type: 'p', text: 'Anyone can submit: post a MOTIF bond, and once curators approve it the work joins the market while its author earns a reward and reputation. The chain records the content hash, license and provenance; “verified on chain” on an item page is your browser recomputing the hash and comparing it with the chain.' },
          {
            type: 'steps',
            items: [
              { title: 'Prepare', text: 'Make it in [Studio](/en/studio), or pack an item folder into a `.motif.json` with `pnpm item:pack <slug>`.' },
              { title: 'Submit', text: 'Drop the file on [Community → Submit](/en/community/submit); once the checks and preview pass, sign and submit.' },
              { title: 'Review', text: 'Whichever side reaches the quorum first decides. Quality problems get the bond back; plagiarism, fake licenses and malicious code forfeit it.' },
              { title: 'Govern', text: 'Delegate your MOTIF to make and vote on proposals in [Community → Governance](/en/community/governance).' },
            ],
          },
          { type: 'p', text: 'Try it locally: `pnpm dev:chain` starts a local chain and imports the items; connect a wallet and claim test tokens. The contract design is in `docs/decisions/0005-decentralized-community.md`.' },
          { type: 'command', text: 'pnpm dev:chain' },
        ],
      },
      {
        id: 'contribute',
        title: 'Contributing',
        blocks: [
          { type: 'p', text: `The repository is public on [GitHub](${REPO_URL}). Local development needs Node 22 and pnpm:` },
          { type: 'command', text: 'pnpm install && pnpm dev' },
          { type: 'p', text: `\`pnpm dev\` starts the site and the preview sandbox; run \`pnpm verify\` before you commit. How to write a new item and the quality bar are in [Writing market items](${AUTHORING}) (in Chinese).` },
        ],
      },
    ],
  },
}
