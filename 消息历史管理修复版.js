async function main({ userMessage, messageHistory }) {
    // 1. 验证输入类型
    if (typeof userMessage !== 'string') {
        throw new Error('userMessage必须是字符串类型');
    }
    if (!Array.isArray(messageHistory)) {
        throw new Error('messageHistory必须是字符串数组');
    }
    
    // 2. 创建新的消息历史数组（避免修改原数组）
    const updatedMessageHistory = [...messageHistory];
    
    // 3. 检查是否需要添加消息（避免重复）
    const trimmedMessage = userMessage.trim();
    let messageAdded = false;
    
    if (trimmedMessage !== '') {
        // 检查最后一条消息是否与当前消息相同
        const lastMessage = updatedMessageHistory[updatedMessageHistory.length - 1];
        
        if (lastMessage !== trimmedMessage) {
            // 只有当最后一条消息与当前消息不同时才添加
            updatedMessageHistory.push(trimmedMessage);
            messageAdded = true;
        }
    }
    
    // 4. 返回更新后的消息历史
    return {
        messageHistory: updatedMessageHistory,
        messageCount: updatedMessageHistory.length,
        latestMessage: userMessage,
        messageAdded: messageAdded,  // 标记是否实际添加了消息
        success: true
    };
} 