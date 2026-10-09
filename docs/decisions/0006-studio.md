# 0006 工作台（Studio）：agent、工具与会话

- 状态：已实现（2026-10-09）
- 验证：
  - `packages/agent/test`：起点模板通过检查并能编译、工作区操作、参数延续规则、脚本运行器「改坏再修好」、AI SDK 运行器（`MockLanguageModelV4`）的工具循环和多轮历史；
  - `e2e/studio.spec.ts`：从市场条目进入工作台、agent 修复编译错误、调参、应用为默认值、shadcn 安装、手动保存出错与恢复、首页带着第一句话开始，并断言控制台没有错误；
  - `pnpm smoke:agent`（手动，调用模型）：本机 Claude CLI 从一句话完成三个条目，记录在 `.data/evals/`。
- 代码：`packages/agent`（工具、运行器、提示词）、`packages/agent-claude-cli`（开发期运行器）、`apps/web/src/lib/studio` 与 `apps/web/src/components/studio`（站点）

## 决定

### 1. 工作区就是 ItemSource，清单是虚拟文件 item.json

agent 用读写文件的方式改清单，不另设一组「改参数」「改预设」的工具。模型改 JSON 比组合一堆细粒度工具可靠，工具列表也短。
新文件写入时按扩展名自动登记进清单（`.tsx` → component、`.ts` → lib、`.css` → style、`.glsl` → shader）。

### 2. 工具只定义一次，每次改动都立刻返回检查结果

`packages/agent/src/tools.ts` 用 zod 定义名字、说明、输入和实现，三个运行器各自转换成自己 SDK 的格式。
`write_file`、`edit_file`、`delete_file` 会立即重新检查、编译，把问题列表交给模型。写入本身成功、但新版本编译不过或没通过检查时，工具结果也标为出错，模型和界面都能马上看到。
`edit_file` 要求 old_string 在文件里恰好出现一次。

### 3. 三个运行器，同一种事件

| 运行器 | 用途 | 续接状态 |
| --- | --- | --- |
| `ai-sdk`（`anthropic` / `openai-compatible`） | 生产：站点内置的 key | 历史消息（ModelMessage[]） |
| `claude-cli` | 开发：本机 Claude Code CLI，Sonnet 5.5 | CLI 的会话 id（`resume`） |
| `scripted` | e2e：按脚本回放工具调用，不调模型 | 无 |

它们都只产出 `AgentEvent`（文本增量、工具调用与结果、工作区变化、参数、用量、结束、错误）。站点把事件原样以 NDJSON 流给浏览器，同时并进对话记录。
会话换了运行器时不接上一家的状态。

### 4. 本机 CLI 运行器不经过 Next 打包

Agent SDK 是专有许可证（见 0003）。站点只在运行时用 Node 原生 `import()` 加载 `packages/agent-claude-cli/src/index.ts`，靠 Node 的类型擦除直接执行 TS 源码；站点对它没有静态依赖，构建产物里没有它。
生产环境不设 `MOTIF_AGENT_PROVIDER` 时 agent 关闭，开发模式默认用本机 CLI。

### 5. 会话是文件，id 就是凭证

每个会话一个 JSON 文件，存在 `.data/studio/sessions/`，部署时放在持久化卷里。会话里有条目、预览参数、对话记录、续接状态和用量。
id 是 12 位随机 base36（约 62 位熵）。没有列出全部会话的接口：浏览器自己记得开过哪些（localStorage）。
会话页不进搜索引擎。分享会话链接，就等于分享编辑权。

### 6. 预览状态由浏览器回报

沙箱是不透明源，服务端看不到预览。浏览器把每一版产物的挂载结果（成功、运行时错误、卡死）连同版本号报给服务端，agent 的 `check_preview` 在服务端等这个回报。
没有浏览器开着这个会话时立刻返回「不知道」，agent 只能依赖编译结果，smoke 脚本就是这种情况。
宿主读不到沙箱里的像素，所以不判断「画面是否空白」。

### 7. 参数延续规则

条目换版以后，用户没动过的参数（值等于旧默认值）跟着新默认值走，动过的保留，删掉的参数丢弃。agent 改默认值时预览会立刻变，用户调过的值也不会被冲掉。

### 8. agent 能看到画面：look_at_preview

服务端用无头浏览器打开预览沙箱的截图宿主 `capture.html`，也就是生成市场海报的那一个。用手动时钟逐帧推进到指定时刻（默认 0.8 秒和 2.5 秒）后截图，作为图片交给模型：AI SDK 用 `file-data` 内容块，Claude CLI 用 MCP 的 `image` 块。
截到的是确定的那一帧，所以 agent 能比较前后两版。

- 浏览器由 `MOTIF_CAPTURE_CHANNEL` 选择。开发模式默认用本机的 Edge（Windows）或 Chrome；生产环境不设就关闭，这时工具会告诉 agent「没有截图」。
- 浏览器常驻，每次截图开一个新的上下文。
- Playwright 不经过 Next 打包，运行时从工作区加载。
- OpenAI 兼容接口的工具结果只能放文字，中转站也不一定转换里面的图片，而 OpenAI 兼容的 provider 会把图片内容序列化成一大段 base64 文本。所以这类接口下：
  - 工具结果只写「截图在下一条消息里」；
  - 截图由 `prepareStep` 作为紧跟其后的一条用户消息发出（`modelRunner` 按 provider 自动选择）。

### 9. 站点的模型（2026-10-09）

生产用「字字动画算力平台」（OpenAI 兼容的中转站，`https://zizidonghua.com/v1`）：

- `MOTIF_AGENT_PROVIDER=openai-compatible`；
- 模型 `OmniC-5-standard`（Claude Opus 5 系列）。同平台的 `OmniC-5-light` 是 Sonnet 5 系列，单价相同。

配置写在 `apps/web/.env.local`，不进仓库。环境变量到模型的映射只有一份（`modelConfigFromEnv`），站点和 `pnpm smoke:agent` 共用。配了站点模型时，冒烟测试就用它，而不是本机 CLI。

### 10. 成本上限

用的是站点自己的 key，所以有三道闸：
- 每个会话的 token 上限 `MOTIF_AGENT_SESSION_TOKENS`，默认 60 万；
- 按 IP 的频率限制：每分钟运行 6 次、新建会话 10 次；
- 一个会话同一时间只跑一轮。

## 后续

- 多实例部署时，运行锁和预览回报要换成共享存储，现在只在进程内存里。
- 生产环境开启截图需要在镜像里装浏览器（Playwright 的 chromium 约 300 MB）；要不要装等部署时再定。
