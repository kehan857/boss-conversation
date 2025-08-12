function main({ lastTime, read_time }) {
    const currentTime = Date.now();
    
    // 如果lastTime不存在，isTimeUp为false
    if (!lastTime) {
        return {
            isTimeUp: false,
            elapsedTime: 0,
            currentTime: currentTime
        };
    }
    
    const elapsedTime = currentTime - lastTime;
    
    return {
        isTimeUp: elapsedTime >= read_time,
        elapsedTime: elapsedTime,
        currentTime: currentTime
    };
} 