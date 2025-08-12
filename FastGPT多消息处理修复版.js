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
  
  // 修复：更精确地判断是否是第一次对话 - 只在lastMessageTime为0时才视为首次对话
  const isFirstConversation = parsedLastTime === 0;
  
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
  
  // 修复：根据条件决定是否应该回复
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
    inputUserMessage: userMessage,
    parsedMsgHistory: parsedMsgHistory
  };
  
  // 优化：针对首次对话和短时间内多条消息的处理
  let finalMessageHistory = parsedMsgHistory;
  let finalMessageCount = updatedMsgCount;
  
  // 只有在达到消息数阈值或时间阈值时才清空，首次对话不清空
  if (shouldReplyByCount || shouldReplyByTime) {
    finalMessageHistory = [];
    finalMessageCount = 0;
  }
  
  // 修复：确保messageHistory正确返回
  // 如果不需要回复，或者仅因为是首次对话需要回复，则保留消息历史
  const outputMessageHistory = shouldReply && !shouldReplyByFirstConversation ? 
                              (shouldReplyByCount || shouldReplyByTime ? [] : parsedMsgHistory) : 
                              parsedMsgHistory;
  
  // 返回结果
  return {
    userMessage,
    shouldReply,
    shouldBlock,
    lastMessageTime: String(currentTime),
    messageHistory: outputMessageHistory,
    messageCount: finalMessageCount,
    dialogTurns: parsedDialogTurns + 1,
    debug
  };
} 