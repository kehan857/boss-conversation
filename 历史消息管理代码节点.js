function main({
    currentMessage,      // 当前用户消息
    lastMessageTime,     // 上次消息时间戳
    currentTime,         // 当前时间戳
    read_time,           // 阅读时间限制(毫秒)
    hasAIResponse,       // AI是否已回复(boolean)
    messageHistory       // 当前消息历史数组(字符串格式，如"消息1,消息2,消息3")
}) {
    // 解析输入参数
    const message = currentMessage || '';
    const lastTime = parseInt(lastMessageTime) || 0;
    const nowTime = parseInt(currentTime) || Date.now();
    const readTimeLimit = parseInt(read_time) || 2000;
    const aiResponded = hasAIResponse === true || hasAIResponse === 'true';
    
    // 解析当前消息历史数组
    let historyArray = [];
    if (messageHistory && typeof messageHistory === 'string' && messageHistory.trim() !== '') {
        historyArray = messageHistory.split(',').filter(msg => msg.trim() !== '');
    } else if (Array.isArray(messageHistory)) {
        historyArray = messageHistory.filter(msg => msg && msg.trim() !== '');
    }
    
    // 计算时间差
    const timeDiff = nowTime - lastTime;
    
    // 判断逻辑
    let newHistoryArray = [...historyArray];
    let action = '';
    let shouldClear = false;
    let shouldAccumulate = false;
    
    // 核心逻辑判断
    if (aiResponded) {
        // 如果AI已经回复，清空历史消息
        newHistoryArray = [];
        action = 'AI已回复，清空消息历史';
        shouldClear = true;
    } else if (timeDiff <= readTimeLimit) {
        // 如果在read_time时间内且AI未回复，累加存储消息
        if (message && message.trim() !== '') {
            newHistoryArray.push(message.trim());
            action = `在阅读时间内(${timeDiff}ms <= ${readTimeLimit}ms)，累加消息`;
            shouldAccumulate = true;
        }
    } else {
        // 如果超过read_time时间，清空历史消息并开始新的累积
        if (message && message.trim() !== '') {
            newHistoryArray = [message.trim()];
            action = `超过阅读时间(${timeDiff}ms > ${readTimeLimit}ms)，重新开始累积`;
            shouldClear = true;
            shouldAccumulate = true;
        } else {
            newHistoryArray = [];
            action = '超过阅读时间，清空消息历史';
            shouldClear = true;
        }
    }
    
    // 转换为字符串格式
    const newMessageHistory = newHistoryArray.join(',');
    
    return {
        newMessageHistory,      // 更新后的消息历史字符串
        messageCount: newHistoryArray.length,  // 消息数量
        shouldClear,           // 是否执行了清空操作
        shouldAccumulate,      // 是否执行了累积操作
        action,                // 执行的操作描述
        timeDiff,              // 时间差(毫秒)
        withinTimeLimit: timeDiff <= readTimeLimit,  // 是否在时间限制内
        historyArray: newHistoryArray  // 消息历史数组格式(用于调试)
    };
} 