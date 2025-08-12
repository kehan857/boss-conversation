function main() {
    try {
        // 生成2-10秒之间的随机时间（以毫秒为单位）
        const minSeconds = 2;  // 最小2秒
        const maxSeconds = 10; // 最大10秒
        
        // 生成随机秒数并转换为毫秒
        const randomSeconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        const randomMilliseconds = Math.round(randomSeconds * 1000);
        
        return {
            accumulatedDelay: randomMilliseconds
        };
    } catch (error) {
        // 如果出现错误，返回默认值5秒
        return {
            accumulatedDelay: 5000
        };
    }
} 