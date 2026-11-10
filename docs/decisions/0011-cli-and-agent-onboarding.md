# 0011 命令行和 agent 接入

- 状态：已上线（2026-11-10）。
- 用户的要求（2026-11-09）：制作 MCP 和 CLI 服务，让 agent 接入更方便。

## 背景

0008 做了给 agent 的商店（`/mcp`、`/api/agent/<工具>`），0009 加了 API 密钥。接入的步骤是：登录网站 → 建密钥 → 复制 → 把一条带密钥的 `claude mcp add --transport http … --header "Authorization: Bearer …"` 贴进终端。问题：

- 只有 Claude Code 有现成的命令；Cursor、Codex、Gemini CLI、VS Code 各有各的配置文件和写法，用户要自己查。
- 密钥明文写进 agent 的配置文件，项目级的配置（`.mcp.json`、`.cursor/mcp.json`）还会被提交进仓库。
- 不是每个 agent 都能给 HTTP 的 MCP 服务配请求头。
- 不用 agent 的人（脚本、CI）只能自己拼 HTTP 请求。

## 决定

### 1. 一个命令行：`motif`（`packages/cli`）

- 一条命令完成接入：`npx -y <站点>/cli/motif-<版本>.tgz setup`。它找出这台机器上装了哪些 agent，给每个加上 Motif 的 MCP 服务，然后带用户在浏览器里登录。
- 其余命令是同一套商店工具的命令行形式（`search`、`info`、`preview`、`add`、`custom`、`order`、`skills`、`skill`、`whoami`），外加 `tools` / `call <工具> [json]` 直接调任意工具。命令只是把参数整理成工具的输入再调 `/api/agent/<工具>`，不另写一套逻辑：工具仍然只在 `apps/web/src/lib/store/tools.ts` 定义一次。
- `motif add <slug>` 把订单里的文件写进项目（已有的文件不覆盖，除非 `--overwrite`），而不是只打印安装命令：命令行的用户要的就是文件落地。`--dry-run` 不花积分：代码要下单才给，所以没买过的条目只报价，买过的（再下单不扣）才列出会写哪些文件。
- 只用 Node 18 就有的东西（`fetch`、`util.parseArgs`），打成**一个没有依赖的文件**，不压缩：用户 `npx` 之前能读懂自己要运行的是什么。

### 2. 站点自己分发 CLI，不经过 npm

- `/cli/motif.mjs` 是那一个文件，`/cli/motif-<版本>.tgz` 是 npm 能装的包（里面只有 `package.json` 和这个文件）。
- 为什么不发到 npm：用户在国内，npm 官方源不稳（原则 4：不依赖外部服务）；而且 CLI 和它对接的接口总是同一次部署出来的，不会出现「CLI 比站点新」的组合。
- 包是请求时拼出来的（自己写 ustar，两个文件不值得加依赖），因为里面要写站点的地址，而同一个镜像可以挂在不同域名下。CLI 源码里的占位符 `__MOTIF_ORIGIN__` 在分发时换成请求的来源：从哪个站点下载的 CLI，默认就连哪个站点。
- 地址里带版本号：npx 按地址缓存非 registry 的包，地址不变就一直用旧的。路由不看版本号，总是给当前这一版，所以写进 agent 配置里的旧地址不会失效（只是继续用缓存里的旧版）。
- 取舍：`npx <tgz 地址>` 每次冷启动要下载一次（几十 KB），比 registry 包没有优势也没有劣势；想快的人 `npm install -g <地址>`。

### 3. 登录：设备确认，密钥不出本机

- CLI 在本机生成密钥（格式和网页上建的一样，`mk_` + 32 个随机字节），只把 **SHA-256 和前 10 个字符**交给 `POST /api/cli/login`，拿回一个请求 id 和 8 位确认码。
- 用户在浏览器里打开 `/connect?code=…`（已登录；没登录先登录再回来），核对设备名和确认码，点同意。站点这时才把那个哈希登记成这个用户的一个 API 密钥（`adoptKey`）。CLI 每 2 秒轮询 `GET /api/cli/login/<id>`，看到同意后把明文密钥写进 `~/.motif/config.json`（按站点地址分开存）。
- 为什么不是站点生成密钥再传给 CLI：那样明文要在网络上走一趟，轮询接口也成了能取走密钥的地方。现在站点从头到尾只见过哈希，轮询接口只回状态。
- 请求十分钟过期；确认码的字母表去掉了易混的字符和元音；发起登录的接口按 IP 限流。请求 id（24 个随机字节）只有发起的 CLI 知道，确认码只用来给人核对，拿到确认码不能读出任何东西。
- 确认页写明「只在你自己刚运行了命令时才同意」：这类流程的风险是别人把他的确认链接发给你，你点了同意，他的 CLI 就用上了你的账号。页面上显示设备名和密钥前缀，供对照终端里的输出。
- `MOTIF_API_KEY` 环境变量优先于配置文件：CI 里不能开浏览器，用网页上建的密钥。
- CLI 只接受 https 的站点地址（本机开发除外）：密钥不能明文走公网。

### 4. agent 那边配的是 stdio 服务，配置里没有密钥

- `setup` 写进各个 agent 的是 `npx -y <包地址> mcp`（Windows 上包一层 `cmd /c`）。`motif mcp` 把站点的 `/mcp`（无状态的 Streamable HTTP）接成 stdio：一条消息一个请求，带上本机配置里的密钥。
- 这样密钥只在 `~/.motif/config.json`，agent 的配置文件可以放心提交；每个 agent 都支持 stdio，不用管它能不能配请求头。
- 没登录也能用：搜索、详情、预览、报价不要密钥。要密钥的工具在没有密钥时返回的错误里直接写着该运行哪条命令，agent 可以转告用户。
- 远程的 `/mcp` 和带密钥的 HTTP 写法保留，给不能运行本地命令的托管 agent 用，在接入页上排在后面。

### 5. 各个 agent 的配置写法只有一张表

- `packages/cli/src/clients.ts`：每个 agent 的名字、怎么判断装没装、配置写在哪、是合并 JSON / TOML 还是执行它自己的命令。纯函数，文件系统和环境都从参数传进来。
- `motif setup` 用它来写配置；站点的接入页（`/agents`）用同一张表生成「手动配置」的片段（`apps/web/src/lib/agent-clients.ts`，路径用 `~`、`%USERPROFILE%` 占位）；文档和 `llms.txt` 里的 agent 名单也从它来。页面上的说明和命令行实际做的事不会对不上。
- 合并配置时只动 `motif` 这一项，其余原样保留；文件解析不了就不写，告诉用户手动加。

### 6. 接入页 `/agents`

- 导航里加一项。页面从上到下：那一条命令（绝大多数人只需要它）→ 按 agent 的自动 / 手动说明（按浏览器猜系统，可切换）→ 能用的工具和是否收费 → 远程 MCP 和 HTTP 接口 → 命令行。
- 首页的 agent 区块、文档的 MCP 一节、API 密钥页、`llms.txt` 都改成先给这条命令，再指向这一页。

### 7. MCP 和 HTTP 接口的改动

- 工具带上 MCP 的标注（`readOnlyHint` 等）：只读的工具 agent 可以不经确认就调用。
- 只读的工具可以用 `GET /api/agent/<工具>?…` 调（查询参数按工具的 schema 转成输入），方便在浏览器和 `curl` 里试；会扣积分的工具仍然只接受 POST。**密钥永远在请求头里，不进地址。**
- `/api/agent` 的工具清单带 JSON Schema，CLI 的 `tools` 和 `call` 直接用它。

### 8. 站点地址要在构建时给出

- 首页、条目页、文档、接入页、sitemap 是构建时预渲染的，里面的 canonical、分享卡片、安装命令都带着 `MOTIF_SITE_URL`。之前它只是运行时的环境变量，构建时没有，这些页面里全是 `http://localhost:3000`（线上实测确认）。
- 现在 `deploy/Dockerfile` 把它作为构建参数，`deploy/compose.yaml` 从 `SITE_HOST` 传进去；没给就构建失败，而不是悄悄带着 localhost 上线。

## 不做

- 不发布到 npm、不做自动更新：重新运行 `setup`（或重装）就是更新。
- 不做 OAuth 2.1 的 MCP 授权（动态客户端注册那一套）：设备确认加 stdio 已经覆盖了本机的 agent；托管 agent 用密钥。等有 agent 平台只支持 OAuth 时再做。
- CLI 不做交互式界面（选择列表、进度动画）：它的主要用户是 agent 和脚本，输出是纯文本和 `--json`。

## 风险

- `npx <地址>` 运行的是站点当时给的代码，没有 registry 的完整性校验。缓解：只有一个不压缩的文件，`/cli/motif.mjs` 可以直接读；只走 https。
- agent 的配置文件位置和格式会变（尤其是 VS Code 和 Windsurf）。只有一张表要改，测试里每个 agent 都有预期输出。
