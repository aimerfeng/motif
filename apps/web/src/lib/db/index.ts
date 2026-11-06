import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { MIGRATIONS } from './migrations'

/*
 * 站点的数据库：一个 SQLite 文件（docs/decisions/0009-accounts-credits-repos.md）。
 * 账号（Better Auth 的表）、积分、API 密钥和用户仓库都在这里。只有站点进程一个写者。
 * 生产环境放在数据卷里（MOTIF_DB_PATH），默认仓库根目录下的 .data/motif.sqlite（不进版本库）。
 */

export const DB_PATH = process.env.MOTIF_DB_PATH ?? path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', '.data/motif.sqlite')

const holder = globalThis as { __motifDb?: DatabaseSync }

/** 打开（第一次时创建并迁移）数据库。挂在 globalThis 上：开发时热更新不会打开第二个连接。 */
export function db(): DatabaseSync {
  if (holder.__motifDb) return holder.__motifDb
  mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const database = new DatabaseSync(DB_PATH)
  // WAL：读不挡写；busy_timeout：备份脚本读的时候写操作等一会儿，而不是立刻报错。
  database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;')
  holder.__motifDb = database
  return database
}

/**
 * 我们自己的表（积分、仓库……）按 user_version 顺序迁移。它们引用 Better Auth 的 user 表，
 * 所以要在 Better Auth 迁移之后跑：由 lib/auth/server.ts 的 ready() 统一安排。
 */
export function migrateOwnTables(database: DatabaseSync = db()): void {
  const current = (database.prepare('PRAGMA user_version').get() as { user_version: number }).user_version
  for (let version = current; version < MIGRATIONS.length; version++) {
    transaction(() => {
      database.exec(MIGRATIONS[version]!)
      database.exec(`PRAGMA user_version = ${version + 1}`)
    }, database)
  }
}

/**
 * 在事务里执行。node:sqlite 是同步的，事务里不会穿插别的请求的语句；
 * 嵌套调用时只有最外层开事务（SQLite 不支持嵌套 BEGIN）。
 */
export function transaction<T>(work: () => T, database: DatabaseSync = db()): T {
  if (database.isTransaction) return work()
  database.exec('BEGIN IMMEDIATE')
  try {
    const result = work()
    database.exec('COMMIT')
    return result
  } catch (error) {
    database.exec('ROLLBACK')
    throw error
  }
}

type Params = SQLInputValue[]

/*
 * 查询结果：node:sqlite 返回的行是没有原型的对象，传给客户端组件时 React 不认，统一复制成普通对象。
 * 行的类型由调用方声明（SQLite 不会帮我们检查）。
 */
export function one<Row>(sql: string, ...params: Params): Row | undefined {
  const row = db().prepare(sql).get(...params)
  return row ? ({ ...row } as Row) : undefined
}

export function all<Row>(sql: string, ...params: Params): Row[] {
  return db()
    .prepare(sql)
    .all(...params)
    .map((row) => ({ ...row }) as Row)
}

export function run(sql: string, ...params: Params): { changes: number; lastInsertRowid: number | bigint } {
  const result = db().prepare(sql).run(...params)
  return { changes: Number(result.changes), lastInsertRowid: result.lastInsertRowid }
}
