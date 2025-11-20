# 使用 Node.js 官方镜像
FROM node:20-alpine

# 安装 ffmpeg（用于处理多媒体文件）
RUN apk add --no-cache ffmpeg

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建 TypeScript
RUN pnpm run build

# 暴露端口（仅用于 Docker 内部网络）
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main.js"]
