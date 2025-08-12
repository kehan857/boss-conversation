@echo off
echo ===== FastGPT增强回复插件测试工具 =====

:: 检查是否安装了Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js版本: 
node -v

:: 安装依赖
echo 正在安装依赖...
call npm install

:: 启动代理服务器
echo 正在启动代理服务器...
echo 请在浏览器中访问: http://localhost:3000/enhanced_response_test.html
echo 按Ctrl+C可以停止服务器
echo.

:: 启动代理服务器
node proxy_server.js 