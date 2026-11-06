import path from 'node:path'
import { defineConfig } from 'vitest/config'

// 测试里也认 tsconfig 的 @/ 别名（站点代码都这么导入）。
export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})
