# FastGPT JSON转数组代码节点使用说明

## 功能描述

这个代码节点用于将AI输出的JSON格式字符串转换为真正的JavaScript数组，并存储到`segmentsArray`变量中，供后续节点使用。

## 节点配置

### 1. 创建代码运行节点

1. 在FastGPT工作流编辑器中，点击左侧的"+"号
2. 选择"基础功能插件" → "工具" → "代码运行"
3. 将代码节点拖拽到画布上，放在增强回复节点之后

### 2. 配置代码内容

将以下代码复制并粘贴到代码运行节点的代码编辑区：

```javascript
function main({aiOutput}) {
    try {
        // 处理AI输出的JSON字符串
        let jsonString = aiOutput;
        
        // 如果输出包含markdown代码块，提取JSON内容
        if (jsonString.includes('```json')) {
            const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonString = jsonMatch[1];
            }
        } else if (jsonString.includes('```')) {
            const jsonMatch = jsonString.match(/```\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonString = jsonMatch[1];
            }
        }
        
        // 清理字符串，移除可能的多余字符
        jsonString = jsonString.trim();
        
        // 解析JSON为数组
        const segmentsArray = JSON.parse(jsonString);
        
        // 验证是否为数组
        if (!Array.isArray(segmentsArray)) {
            throw new Error('解析结果不是数组格式');
        }
        
        // 返回处理后的数组
        return {
            segmentsArray: segmentsArray
        };
        
    } catch (error) {
        // 如果解析失败，尝试直接返回原文本作为单元素数组
        return {
            segmentsArray: [aiOutput || '解析失败，请检查AI输出格式']
        };
    }
}
```

### 3. 配置输入变量

在"自定义输入"中添加：
- 变量名: `aiOutput`
- 连接: 来自上游增强回复节点的输出

### 4. 配置输出变量

在"自定义输出"中添加：
- 变量名: `segmentsArray`
- 类型: array
- 描述: 解析后的分段数组

## 工作流连接示例

```
[用户输入] → [增强回复节点(分段)] → [JSON转数组节点] → [后续处理节点]
                     ↓                        ↓
                 AI输出JSON              segmentsArray数组
```

## 处理的AI输出格式

### 支持的输入格式

1. **纯JSON数组**
```json
["第一段内容", "😊 第二段内容", "第三段内容"]
```

2. **Markdown代码块格式**
```markdown
```json
["第一段内容", "😊 第二段内容", "第三段内容"]
```
```

3. **包含说明文字的格式**
```
以下是分段结果：
```json
["第一段内容", "😊 第二段内容", "第三段内容"]
```
```

### 输出结果

无论输入哪种格式，都会输出标准的JavaScript数组：
```javascript
segmentsArray = ["第一段内容", "😊 第二段内容", "第三段内容"]
```

## 错误处理

### 自动修复功能
- 自动提取markdown代码块中的JSON内容
- 自动清理多余的空格和换行符
- 验证解析结果是否为数组格式

### 容错机制
如果JSON解析失败，会自动：
1. 将原始AI输出作为单个元素放入数组
2. 返回错误提示信息
3. 确保后续节点不会因解析失败而中断

## 集成到现有工作流

### 与营销智能体测试页面结合

在您的JavaScript代码中可以直接使用：

```javascript
// 在handleResponse函数中
if (segmentsArray && Array.isArray(segmentsArray) && segmentsArray.length > 0) {
    addLog(`成功解析${segmentsArray.length}个分段`, 'success');
    // 使用分段数组进行逐条显示
    processEnhancedResponse(segmentsArray, delay);
} else {
    // 降级处理
    addLog('分段解析失败，使用普通回复', 'warning');
    processSegmentedResponse(aiResponse);
}
```

### 与随机时间节点结合

```
[增强回复节点] → [JSON转数组节点] → [随机时间节点] → [分段显示节点]
      ↓                  ↓                ↓               ↓
   JSON字符串         segmentsArray    accumulatedDelay   逐条显示
```

## 调试技巧

### 1. 查看原始AI输出
在"指定回复"节点中输出aiOutput变量，检查AI的原始输出格式

### 2. 验证数组内容
在"指定回复"节点中输出segmentsArray变量，确认解析结果

### 3. 日志监控
代码节点会自动处理错误，通过工作流日志可以看到详细的处理过程

## 注意事项

1. **输入连接**：确保将增强回复节点的输出正确连接到此代码节点的aiOutput变量
2. **输出使用**：后续节点使用segmentsArray时，可以直接作为JavaScript数组操作
3. **容错性**：即使AI输出格式不规范，代码也会尽力解析或提供降级方案
4. **性能**：JSON解析操作轻量，不会影响工作流性能

这个代码节点确保您的分段功能稳定可靠，无论AI输出什么格式都能正确处理。 