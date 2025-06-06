// 检查必要的输入参数是否存在
if (typeof userChatInput !== 'string') {
  throw new Error('缺少用户消息输入');
}

// 获取或初始化全局变量（确保变量存在）
const messageHistory = globalVariables.messageHistory || [];
const lastMsgTime = globalVariables.lastMessageTime || 0;
const msgCount = globalVariables.messageCount || 0;

// 设置阈值参数（检查是否从全局变量获取）
const msgThreshold = globalVariables.messageThreshold || 10;
const timeThreshold = globalVariables.timeThreshold || 5000;

// 计算当前时间和消息间隔
const currentTime = Date.now();
const timeSinceLastMessage = currentTime - lastMsgTime;

// 准备消息历史 
let updatedHistory = [...messageHistory];
updatedHistory.push(userChatInput);

// 更新消息计数
const newMessageCount = msgCount + 1;

// 判断触发条件
const timeCondition = timeSinceLastMessage > timeThreshold && updatedHistory.length > 0;
const countCondition = newMessageCount >= msgThreshold;
const shouldReply = timeCondition || countCondition;

// 合并消息
let combinedMessage = '';
if (shouldReply && updatedHistory.length > 0) {
  combinedMessage = updatedHistory.join('\n\n');
}

// 最终消息计数
const finalMessageCount = shouldReply ? 0 : newMessageCount;

// 返回所有需要的输出
return {
  shouldReply: shouldReply,
  updatedMessageHistory: shouldReply ? [] : updatedHistory,
  combinedMessage: combinedMessage,
  lastMessageTime: currentTime,
  messageCount: finalMessageCount
}; 