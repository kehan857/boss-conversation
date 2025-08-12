function main({userChatInput}) {
  // 获取全局变量或设置初始值
  const lastMessageTime = global.lastMessageTime || 0;
  const messageHistory = global.messageHistory || [];
  const messageCount = global.messageCount || 0;
  const dialogTurns = global.dialogTurns || 0;

  // 计算当前时间和消息间隔
  const currentTime = Date.now();
  const timeSinceLastMessage = currentTime - (Number(lastMessageTime) || 0);

  // 准备消息历史
  let updatedHistory = Array.isArray(messageHistory) ? [...messageHistory] : [];
  updatedHistory.push(userChatInput || '');

  // 更新消息计数
  const newMessageCount = (Number(messageCount) || 0) + 1;

  // 设置阈值参数
  const timeThresholdMs = 5000; // 时间阈值，5秒
  const messageThresholdNum = 10; // 消息数阈值，10条消息

  // 判断触发条件
  const timeCondition = timeSinceLastMessage > timeThresholdMs && updatedHistory.length > 0;
  const countCondition = newMessageCount >= messageThresholdNum;
  const shouldReply = timeCondition || countCondition;

  // 合并消息
  let combinedMessage = '';
  if (shouldReply && updatedHistory.length > 0) {
    combinedMessage = updatedHistory.join('\n\n');
  }

  // 计算对话轮次
  const newDialogTurns = shouldReply ? dialogTurns + 1 : dialogTurns;

  // 检查是否需要重置计数（超过10轮对话后重置）
  const shouldResetCounters = newDialogTurns > 10;
  const finalDialogTurns = shouldResetCounters ? 1 : newDialogTurns;

  // 最终消息计数
  const finalMessageCount = shouldReply || shouldResetCounters ? 0 : newMessageCount;

  // 更新全局变量
  global.lastMessageTime = currentTime;
  global.messageHistory = shouldReply ? [] : updatedHistory;
  global.messageCount = finalMessageCount;
  global.dialogTurns = finalDialogTurns;

  // 返回结果
  return {
    userChatInput: shouldReply ? combinedMessage : userChatInput,
    shouldReply: Boolean(shouldReply),
    shouldBlock: !shouldReply // 控制是否继续执行工作流
  };
} 