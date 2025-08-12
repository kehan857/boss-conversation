#!/usr/bin/env node

/**
 * 快速验证定时任务不携带问题触发
 * 使用内置的https模块，无需安装额外依赖
 */

const https = require('https');
const http = require('http');

// 简化的HTTP请求函数
function makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        const req = client.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: result });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 快速验证函数
async function quickVerify(apiUrl, apiKey) {
    console.log('🧪 开始快速验证定时任务不携带问题触发...\n');
    
    const chatId = `quick_verify_${Date.now()}`;
    const baseUrl = `${apiUrl}/v1/chat/completions`;
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    };
    
    // 测试场景
    const scenarios = [
        {
            name: '传统方式（携带问题）',
            data: {
                chatId,
                stream: false,
                detail: true,
                variables: { isTimerTriggered: true },
                messages: [{ role: "user", content: "你好，我想了解项目详情" }]
            }
        },
        {
            name: '不携带问题（空数组）',
            data: {
                chatId,
                stream: false,
                detail: true,
                variables: { isTimerTriggered: true },
                messages: []
            }
        },
        {
            name: '空消息内容',
            data: {
                chatId,
                stream: false,
                detail: true,
                variables: { isTimerTriggered: true },
                messages: [{ role: "user", content: "" }]
            }
        }
    ];
    
    const results = [];
    
    for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        console.log(`📋 [${i + 1}/3] 测试：${scenario.name}`);
        
        try {
            const startTime = Date.now();
            const response = await makeRequest(baseUrl, options, scenario.data);
            const responseTime = Date.now() - startTime;
            
            if (response.statusCode === 200) {
                const hasContent = response.data.choices && 
                                 response.data.choices[0] && 
                                 response.data.choices[0].message &&
                                 response.data.choices[0].message.content;
                
                if (hasContent) {
                    const content = response.data.choices[0].message.content;
                    console.log(`✅ 成功 (${responseTime}ms) - 回复长度: ${content.length}字符`);
                    console.log(`💬 回复预览: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}\n`);
                    results.push({ scenario: scenario.name, status: 'success', responseTime });
                } else {
                    console.log(`⚠️ 部分成功 (${responseTime}ms) - 工作流执行但无回复内容\n`);
                    results.push({ scenario: scenario.name, status: 'partial', responseTime });
                }
            } else {
                console.log(`❌ 失败 - HTTP ${response.statusCode}: ${JSON.stringify(response.data).substring(0, 100)}\n`);
                results.push({ scenario: scenario.name, status: 'failed', error: response.data });
            }
        } catch (error) {
            console.log(`❌ 错误: ${error.message}\n`);
            results.push({ scenario: scenario.name, status: 'error', error: error.message });
        }
        
        // 间隔1秒
        if (i < scenarios.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // 结果汇总
    console.log('📊 验证结果汇总:');
    console.log('='.repeat(50));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const partialCount = results.filter(r => r.status === 'partial').length;
    
    results.forEach((result, index) => {
        const emoji = result.status === 'success' ? '✅' : 
                     result.status === 'partial' ? '⚠️' : '❌';
        console.log(`${emoji} ${result.scenario}`);
    });
    
    console.log(`\n🎯 结论:`);
    if (successCount >= 2) {
        console.log('🎉 定时任务不携带问题触发是可行的！');
    } else if (successCount + partialCount >= 2) {
        console.log('🤔 有一定可行性，建议优化工作流处理逻辑');
    } else {
        console.log('❌ 当前配置下可行性较低，需要检查API和工作流配置');
    }
}

// 命令行参数处理
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('使用方法：');
        console.log('node quick_verify.js <API_URL> <API_KEY>');
        console.log('');
        console.log('示例：');
        console.log('node quick_verify.js https://api.fastgpt.in/api fastgpt-xxxxxx');
        process.exit(1);
    }
    
    const [apiUrl, apiKey] = args;
    
    quickVerify(apiUrl, apiKey).catch(error => {
        console.error('💥 验证失败:', error.message);
        process.exit(1);
    });
}

module.exports = { quickVerify }; 