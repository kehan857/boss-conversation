// 接收输入参数 
function main({userChatInput, messageHistory, lastMessageTime, messageThreshold, messageCount, timeThreshold, dialogTurns}) {
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
  if (userChatInput) {
    parsedMsgHistory.push(userChatInput);
  }
  
  // 更新消息计数
  const updatedMsgCount = parsedMsgCount + 1;
  
  // 判断是否应该回复
  const timeCondition = timeSinceLastMessageMs > parsedTimeThreshold && parsedMsgHistory.length > 0;
  const countCondition = updatedMsgCount >= parsedMsgThreshold;
  const shouldReply = timeCondition || countCondition || isFirstConversation;
  
  // 是否应该阻止对话（通常不需要）
  const shouldBlock = false;
  
  // 准备调试信息
  const debug = {
    timeSinceLastMessageMs,
    timeThresholdMs: parsedTimeThreshold,
    parsedLastTimestamp: parsedLastTime,
    currentTime,
    isFirstConversation
  };
  
  // 返回结果
  return {
    userChatInput,
    shouldReply,
    shouldBlock,
    lastMessageTime: String(currentTime),
    messageHistory: shouldReply ? [] : parsedMsgHistory,
    messageCount: shouldReply ? 0 : updatedMsgCount,
    dialogTurns: parsedDialogTurns + 1,
    debug
  };
} 