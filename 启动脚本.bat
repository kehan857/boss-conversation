@echo off
chcp 65001 >nul
title AI文案改写工具 - 本地服务器

echo.
echo ========================================
echo 🚀 AI文案改写工具 - 本地服务器启动器
echo ========================================
echo.

echo 📋 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Python，请先安装Python 3.6+
    echo 💡 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python环境正常
echo.

echo 🚀 启动本地服务器...
echo 💡 服务器启动后会自动打开浏览器
echo 💡 按 Ctrl+C 可以停止服务器
echo.

python "启动本地服务器.py"

echo.
echo 🛑 服务器已停止
pause 