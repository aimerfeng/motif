/*
 * 积分的价格表和套餐（docs/decisions/0009-accounts-credits-repos.md）。全站只在这里定义；
 * 页面、MCP 工具说明、llms.txt 都从这里读。环境变量可以改单价（运营时调价不用改代码），套餐要改代码。
 */

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (Number.isInteger(value) && value >= 0) return value
  console.error(`[credits] ${name}="${raw}" is not a non-negative integer; using ${fallback}`)
  return fallback
}

export interface CreditCosts {
  /** 注册赠送。 */
  signupBonus: number
  /** 解锁一个市场条目：网页下载完整项目、MCP 交付代码。 */
  unlockItem: number
  /** 解锁一个 Skill。 */
  unlockSkill: number
  /** 工作台：每 1000 个输入 / 输出 token。 */
  per1kInput: number
  per1kOutput: number
  /** 开始一轮工作台对话至少要有的余额。 */
  studioMinimum: number
  /** MCP 的定制单。 */
  customOrder: number
}

export function creditCosts(): CreditCosts {
  return {
    signupBonus: envInt('MOTIF_CREDITS_SIGNUP_BONUS', 200),
    unlockItem: envInt('MOTIF_CREDITS_UNLOCK_ITEM', 10),
    unlockSkill: envInt('MOTIF_CREDITS_UNLOCK_SKILL', 10),
    per1kInput: envInt('MOTIF_CREDITS_PER_1K_INPUT', 1),
    per1kOutput: envInt('MOTIF_CREDITS_PER_1K_OUTPUT', 5),
    studioMinimum: envInt('MOTIF_CREDITS_STUDIO_MINIMUM', 20),
    customOrder: envInt('MOTIF_CREDITS_CUSTOM_ORDER', 300),
  }
}

/** 一段用量折合多少积分。按累计用量算再取整，不按每一步取整（每步都向上取整会多收）。 */
export function tokenCost(usage: { inputTokens: number; outputTokens: number }, costs: CreditCosts = creditCosts()): number {
  return Math.ceil((usage.inputTokens * costs.per1kInput + usage.outputTokens * costs.per1kOutput) / 1000)
}

export type PackageId = 'trial' | 'standard' | 'pro' | 'studio'

export interface CreditPackage {
  id: PackageId
  credits: number
  /** 价格，人民币分。 */
  amount: number
  currency: 'CNY'
  /** 比体验套餐多送的比例（展示用），0–1。 */
  bonus: number
  featured?: boolean
}

export const PACKAGES: CreditPackage[] = [
  { id: 'trial', credits: 500, amount: 990, currency: 'CNY', bonus: 0 },
  { id: 'standard', credits: 2200, amount: 3900, currency: 'CNY', bonus: 0.1 },
  { id: 'pro', credits: 6000, amount: 9900, currency: 'CNY', bonus: 0.2, featured: true },
  { id: 'studio', credits: 20000, amount: 29900, currency: 'CNY', bonus: 0.33 },
]

export function packageById(id: string): CreditPackage | undefined {
  return PACKAGES.find((pack) => pack.id === id)
}

/** 付款和积分问题找谁（付款通道接入前，下单后把订单号发到这里）。 */
export function supportContact(): string | null {
  return process.env.MOTIF_SUPPORT_EMAIL?.trim() || null
}

/** ¥9.9、¥39：分 → 显示用的金额。 */
export function formatAmount(amount: number): string {
  const yuan = amount / 100
  return `¥${Number.isInteger(yuan) ? yuan : yuan.toFixed(2).replace(/0$/, '')}`
}
