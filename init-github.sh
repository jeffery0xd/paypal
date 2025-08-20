#!/bin/bash

# GitHub 初始化和部署脚本
echo "🚀 开始初始化 GitHub 仓库..."

# 初始化 Git 仓库
git init

# 添加 .gitignore 文件内容
echo "node_modules/
.env
.env.local
.env.production
.DS_Store
dist/
*.log" > .gitignore

# 添加所有文件
git add .

# 创建初始提交
git commit -m "🎉 Initial commit: Mexico E-commerce Site with Cloudflare Pages optimization"

echo "✅ Git 仓库初始化完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 在 GitHub 上创建新仓库"
echo "2. 运行以下命令连接远程仓库："
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 前往 Cloudflare Pages 连接该仓库进行部署"
echo "🎯 管理员密码: 19961015"