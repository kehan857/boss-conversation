#!/usr/bin/env python3
"""
简单的测试服务器
用于诊断CORS问题
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    # 获取当前目录
    current_dir = Path(__file__).parent
    print(f"📁 当前目录: {current_dir}")
    
    # 切换到当前目录
    os.chdir(current_dir)
    print(f"✅ 已切换到工作目录")
    
    # 检查文件是否存在
    html_files = list(current_dir.glob("*.html"))
    print(f"📄 找到 {len(html_files)} 个HTML文件:")
    for file in html_files:
        print(f"   - {file.name}")
    
    # 设置端口
    port = 8000
    
    try:
        # 创建服务器
        with socketserver.TCPServer(("", port), SimpleHTTPRequestHandler) as httpd:
            print(f"🚀 服务器启动成功!")
            print(f"🌐 访问地址: http://localhost:{port}")
            print(f"📄 文案改写工具: http://localhost:{port}/文案改写工具-增强版.html")
            print(f"📄 基础版本: http://localhost:{port}/文案改写工具.html")
            print(f"\n💡 按 Ctrl+C 停止服务器")
            print(f"=" * 50)
            
            # 尝试打开浏览器
            try:
                webbrowser.open(f'http://localhost:{port}/文案改写工具-增强版.html')
                print("✅ 已自动打开浏览器")
            except Exception as e:
                print(f"⚠️ 无法自动打开浏览器: {e}")
                print("请手动访问: http://localhost:8000/文案改写工具-增强版.html")
            
            # 启动服务器
            print("🔄 服务器运行中...")
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ 端口 {port} 已被占用")
            print("💡 请尝试:")
            print("   1. 关闭其他占用端口的程序")
            print("   2. 或者修改端口号")
        else:
            print(f"❌ 启动服务器失败: {e}")
    except KeyboardInterrupt:
        print(f"\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 