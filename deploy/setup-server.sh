#!/usr/bin/env bash
# 新服务器（Ubuntu 24.04）的一次性初始化：Docker、防火墙、交换空间、每日备份。以 root 在服务器上运行：
#   ssh root@<IP> 'bash -s' < deploy/setup-server.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y docker.io docker-compose-v2 ufw
systemctl enable --now docker

# 构建站点峰值要 3–4G 内存；小内存机器加 4G 交换空间，免得构建时被 OOM 杀掉。
if ! swapon --show | grep -q '^/swapfile'; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 只开放 SSH 和网页端口；站点和沙箱的容器端口不对外，只经过 Caddy。
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

mkdir -p /opt/motif/backups
echo '30 3 * * * root /opt/motif/src/deploy/backup.sh >> /var/log/motif-backup.log 2>&1' > /etc/cron.d/motif-backup
echo "server ready; next: create /opt/motif/.env from deploy/.env.example, then run deploy/push.sh from your machine"
