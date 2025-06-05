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