# FastGPT随机时间代码节点使用说明（简化版）

## 功能描述

这个代码节点用于在FastGPT工作流中生成2-10秒之间的随机时间（毫秒为单位），输出为`accumulatedDelay`变量，可以直接用于延迟控制。

## 节点配置

### 1. 创建代码运行节点

1. 在FastGPT工作流编辑器中，点击左侧的"+"号
2. 选择"基础功能插件" → "工具" → "代码运行"
3. 将代码节点拖拽到画布上

### 2. 配置代码内容

将以下代码复制并粘贴到代码运行节点的代码编辑区：

```javascript
function main() {
    // 生成2-10秒之间的随机时间（以毫秒为单位）
    const minSeconds = 2;  // 最小2秒
    const maxSeconds = 10; // 最大10秒
    
    // 生成随机秒数并转换为毫秒
    const randomSeconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
    const randomMilliseconds = Math.round(randomSeconds * 1000);
    
    return {
        accumulatedDelay: randomMilliseconds
    };
}
```

### 3. 配置输出变量

在"自定义输出"中添加：

- `accumulatedDelay` - 随机延迟时间（毫秒，范围：2000-10000）

## 使用场景

### 1. 直接用于delay函数

```javascript
// 在后续的代码节点中使用
async function main({accumulatedDelay}) {
    await delay(accumulatedDelay);
    return {
        result: "延迟执行完成"
    };
}
```

### 2. 控制分段回复间隔

```javascript
// 使用随机延迟控制分段发送
async function main({segments, accumulatedDelay}) {
    for (let i = 0; i < segments.length; i++) {
        // 发送段落
        await sendSegment(segments[i]);
        // 随机延迟
        await delay(accumulatedDelay);
    }
    return { result: "分段发送完成" };
}
```

### 3. 工作流连接示例

```
[用户输入] → [随机时间节点] → [延迟节点] → [AI对话]
```

## 自定义配置

### 修改时间范围

```javascript
// 修改为1-5秒范围
const minSeconds = 1;  
const maxSeconds = 5;  

// 修改为0.5-3秒范围
const minSeconds = 0.5;  
const maxSeconds = 3;    
```

## 输出说明

- **变量名**: `accumulatedDelay`
- **数据类型**: 整数（毫秒）
- **取值范围**: 2000-10000（对应2-10秒）
- **用途**: 可直接用于FastGPT的delay()函数

## 使用示例

1. **基础延迟**: 直接连接到使用delay()函数的代码节点
2. **条件判断**: 根据延迟时间进行分支处理
3. **循环控制**: 在循环中使用不同的随机延迟

这个简化版本专注于核心功能，易于使用和集成到现有工作流中。 