#!/usr/bin/env bash
# 备份社区数据卷（投稿源码、审核意见、资料；链上只有它们的哈希，丢了找不回来），保留最近 14 份。
# setup-server.sh 装的定时任务每天 03:30 运行；deploy/pull-backups.sh 把它们拉回本地，留一份在服务器之外。
set -euo pipefail
DEST=/opt/motif/backups
mkdir -p "$DEST"
STAMP=$(date +%Y%m%d-%H%M%S)
# 账号和积分的 SQLite 先做一份一致的快照（VACUUM INTO）：直接打包正在写的数据库文件可能拿到写了一半的状态。
docker compose -f /opt/motif/src/deploy/compose.yaml --env-file /opt/motif/.env exec -T web node -e '
  const { rmSync } = require("node:fs")
  const { DatabaseSync } = require("node:sqlite")
  rmSync("/data/db/snapshot.sqlite", { force: true })
  new DatabaseSync(process.env.MOTIF_DB_PATH).prepare("VACUUM INTO ?").run("/data/db/snapshot.sqlite")
' || echo "warning: could not snapshot the database; the archive has the live files only"
# 用站点镜像自带的 tar，不必再拉别的镜像。
docker run --rm --entrypoint tar -v motif_community-data:/data:ro -v "$DEST":/backup motif:latest -czf "/backup/community-$STAMP.tar.gz" -C /data .
ls -1t "$DEST"/community-*.tar.gz | tail -n +15 | xargs -r rm --
echo "backup written: $DEST/community-$STAMP.tar.gz"
