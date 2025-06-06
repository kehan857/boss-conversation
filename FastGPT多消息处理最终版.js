// 接收输入参数 
function main({userMessage, messageHistory, lastMessageTime, messageThreshold, messageCount, timeThreshold, dialogTurns}) {
  // 确保输入参数的类型正确
  let parsedMsgHistory = Array.isArray(messageHistory) ? [...messageHistory] : [];
  const parsedLastTime = Number(lastMessageTime) || 0;
  const parsedMsgCount = Number(messageCount) || 0;
  const parsedTimeThreshold = Number(timeThreshold) || 10000;
  const parsedMsgThreshold = Number(messageThreshold) || 10;
  const parsedDialogTurns = Number(dialogTurns) || 0;
  
  // 计算当前时间
  const currentTime = Date.now();
  const timeSinceLastMessageMs = currentTime - parsedLastTime;
  
  // 检测是否是第一次对话
  const isFirstConversation = parsedLastTime === 0 || parsedDialogTurns === 0;
  
  // 添加当前消息到历史记录
  if (userMessage) {
    parsedMsgHistory.push(userMessage);
  }
  
  // 更新消息计数
  const updatedMsgCount = parsedMsgCount + 1;
  
  // 判断触发条件
  const timeCondition = timeSinceLastMessageMs > parsedTimeThreshold && parsedMsgHistory.length > 0;
  const countCondition = updatedMsgCount >= parsedMsgThreshold;
  
  // 确定是否应该回复，对首次对话特殊处理
  const shouldReplyByTime = timeCondition;
  const shouldReplyByCount = countCondition;
  const shouldReplyByFirstConversation = isFirstConversation;
  const shouldReply = shouldReplyByTime || shouldReplyByCount || shouldReplyByFirstConversation;
  
  // 是否应该阻止对话（通常不需要）
  const shouldBlock = false;
  
  // 准备调试信息
  const debug = {
    timeSinceLastMessageMs,
    timeThresholdMs: parsedTimeThreshold,
    parsedLastTimestamp: parsedLastTime,
    currentTime,
    isFirstConversation,
    shouldReplyByTime,
    shouldReplyByCount,
    shouldReplyByFirstConversation,
    messageHistoryLength: parsedMsgHistory.length,
    inputUserMessage: userMessage
  };
  
  // 优化：针对首次对话不清空消息历史和计数，只有在达到阈值时才清空
  // 优先级：计数条件 > 时间条件 > 首次对话条件
  let finalMessageHistory = parsedMsgHistory;
  let finalMessageCount = updatedMsgCount;
  
  // 只有在达到消息数阈值或时间阈值时才清空
  if (shouldReplyByCount || shouldReplyByTime) {
    finalMessageHistory = [];
    finalMessageCount = 0;
  }
  
  // 返回结果
  return {
    userMessage,
    shouldReply,
    shouldBlock,
    lastMessageTime: String(currentTime),
    messageHistory: finalMessageHistory,
    messageCount: finalMessageCount,
    dialogTurns: parsedDialogTurns + 1,
    debug
  };
} 