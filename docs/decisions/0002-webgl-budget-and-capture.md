# 0002 WebGL 上下文预算与截图 / 录屏

- 状态：已采纳（2026-09-29，P0 实测）
- 环境：Windows 11，Edge 154，RTX 5070，Playwright 1.63（`channel: 'msedge'`）

## 实测结果

| 项目 | 结果 |
| --- | --- |
| 同时存活的 WebGL 上下文 | **16**（webgl 与 webgl2 相同，有头 / 无头相同）。第 17 个创建时最早的一个触发 `webglcontextlost`，控制台警告 "Too many active WebGL contexts. Oldest context will be lost." |
| 无头模式的渲染器 | 默认就是真实 GPU：`ANGLE (NVIDIA … Direct3D11)`，不需要任何参数。只有 `--disable-gpu` 才会退到 SwiftShader |
| WebGL 画面截图 | `page.screenshot()` / `locator.screenshot()` 都能正确截到画布，与 `preserveDrawingBuffer` 无关。1280×720 下 `page.screenshot` 中位数约 31 ms，`locator.screenshot` 约 63 ms |
| 逐帧步进 | 手动设置 `u_time` 渲染一帧再截图：30 帧 1280×720 用 `page.screenshot` 约 1.1 s |
| 编码 | 系统没有 ffmpeg；`ffmpeg-static` 5.3（ffmpeg 6.1.1）可用。4 秒 30fps 640×400：VP9 webm 约 43 KB / 0.9 s，H.264 mp4 约 39 KB / 0.2 s |

## 决定

1. **画廊列表不放实时 WebGL**，只放循环视频和海报图；详情页最多保留 2 个实时预览 iframe。
2. 条目运行时统一处理 `webglcontextlost` / `webglcontextrestored`，卸载时释放上下文（three 用 `forceContextLoss()`）。
3. 缩略图和循环视频用 Playwright + Edge 无头生成：预览运行时支持固定时钟，逐帧步进，用 `page.screenshot({ clip })`（比 locator 截图快一倍），再用 `ffmpeg-static` 编码。`ffmpeg-static` 的安装脚本要在 `pnpm-workspace.yaml` 的 `allowBuilds` 里放行。
4. 没有 GPU 的机器（将来的 CI）会退到 SwiftShader，截图结果可能与本机不同；视觉基准以本机 GPU 生成的为准。
