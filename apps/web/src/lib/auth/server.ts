import { NodeSqliteDialect } from '@better-auth/kysely-adapter/node-sqlite-dialect'
import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { getMigrations } from 'better-auth/db/migration'
import { HttpError } from '@/lib/community/http'
import { db, migrateOwnTables } from '@/lib/db'
import { actionMail, mailAvailable, sendMail } from '@/lib/mail'
import { SITE_URL } from '@/lib/site'
import { onGitHubLinked, onUserCreated, onUserUpdated, type HookUser } from './hooks'

/*
 * 登录（docs/decisions/0009-accounts-credits-repos.md）：Better Auth，GitHub 和邮箱密码两种方式，数据在站点的 SQLite 里。
 *
 * 不开 Better Auth 的事务：它的事务跨越 await，而积分、仓库的写操作是同步的、和它共用一个连接，
 * 跨 await 的事务会把别的请求的语句也卷进去。关掉以后它的每条语句各自提交，我们自己的写操作各自在同步事务里。
 */

const DEV_SECRET = 'motif-dev-secret-do-not-use-in-production-0000'

function authSecret(): string {
  const secret = process.env.MOTIF_AUTH_SECRET
  if (secret && secret.length >= 32) return secret
  if (process.env.NODE_ENV === 'production') throw new Error('MOTIF_AUTH_SECRET must be set (32+ random characters) in production; generate one with `openssl rand -base64 48`')
  return DEV_SECRET
}

/** GitHub OAuth App 配好了没有。没配置时登录页不显示 GitHub 按钮。 */
export function githubConfigured(): boolean {
  return Boolean(process.env.MOTIF_GITHUB_CLIENT_ID && process.env.MOTIF_GITHUB_CLIENT_SECRET)
}

const verificationMail = (to: string, url: string) =>
  actionMail({
    to,
    subject: { zh: '验证你的邮箱', en: 'Verify your email' },
    intro: { zh: '欢迎来到 Motif。点下面的按钮验证邮箱，完成注册。', en: 'Welcome to Motif. Confirm your email address to finish signing up.' },
    action: { zh: '验证邮箱', en: 'Verify email' },
    url,
    outro: { zh: '链接 24 小时内有效。不是你本人注册的话，忽略这封邮件即可。', en: 'The link expires in 24 hours. If you did not sign up, you can ignore this email.' },
  })

const resetMail = (to: string, url: string) =>
  actionMail({
    to,
    subject: { zh: '重置密码', en: 'Reset your password' },
    intro: { zh: '有人（希望是你）请求重置 Motif 账号的密码。', en: 'Someone (hopefully you) asked to reset the password of your Motif account.' },
    action: { zh: '设置新密码', en: 'Choose a new password' },
    url,
    outro: { zh: '链接 1 小时内有效。没有请求过的话忽略即可，密码不会改变。', en: 'The link expires in 1 hour. If you did not ask for this, ignore this email and your password stays the same.' },
  })

function options(): BetterAuthOptions {
  const github = githubConfigured() ? { clientId: process.env.MOTIF_GITHUB_CLIENT_ID!, clientSecret: process.env.MOTIF_GITHUB_CLIENT_SECRET! } : null
  return {
    appName: 'Motif',
    baseURL: SITE_URL,
    basePath: '/api/auth',
    secret: authSecret(),
    database: { dialect: new NodeSqliteDialect({ database: db() }), type: 'sqlite', transaction: false },
    telemetry: { enabled: false },
    trustedOrigins: [new URL(SITE_URL).origin],
    user: {
      // GitHub 用户名：生成主页地址、显示「已关联 GitHub」都要用。只能由登录流程写入。
      additionalFields: { githubLogin: { type: 'string', required: false, input: false } },
    },
    emailAndPassword: {
      enabled: mailAvailable(),
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 3600,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => sendMail(resetMail(user.email, url)),
    },
    emailVerification: {
      sendOnSignUp: true,
      // 没验证就来登录：重新发一封，免得人卡在「请先验证邮箱」却找不到邮件。
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 86_400,
      sendVerificationEmail: async ({ user, url }) => sendMail(verificationMail(user.email, url)),
    },
    socialProviders: github ? { github: { ...github, mapProfileToUser: (profile) => ({ githubLogin: profile.login }) } } : {},
    account: {
      // 同一个邮箱的两种登录方式合成一个账号：只在 GitHub 说这个邮箱验证过时（不设 trustedProviders，不跳过这个检查）。
      // 登录状态下在账号页主动关联 GitHub 可以是不同的邮箱（邮箱注册的用户大多和 GitHub 的邮箱不一样）。
      accountLinking: { enabled: true, allowDifferentEmails: true },
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: process.env.NODE_ENV === 'production',
      window: 60,
      max: 60,
      customRules: { '/sign-in/email': { window: 60, max: 8 }, '/sign-up/email': { window: 60, max: 5 }, '/request-password-reset': { window: 300, max: 3 }, '/send-verification-email': { window: 300, max: 3 } },
    },
    // Caddy 只写它亲眼看到的客户端地址，X-Forwarded-For 可信（见 deploy/Caddyfile）。
    advanced: { ipAddress: { ipAddressHeaders: ['x-forwarded-for'] }, useSecureCookies: SITE_URL.startsWith('https://') },
    databaseHooks: {
      user: {
        create: { after: async (user) => onUserCreated(user as HookUser) },
        update: { after: async (user) => onUserUpdated(user as HookUser) },
      },
      account: { create: { after: async (account) => onGitHubLinked(account) } },
    },
  }
}

function create(config: BetterAuthOptions) {
  return betterAuth(config)
}

type Auth = ReturnType<typeof create>

const holder = globalThis as { __motifAuth?: Auth; __motifAuthReady?: Promise<void> }

/** 第一次用到时才创建：构建时（next build）没有生产环境的密钥和数据卷。 */
export function auth(): Auth {
  holder.__motifAuth ??= create(options())
  return holder.__motifAuth
}

/** 数据库迁移：Better Auth 的表先建（我们的表引用 user），再迁移我们自己的表。每个进程只跑一次。 */
export function authReady(): Promise<void> {
  holder.__motifAuthReady ??= (async () => {
    const { runMigrations } = await getMigrations(options())
    await runMigrations()
    migrateOwnTables()
  })().catch((error: unknown) => {
    holder.__motifAuthReady = undefined
    throw error
  })
  return holder.__motifAuthReady
}

export interface SessionUser {
  id: string
  email: string
  name: string
  image: string | null
  emailVerified: boolean
  githubLogin: string | null
}

/** 请求带的登录会话；没登录是 null。 */
export async function sessionUser(headers: Headers): Promise<SessionUser | null> {
  await authReady()
  const session = await auth().api.getSession({ headers })
  if (!session) return null
  const user = session.user as typeof session.user & { githubLogin?: string | null }
  return { id: user.id, email: user.email, name: user.name, image: user.image ?? null, emailVerified: user.emailVerified, githubLogin: user.githubLogin ?? null }
}

/** 接口里要求登录：没登录就是 401。 */
export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await sessionUser(request.headers)
  if (!user) throw new HttpError(401, 'sign in first')
  return user
}

/** 管理员：MOTIF_ADMIN_EMAILS 里列出的、已经验证过的邮箱。 */
export function isAdmin(user: Pick<SessionUser, 'email' | 'emailVerified'>): boolean {
  if (!user.emailVerified) return false
  const admins = (process.env.MOTIF_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(user.email.toLowerCase())
}

export async function requireAdmin(request: Request): Promise<SessionUser> {
  const user = await requireUser(request)
  if (!isAdmin(user)) throw new HttpError(403, 'admins only')
  return user
}

/** 用户 GitHub 账号的访问令牌和已授权的范围；没关联 GitHub 是 null。 */
export async function githubToken(userId: string): Promise<{ token: string; scopes: string[] } | null> {
  await authReady()
  const row = db().prepare(`SELECT id, scope FROM account WHERE userId = ? AND providerId = 'github'`).get(userId) as { id: string; scope: string | null } | undefined
  if (!row) return null
  try {
    const { accessToken } = await auth().api.getAccessToken({ body: { accountId: row.id, userId } })
    if (!accessToken) return null
    return { token: accessToken, scopes: (row.scope ?? '').split(/[,\s]+/).filter(Boolean) }
  } catch {
    return null
  }
}
