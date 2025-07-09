# React组件实现提示词

## 🏠 主页面组件提示词

```
请创建一个名为 HomePage 的React组件，实现以下功能：

组件要求：
- 使用TypeScript和Tailwind CSS
- 响应式设计，支持桌面和移动端
- 深色主题设计

布局结构：
1. 顶部导航栏 (Header)
2. 主要内容区域 (4个功能卡片的网格布局)
3. 底部状态栏 (Footer)

功能卡片：
1. 智能合约分析卡片
   - 图标：代码分析图标
   - 标题："智能合约分析"
   - 描述："上传Solidity文件进行安全分析"
   - 按钮："开始分析"
   - 点击跳转到 /analyze 页面

2. 批量报告上传卡片
   - 图标：文件上传图标
   - 标题："批量报告上传"
   - 描述："上传Slither和Echidna分析报告"
   - 按钮："批量上传"
   - 点击跳转到 /ingest 页面

3. AI智能问答卡片
   - 图标：机器人图标
   - 标题："AI智能问答"
   - 描述："询问智能合约安全相关问题"
   - 按钮："开始问答"
   - 点击跳转到 /ask 页面

4. 分析历史记录卡片
   - 图标：历史记录图标
   - 标题："分析历史"
   - 描述："查看历史分析记录和结果"
   - 按钮："查看历史"
   - 点击跳转到 /history 页面

状态管理：
- 使用useState管理健康检查状态
- 使用useEffect每30秒调用健康检查API
- 显示API连接状态（在线/离线）

样式要求：
- 卡片hover效果和动画
- 渐变背景
- 玻璃态效果
- 圆角和阴影
- 响应式网格布局

请实现完整的组件代码，包括TypeScript接口定义。
```

## 📊 智能合约分析组件提示词

```
请创建一个名为 ContractAnalyzer 的React组件：

功能需求：
1. 文件上传区域
   - 拖拽上传支持
   - 文件格式验证（.sol文件）
   - 文件大小限制（10MB）
   - 上传进度显示

2. 分析选项
   - 合约名称输入框
   - 合约地址输入框（二选一）
   - 分析类型选择（Slither/Echidna/Both）

3. 分析结果展示
   - 实时进度条
   - 结果统计卡片
   - 详细问题列表
   - 风险等级标识

组件状态：
```typescript
interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  results: AnalyzeResponse | null;
  error: string | null;
  uploadedFile: File | null;
}
```

API集成：
- 调用 POST /analyze 接口
- 处理FormData上传
- 错误处理和重试机制
- 超时处理

UI组件：
- FileDropzone组件（拖拽上传）
- ProgressBar组件（进度显示）
- ResultCard组件（结果展示）
- ErrorAlert组件（错误提示）

样式特点：
- 左右分栏布局
- 步骤指示器
- 动画效果
- 响应式设计

请实现完整的组件，包括所有子组件和样式。
```

## 🤖 AI问答组件提示词

```
请创建一个名为 AIChat 的React组件：

聊天界面设计：
1. 消息列表区域
   - 自动滚动到底部
   - 消息气泡样式
   - 时间戳显示
   - 加载状态动画

2. 输入区域
   - 多行文本框
   - 发送按钮
   - 字符计数
   - Enter发送支持

3. 侧边栏功能
   - 预设问题模板
   - 对话历史
   - 设置选项

数据结构：
```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  topK: number;
}
```

预设问题模板：
- "什么是重入攻击？如何防范？"
- "智能合约中的整数溢出问题"
- "如何进行访问控制安全检查？"
- "DeFi协议常见的安全漏洞"
- "NFT合约的安全最佳实践"

功能特性：
- 打字机效果显示AI回复
- Markdown内容渲染
- 代码语法高亮
- 复制消息内容
- 清空对话历史

API集成：
- 调用 POST /ask 接口
- 流式响应处理（如果支持）
- 错误重试机制

本地存储：
- 对话历史保存
- 用户偏好设置
- 预设问题管理

请实现完整的聊天组件，包括所有交互功能。
```

## 📁 文件上传组件提示词

```
请创建一个名为 FileUploader 的通用文件上传组件：

组件Props：
```typescript
interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (response: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

功能特性：
1. 拖拽上传支持
   - 拖拽区域高亮
   - 拖拽状态指示
   - 多文件拖拽

2. 文件验证
   - 文件类型检查
   - 文件大小限制
   - 文件数量限制
   - 重复文件检测

3. 上传进度
   - 整体进度条
   - 单文件进度
   - 上传速度显示
   - 剩余时间估算

4. 文件列表
   - 文件预览
   - 删除功能
   - 重新上传
   - 状态指示

5. 错误处理
   - 验证错误提示
   - 网络错误处理
   - 重试机制
   - 错误日志

样式设计：
- 虚线边框拖拽区域
- 文件图标和预览
- 进度条动画
- 状态颜色指示

使用示例：
```typescript
<FileUploader
  accept=".sol,.json"
  multiple={true}
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={5}
  onFilesChange={handleFilesChange}
  onUploadProgress={handleProgress}
  onUploadComplete={handleComplete}
  onError={handleError}
/>
```

请实现这个通用的文件上传组件。
```

## 🔔 通知组件提示词

```
请创建一个全局通知系统，包含以下组件：

1. Toast组件：
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}
```

2. ToastContainer组件：
- 管理多个Toast
- 位置配置（顶部/底部/角落）
- 动画进入/退出效果
- 自动堆叠管理

3. useToast Hook：
```typescript
interface UseToastReturn {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}
```

功能特性：
- 自动消失（可配置时间）
- 手动关闭按钮
- 进度条显示剩余时间
- 鼠标悬停暂停计时
- 滑动手势关闭（移动端）

样式设计：
- 不同类型的颜色主题
- 图标指示
- 滑入滑出动画
- 响应式设计

使用示例：
```typescript
const { showToast } = useToast();

showToast({
  type: 'success',
  title: '分析完成',
  message: '智能合约分析已完成，发现3个安全问题',
  duration: 5000
});
```

请实现完整的通知系统。
```

## 📈 数据可视化组件提示词

```
请创建数据可视化组件来展示分析结果：

1. SecurityChart组件：
```typescript
interface SecurityChartProps {
  data: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  type: 'pie' | 'bar' | 'doughnut';
}
```

2. TrendChart组件：
- 显示分析历史趋势
- 时间轴选择（7天/30天/90天）
- 多指标对比
- 交互式图表

3. StatCard组件：
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}
```

4. ProgressRing组件：
- 环形进度条
- 百分比显示
- 动画效果
- 颜色渐变

图表库选择：
- 使用Chart.js + react-chartjs-2
- 或者使用Recharts
- 响应式图表
- 深色主题适配

数据处理：
- 数据格式化
- 空数据处理
- 加载状态
- 错误状态

交互功能：
- 图表点击事件
- 工具提示
- 图例切换
- 数据导出

请实现这些可视化组件。
```
