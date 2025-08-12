#!/usr/bin/env node

/**
 * 修复版快速验证定时任务不携带问题触发
 * 修复了Node.js HTTP头部验证问题
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// 简化的HTTP请求函数 - 修复版
function makeRequest(urlString, options, data) {
    return new Promise((resolve, reject) => {
        try {
            const url = new URL(urlString);
            const client = url.protocol === 'https:' ? https : http;
            
            // 清理和验证API密钥
            const cleanApiKey = options.headers.Authorization.replace('Bearer ', '').trim();
            
            // 重新构建选项，确保头部内容安全
            const requestOptions = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: options.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cleanApiKey}`,
                    'User-Agent': 'FastGPT-Verify/1.0'
                }
            };
            
            // 如果有数据，添加Content-Length
            if (data) {
                const dataString = JSON.stringify(data);
                requestOptions.headers['Content-Length'] = Buffer.byteLength(dataString);
            }
            
            const req = client.request(requestOptions, (res) => {
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
            
            req.on('error', (error) => {
                reject(new Error(`请求错误: ${error.message}`));
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('请求超时'));
            });
            
            // 设置超时
            req.setTimeout(30000);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
            
        } catch (error) {
            reject(new Error(`URL解析错误: ${error.message}`));
        }
    });
}

// 验证API密钥格式
function validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        return { valid: false, message: 'API密钥不能为空' };
    }
    
    const cleanKey = apiKey.trim();
    if (cleanKey.length < 10) {
        return { valid: false, message: 'API密钥长度太短' };
    }
    
    // 检查是否包含不合法字符
    const illegalChars = /[\r\n\t]/;
    if (illegalChars.test(cleanKey)) {
        return { valid: false, message: 'API密钥包含不合法字符（换行符、制表符等）' };
    }
    
    return { valid: true, cleanKey };
}

// 验证API URL格式
function validateApiUrl(apiUrl) {
    try {
        const url = new URL(apiUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return { valid: false, message: 'API地址必须使用http或https协议' };
        }
        return { valid: true, cleanUrl: apiUrl };
    } catch (error) {
        return { valid: false, message: `无效的API地址: ${error.message}` };
    }
}

// 快速验证函数 - 修复版
async function quickVerify(apiUrl, apiKey) {
    console.log('🧪 开始快速验证定时任务不携带问题触发...\n');
    
    // 验证输入参数
    const urlValidation = validateApiUrl(apiUrl);
    if (!urlValidation.valid) {
        console.error(`❌ ${urlValidation.message}`);
        return;
    }
    
    const keyValidation = validateApiKey(apiKey);
    if (!keyValidation.valid) {
        console.error(`❌ ${keyValidation.message}`);
        return;
    }
    
    console.log(`📍 API地址: ${apiUrl}`);
    console.log(`🔑 API密钥: ${keyValidation.cleanKey.substring(0, 8)}****** (长度: ${keyValidation.cleanKey.length})`);
    console.log('');
    
    const chatId = `quick_verify_${Date.now()}`;
    const baseUrl = `${apiUrl.replace(/\/$/, '')}/v1/chat/completions`;
    
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keyValidation.cleanKey}`
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
            
            console.log(`📡 HTTP状态: ${response.statusCode} (${responseTime}ms)`);
            
            if (response.statusCode === 200) {
                const hasContent = response.data.choices && 
                                 response.data.choices[0] && 
                                 response.data.choices[0].message &&
                                 response.data.choices[0].message.content;
                
                if (hasContent) {
                    const content = response.data.choices[0].message.content;
                    console.log(`✅ 成功 - 回复长度: ${content.length}字符`);
                    console.log(`💬 回复预览: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);
                    results.push({ scenario: scenario.name, status: 'success', responseTime });
                } else {
                    console.log(`⚠️ 部分成功 - 工作流执行但无回复内容`);
                    results.push({ scenario: scenario.name, status: 'partial', responseTime });
                }
            } else if (response.statusCode === 401) {
                console.log(`❌ 认证失败 - 请检查API密钥是否正确`);
                results.push({ scenario: scenario.name, status: 'auth_failed', error: 'API密钥认证失败' });
            } else if (response.statusCode === 404) {
                console.log(`❌ 接口不存在 - 请检查API地址是否正确`);
                results.push({ scenario: scenario.name, status: 'not_found', error: 'API接口不存在' });
            } else {
                console.log(`❌ 失败 - HTTP ${response.statusCode}`);
                console.log(`📄 响应内容: ${JSON.stringify(response.data).substring(0, 200)}`);
                results.push({ scenario: scenario.name, status: 'failed', error: response.data });
            }
        } catch (error) {
            console.log(`❌ 网络错误: ${error.message}`);
            results.push({ scenario: scenario.name, status: 'error', error: error.message });
        }
        
        console.log(''); // 空行分隔
        
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
    const authFailedCount = results.filter(r => r.status === 'auth_failed').length;
    
    results.forEach((result, index) => {
        const emoji = result.status === 'success' ? '✅' : 
                     result.status === 'partial' ? '⚠️' : 
                     result.status === 'auth_failed' ? '🔑' : '❌';
        console.log(`${emoji} ${result.scenario}`);
    });
    
    console.log(`\n🎯 结论:`);
    if (authFailedCount > 0) {
        console.log('🔑 API密钥认证失败，请检查密钥是否正确和有效');
    } else if (successCount >= 2) {
        console.log('🎉 定时任务不携带问题触发是可行的！');
        console.log('📌 特别关注"不携带问题（空数组）"场景的结果');
    } else if (successCount + partialCount >= 2) {
        console.log('🤔 有一定可行性，建议优化工作流处理逻辑');
    } else {
        console.log('❌ 当前配置下可行性较低，需要检查API和工作流配置');
        console.log('💡 建议检查：API地址、密钥、工作流配置');
    }
}

// 命令行参数处理
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('🔧 使用方法：');
        console.log('node quick_verify_fixed.js <API_URL> <API_KEY>');
        console.log('');
        console.log('📝 示例：');
        console.log('node quick_verify_fixed.js https://api.fastgpt.in/api fastgpt-xxxxxx');
        console.log('');
        console.log('💡 注意事项：');
        console.log('- API地址需要完整路径（包含协议）');
        console.log('- API密钥不要包含换行符或其他特殊字符');
        console.log('- 确保网络连接正常');
        process.exit(1);
    }
    
    const [apiUrl, apiKey] = args;
    
    quickVerify(apiUrl, apiKey).catch(error => {
        console.error('💥 验证过程发生错误:', error.message);
        console.error('🔍 错误详情:', error);
        process.exit(1);
    });
}

module.exports = { quickVerify, validateApiKey, validateApiUrl }; 