// 不依赖 zod 的部分：浏览器里的代码（站点的客户端组件、@motif/export）只从这里导入，
// 避免把 zod 整个打进客户端包。清单的 zod 校验只在构建、审计和服务端用，走 '@motif/schema'。
export * from './values.ts'
export * from './taxonomy.ts'
export * from './defaults-region.ts'
export type { L10n, ParamSpec, ParamType } from './params.ts'
export type { ItemManifest, ItemSource, Preset, Provenance } from './manifest.ts'
