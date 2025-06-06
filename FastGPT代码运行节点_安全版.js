function main({userChatInput, timeThreshold, messageThreshold, maxDialogTurns}) {
  try {
    // 参数检查
    if (userChatInput === undefined || userChatInput === null) {
      console.log('警告: userChatInput 为空');
      userChatInput = '';
    }

    // 获取全局变量或设置初始值
    let lastMessageTime = 0;
    let messageHistory = [];
    let messageCount = 0;
    let dialogTurns = 0;

    // 安全获取全局变量
    try {
      lastMessageTime = global.lastMessageTime || 0;
      messageHistory = global.messageHistory || [];
      messageCount = global.messageCount || 0;
      dialogTurns = global.dialogTurns || 0;
    } catch (e) {
      console.log('获取全局变量出错，使用默认值: ', e.message);
    }

    // 设置阈值参数，允许外部配置
    const timeThresholdMs = Number(timeThreshold) || 5000; // 时间阈值，默认5秒
    const messageThresholdNum = Number(messageThreshold) || 10; // 消息数阈值，默认10条消息
    const maxDialogTurnsNum = Number(maxDialogTurns) || 10; // 最大对话轮次，默认10轮

    // 计算当前时间和消息间隔
    const currentTime = Date.now();
    const timeSinceLastMessage = currentTime - (Number(lastMessageTime) || 0);

    // 准备消息历史
    let updatedHistory = [];
    if (Array.isArray(messageHistory)) {
      updatedHistory = [...messageHistory];
    } else {
      console.log('警告: messageHistory 不是数组，已重置');
    }
    updatedHistory.push(userChatInput);

    // 更新消息计数
    const newMessageCount = (Number(messageCount) || 0) + 1;

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

    // 检查是否需要重置计数（超过设定轮次后重置）
    const shouldResetCounters = newDialogTurns > maxDialogTurnsNum;
    const finalDialogTurns = shouldResetCounters ? 1 : newDialogTurns;

    // 最终消息计数
    const finalMessageCount = shouldReply || shouldResetCounters ? 0 : newMessageCount;

    // 更新全局变量
    try {
      global.lastMessageTime = currentTime;
      global.messageHistory = shouldReply ? [] : updatedHistory;
      global.messageCount = finalMessageCount;
      global.dialogTurns = finalDialogTurns;
    } catch (e) {
      console.log('更新全局变量出错: ', e.message);
    }

    // 返回结果
    return {
      userChatInput: shouldReply ? combinedMessage : userChatInput,
      shouldReply: Boolean(shouldReply),
      shouldBlock: !shouldReply, // 控制是否继续执行工作流
      messageCount: finalMessageCount,
      dialogTurns: finalDialogTurns,
      timeSinceLastMessage: timeSinceLastMessage,
      messagesInHistory: updatedHistory.length,
      error: null
    };
  } catch (error) {
    console.log('多消息汇总功能发生错误: ', error.message);
    // 出错时的安全返回，确保工作流不会中断
    return {
      userChatInput: userChatInput || '',
      shouldReply: true, // 错误情况下直接回复
      shouldBlock: false,
      error: error.message
    };
  }
} 