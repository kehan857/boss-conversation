# FastGPT 对话演示

一个基于 FastGPT API 的简洁对话界面，支持与 AI 智能体进行多轮对话。

## 功能特点

- 🤖 基于 FastGPT API 的智能对话
- 💬 支持多轮对话，保持上下文
- 🎨 简洁现代的深色主题界面
- ⌨️ 支持回车发送，Shift+Enter 换行
- 🔄 一键清空对话历史
- 💾 自动保存 API Key 到本地存储

## 在线预览

访问 [GitHub Pages 预览](https://kehan857.github.io/boss-conversation/fastgpt_chat.html)

## 本地运行

### 方法一：直接打开
1. 下载 `fastgpt_chat.html` 文件
2. 在浏览器中直接打开
3. 在控制台设置 API Key：
   ```javascript
   localStorage.setItem('fastgpt_api_key', '你的FastGPT API Key');
   location.reload();
   ```

### 方法二：使用本地代理（推荐）
1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动代理服务器：
   ```bash
   npm start
   ```

3. 访问：http://localhost:3001/fastgpt_chat.html

## API Key 配置

默认已预填 API Key，如需更换：

1. 在浏览器控制台执行：
   ```javascript
   localStorage.setItem('fastgpt_api_key', '你的新API Key');
   location.reload();
   ```

2. 或直接修改 `fastgpt_chat.html` 中的默认值

## 技术栈

- HTML5 + CSS3 + JavaScript
- FastGPT API
- GitHub Pages 部署

## 部署

本项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 main/master 分支
2. GitHub Actions 自动构建并部署
3. 访问 https://kehan857.github.io/boss-conversation/

## 许可证

MIT License 