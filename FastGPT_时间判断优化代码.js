function main({ lastTime, read_time }) {
    const currentTime = Date.now();
    
    // 如果lastTime不存在或无效，直接返回未到时间
    if (!lastTime || lastTime <= 0) {
        return {
            isTimeUp: false,
            elapsedTime: 0,
            currentTime: currentTime,
            reason: "lastTime无效或不存在"
        };
    }
    
    // 如果read_time无效，默认设为0（立即到时间）
    const validReadTime = read_time && read_time > 0 ? read_time : 0;
    
    // 计算已经过去的时间
    const elapsedTime = currentTime - lastTime;
    
    // 如果计算出的时间差为负数，说明时间异常
    if (elapsedTime < 0) {
        return {
            isTimeUp: false,
            elapsedTime: 0,
            currentTime: currentTime,
            reason: "时间异常：lastTime大于当前时间"
        };
    }
    
    return {
        isTimeUp: elapsedTime >= validReadTime,
        elapsedTime: elapsedTime,
        currentTime: currentTime,
        readTime: validReadTime,
        reason: elapsedTime >= validReadTime ? "时间已到" : "时间未到"
    };
} 