#!/usr/bin/env node

/**
 * FastGPT定时任务不携带问题触发验证脚本
 * 
 * 使用方法：
 * 1. 安装依赖：npm install node-fetch
 * 2. 配置API信息
 * 3. 运行：node verify_timer_trigger.js
 */

const fetch = require('node-fetch').default || require('node-fetch');

// 配置信息 - 请修改为您的实际配置
const CONFIG = {
    apiUrl: 'https://api.fastgpt.in/api',  // 请修改为您的FastGPT API地址
    apiKey: 'YOUR_API_KEY_HERE',           // 请修改为您的API密钥
    chatId: `verify_session_${Date.now()}` // 测试会话ID
};

// 测试场景配置
const TEST_SCENARIOS = [
    {
        name: '场景1：携带问题触发（对照组）',
        description: '传统方式，定时任务仍携带用户问题',
        requestBody: {
            chatId: CONFIG.chatId,
            stream: false,
            detail: true,
            variables: {
                isTimerTriggered: true,
                testScenario: 'withMessage'
            },
            messages: [{
                role: "user",
                content: "你好，我想了解一下项目详情"
            }]
        }
    },
    {
        name: '场景2：不携带问题触发（实验组）',
        description: '验证定时任务完全不携带用户问题',
        requestBody: {
            chatId: CONFIG.chatId,
            stream: false,
            detail: true,
            variables: {
                isTimerTriggered: true,
                testScenario: 'withoutMessage'
            },
            messages: []  // 完全不传递消息
        }
    },
    {
        name: '场景3：空消息触发',
        description: '发送空消息内容，让工作流自行处理',
        requestBody: {
            chatId: CONFIG.chatId,
            stream: false,
            detail: true,
            variables: {
                isTimerTriggered: true,
                testScenario: 'emptyMessage'
            },
            messages: [{
                role: "user",
                content: ""
            }]
        }
    },
    {
        name: '场景4：系统消息触发',
        description: '使用系统消息标识定时任务触发',
        requestBody: {
            chatId: CONFIG.chatId,
            stream: false,
            detail: true,
            variables: {
                isTimerTriggered: true,
                testScenario: 'systemMessage'
            },
            messages: [{
                role: "system",
                content: "timer_triggered"
            }]
        }
    },
    {
        name: '场景5：纯变量触发',
        description: '仅通过变量传递信息，不包含messages字段',
        requestBody: {
            chatId: CONFIG.chatId,
            stream: false,
            detail: true,
            variables: {
                isTimerTriggered: true,
                testScenario: 'variableOnly',
                triggerType: 'timer',
                action: 'continue_conversation',
                contextInfo: "用户等待回复中"
            }
            // 注意：这里故意不包含messages字段
        }
    }
];

// 颜色输出工具
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 发送测试请求
async function sendTestRequest(scenario) {
    const startTime = Date.now();
    
    try {
        log(`\n🚀 开始测试：${scenario.name}`, 'cyan');
        log(`📋 描述：${scenario.description}`, 'blue');
        
        // 显示请求体（隐藏敏感信息）
        const requestBodyForLog = {
            ...scenario.requestBody,
            chatId: '[HIDDEN]'
        };
        log(`📤 请求体：${JSON.stringify(requestBodyForLog, null, 2)}`, 'yellow');
        
        const response = await fetch(`${CONFIG.apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.apiKey}`
            },
            body: JSON.stringify(scenario.requestBody)
        });
        
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        return {
            success: true,
            data: result,
            responseTime,
            statusCode: response.status
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            responseTime: Date.now() - startTime
        };
    }
}

// 分析测试结果
function analyzeResult(result, scenarioName) {
    if (!result.success) {
        log(`❌ 请求失败：${result.error}`, 'red');
        return {
            status: 'failed',
            message: result.error,
            details: null
        };
    }
    
    log(`✅ 请求成功 (${result.responseTime}ms)`, 'green');
    
    const data = result.data;
    
    // 检查是否有回复内容
    const hasResponse = data.choices && data.choices.length > 0 && 
                       data.choices[0].message && data.choices[0].message.content;
    
    if (hasResponse) {
        const responseContent = data.choices[0].message.content;
        log(`💬 回复内容：${responseContent.substring(0, 100)}${responseContent.length > 100 ? '...' : ''}`, 'green');
        
        // 检查工作流执行信息
        let workflowInfo = '';
        if (data.responseData && Array.isArray(data.responseData)) {
            workflowInfo = `工作流执行了${data.responseData.length}个节点`;
            
            // 检查定时任务相关变量
            for (const node of data.responseData) {
                if (node.customOutputs && node.customOutputs.isTimeUp !== undefined) {
                    workflowInfo += `，isTimeUp=${node.customOutputs.isTimeUp}`;
                }
            }
        }
        
        return {
            status: 'success',
            message: `成功获得回复 (${result.responseTime}ms)`,
            details: {
                responseLength: responseContent.length,
                workflowInfo,
                hasWorkflowData: !!(data.responseData && data.responseData.length > 0)
            }
        };
    } else {
        log(`⚠️ 工作流执行但无回复内容`, 'yellow');
        return {
            status: 'partial',
            message: '工作流执行但无回复内容',
            details: null
        };
    }
}

// 主验证函数
async function runVerification() {
    log('🧪 FastGPT定时任务不携带问题触发验证开始', 'bright');
    log('=' .repeat(60), 'cyan');
    
    // 检查配置
    if (CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        log('❌ 请先配置您的API密钥！', 'red');
        log('请修改脚本中的CONFIG.apiKey为您的实际API密钥', 'yellow');
        process.exit(1);
    }
    
    const results = [];
    
    // 逐个测试场景
    for (let i = 0; i < TEST_SCENARIOS.length; i++) {
        const scenario = TEST_SCENARIOS[i];
        
        log(`\n📋 [${i + 1}/${TEST_SCENARIOS.length}] ${scenario.name}`, 'bright');
        
        const result = await sendTestRequest(scenario);
        const analysis = analyzeResult(result, scenario.name);
        
        results.push({
            scenario: scenario.name,
            ...analysis
        });
        
        // 添加延迟，避免请求过于频繁
        if (i < TEST_SCENARIOS.length - 1) {
            log('⏳ 等待2秒后继续下一个测试...', 'yellow');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // 输出测试结果汇总
    log('\n📊 测试结果汇总', 'bright');
    log('=' .repeat(60), 'cyan');
    
    results.forEach((result, index) => {
        const status = result.status === 'success' ? '✅' : 
                      result.status === 'partial' ? '⚠️' : '❌';
        const color = result.status === 'success' ? 'green' : 
                     result.status === 'partial' ? 'yellow' : 'red';
        
        log(`${status} 场景${index + 1}：${result.message}`, color);
    });
    
    // 分析可行性
    const successCount = results.filter(r => r.status === 'success').length;
    const partialCount = results.filter(r => r.status === 'partial').length;
    const failCount = results.filter(r => r.status === 'failed').length;
    
    log('\n🎯 可行性分析', 'bright');
    log('-' .repeat(40), 'cyan');
    log(`✅ 完全成功：${successCount}个场景`, 'green');
    log(`⚠️ 部分成功：${partialCount}个场景`, 'yellow');
    log(`❌ 失败：${failCount}个场景`, 'red');
    
    if (successCount >= 2) {
        log('\n🎉 结论：定时任务不携带问题触发是可行的！', 'green');
        log('建议：可以选择成功的场景进行实际应用', 'green');
    } else if (successCount + partialCount >= 2) {
        log('\n🤔 结论：有一定可行性，但需要优化工作流', 'yellow');
        log('建议：检查工作流配置，确保能处理无用户输入的情况', 'yellow');
    } else {
        log('\n❌ 结论：当前配置下可行性较低', 'red');
        log('建议：检查API配置和工作流设计', 'red');
    }
    
    log('\n✨ 验证完成！', 'bright');
}

// 错误处理和脚本入口
if (require.main === module) {
    runVerification().catch(error => {
        log(`\n💥 验证过程发生错误：${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    runVerification,
    sendTestRequest,
    analyzeResult,
    CONFIG,
    TEST_SCENARIOS
}; 