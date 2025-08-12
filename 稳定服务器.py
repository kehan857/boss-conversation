#!/usr/bin/env python3
"""
稳定的HTTP服务器
解决CORS问题并提供详细日志
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import time
from pathlib import Path

class StableHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        """自定义日志格式"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {format % args}")
    
    def end_headers(self):
        """添加CORS头"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        """处理预检请求"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """处理GET请求"""
        try:
            super().do_GET()
        except Exception as e:
            print(f"❌ GET请求处理错误: {e}")
            self.send_error(500, f"Internal Server Error: {e}")
    
    def do_POST(self):
        """处理POST请求"""
        try:
            # 对于API请求，返回简单的响应
            if self.path.startswith('/api'):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "proxy_ready"}')
            else:
                super().do_POST()
        except Exception as e:
            print(f"❌ POST请求处理错误: {e}")
            self.send_error(500, f"Internal Server Error: {e}")

def create_server(port=8000):
    """创建服务器"""
    try:
        # 设置服务器参数
        socketserver.TCPServer.allow_reuse_address = True
        
        # 创建服务器
        with socketserver.TCPServer(("", port), StableHTTPRequestHandler) as httpd:
            print(f"🚀 服务器启动成功!")
            print(f"📁 工作目录: {os.getcwd()}")
            print(f"🌐 访问地址: http://localhost:{port}")
            print(f"📄 文案改写工具: http://localhost:{port}/文案改写工具-增强版.html")
            print(f"📄 基础版本: http://localhost:{port}/文案改写工具.html")
            print(f"\n💡 按 Ctrl+C 停止服务器")
            print(f"=" * 50)
            
            # 检查文件是否存在
            html_files = list(Path('.').glob("*.html"))
            print(f"📄 找到 {len(html_files)} 个HTML文件:")
            for file in html_files[:5]:  # 只显示前5个
                print(f"   - {file.name}")
            if len(html_files) > 5:
                print(f"   ... 还有 {len(html_files) - 5} 个文件")
            
            # 尝试打开浏览器
            try:
                webbrowser.open(f'http://localhost:{port}/文案改写工具-增强版.html')
                print("✅ 已自动打开浏览器")
            except Exception as e:
                print(f"⚠️ 无法自动打开浏览器: {e}")
                print("请手动访问: http://localhost:8000/文案改写工具-增强版.html")
            
            print("🔄 服务器运行中...")
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ 端口 {port} 已被占用")
            print("💡 请尝试:")
            print("   1. 关闭其他占用端口的程序")
            print("   2. 或者使用其他端口")
            return False
        else:
            print(f"❌ 启动服务器失败: {e}")
            return False
    except KeyboardInterrupt:
        print(f"\n🛑 服务器已停止")
        return True
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    print("🚀 启动稳定的HTTP服务器...")
    
    # 获取当前目录
    current_dir = Path(__file__).parent
    print(f"📁 当前目录: {current_dir}")
    
    # 切换到当前目录
    os.chdir(current_dir)
    print(f"✅ 已切换到工作目录")
    
    # 尝试不同的端口
    ports = [8000, 8001, 8002, 8003, 8004]
    
    for port in ports:
        print(f"\n🔄 尝试端口 {port}...")
        if create_server(port):
            break
        else:
            print(f"❌ 端口 {port} 启动失败，尝试下一个端口")
    else:
        print("❌ 所有端口都无法启动，请检查系统设置")

if __name__ == "__main__":
    main() 