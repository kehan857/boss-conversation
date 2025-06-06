#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import time
import threading
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
# 增强CORS配置，确保所有必要的头信息和方法都被允许
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Accept"]
}})

# FastGPT API配置
FASTGPT_API_URL = "https://api.fastgpt.in/api/v1/chat/completions"
FASTGPT_API_KEY = "fastgpt-dIZ13SeCXJOp0eCvGvwVaqR71Kq6qRHtDUkH1CqMpxIQCWvwV0qvT3p"

# 存储会话和回复的字典
conversations = {}
responses = {}

# 模拟长回复文本的示例
SAMPLE_LONG_RESPONSES = {
    "project_intro": [
        "您好！很高兴为您介绍我们加速孵化的项目——和气聚力AI作文📝",
        "和气聚力AI作文是一款专为中小学阶段设计的智能作文批阅系统，由北京和气聚力教育科技有限公司打造，属于\"AI+教育\"赛道。它结合学校实际需求，运用先进的AI与大数据技术，实现从作文批改、讲评到归档的全流程数字化管理，助力语文教学提质增效和学校信息化升级。👍",
        "该项目核心优势突出：\n\n1️⃣ 企业实力强：由国投集团、北京东城区政府引导基金等国有资本及著名基金合作参股设立，全国有4个研发中心，已获发明专利14项，软著272项。\n\n2️⃣ 技术先进：采用先进的AI与大数据技术，能实现高质量深度精批，包括语句纠错、优美句段点评等。\n\n3️⃣ 市场前景广阔：目前已在北京、上海等多个城市的学校落地应用，用户反馈极为积极。✨",
        "您对这个项目有什么具体想了解的方面吗？例如技术细节、商业模式或者合作方式？"
    ],
    "business_model": [
        "关于和气聚力AI作文的商业模式，我来为您详细介绍👇",
        "该项目采用\"软件+服务\"的SaaS订阅模式，主要面向K12教育机构和学校：\n\n1. 基础版：按年收费，提供基础的AI批改功能\n2. 专业版：增加个性化教学报告和数据分析\n3. 旗舰版：提供全套解决方案，包括专属定制和培训服务",
        "目前的定价策略是根据学校规模和使用人数进行阶梯式定价，非常灵活。最小起订单位为班级，每班每年约2000-5000元不等，具有很强的价格竞争力。💪",
        "收费模式透明清晰，无隐藏收费，后续升级免费。项目已实现规模化商用，投资回报周期短，通常6-12个月即可收回成本。",
        "您对这种商业模式有什么看法或建议吗？或者您想了解更多关于投资回报和市场规模的详情？"
    ],
    "technical_details": [
        "让我为您详细解析和气聚力AI作文的技术架构和创新点🔍",
        "核心技术架构：\n\n1. 底层采用了自主研发的NLP大模型，针对中文作文理解和评价进行了特殊优化\n2. 中间层是知识图谱和教学规则引擎，融合了语文教学专家经验\n3. 应用层则是直观易用的教师和学生界面，支持多端协同",
        "创新亮点：\n\n1️⃣ 精准的表达理解能力：不仅能识别语法错误，还能理解内容逻辑和情感表达\n2️⃣ 个性化的批改风格：可根据不同教师习惯调整批改风格\n3️⃣ 智能化的学习曲线：能够追踪学生写作能力发展，自动生成进步报告\n4️⃣ 数据安全保障：采用国密级加密技术，确保学生数据绝对安全",
        "技术壁垒很高，核心算法已申请多项专利保护。系统经过严格测试，准确率达到95%以上，远超行业平均水平。⚡",
        "您还想了解哪些具体的技术细节？我可以为您提供更深入的解析。"
    ],
    "market_analysis": [
        "下面我来分析一下和气聚力AI作文面对的市场环境和竞争格局📊",
        "市场规模：\n中国K12教育市场规模超过3万亿元，其中AI教育赛道增速超过30%。语文学科作为主科，在教育信息化进程中的需求巨大。保守估计，AI作文批改市场空间超过200亿元。",
        "竞争格局：\n目前市场上主要有三类竞争者：\n1. 传统教育巨头转型：如科大讯飞等\n2. 教育科技创业公司：如火花思维、作业帮等\n3. 纯AI技术公司：如一些依托大厂AI能力的初创团队\n\n和气聚力的优势在于专注度高、产品落地性强、技术与教学深度结合。🥇",
        "增长趋势：\n1. 政策推动：教育部明确支持AI技术在教育领域应用\n2. 疫情催化：远程教育需求激增，教师工作负担加重\n3. 技术成熟：NLP技术日趋成熟，应用成本下降\n\n预计未来3年，市场渗透率将从目前的5%增长到30%以上。",
        "您对市场前景有什么看法？我们可以针对特定区域或学校类型进行更详细的市场分析。"
    ],
    "default": [
        "我理解您的问题，让我思考一下...",
        "根据我们加速孵化的项目经验，这个问题涉及多个方面。我需要先了解一下您的具体需求点。",
        "一般来说，我们的项目都经过严格的筛选和评估，确保市场潜力和技术可行性。每个项目都配备专业团队全程支持，从创意到落地实施。",
        "您是否对某个特定领域更感兴趣？比如AI教育、企业服务或者医疗健康？这样我可以为您提供更有针对性的信息。"
    ]
}

@app.route('/api/questions', methods=['POST'])
def submit_question():
    """接收用户问题并触发异步处理"""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"error": "Missing required field: text"}), 400
    
    # 生成一个请求ID
    request_id = str(uuid.uuid4())
    user_text = data.get('text', '')
    chat_id = data.get('chatId', str(uuid.uuid4()))
    
    # 保存会话信息
    if chat_id not in conversations:
        conversations[chat_id] = []
    
    conversations[chat_id].append({
        'role': 'user',
        'content': user_text,
        'timestamp': time.time()
    })
    
    # 初始化响应队列
    responses[request_id] = {
        'status': 'processing',
        'segments': [],
        'next_segment': 0,
        'total_segments': 0,
        'chat_id': chat_id
    }
    
    # 异步处理回复
    threading.Thread(target=process_response, args=(request_id, user_text, chat_id)).start()
    
    return jsonify({
        'request_id': request_id,
        'status': 'processing',
        'message': 'Question received and being processed'
    })

@app.route('/api/responses/<request_id>', methods=['GET'])
def get_response_segment(request_id):
    """获取分段回复"""
    if request_id not in responses:
        return jsonify({"error": "Invalid request ID"}), 404
    
    response_data = responses[request_id]
    
    # 如果还有未返回的段落
    if response_data['next_segment'] < len(response_data['segments']):
        segment = response_data['segments'][response_data['next_segment']]
        response_data['next_segment'] += 1
        is_last = response_data['next_segment'] == response_data['total_segments']
        
        # 返回当前段落
        response = {
            'request_id': request_id,
            'segment': segment['content'],
            'segment_index': response_data['next_segment'] - 1,
            'total_segments': response_data['total_segments'],
            'is_last': is_last,
            'next_delay': segment.get('delay', 2000)
        }
        
        # 如果是最后一段，添加OpenAI格式的完整响应
        if is_last and 'openai_format' in response_data:
            response['openai_format'] = response_data['openai_format']
            
        return jsonify(response)
    elif response_data['status'] == 'completed':
        # 所有段落已返回，提供完整的OpenAI格式响应
        response = {
            'request_id': request_id,
            'status': 'completed',
            'message': 'All response segments have been delivered'
        }
        
        if 'openai_format' in response_data:
            response['openai_format'] = response_data['openai_format']
            
        return jsonify(response)
    else:
        # 还在处理中
        return jsonify({
            'request_id': request_id,
            'status': 'processing',
            'message': 'Response is still being processed'
        })

def process_response(request_id, user_text, chat_id):
    """处理回复并分段存储"""
    try:
        # 根据问题类型选择合适的预设回复
        response_type = categorize_question(user_text)
        segments = SAMPLE_LONG_RESPONSES.get(response_type, SAMPLE_LONG_RESPONSES['default'])
        
        # 也可以调用真实的FastGPT API获取回复
        # 注释掉的是调用FastGPT API的代码
        """
        fastgpt_response = call_fastgpt_api(user_text)
        if 'choices' in fastgpt_response and fastgpt_response['choices']:
            full_response = fastgpt_response['choices'][0]['message']['content']
            # 将完整回复分成若干段落
            segments = split_response(full_response)
        """
        
        # 模拟处理时间
        time.sleep(1)
        
        # 为每个段落添加延迟时间，模拟打字和思考
        processed_segments = []
        for i, segment in enumerate(segments):
            # 根据文本长度和复杂度计算合理的延迟
            delay = calculate_typing_delay(segment, i)
            processed_segments.append({
                'content': segment,
                'delay': delay
            })
        
        # 更新响应状态
        responses[request_id]['segments'] = processed_segments
        responses[request_id]['total_segments'] = len(processed_segments)
        responses[request_id]['status'] = 'completed'
        
        # 保存到会话历史并构建OpenAI API兼容格式
        full_content = ""
        for segment in processed_segments:
            content = segment['content']
            full_content += (content + "\n\n")
            conversations[chat_id].append({
                'role': 'assistant',
                'content': content,
                'timestamp': time.time()
            })
        
        # 添加OpenAI API兼容格式的响应
        responses[request_id]['openai_format'] = {
            'id': f'chatcmpl-{request_id}',
            'object': 'chat.completion',
            'created': int(time.time()),
            'model': 'enhanced-response-plugin',
            'choices': [
                {
                    'index': 0,
                    'message': {
                        'role': 'assistant',
                        'content': full_content.strip()
                    },
                    'finish_reason': 'stop'
                }
            ],
            'usage': {
                'prompt_tokens': len(user_text) // 4,
                'completion_tokens': len(full_content) // 4,
                'total_tokens': (len(user_text) + len(full_content)) // 4
            }
        }
            
    except Exception as e:
        print(f"Error processing response: {str(e)}")
        responses[request_id]['status'] = 'error'
        responses[request_id]['error'] = str(e)

def categorize_question(text):
    """简单地对问题进行分类"""
    text = text.lower()
    
    if any(keyword in text for keyword in ['商业', '模式', '盈利', '收费', '价格']):
        return 'business_model'
    elif any(keyword in text for keyword in ['技术', '架构', '实现', '原理', '算法']):
        return 'technical_details'
    elif any(keyword in text for keyword in ['市场', '竞争', '前景', '分析', '趋势']):
        return 'market_analysis'
    elif any(keyword in text for keyword in ['项目', '介绍', '是什么', '什么项目', '讲讲']):
        return 'project_intro'
    else:
        return 'default'

def calculate_typing_delay(text, segment_index):
    """根据文本长度和段落位置计算合理的延迟时间"""
    # 基础延迟
    base_delay = 1000  # 毫秒
    
    # 第一段回复通常较快
    if segment_index == 0:
        return base_delay
    
    # 文本长度因素：每个字符增加一定延迟
    length_factor = len(text) * 5
    
    # 复杂度因素：特殊符号、数字等表示内容可能更复杂
    complexity = sum(1 for char in text if char in '.,;:!?()[]{}0123456789') * 100
    
    # 段落因素：中间段落通常需要更多思考时间
    segment_factor = 500 if 0 < segment_index < 3 else 0
    
    # 计算总延迟，介于1.5-5秒之间
    delay = base_delay + length_factor + complexity + segment_factor
    return min(max(delay, 1500), 5000)

def split_response(text):
    """将长文本分割成合理的段落"""
    # 首先按照段落分隔符分割
    paragraphs = text.split('\n\n')
    
    # 如果段落太少，尝试按句子分割
    if len(paragraphs) < 3:
        sentences = []
        for para in paragraphs:
            sentences.extend([s.strip() + '.' for s in para.split('.') if s.strip()])
        
        # 将句子组合成合理的段落
        segments = []
        current_segment = ""
        
        for sentence in sentences:
            if len(current_segment) + len(sentence) < 200:
                current_segment += " " + sentence if current_segment else sentence
            else:
                if current_segment:
                    segments.append(current_segment)
                current_segment = sentence
        
        if current_segment:
            segments.append(current_segment)
        
        return segments if segments else [text]
    
    # 如果有一些段落太长，进一步分割
    result = []
    for para in paragraphs:
        if len(para) > 300:  # 如果段落超过300字符
            # 按句子分割长段落
            sentences = [s.strip() + '.' for s in para.split('.') if s.strip()]
            current = ""
            
            for sentence in sentences:
                if len(current) + len(sentence) < 250:
                    current += " " + sentence if current else sentence
                else:
                    if current:
                        result.append(current)
                    current = sentence
            
            if current:
                result.append(current)
        else:
            result.append(para)
    
    return result if result else [text]

def call_fastgpt_api(user_text):
    """调用FastGPT API获取回复"""
    try:
        response = requests.post(
            FASTGPT_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {FASTGPT_API_KEY}"
            },
            json={
                "model": "gpt-3.5-turbo",  # 或者您配置的增强回复插件ID
                "messages": [
                    {
                        "role": "user",
                        "content": user_text
                    }
                ]
            },
            timeout=30
        )
        
        return response.json()
    except Exception as e:
        print(f"Error calling FastGPT API: {str(e)}")
        return {"error": str(e)}

@app.route('/api/history/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    """获取聊天历史"""
    if chat_id not in conversations:
        return jsonify({"error": "Chat not found"}), 404
    
    return jsonify({
        'chat_id': chat_id,
        'history': conversations[chat_id]
    })

@app.route('/')
def index():
    """返回服务状态"""
    return jsonify({
        'status': 'running',
        'message': 'FastGPT Multi-segment Chat API Server is running',
        'endpoints': {
            'submit_question': '/api/questions',
            'get_response': '/api/responses/<request_id>',
            'get_history': '/api/history/<chat_id>'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)