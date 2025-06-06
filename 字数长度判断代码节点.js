function main({content, SegmentLength}) {
    // 获取输入内容，如果没有content则使用空字符串
    const text = content || '';
    
    // 计算当前文本的字数长度
    const currentLength = text.length;
    
    // 获取限定长度，如果没有SegmentLength则默认为100
    const limitLength = parseInt(SegmentLength) || 100;
    
    // 判断是否超过限定长度
    const isExceeded = currentLength > limitLength;
    
    return {
        isExceeded,         // 布尔值：是否超过长度限制
        currentLength,      // 当前文本长度
        limitLength,        // 限定长度
        difference: currentLength - limitLength  // 超出的字数（负数表示未超出）
    };
} 