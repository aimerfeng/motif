/**
 * 商店的价格（docs/decisions/0008-agent-store.md）。
 * - 统一以 USDC 定价，金额用十进制字符串（最多 6 位小数，和 USDC 的精度一致），不用浮点数。
 * - 用 MOTIF 付款时按汇率折算再打折。
 * - 开源条目免费；定制单的价格由环境变量设定，第一阶段默认 0；社区作品的定价第二阶段做，现在也是 0。
 */

export type Currency = 'USDC' | 'MOTIF'

export interface Price {
  /** USDC 金额，十进制字符串。 */
  usdc: string
  /** 用 MOTIF 付款时的金额（已打折），十进制字符串。 */
  motif: string
  free: boolean
}

export interface PricingConfig {
  customUsdc: string
  motifPerUsdc: string
  /** 用 MOTIF 付款的折扣，0–1。 */
  motifDiscount: number
}

const DECIMALS = 6n
const SCALE = 10n ** DECIMALS

/** 十进制字符串 → 最小单位（6 位小数）。格式不对就抛错，配置错误要早发现。 */
export function toUnits(value: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(value.trim())
  if (!match) throw new Error(`not a non-negative decimal with at most 6 places: "${value}"`)
  return BigInt(match[1]!) * SCALE + BigInt((match[2] ?? '').padEnd(Number(DECIMALS), '0'))
}

/** 最小单位 → 十进制字符串，去掉末尾的 0（"1.500000" → "1.5"，"2.000000" → "2"）。 */
export function fromUnits(units: bigint): string {
  const whole = units / SCALE
  const fraction = (units % SCALE).toString().padStart(Number(DECIMALS), '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export function priceOf(usdc: string, config: PricingConfig): Price {
  const units = toUnits(usdc)
  const discount = BigInt(Math.round((1 - config.motifDiscount) * 1_000_000))
  const motifUnits = (units * toUnits(config.motifPerUsdc) * discount) / (SCALE * 1_000_000n)
  return { usdc: fromUnits(units), motif: fromUnits(motifUnits), free: units === 0n }
}

const DEFAULTS: PricingConfig = { customUsdc: '0', motifPerUsdc: '100', motifDiscount: 0.2 }
const warned = new Set<string>()

/** 配置写错时只报一次，然后用默认值：一个格式不对的环境变量不该让搜索、下单和 llms.txt 全部报错。 */
function fallback<T>(name: string, raw: string, value: T): T {
  if (!warned.has(name)) {
    warned.add(name)
    console.error(`[store] ${name}="${raw}" is not valid; using ${String(value)} instead`)
  }
  return value
}

function decimal(env: Record<string, string | undefined>, name: string, defaultValue: string): string {
  const raw = env[name]?.trim()
  // 空字符串当作没设置。
  if (!raw) return defaultValue
  try {
    toUnits(raw)
    return raw
  } catch {
    return fallback(name, raw, defaultValue)
  }
}

export function pricingFromEnv(env: Record<string, string | undefined> = process.env): PricingConfig {
  const rawDiscount = env.MOTIF_STORE_MOTIF_DISCOUNT?.trim()
  const discount = rawDiscount ? Number(rawDiscount) : DEFAULTS.motifDiscount
  return {
    customUsdc: decimal(env, 'MOTIF_STORE_CUSTOM_PRICE_USDC', DEFAULTS.customUsdc),
    motifPerUsdc: decimal(env, 'MOTIF_STORE_MOTIF_PER_USDC', DEFAULTS.motifPerUsdc),
    motifDiscount: Number.isFinite(discount) && discount >= 0 && discount < 1 ? discount : fallback('MOTIF_STORE_MOTIF_DISCOUNT', rawDiscount ?? '', DEFAULTS.motifDiscount),
  }
}

/** 现成条目的价格：目录里的开源条目免费；社区作品等作者定价上线前也免费。 */
export function itemPrice(config: PricingConfig): Price {
  return priceOf('0', config)
}

/** 定制单的价格。 */
export function customPrice(config: PricingConfig): Price {
  return priceOf(config.customUsdc, config)
}
