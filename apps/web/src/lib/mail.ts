import { createTransport, type Transporter } from 'nodemailer'

/*
 * 站点发的邮件（验证邮箱、重置密码）。SMTP 由环境变量配置，生产环境用 Spacemail（docs/decisions/0009-accounts-credits-repos.md）。
 * 没配置时：开发模式把邮件打印到终端，照样能走完注册流程；生产环境 mailConfigured() 为假，邮箱注册关闭。
 */

interface SmtpConfig {
  host: string
  port: number
  user: string
  password: string
  from: string
}

function smtpConfig(): SmtpConfig | null {
  const { MOTIF_SMTP_HOST: host, MOTIF_SMTP_USER: user, MOTIF_SMTP_PASSWORD: password } = process.env
  if (!host || !user || !password) return null
  const port = Number(process.env.MOTIF_SMTP_PORT) || 465
  return { host, port, user, password, from: process.env.MOTIF_MAIL_FROM || `Motif <${user}>` }
}

export function mailConfigured(): boolean {
  return smtpConfig() !== null
}

/** 能不能发邮件（或者在开发模式打印出来）：邮箱注册、找回密码都靠它。 */
export function mailAvailable(): boolean {
  return mailConfigured() || process.env.NODE_ENV !== 'production'
}

const holder = globalThis as { __motifMailer?: Transporter }

function transporter(config: SmtpConfig): Transporter {
  // 465 是隐式 TLS，587 是 STARTTLS；nodemailer 用 secure 区分。
  holder.__motifMailer ??= createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user, pass: config.password } })
  return holder.__motifMailer
}

export interface Mail {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendMail(mail: Mail): Promise<void> {
  const config = smtpConfig()
  if (!config) {
    if (process.env.NODE_ENV === 'production') throw new Error('mail is not configured (MOTIF_SMTP_*)')
    console.info(`[mail] (not sent: no SMTP configured)\n  to: ${mail.to}\n  subject: ${mail.subject}\n${mail.text.replace(/^/gm, '  ')}`)
    return
  }
  await transporter(config).sendMail({ from: config.from, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html })
}

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

/**
 * 一封带按钮的通知邮件。中英文都写上：发信时不知道收件人习惯哪种语言，两种都在最稳。
 * 样式全部内联（邮件客户端不认外部样式表），不引用任何外部图片。
 */
export function actionMail({ to, subject, intro, action, url, outro }: { to: string; subject: { zh: string; en: string }; intro: { zh: string; en: string }; action: { zh: string; en: string }; url: string; outro: { zh: string; en: string } }): Mail {
  const text = [intro.zh, url, outro.zh, '', '—', '', intro.en, url, outro.en, '', 'Motif 母题'].join('\n')
  const block = (lang: 'zh' | 'en') => `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1f1f23">${escape(intro[lang])}</p>
    <p style="margin:0 0 20px"><a href="${escape(url)}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#141416;color:#fafafa;text-decoration:none;font-size:14px;font-weight:600">${escape(action[lang])}</a></p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#6b6b73">${escape(outro[lang])}</p>`
  const html = `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px;border-radius:14px;background:#ffffff">
    <p style="margin:0 0 24px;font-size:17px;font-weight:700;color:#141416">Motif <span style="font-weight:400;color:#6b6b73">母题</span></p>
    ${block('zh')}
    <hr style="margin:28px 0;border:none;border-top:1px solid #e4e4e7">
    ${block('en')}
    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;word-break:break-all">${escape(url)}</p>
  </div></body></html>`
  return { to, subject: `${subject.zh} · ${subject.en}`, text, html }
}
