import { defineConfig } from 'vitest/config'

// test/nodejs 是 Hardhat 的链上集成测试（hardhat test 跑），vitest 只跑不需要链的单元测试。
export default defineConfig({
  test: { include: ['test/unit/**/*.test.ts'] },
})
