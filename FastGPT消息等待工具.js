/**
 * FastGPT消息等待工具
 * 用于控制消息批量处理时的延迟等待
 * 在多消息处理场景中，根据配置的消息阈值和时间阈值来决定何时触发回复
 * 
 * @param {Object} inputs - 输入参数
 * @param {string} inputs.userMessage - 用户当前消息
 * @param {Array} inputs.messageHistory - 消息历史记录
 * @param {number} inputs.messageCount - 当前累积的消息数量
 * @param {number} inputs.messageThreshold - 触发回复的消息数量阈值
 * @param {number} inputs.lastMessageTime - 上一条消息的时间戳
 * @param {number} inputs.timeThreshold - 触发回复的时间阈值(毫秒)
 * @param {number} inputs.dialogTurns - 对话轮次计数
 * @returns {Object} - 返回带有shouldReply和其他控制参数的结果对象
 */
function main(inputs) {
  // 确保输入参数的类型正确
  let {
    userMessage,
    messageHistory = [],
    messageCount = 0,
    messageThreshold = 3,
    lastMessageTime = "0",
    timeThreshold = 2000,
    dialogTurns = 0
  } = inputs;
  
  // 解析参数，确保类型正确
  let parsedMsgHistory = Array.isArray(messageHistory) ? [...messageHistory] : [];
  const parsedLastTime = Number(lastMessageTime) || 0;
  const parsedMsgCount = Number(messageCount) || 0;
  const parsedTimeThreshold = Number(timeThreshold) || 2000;
  const parsedMsgThreshold = Number(messageThreshold) || 3;
  const parsedDialogTurns = Number(dialogTurns) || 0;
  
  // 计算当前时间
  const currentTime = Date.now();
  const timeSinceLastMessageMs = currentTime - parsedLastTime;
  
  // 判断是否是首次对话
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
  
  // 确定是否应该回复
  const shouldReplyByTime = timeCondition;
  const shouldReplyByCount = countCondition;
  const shouldReplyByFirstConversation = isFirstConversation;
  
  // 按条件决定是否应该回复
  const shouldReply = shouldReplyByTime || shouldReplyByCount || shouldReplyByFirstConversation;
  
  // 是否应该阻止对话
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
    parsedMsgHistory: JSON.stringify(parsedMsgHistory).slice(0, 500) + '...' // 防止过长
  };
  
  // 如果需要回复，且不是因为首次对话，则清空消息历史
  let finalMessageHistory = parsedMsgHistory;
  let finalMessageCount = updatedMsgCount;
  
  if ((shouldReplyByCount || shouldReplyByTime) && shouldReply) {
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