#!/bin/bash

# 定义服务器信息
SERVER_USER="root"
SERVER_IP="47.122.119.171"
SERVER_PATH="/www/wwwroot/back-end"

# 本地构建项目
echo "Building the project..."
pnpm build

# 在上传之前，先移除服务器的文件
echo "Removing existing files on the server..."
ssh $SERVER_USER@$SERVER_IP "rm -rf $SERVER_PATH/*"


# 上传 dist 文件到服务器
echo "Uploading dist files to the server..."
scp -r dist $SERVER_USER@$SERVER_IP:$SERVER_PATH

# 上传其他项目文件到服务器，排除 node_modules
echo "Uploading other project files to the server..."
scp -r $(ls | grep -v 'node_modules' | grep -v 'dist') $SERVER_USER@$SERVER_IP:$SERVER_PATH

# 在服务器上运行 docker-compose
echo "Running docker-compose on the server..."
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker stop graduation_app && docker rm graduation_app && docker rmi back-end-app:latest && docker-compose up -d"

echo "Deployment completed."