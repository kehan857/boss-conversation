/**
 * 增强回复分段输出节点
 * 接收批量生成的数组信息并按照设定的延迟时间分段输出
 * @param {Object} inputs - 输入参数
 * @param {string|string[]} inputs.inputText - 输入文本或文本数组
 * @param {number} inputs.accumulatedDelay - 每段显示的延迟时间(毫秒)
 * @param {number} inputs.segmentLength - 每段的最大字符数
 * @returns {Object} - 返回分段后的文本数组和延迟时间
 */
async function main(inputs) {
  // 解析输入参数
  const { inputText, accumulatedDelay = 2000, segmentLength = 150 } = inputs;
  
  // 处理输入可能是字符串或数组的情况
  let textToProcess = inputText;
  
  // 如果输入为空，返回空数组
  if (!textToProcess) {
    return {
      outputText: [],
      accumulatedDelay: accumulatedDelay
    };
  }
  
  // 如果输入已经是数组，则直接使用
  if (Array.isArray(textToProcess)) {
    return {
      outputText: textToProcess,
      accumulatedDelay: accumulatedDelay
    };
  }
  
  // 如果输入是字符串，分段处理
  function segmentText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return [text];
    }
    
    const segments = [];
    let currentSegment = '';
    
    // 按句子分割，保留分隔符
    const sentences = text.split(/([。！？.!?])/);
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '');
      
      // 如果当前段落加上新句子会超出最大长度，创建新段落
      if (currentSegment.length + sentence.length > maxLength && currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = sentence;
      } else {
        currentSegment += sentence;
      }
    }
    
    // 添加最后一段
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }
    
    return segments;
  }
  
  // 添加表情和格式化
  function formatText(segments) {
    const emojis = ['😊', '👍', '✨', '🔍', '📝', '💡', '🌟', '📊', '🎯', '🚀'];
    
    return segments.map((segment, index) => {
      // 随机选择表情
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      // 为每段添加表情前缀
      return `${emoji} ${segment}`;
    });
  }
  
  // 执行分段和格式化
  const segments = segmentText(textToProcess, segmentLength);
  const formattedSegments = formatText(segments);
  
  // 返回处理结果
  return {
    outputText: formattedSegments,
    accumulatedDelay: accumulatedDelay
  };
} 