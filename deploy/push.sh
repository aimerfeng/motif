#!/usr/bin/env bash
# 把本地工作区部署到服务器：打包源码（按 .gitignore 排除依赖、产物和 .env）→ 上传 → 在服务器上构建镜像并重启。
#   deploy/push.sh root@<IP>
# 服务器上的 /opt/motif/.env 不在源码目录里，不会被覆盖。第一次部署前先跑 deploy/setup-server.sh。
# 部署的是本地工作区的当前内容（包括还没提交的改动）。
set -euo pipefail
TARGET=${1:?usage: deploy/push.sh user@host}
cd "$(dirname "$0")/.."
SSH=(ssh -o StrictHostKeyChecking=accept-new)
[ -n "${MOTIF_SSH_KEY:-}" ] && SSH+=(-i "$MOTIF_SSH_KEY")

# 已跟踪的文件加上没被忽略的新文件；工作区里删掉了的跳过。
git ls-files --cached --others --exclude-standard -z | while IFS= read -r -d '' file; do [ -e "$file" ] && printf '%s\0' "$file"; done > .deploy-files
tar -czf - --null -T .deploy-files | "${SSH[@]}" "$TARGET" '
  set -e
  rm -rf /opt/motif/src.new && mkdir -p /opt/motif/src.new
  tar -xzf - -C /opt/motif/src.new
  rm -rf /opt/motif/src.old
  if [ -d /opt/motif/src ]; then mv /opt/motif/src /opt/motif/src.old; fi
  mv /opt/motif/src.new /opt/motif/src
  chmod +x /opt/motif/src/deploy/*.sh'
rm -f .deploy-files

"${SSH[@]}" "$TARGET" '
  set -e
  test -f /opt/motif/.env || { echo "missing /opt/motif/.env (copy deploy/.env.example)"; exit 1; }
  cd /opt/motif/src/deploy
  docker compose --env-file /opt/motif/.env up -d --build --remove-orphans
  docker image prune -f >/dev/null
  docker compose --env-file /opt/motif/.env ps'
