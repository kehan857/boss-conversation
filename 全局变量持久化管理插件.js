async function main({ 
    userMessage, 
    lastTime = 0, 
    messageCount = 0, 
    messageHistory = [], 
    chatId,
    timeThreshold = 2000,
    messageThreshold = 3 
}) {
    try {
        // 1. 获取当前时间戳
        const currentTime = Date.now();
        
        // 2. 解析输入参数
        const parsedLastTime = Number(lastTime) || 0;
        const parsedMsgCount = Number(messageCount) || 0;
        const parsedTimeThreshold = Number(timeThreshold) || 2000;
        const parsedMsgThreshold = Number(messageThreshold) || 3;
        const parsedMsgHistory = Array.isArray(messageHistory) ? [...messageHistory] : [];
        
        // 3. 计算时间差
        const timeSinceLastMessage = currentTime - parsedLastTime;
        
        // 4. 判断对话状态
        const isFirstConversation = parsedLastTime === 0;
        const isTimeTriggered = timeSinceLastMessage >= parsedTimeThreshold;
        const isCountTriggered = parsedMsgCount >= parsedMsgThreshold;
        
        // 5. 添加当前消息到历史记录
        if (userMessage && userMessage.trim()) {
            parsedMsgHistory.push(userMessage.trim());
        }
        
        // 6. 更新消息计数
        const updatedMsgCount = parsedMsgCount + 1;
        
        // 7. 决定回复策略
        let shouldReply = false;
        let replyReason = '';
        
        if (isFirstConversation) {
            shouldReply = true;
            replyReason = '首次对话';
        } else if (isTimeTriggered) {
            shouldReply = true;
            replyReason = `时间触发(${timeSinceLastMessage}ms >= ${parsedTimeThreshold}ms)`;
        } else if (isCountTriggered) {
            shouldReply = true;
            replyReason = `消息数触发(${updatedMsgCount} >= ${parsedMsgThreshold})`;
        }
        
        // 8. 准备返回数据
        const result = {
            // 核心状态
            shouldReply: shouldReply,
            replyReason: replyReason,
            
            // 更新的全局变量
            lastTime: currentTime,
            messageCount: shouldReply && !isFirstConversation ? 0 : updatedMsgCount, // 回复后重置计数
            messageHistory: shouldReply && !isFirstConversation ? [] : parsedMsgHistory, // 回复后重置历史
            
            // 调试信息
            debugInfo: {
                currentTime: currentTime,
                inputLastTime: parsedLastTime,
                timeSinceLastMessage: timeSinceLastMessage,
                isFirstConversation: isFirstConversation,
                isTimeTriggered: isTimeTriggered,
                isCountTriggered: isCountTriggered,
                inputMessageCount: parsedMsgCount,
                updatedMessageCount: updatedMsgCount,
                messageHistoryLength: parsedMsgHistory.length,
                thresholds: {
                    time: parsedTimeThreshold,
                    message: parsedMsgThreshold
                }
            },
            
            // 用户输入
            userMessage: userMessage,
            chatId: chatId,
            
            // 成功标记
            success: true
        };
        
        return result;
        
    } catch (error) {
        return {
            shouldReply: false,
            replyReason: '处理错误',
            lastTime: Date.now(),
            messageCount: 0,
            messageHistory: [],
            error: error.message,
            success: false
        };
    }
} 