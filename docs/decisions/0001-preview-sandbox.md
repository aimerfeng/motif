# 0001 预览沙箱：不透明源 iframe + 预打包 vendor + import map

- 状态：已采纳（2026-09-29，P0 验证通过）
- 验证：`e2e/preview-sandbox.spec.ts`

## 决定

所有实时预览（市场条目、Studio 生成的代码）都在同一种沙箱里运行：

1. **iframe `sandbox="allow-scripts"`**，不加 `allow-same-origin`，文档的 origin 是 `null`，拿不到站点的 cookie、存储和 DOM。
2. **沙箱放在另一个 site**：开发时站点是 `localhost:3000`，沙箱是 `127.0.0.1:4100`。`localhost` 的不同端口算同一个 site，会共享渲染进程，沙箱里的死循环会拖住站点；换成 `127.0.0.1` 后是不同 site，进程隔离。生产环境要给沙箱一个独立的可注册域名。
3. **vendor 依赖一次性预打包**（`packages/vendor`）：react、react-dom、motion、three、paper shaders 等放进**同一次** esbuild 构建并开启 code splitting。同一个依赖图里 React 只有一份，每个入口文件只是再导出共享 chunk。CommonJS 包（react、react-dom）没有静态具名导出，构建时在 Node 里 `require` 一次枚举导出名，生成 `export const { … } = module`。
4. **import map** 把裸模块名映射到 `/vendor/*.js`。沙箱里的运行时、预编译条目、Studio 代码都把 vendor 设为 external，因此共用同一份实例。
5. **模块来源两种**：预编译条目用沙箱自己托管的 URL（`/items/...`，只允许同源）；Studio 代码以字符串传入，沙箱里转成 blob URL 再 `import()`。blob 模块同样受 import map 解析。
6. **CSP**（写在 `runtime.html` 的 meta 里）：`default-src 'none'`，脚本只允许自身源、内联 import map 和 blob；`connect-src` 只允许自身源，条目代码不能往外发数据。
7. **消息协议**（`apps/preview/src/protocol.ts`）：消息带协议版本和每次加载随机生成的 nonce。站点只收 `event.source === iframe.contentWindow` 且 nonce 匹配的消息；沙箱只收来自 `window.parent`、origin 等于 URL 里声明的 host origin 的消息，也只往这个 origin 回消息。站点每 2 秒心跳，5 秒没有回应就重建 iframe。
8. 沙箱的静态服务对所有响应加 `Access-Control-Allow-Origin: *`：不透明源加载模块脚本走 CORS，请求头是 `Origin: null`。

## 与计划的差异

计划里写的是用 Vite 做沙箱应用。实际改成 **esbuild + 一个很小的 Node 静态服务**（`apps/preview/scripts/serve.ts`）：沙箱运行时本身也必须通过 import map 使用同一份 React，而 Vite 会把运行时和它自己的 React 打在一起，破坏单实例。esbuild 的 watch 模式足够做开发时的增量构建。

## 实测

- 完整构建（vendor + 运行时 + 3 个实验条目）：约 160–270 ms。
- vendor 总计约 1.5 MB（未压缩）：three 742 KB、paper shaders 277 KB、react-dom/client 210 KB、motion/react 62 KB。
- e2e 覆盖：motion、three、paper shader、blob 代码都能挂载；hooks 正常（证明只有一份 React）；渲染错误回传给站点；`window.origin === 'null'`；WebGL 画面非空白；整页无控制台错误。
