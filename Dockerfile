# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码和配置文件
COPY src/ ./src/
COPY tsconfig.json ./
COPY .env.example ./

# 编译 TypeScript 到 JavaScript
RUN npm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

# 设置文件权限
RUN chown -R mcp:nodejs /app
USER mcp

# 暴露端口（如果需要）
# EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]