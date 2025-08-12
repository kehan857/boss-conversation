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

@app.route('/api', methods=['POST'])
def handle_rewrite_request():
    """处理文案改写请求"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "Missing request data"}), 400
        
        # 提取请求参数
        original_text = data.get('original_text', '')
        video_duration = data.get('video_duration', 30)
        rewrite_count = data.get('rewrite_count', 3)
        rewrite_style = data.get('rewrite_style', '')
        
        if not original_text:
            return jsonify({"error": "Missing original_text"}), 400
        
        # 调用FastGPT API生成改写结果
        results = call_fastgpt_for_rewrite(original_text, video_duration, rewrite_count, rewrite_style)
        
        return jsonify({
            "result": results,
            "status": "success",
            "message": f"成功生成{len(results)}个改写版本"
        })
        
    except Exception as e:
        print(f"Error handling rewrite request: {str(e)}")
        return jsonify({"error": f"处理请求失败: {str(e)}"}), 500

def call_fastgpt_for_rewrite(original_text, video_duration, rewrite_count, rewrite_style):
    """调用FastGPT API进行文案改写"""
    results = []
    
    # 构建提示词
    style_prompts = {
        'professional': '请用专业正式的语气改写以下文案，保持内容的准确性和权威性：',
        'casual': '请用轻松活泼的语气改写以下文案，让内容更加亲切自然：',
        'emotional': '请用富有情感的语气改写以下文案，增强内容的感染力：',
        'marketing': '请用营销导向的语气改写以下文案，突出产品卖点和价值主张：',
        '': '请改写以下文案，保持原意的同时让表达更加清晰有力：'
    }
    
    style_prompt = style_prompts.get(rewrite_style, style_prompts[''])
    
    for i in range(rewrite_count):
        try:
            # 构建完整的提示词
            prompt = f"""{style_prompt}

原始文案：{original_text}

要求：
1. 改写后的文案适合{video_duration}秒的视频使用
2. 保持原意不变，但表达方式要更加吸引人
3. 内容长度控制在{video_duration * 3}字以内
4. 这是第{i+1}个改写版本，请确保与之前版本有所区别

请直接输出改写后的文案，不要添加任何解释。"""

            # 调用FastGPT API
            response = call_fastgpt_api(prompt)
            
            if 'choices' in response and response['choices']:
                rewritten_text = response['choices'][0]['message']['content'].strip()
                results.append(rewritten_text)
            else:
                # 如果API调用失败，使用备用方案
                fallback_text = generate_fallback_rewrite(original_text, video_duration, i+1, rewrite_style)
                results.append(fallback_text)
                
        except Exception as e:
            print(f"Error calling FastGPT API for rewrite {i+1}: {str(e)}")
            # 使用备用方案
            fallback_text = generate_fallback_rewrite(original_text, video_duration, i+1, rewrite_style)
            results.append(fallback_text)
    
    return results

def generate_fallback_rewrite(original_text, video_duration, version_num, rewrite_style):
    """生成备用改写文案（当API调用失败时使用）"""
    style_templates = {
        'professional': [
            "基于您提供的原始内容，我们为您精心打造了专业版本：",
            "经过深度优化，这个版本更加正式和专业：",
            "针对商务场景，我们特别调整了表达方式："
        ],
        'casual': [
            "轻松活泼的版本，更适合年轻受众：",
            "这个版本更加亲切自然，拉近与观众的距离：",
            "用更轻松的方式表达，让内容更有趣："
        ],
        'emotional': [
            "富有情感的版本，更能打动人心：",
            "加入情感元素，让内容更有感染力：",
            "这个版本更能引起观众的共鸣："
        ],
        'marketing': [
            "营销导向的版本，突出产品卖点：",
            "针对转化优化的版本，更有说服力：",
            "突出价值主张的版本，更有吸引力："
        ],
        '': [
            "改写版本一：",
            "改写版本二：",
            "改写版本三："
        ]
    }
    
    templates = style_templates.get(rewrite_style, style_templates[''])
    template = templates[(version_num - 1) % len(templates)]
    
    # 根据视频时长调整内容长度
    target_length = video_duration * 3
    
    # 简单的改写逻辑
    if "项目" in original_text or "产品" in original_text:
        rewritten = f"{template}\n\n{original_text}\n\n这个项目具有以下优势：\n• 技术先进，采用最新AI技术\n• 市场前景广阔，需求量大\n• 团队经验丰富，执行力强\n• 商业模式清晰，盈利能力强"
    elif "服务" in original_text or "解决方案" in original_text:
        rewritten = f"{template}\n\n{original_text}\n\n我们的服务特色：\n• 专业团队，经验丰富\n• 定制化方案，满足个性化需求\n• 全程跟踪，确保服务质量\n• 性价比高，投资回报快"
    else:
        # 通用改写
        rewritten = f"{template}\n\n{original_text}\n\n核心亮点：\n• 内容质量高，专业性强\n• 表达清晰，易于理解\n• 针对性强，目标明确\n• 效果显著，价值突出"
    
    # 调整长度
    if len(rewritten) > target_length:
        rewritten = rewritten[:target_length] + "..."
    elif len(rewritten) < target_length * 0.8:
        rewritten += f"\n\n适合{video_duration}秒视频的完整内容，包含详细说明和具体案例。"
    
    return rewritten

@app.route('/')
def index():
    """返回服务状态"""
    return jsonify({
        'status': 'running',
        'message': 'FastGPT Multi-segment Chat API Server is running',
        'endpoints': {
            'submit_question': '/api/questions',
            'get_response': '/api/responses/<request_id>',
            'get_history': '/api/history/<chat_id>',
            'rewrite_text': '/api'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)