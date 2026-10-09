#!/usr/bin/env bash
# 备份社区数据卷（投稿源码、审核意见、资料；链上只有它们的哈希，丢了找不回来），保留最近 14 份。
# setup-server.sh 装的定时任务每天 03:30 运行；deploy/pull-backups.sh 把它们拉回本地，留一份在服务器之外。
set -euo pipefail
DEST=/opt/motif/backups
mkdir -p "$DEST"
STAMP=$(date +%Y%m%d-%H%M%S)
# 用站点镜像自带的 tar，不必再拉别的镜像。
docker run --rm --entrypoint tar -v motif_community-data:/data:ro -v "$DEST":/backup motif:latest -czf "/backup/community-$STAMP.tar.gz" -C /data .
ls -1t "$DEST"/community-*.tar.gz | tail -n +15 | xargs -r rm --
echo "backup written: $DEST/community-$STAMP.tar.gz"
