import { z } from 'zod'
import { HEX_COLOR } from './values.ts'

/** 界面文案都要有中英两份。 */
export const L10nSchema = z.object({ 'zh-CN': z.string().min(1), en: z.string().min(1) })
export type L10n = z.infer<typeof L10nSchema>

const KEY = /^[a-z][A-Za-z0-9]*$/

const ParamBase = {
  /** 组件的 prop 名，也是 defaults 对象的键。 */
  key: z.string().regex(KEY, 'param key must be camelCase'),
  label: L10nSchema,
  hint: L10nSchema.optional(),
  /** 调参面板里的分组。 */
  group: z.string().optional(),
}

const HexColor = z.string().regex(HEX_COLOR, 'colors are #rrggbb or #rrggbbaa')

// 默认值是否落在可调范围里由 checkParamValue（values.ts）在清单校验时统一检查。
export const ParamSpecSchema = z.discriminatedUnion('type', [
  z.object({
    ...ParamBase,
    type: z.literal('number'),
    default: z.number(),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    unit: z.enum(['px', 's', 'ms', 'deg', '%', 'x']).optional(),
    /** 推荐范围：超出后面板会提示「可能不好看」，agent 也会尽量待在这个范围里。 */
    safe: z.tuple([z.number(), z.number()]).optional(),
  }),
  z.object({ ...ParamBase, type: z.literal('color'), default: HexColor }),
  z.object({
    ...ParamBase,
    type: z.literal('palette'),
    default: z.array(HexColor).min(1),
    minItems: z.number().int().min(1),
    maxItems: z.number().int().min(1),
  }),
  z.object({
    ...ParamBase,
    type: z.literal('select'),
    default: z.string(),
    options: z.array(z.object({ value: z.string(), label: L10nSchema })).min(2),
  }),
  z.object({ ...ParamBase, type: z.literal('boolean'), default: z.boolean() }),
  z.object({ ...ParamBase, type: z.literal('text'), default: z.string(), maxLength: z.number().int().positive() }),
  z.object({
    ...ParamBase,
    type: z.literal('easing'),
    /** cubic-bezier 的四个控制点。 */
    default: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  }),
  z.object({
    ...ParamBase,
    type: z.literal('spring'),
    /** 用 motion 的 visualDuration + bounce 描述弹簧，比 stiffness/damping 更好调。 */
    default: z.object({ visualDuration: z.number(), bounce: z.number() }),
  }),
  z.object({
    ...ParamBase,
    type: z.literal('vec2'),
    default: z.tuple([z.number(), z.number()]),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
  }),
  z.object({ ...ParamBase, type: z.literal('seed'), default: z.number().int().min(0) }),
])

export type ParamSpec = z.infer<typeof ParamSpecSchema>
export type ParamType = ParamSpec['type']
