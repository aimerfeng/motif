# Motif 站点与预览沙箱的部署镜像：同一个镜像，compose 里分成 web 和 preview 两个容器运行。
# 站点运行时要读仓库里的文件（catalog.json、skills/、sources.json、编译子进程的源码、合约部署记录），
# 所以镜像里保留完整的工作区，不做 Next 的 standalone 裁剪。
FROM node:24-bookworm-slim

ENV CI=true NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.4.1
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# 预览沙箱的公开地址会写进站点的客户端代码，必须在构建时给出。
ARG NEXT_PUBLIC_MOTIF_PREVIEW_URL
ENV NEXT_PUBLIC_MOTIF_PREVIEW_URL=${NEXT_PUBLIC_MOTIF_PREVIEW_URL}
RUN test -n "$NEXT_PUBLIC_MOTIF_PREVIEW_URL" && pnpm build

ENV NODE_ENV=production
