# 使用 Node.js 官方镜像
FROM node:20

# 设置工作目录
WORKDIR /back-end

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装生产环境依赖
RUN npm install -g pnpm && pnpm install

# 复制除了 node_modules 和 dist 外的所有文件
COPY . .

# 构建项目
RUN pnpm build

# 暴露应用程序端口
EXPOSE 3000

# 使用 node 启动编译后的应用程序
CMD ["node", "dist/src/main.js"]