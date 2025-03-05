#!/bin/bash
# 指定使用 bash 解释器执行此脚本

# 定义颜色变量，用于输出彩色文本，提高可读性
GREEN='\033[0;32m'  # 绿色，用于成功信息
BLUE='\033[0;34m'   # 蓝色，用于一般信息
RED='\033[0;31m'    # 红色，用于错误信息
NC='\033[0m'        # 无颜色，用于重置文本颜色

# 定义服务器信息，便于连接和操作远程服务器
SERVER_USER="root"                # 服务器用户名
SERVER_IP="47.122.119.171"        # 服务器 IP 地址
SERVER_PATH="/www/wwwroot/back-end" # 服务器上的项目路径

# 本地构建项目，生成生产环境代码
echo -e "${BLUE}Building the project...${NC}"  # 输出带颜色的提示信息
pnpm build  # 使用 pnpm 构建项目

# 创建必要的目录，确保服务器上有正确的目录结构
echo -e "${BLUE}Creating necessary directories...${NC}"
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH/nginx/conf.d && \
  mkdir -p $SERVER_PATH/nginx/ssl && \
  mkdir -p $SERVER_PATH/nginx/logs"
# 使用 SSH 连接服务器并执行命令
# mkdir -p 创建目录及其父目录（如果不存在）
# 创建 Nginx 配置、SSL 证书和日志目录

# 在上传之前，先移除服务器上的旧文件，但保留 public 文件夹和 nginx 目录
echo -e "${BLUE}Removing existing files on the server except public folder and nginx...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && find . -maxdepth 1 ! -name 'public' ! -name 'nginx' ! -name '.' -exec rm -rf {} +"
# cd $SERVER_PATH：切换到项目目录
# find . -maxdepth 1：只查找当前目录下的文件和目录（不递归）
# ! -name 'public' ! -name 'nginx' ! -name '.'：排除 public、nginx 目录和当前目录
# -exec rm -rf {} +：对匹配的文件执行删除操作

# 上传项目文件到服务器，排除不需要的文件和目录
echo -e "${BLUE}Uploading project files to the server...${NC}"
scp -r $(ls | grep -v 'node_modules' | grep -v 'dist' | grep -v 'public' | grep -v 'nginx') $SERVER_USER@$SERVER_IP:$SERVER_PATH
# ls：列出当前目录下的所有文件和目录
# grep -v：排除指定的文件和目录（node_modules、dist、public、nginx）
# scp -r：递归复制文件和目录到远程服务器

# 上传 Nginx 配置文件
echo -e "${BLUE}Uploading Nginx configuration...${NC}"
scp nginx.conf $SERVER_USER@$SERVER_IP:$SERVER_PATH/nginx/conf.d/default.conf
# 将本地的 nginx.conf 文件上传到服务器的 Nginx 配置目录，并命名为 default.conf

# 检查 Nginx 配置文件是否上传成功
ssh $SERVER_USER@$SERVER_IP "if [ -f $SERVER_PATH/nginx/conf.d/default.conf ]; then 
  echo -e '${GREEN}Nginx config uploaded successfully${NC}'; 
  cat $SERVER_PATH/nginx/conf.d/default.conf;  # 显示配置文件内容，便于检查
else 
  echo -e '${RED}Nginx config upload failed${NC}'; 
fi"
# 使用条件判断检查文件是否存在
# -f 检查是否为普通文件
# cat 命令显示文件内容

# 上传 SSL 证书（如果存在）
echo -e "${BLUE}Uploading SSL certificates...${NC}"
if [ -f "ssl/shuyikang.online.pem" ] && [ -f "ssl/shuyikang.online.key" ]; then
  # 检查本地证书文件是否存在
  scp ssl/shuyikang.online.pem $SERVER_USER@$SERVER_IP:$SERVER_PATH/nginx/ssl/shuyikang.online.pem
  scp ssl/shuyikang.online.key $SERVER_USER@$SERVER_IP:$SERVER_PATH/nginx/ssl/shuyikang.online.key
  # 上传 SSL 证书和私钥到服务器
  
  # 检查证书是否上传成功
  ssh $SERVER_USER@$SERVER_IP "if [ -f $SERVER_PATH/nginx/ssl/shuyikang.online.pem ] && [ -f $SERVER_PATH/nginx/ssl/shuyikang.online.key ]; then 
    echo -e '${GREEN}SSL certificates uploaded successfully${NC}'; 
  else 
    echo -e '${RED}SSL certificates upload failed${NC}'; 
  fi"
  # 使用条件判断检查证书文件是否成功上传
else
  echo -e "${RED}SSL certificates not found in local ssl directory${NC}"
  # 如果本地证书文件不存在，输出错误信息
fi

# 在服务器上运行 docker-compose
echo -e "${BLUE}Running docker-compose on the server...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && \
  docker-compose down && \
  docker rmi back-end-app:latest || true && \
  docker-compose up -d"
# cd $SERVER_PATH：切换到项目目录
# docker-compose down：停止并移除所有容器
# docker rmi back-end-app:latest || true：删除旧的应用镜像（如果存在），失败则继续执行
# docker-compose up -d：后台启动所有服务

# 检查容器是否正常运行
echo -e "${BLUE}Checking container status...${NC}"
ssh $SERVER_USER@$SERVER_IP "docker ps | grep graduation"
# docker ps：列出正在运行的容器
# grep graduation：过滤出包含 "graduation" 的容器

# 检查端口是否正常监听
echo -e "${BLUE}Checking port status...${NC}"
ssh $SERVER_USER@$SERVER_IP "netstat -tulpn | grep 3000"
# netstat -tulpn：列出所有 TCP/UDP 监听端口
# grep 3000：过滤出监听 3000 端口的进程

echo -e "${GREEN}Deployment completed successfully!${NC}"
# 输出部署成功的消息