const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 添加JSON解析中间件
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('JSON解析错误:', e.message);
      res.status(400).send({ 
        success: false, 
        error: '无效的JSON格式',
        message: e.message
      });
      throw new Error('无效的JSON格式');
    }
  }
}));

// 执行插件逻辑的通用函数
async function executePlugin(pluginId, inputs, res) {
  try {
    console.log(`执行插件[${pluginId}], 收到输入:`, JSON.stringify(inputs).substring(0, 200) + '...');
    
    // 读取插件配置文件
    const pluginConfigPath = path.join(__dirname, `${pluginId}.json`);
    
    if (fs.existsSync(pluginConfigPath)) {
      try {
        // 直接读取文件内容并解析
        const pluginContent = fs.readFileSync(pluginConfigPath, 'utf8');
        const pluginConfig = JSON.parse(pluginContent);
        
        if (!pluginConfig.implementation || !pluginConfig.implementation.process || !pluginConfig.implementation.process.function) {
          throw new Error('插件配置不完整');
        }
        
        // 直接执行函数代码
        try {
          // 使用直接执行方式
          const functionCode = pluginConfig.implementation.process.function;
          console.log('准备执行插件函数:', functionCode.substring(0, 50) + '...');
          
          // 提取输入参数
          const userMessage = inputs.userMessage || '';
          const messageHistory = inputs.messageHistory || [];
          const lastMessageTime = inputs.lastMessageTime || 0;
          const messageThreshold = inputs.messageThreshold || 10;
          const timeThreshold = inputs.timeThreshold || 5000;
          const messageCount = inputs.messageCount || 0;
          
          // 创建一个包含所有变量的执行环境
          const evalString = `
            var userMessage = ${JSON.stringify(userMessage)};
            var messageHistory = ${JSON.stringify(messageHistory)};
            var lastMessageTime = ${lastMessageTime};
            var messageThreshold = ${messageThreshold};
            var timeThreshold = ${timeThreshold};
            var messageCount = ${messageCount};
            ${functionCode}
          `;
          
          // 执行代码
          const result = eval(evalString);
          
          // 验证返回结果是否为对象
          if (!result || typeof result !== 'object') {
            throw new Error('插件函数返回值不是对象');
          }
          
          console.log('插件处理结果:', JSON.stringify(result).substring(0, 200) + '...');
          
          res.json({
            success: true,
            outputs: result
          });
        } catch (execErr) {
          console.error('执行插件函数错误:', execErr);
          res.status(500).json({
            success: false,
            error: '执行插件函数错误',
            message: execErr.message,
            stack: execErr.stack
          });
        }
      } catch (parseErr) {
        console.error('解析插件配置错误:', parseErr);
        res.status(500).json({
          success: false,
          error: '解析插件配置错误',
          message: parseErr.message
        });
      }
    } else {
      console.error(`插件配置文件不存在: ${pluginConfigPath}`);
      res.status(404).json({
        success: false,
        error: '插件配置文件不存在',
        message: `找不到插件: ${pluginId}`
      });
    }
  } catch (err) {
    console.error('处理插件请求错误:', err);
    res.status(500).json({
      success: false,
      error: '处理插件请求错误',
      message: err.message,
      stack: err.stack
    });
  }
}

// 添加对/v1/plugin/多消息汇总插件/run格式请求的支持
app.post('/v1/plugin/:pluginId/run', (req, res) => {
  console.log('直接插件请求:', req.params.pluginId);
  executePlugin(req.params.pluginId, req.body, res);
});

// 插件处理路由
app.post('/api/v1/plugin/:pluginId/run', (req, res) => {
  console.log('插件请求:', req.params.pluginId);
  executePlugin(req.params.pluginId, req.body, res);
});

// 通用插件路由，支持通过pluginId指定插件
app.post('/api/v1/plugin/run', (req, res) => {
  console.log('通用插件请求:', req.body.pluginId);
  executePlugin(req.body.pluginId, req.body.inputs, res);
});

// 代理中间件配置
const apiProxy = createProxyMiddleware('/api', {
  target: 'https://api.fastgpt.in',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // 保持路径不变
  },
  onProxyReq: (proxyReq, req, res) => {
    // 传递所有头信息
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    // 如果 express.json 已经解析了 body，则需要手动写入到代理请求中
    if (req.body && Object.keys(req.body).length) {
      try {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      } catch (e) {
        console.error('写入代理请求体失败:', e.message);
      }
    }
    console.log('代理请求到:', req.method, req.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('代理响应:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.status(500).send({ error: '代理请求失败', message: err.message });
  }
});

// 使用代理中间件, 但排除插件路径
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/v1/plugin')) {
    next();
  } else {
    apiProxy(req, res, next);
  }
});

// 访问根路径时，重定向到新的对话页面，避免404误导
app.get('/', (req, res) => {
  res.redirect('/fastgpt_chat.html');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('应用错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器错误',
    message: err.message
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`请在浏览器中访问 http://localhost:${PORT}/multi_message_test.html`);
  console.log('提示: 需要先安装依赖，运行 npm install express cors http-proxy-middleware');
});

// 处理进程终止信号
process.on('SIGINT', () => {
  console.log('关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
}); 