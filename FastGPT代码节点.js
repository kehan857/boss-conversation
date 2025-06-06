// 计算当前时间和消息间隔
const currentTime = Date.now();
const timeSinceLastMessage = currentTime - (Number(lastMessageTime) || 0);

// 准备消息历史
let updatedHistory = Array.isArray(messageHistory) ? [...messageHistory] : [];
updatedHistory.push(userMessage || '');

// 更新消息计数
const newMessageCount = (Number(messageCount) || 0) + 1;

// 判断触发条件
const timeThresholdNum = Number(timeThreshold) || 5000;
const messageThresholdNum = Number(messageThreshold) || 10;
const timeCondition = timeSinceLastMessage > timeThresholdNum && updatedHistory.length > 0;
const countCondition = newMessageCount >= messageThresholdNum;
const shouldReply = timeCondition || countCondition;

// 合并消息
let combinedMessage = '';
if (shouldReply && updatedHistory.length > 0) {
  combinedMessage = updatedHistory.join('\n\n');
}

// 最终消息计数
const finalMessageCount = shouldReply ? 0 : newMessageCount;

// 返回结果
return {
  shouldReply: Boolean(shouldReply),
  updatedMessageHistory: shouldReply ? [] : updatedHistory,
  combinedMessage: combinedMessage,
  lastMessageTime: currentTime,
  messageCount: finalMessageCount
}; 