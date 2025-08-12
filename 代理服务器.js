/**
 * Node.js 代理服务器
 * 解决FastGPT API的CORS问题
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 代理FastGPT API请求
app.use('/api', createProxyMiddleware({
    target: 'https://api.fastgpt.in',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 代理请求: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ 代理响应: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error(`❌ 代理错误: ${err.message}`);
        res.status(500).json({ error: '代理服务器错误' });
    }
}));

// 主页路由
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI文案改写工具</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .container { max-width: 800px; margin: 0 auto; }
                .link { display: block; margin: 10px 0; padding: 15px; 
                        background: #4f46e5; color: white; text-decoration: none; 
                        border-radius: 8px; text-align: center; }
                .link:hover { background: #3730a3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 AI文案改写工具</h1>
                <p>选择您要使用的版本：</p>
                <a href="/文案改写工具-增强版.html" class="link">📄 增强版（推荐）</a>
                <a href="/文案改写工具.html" class="link">📄 基础版</a>
                <p style="margin-top: 30px; color: #666;">
                    💡 提示：此页面通过代理服务器访问FastGPT API，解决了CORS问题
                </p>
            </div>
        </body>
        </html>
    `);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 代理服务器已启动`);
    console.log(`📁 服务目录: ${__dirname}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📄 文案改写工具: http://localhost:${PORT}/文案改写工具-增强版.html`);
    console.log(`📄 基础版本: http://localhost:${PORT}/文案改写工具.html`);
    console.log(`\n💡 使用说明:`);
    console.log(`1. 在浏览器中访问上述地址`);
    console.log(`2. 输入文案信息并点击改写`);
    console.log(`3. 按 Ctrl+C 停止服务器`);
    console.log(`\n` + "=".repeat(50));
});

// 错误处理
process.on('uncaughtException', (err) => {
    console.error('❌ 未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
});

console.log(`
📦 依赖安装说明：
如果遇到模块未找到的错误，请先安装依赖：

npm init -y
npm install express cors http-proxy-middleware

或者使用yarn：
yarn init -y
yarn add express cors http-proxy-middleware
`); 