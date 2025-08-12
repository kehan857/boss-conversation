#!/usr/bin/env python3
"""
本地服务器启动脚本
解决CORS问题，让文案改写工具正常工作
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头，允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()

def start_server(port=8000):
    """启动本地服务器"""
    # 获取当前目录
    current_dir = Path(__file__).parent
    
    # 切换到当前目录
    os.chdir(current_dir)
    
    # 创建服务器
    with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 本地服务器已启动")
        print(f"📁 服务目录: {current_dir}")
        print(f"🌐 访问地址: http://localhost:{port}")
        print(f"📄 文案改写工具: http://localhost:{port}/文案改写工具-增强版.html")
        print(f"📄 基础版本: http://localhost:{port}/文案改写工具.html")
        print(f"\n💡 使用说明:")
        print(f"1. 在浏览器中访问上述地址")
        print(f"2. 输入文案信息并点击改写")
        print(f"3. 按 Ctrl+C 停止服务器")
        print(f"\n" + "="*50)
        
        # 自动打开浏览器
        try:
            webbrowser.open(f'http://localhost:{port}/文案改写工具-增强版.html')
        except:
            print("⚠️ 无法自动打开浏览器，请手动访问上述地址")
        
        # 启动服务器
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 服务器已停止")
            httpd.shutdown()

if __name__ == "__main__":
    # 检查端口是否可用
    port = 8000
    try:
        start_server(port)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ 端口 {port} 已被占用，尝试使用端口 {port + 1}")
            try:
                start_server(port + 1)
            except OSError:
                print(f"❌ 端口 {port + 1} 也被占用，请手动关闭占用端口的程序")
        else:
            print(f"❌ 启动服务器失败: {e}")
    except Exception as e:
        print(f"❌ 未知错误: {e}") 