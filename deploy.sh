#!/bin/bash

echo "🚀 营销智能体工作流测试页面 - GitHub Pages 部署脚本"
echo "================================================"

# 检查是否提供了GitHub用户名
if [ -z "$1" ]; then
    echo "❌ 错误: 请提供您的GitHub用户名"
    echo "📝 使用方法: ./deploy.sh YOUR_GITHUB_USERNAME"
    echo "📝 例如: ./deploy.sh zhangsan"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="marketing-ai-workflow-test"

echo "👤 GitHub用户名: $GITHUB_USERNAME"
echo "📦 仓库名称: $REPO_NAME"
echo ""

# 设置远程仓库
echo "🔗 设置远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "📤 推送代码到GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo "🌐 GitHub仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "📄 GitHub Pages URL: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
    echo ""
    echo "📋 接下来的步骤:"
    echo "1. 访问 https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. 点击 Settings 选项卡"
    echo "3. 向下滚动到 Pages 部分"
    echo "4. 在 Source 下选择 'Deploy from a branch'"
    echo "5. 选择 'main' 分支和 '/ (root)' 文件夹"
    echo "6. 点击 Save"
    echo "7. 等待几分钟后，访问: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
    echo ""
    echo "🎉 您的营销智能体测试页面将在几分钟后可以通过GitHub Pages访问！"
else
    echo ""
    echo "❌ 推送失败！"
    echo "🔍 可能的原因:"
    echo "1. GitHub仓库不存在，请先在GitHub上创建仓库"
    echo "2. 网络连接问题"
    echo "3. GitHub认证问题"
    echo ""
    echo "💡 解决方案:"
    echo "1. 确保已在GitHub上创建了名为 '$REPO_NAME' 的公开仓库"
    echo "2. 确保已配置GitHub认证（SSH密钥或个人访问令牌）"
fi 