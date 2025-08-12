#!/bin/bash

# 设置UTF-8编码
export LANG=zh_CN.UTF-8

echo ""
echo "========================================"
echo "🚀 AI文案改写工具 - 本地服务器启动器"
echo "========================================"
echo ""

# 检查Python环境
echo "📋 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python 3.6+"
    echo "💡 Ubuntu/Debian: sudo apt install python3"
    echo "💡 CentOS/RHEL: sudo yum install python3"
    echo "💡 macOS: brew install python3"
    exit 1
fi

echo "✅ Python环境正常"
echo ""

# 检查端口是否被占用
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ 端口 $PORT 已被占用，尝试使用端口 $((PORT+1))"
    PORT=$((PORT+1))
fi

echo "🚀 启动本地服务器..."
echo "💡 服务器启动后会自动打开浏览器"
echo "💡 按 Ctrl+C 可以停止服务器"
echo ""

# 启动Python服务器
python3 "启动本地服务器.py"

echo ""
echo "🛑 服务器已停止" 