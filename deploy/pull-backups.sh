#!/usr/bin/env bash
# 把服务器上的社区数据备份拉回本地 .data/server-backups/（不进版本库）。
#   deploy/pull-backups.sh root@<IP>
set -euo pipefail
TARGET=${1:?usage: deploy/pull-backups.sh user@host}
cd "$(dirname "$0")/.."
mkdir -p .data/server-backups
OPTS=(-o StrictHostKeyChecking=accept-new)
[ -n "${MOTIF_SSH_KEY:-}" ] && OPTS+=(-i "$MOTIF_SSH_KEY")
scp "${OPTS[@]}" "$TARGET:/opt/motif/backups/community-*.tar.gz" .data/server-backups/
ls -1 .data/server-backups | tail -5
