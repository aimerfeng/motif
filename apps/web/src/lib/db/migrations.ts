/*
 * 我们自己的表，按版本顺序迁移（PRAGMA user_version）。已经发布的迁移不能改，只能往后加。
 * "user" 是 Better Auth 的用户表（id 是文本）；删用户时连带删掉他的一切。
 * 时间一律是毫秒时间戳（INTEGER）。
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE profile (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    handle TEXT NOT NULL UNIQUE,
    github_login TEXT,
    bio TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE credit_balance (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );

  -- 每一笔变动。(user_id, kind, ref) 唯一：同一张订单只到账一次、同一个条目只解锁一次。ref 为空的（管理员调整）不受限制。
  CREATE TABLE credit_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    kind TEXT NOT NULL,
    ref TEXT,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX credit_ledger_once ON credit_ledger(user_id, kind, ref);
  CREATE INDEX credit_ledger_user ON credit_ledger(user_id, id DESC);

  CREATE TABLE credit_order (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    package_id TEXT NOT NULL,
    credits INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_ref TEXT,
    note TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    paid_at INTEGER
  );
  CREATE INDEX credit_order_user ON credit_order(user_id, created_at DESC);
  CREATE INDEX credit_order_status ON credit_order(status, created_at DESC);

  -- 解锁：花一次积分，这个条目（或 Skill）以后对这个用户永久免费。
  CREATE TABLE unlock (
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    target TEXT NOT NULL,
    credits INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, kind, target)
  );

  -- API 密钥只存 SHA-256；prefix 是明文的前几位，给用户认自己的密钥。
  CREATE TABLE api_key (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER,
    revoked_at INTEGER
  );
  CREATE INDEX api_key_user ON api_key(user_id);

  CREATE TABLE repo (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    visibility TEXT NOT NULL,
    source TEXT NOT NULL,
    source_ref TEXT,
    forked_from TEXT REFERENCES repo(id) ON DELETE SET NULL,
    github_repo TEXT,
    github_commit TEXT,
    pushed_repo TEXT,
    file_count INTEGER NOT NULL DEFAULT 0,
    total_bytes INTEGER NOT NULL DEFAULT 0,
    fork_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE (owner_id, slug)
  );
  CREATE INDEX repo_public ON repo(visibility, updated_at DESC);

  CREATE TABLE repo_file (
    repo_id TEXT NOT NULL REFERENCES repo(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    size INTEGER NOT NULL,
    PRIMARY KEY (repo_id, path)
  );
  `,
  // 注册积分按（规范化的）邮箱只送一次，见 lib/credits/ledger.ts 的 bonusKey。
  `
  CREATE TABLE signup_bonus (
    email_key TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );
  `,
  // 排行榜的计数（docs/decisions/0010-motion-cursor-ranking.md）：每天每个条目每种事件一行。
  // seen 是去重表（同一访客同一天同一事件只算一次），只留两天；visitor 是每天换盐的哈希，还原不出 IP。
  `
  CREATE TABLE item_stat_daily (
    day TEXT NOT NULL,
    slug TEXT NOT NULL,
    event TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, slug, event)
  ) WITHOUT ROWID;

  CREATE TABLE item_stat_seen (
    day TEXT NOT NULL,
    slug TEXT NOT NULL,
    event TEXT NOT NULL,
    visitor TEXT NOT NULL,
    PRIMARY KEY (day, slug, event, visitor)
  ) WITHOUT ROWID;
  `,
]
