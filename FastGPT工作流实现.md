# FastGPT多消息汇总功能实现指南

## 功能说明

该功能实现了客户在短时间内（默认5秒）发送多条消息时，系统会自动汇总这些消息，当满足以下条件之一时才触发AI回复：
1. 用户停顿超过设定时间（默认5秒）
2. 消息数超过设定值（默认10条）

## 工作流实现步骤

1. 创建一个新的工作流
2. 添加以下节点并配置：

### 节点1：用户输入
- 类型：输入节点
- 设置：启用流式输出

### 节点2：代码运行节点 - 消息汇总处理
- 类型：代码运行节点
- 代码：
```javascript
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
updatedHistory.push(inputs.userChatInput || '');

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
  userChatInput: shouldReply ? combinedMessage : inputs.userChatInput,
  shouldReply: Boolean(shouldReply),
  shouldBlock: !shouldReply // 控制是否继续执行工作流
};
```

### 节点3：判断器节点
- 类型：判断器节点
- 判断条件：`{{outputs.代码运行节点.shouldReply}}`
- 配置：
  - 为真：连接到AI回复节点
  - 为假：连接到工作流结束节点（阻止继续处理）

### 节点4：AI回复节点
- 类型：AI对话节点
- 配置：
  - 输入：`{{outputs.代码运行节点.userChatInput}}`
  - 模型：根据需要选择

### 节点5：结束节点
- 类型：结束节点

## 工作流连接方式
1. 用户输入 → 代码运行节点
2. 代码运行节点 → 判断器节点
3. 判断器节点(为真) → AI回复节点
4. 判断器节点(为假) → 结束节点

## 代码运行节点输出变量说明
- `userChatInput`: 汇总后的用户消息或原始消息
- `shouldReply`: 是否应该触发AI回复
- `shouldBlock`: 是否应该阻止工作流继续执行

## 全局变量说明
- `lastMessageTime`: 上一条消息的时间戳
- `messageHistory`: 已缓存的消息历史
- `messageCount`: 当前消息计数
- `dialogTurns`: 当前对话轮次 