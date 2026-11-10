import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { adminEmailCount, databaseBytes } from '@/lib/accounts/admin'
import { githubConfigured } from '@/lib/auth/server'
import { getPublishedItems } from '@/lib/catalog'
import { getCommunityConfig } from '@/lib/community/config'
import { mailConfigured } from '@/lib/mail'
import { captureAvailable } from '@/lib/studio/capture'
import { runnerConfig } from '@/lib/studio/runner'
import { FactList, formatBytes, StatusText } from './ui'

/** 出错也不能让整页挂掉：系统状态只是参考，查不到的那一项显示「—」。 */
async function safely<T>(work: () => Promise<T>): Promise<T | null> {
  try {
    return await work()
  } catch {
    return null
  }
}

/**
 * 系统状态：各项外部依赖配好了没有，加上几个量级数字。
 *
 * 这里只显示「开 / 关」和本来就公开的名字（工作台用的模型名在工作台页面上就有，链的名字和 id 是给钱包用的）。
 * 环境变量的值、SMTP 主机、RPC 地址、文件路径、管理员邮箱都不显示：后台页面也可能被截图、被投屏。
 */
export async function SystemHealth({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'admin.health' })
  const number = new Intl.NumberFormat(locale)
  const runner = runnerConfig()
  const mail = mailConfigured()
  // 链连不上时这一步最多等一秒半（lib/community/config.ts 里有超时，之后 15 秒内不再重试）。
  const [chain, items] = await Promise.all([safely(getCommunityConfig), safely(getPublishedItems)])
  const bytes = databaseBytes()

  const state = (on: boolean, onLabel: string, offLabel: string, offTone: 'pending' | 'muted' = 'muted') => <StatusText tone={on ? 'success' : offTone}>{on ? onLabel : offLabel}</StatusText>
  const rows: { label: string; value: ReactNode; detail?: string }[] = [
    // 生产环境没配邮件时邮箱注册是关着的，所以这一项关着要显眼一点。
    { label: t('mail'), value: state(mail, t('configured'), t('notConfigured'), 'pending'), detail: mail ? undefined : t('mailOff') },
    { label: t('github'), value: state(githubConfigured(), t('configured'), t('notConfigured')) },
    { label: t('runner'), value: state(runner !== null, t('on'), t('off')), detail: runner ? [runner.label, runner.vision ? t('vision') : null].filter(Boolean).join(' · ') : undefined },
    { label: t('capture'), value: state(captureAvailable(), t('on'), t('off')) },
    { label: t('chain'), value: state(chain !== null, t('on'), t('off')), detail: chain ? `${chain.chainName} · ${chain.chainId}` : undefined },
    { label: t('database'), value: bytes === null ? '—' : formatBytes(bytes) },
    { label: t('catalog'), value: items === null ? '—' : number.format(items.length) },
    { label: t('admins'), value: number.format(adminEmailCount()) },
  ]

  return <FactList rows={rows} />
}
