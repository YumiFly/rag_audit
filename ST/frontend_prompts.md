# RAG审计分析系统 - 前端AI生成提示词

## 🎯 系统概述提示词

```
请为我创建一个现代化的RAG智能合约审计分析系统前端界面。这是一个基于AI的智能合约安全分析平台，集成了Slither静态分析、Echidna模糊测试和Google Gemini AI问答功能。

系统特点：
- 专业的区块链安全审计工具
- 现代化的深色主题UI设计
- 响应式布局，支持桌面和移动端
- 实时分析进度显示
- 智能问答交互界面

技术要求：
- 使用React + TypeScript + Tailwind CSS
- 集成Axios进行API调用
- 使用React Hook Form处理表单
- 添加Loading状态和错误处理
- 支持文件拖拽上传
- 使用图标库（Lucide React或Heroicons）

API基础URL: http://localhost:8000
```

## 🏠 主页面布局提示词

```
创建一个专业的智能合约审计分析系统主页面，包含以下布局：

1. 顶部导航栏：
   - 左侧：系统Logo "RAG Audit" + 副标题 "智能合约安全分析平台"
   - 右侧：健康状态指示器（调用 GET /health 接口显示系统状态）

2. 主要内容区域（4个功能卡片）：
   - 智能合约分析卡片
   - 批量报告上传卡片  
   - AI智能问答卡片
   - 分析历史记录卡片

3. 底部状态栏：
   - 显示API连接状态
   - 系统版本信息
   - 最后更新时间

设计风格：
- 深色主题（bg-gray-900, text-white）
- 渐变背景和玻璃态效果
- 卡片使用 bg-gray-800 背景，hover效果
- 蓝色主色调（blue-500, blue-600）
- 圆角设计（rounded-xl）
- 阴影效果（shadow-lg）

请实现健康检查功能，每30秒自动调用一次 GET /health 接口。
```

## 📊 智能合约分析页面提示词

```
创建智能合约分析页面，实现以下功能：

1. 文件上传区域：
   - 支持拖拽上传.sol文件
   - 文件格式验证（只允许.sol文件）
   - 文件大小限制（最大10MB）
   - 上传进度条显示

2. 分析选项：
   - 合约名称输入框（可选）
   - 或者输入合约地址（Etherscan获取源码）
   - 分析类型选择：Slither静态分析、Echidna模糊测试、或两者都执行

3. 分析结果展示：
   - 实时分析进度条
   - Slither发现的安全问题数量
   - Echidna测试失败数量
   - 详细的漏洞列表（可展开/折叠）
   - 风险等级颜色标识（高危-红色，中危-橙色，低危-黄色）

4. API调用实现：
   - POST /analyze 接口
   - 请求格式：FormData
   - 参数：files（文件）、contract_name（可选）、address（可选）
   - 响应：{doc_id, slither_findings, echidna_fails}

5. 错误处理：
   - 网络错误提示
   - 文件格式错误提示
   - 分析超时处理（显示友好提示）

界面要求：
- 左右分栏布局：左侧上传和配置，右侧结果展示
- 使用步骤指示器显示分析流程
- 添加分析历史记录功能
- 支持结果导出（JSON格式）
```

## 🤖 AI智能问答页面提示词

```
创建RAG智能问答页面，实现智能合约安全咨询功能：

1. 聊天界面设计：
   - 类似ChatGPT的对话界面
   - 用户消息气泡（右侧，蓝色背景）
   - AI回复气泡（左侧，灰色背景）
   - 消息时间戳显示
   - 自动滚动到最新消息

2. 输入区域：
   - 多行文本输入框
   - 发送按钮（支持Enter快捷键）
   - 字符计数显示
   - 清空对话按钮

3. 智能功能：
   - 预设问题模板（常见安全问题）
   - 问题建议（基于用户输入的自动补全）
   - 相关性设置（top_k参数调节）

4. 预设问题示例：
   - "什么是重入攻击？如何防范？"
   - "智能合约中的整数溢出问题"
   - "如何进行访问控制安全检查？"
   - "DeFi协议常见的安全漏洞"
   - "NFT合约的安全最佳实践"

5. API调用实现：
   - POST /ask 接口
   - 请求体：{question: string, top_k?: number}
   - 响应：{answer: string}
   - 添加打字机效果显示AI回复

6. 高级功能：
   - 对话历史保存（localStorage）
   - 回复内容支持Markdown渲染
   - 代码高亮显示
   - 复制回复内容功能
   - 点赞/点踩反馈机制

界面特色：
- 深色聊天主题
- 消息发送动画效果
- AI思考中的加载动画
- 响应式设计，移动端友好
```

## 📁 批量上传页面提示词

```
创建批量审计报告上传页面：

1. 文件上传区域：
   - 多文件拖拽上传
   - 支持JSON格式的Slither和Echidna报告
   - 文件列表显示（名称、大小、状态）
   - 批量删除和单个删除功能

2. 上传进度：
   - 整体上传进度条
   - 单个文件上传状态
   - 成功/失败状态图标
   - 错误信息显示

3. 文件预览：
   - JSON文件内容预览
   - 语法高亮显示
   - 文件结构树形展示
   - 关键信息提取显示

4. 批量操作：
   - 全选/取消全选
   - 批量上传按钮
   - 上传队列管理
   - 重试失败的文件

5. API调用实现：
   - POST /ingest 接口
   - 请求格式：FormData with multiple files
   - 响应：上传统计信息
   - 支持并发上传（限制并发数）

6. 统计信息：
   - 上传文件总数
   - 成功/失败数量
   - 处理的审计记录数量
   - 上传耗时统计

界面设计：
- 卡片式文件列表
- 进度条和状态指示器
- 响应式网格布局
- 拖拽区域高亮效果
```

## 🔧 通用组件提示词

```
创建以下通用组件：

1. LoadingSpinner组件：
   - 多种加载动画样式
   - 可配置大小和颜色
   - 带文字说明的加载状态

2. ErrorBoundary组件：
   - 全局错误捕获
   - 友好的错误页面
   - 错误报告功能

3. Toast通知组件：
   - 成功、警告、错误、信息四种类型
   - 自动消失和手动关闭
   - 位置可配置（顶部、底部等）

4. FileUpload组件：
   - 拖拽上传功能
   - 文件类型和大小验证
   - 上传进度显示
   - 可复用的文件上传逻辑

5. ApiClient工具类：
   - 统一的API调用封装
   - 请求拦截器（添加loading状态）
   - 响应拦截器（错误处理）
   - 重试机制实现

6. 状态管理：
   - 使用Context API或Zustand
   - 全局状态：用户设置、API状态、主题配置
   - 本地存储同步

代码规范：
- TypeScript严格模式
- ESLint + Prettier配置
- 组件Props接口定义
- 错误边界处理
- 性能优化（React.memo, useMemo, useCallback）
```

## 🎨 样式设计提示词

```
实现现代化的UI设计系统：

1. 颜色方案：
   - 主色：蓝色系 (#3B82F6, #1D4ED8, #1E40AF)
   - 背景：深灰色系 (#111827, #1F2937, #374151)
   - 文字：白色和灰色系 (#FFFFFF, #F9FAFB, #9CA3AF)
   - 状态色：成功绿色、警告橙色、错误红色

2. 字体系统：
   - 主字体：Inter或系统字体栈
   - 代码字体：JetBrains Mono或Fira Code
   - 字体大小：12px-48px的响应式缩放

3. 间距系统：
   - 基于8px网格的间距系统
   - 组件内边距：8px, 16px, 24px, 32px
   - 组件间距：16px, 24px, 32px, 48px

4. 动画效果：
   - 页面切换动画（淡入淡出）
   - 按钮hover效果
   - 加载动画
   - 消息通知动画
   - 文件上传进度动画

5. 响应式设计：
   - 移动端优先设计
   - 断点：sm(640px), md(768px), lg(1024px), xl(1280px)
   - 灵活的网格布局
   - 移动端导航菜单

6. 可访问性：
   - ARIA标签支持
   - 键盘导航支持
   - 高对比度模式
   - 屏幕阅读器友好

使用Tailwind CSS实现，确保设计一致性和可维护性。
```

## 🚀 部署和优化提示词

```
实现生产就绪的前端应用：

1. 构建优化：
   - Vite或Create React App配置
   - 代码分割和懒加载
   - 静态资源优化
   - Bundle分析和优化

2. 性能优化：
   - 图片懒加载
   - 虚拟滚动（大列表）
   - 防抖和节流
   - 缓存策略

3. 错误监控：
   - Sentry集成
   - 错误日志收集
   - 性能监控
   - 用户行为分析

4. 环境配置：
   - 开发/测试/生产环境配置
   - 环境变量管理
   - API地址配置
   - 功能开关

5. 测试策略：
   - 单元测试（Jest + React Testing Library）
   - 集成测试
   - E2E测试（Playwright或Cypress）
   - 组件快照测试

6. 部署方案：
   - Docker容器化
   - Nginx配置
   - CDN集成
   - 自动化部署流水线

确保应用的稳定性、性能和用户体验。
```

## 💻 API调用代码示例提示词

```
请实现以下API调用的TypeScript代码：

1. API客户端基础配置：
```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  // 添加loading状态
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

2. 健康检查API：
```typescript
// api/health.ts
export interface HealthResponse {
  status: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
```

3. 智能合约分析API：
```typescript
// api/analyze.ts
export interface AnalyzeRequest {
  file?: File;
  address?: string;
  contract_name?: string;
}

export interface AnalyzeResponse {
  doc_id: string;
  slither_findings: number;
  echidna_fails: number;
}

export const analyzeContract = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const formData = new FormData();

  if (data.file) {
    formData.append('files', data.file);
  }
  if (data.address) {
    formData.append('address', data.address);
  }
  if (data.contract_name) {
    formData.append('contract_name', data.contract_name);
  }

  const response = await apiClient.post<AnalyzeResponse>('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
```

4. AI问答API：
```typescript
// api/ask.ts
export interface AskRequest {
  question: string;
  top_k?: number;
}

export interface AskResponse {
  answer: string;
}

export const askQuestion = async (data: AskRequest): Promise<AskResponse> => {
  const response = await apiClient.post<AskResponse>('/ask', data);
  return response.data;
};
```

5. 批量上传API：
```typescript
// api/ingest.ts
export interface IngestResponse {
  message: string;
  total_processed: number;
}

export const ingestFiles = async (files: File[]): Promise<IngestResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post<IngestResponse>('/ingest', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
```

请基于这些API接口实现完整的前端功能。
```

## 🎯 高级功能提示词

```
实现以下高级功能来提升用户体验：

1. 实时通知系统：
   - WebSocket连接（如果后端支持）
   - 分析进度实时更新
   - 系统状态变化通知
   - 错误和警告实时推送

2. 数据可视化：
   - 安全漏洞统计图表（使用Chart.js或Recharts）
   - 分析历史趋势图
   - 风险等级分布饼图
   - 时间线展示分析记录

3. 高级搜索和过滤：
   - 分析结果搜索功能
   - 按风险等级过滤
   - 按时间范围过滤
   - 按合约类型分类

4. 导出和分享：
   - PDF报告生成
   - Excel数据导出
   - 分析结果分享链接
   - 二维码分享功能

5. 用户偏好设置：
   - 主题切换（深色/浅色）
   - 语言切换（中文/英文）
   - 通知偏好设置
   - 默认分析参数配置

6. 离线功能：
   - Service Worker缓存
   - 离线状态检测
   - 本地数据同步
   - 离线操作队列

7. 键盘快捷键：
   - Ctrl+U: 快速上传文件
   - Ctrl+Enter: 发送问答
   - Ctrl+/: 显示快捷键帮助
   - Esc: 关闭模态框

8. 拖拽和排序：
   - 文件列表拖拽排序
   - 仪表板组件拖拽布局
   - 分析结果拖拽分组
   - 自定义工作区布局

请实现这些功能来创建一个专业级的用户界面。
```

## 🔒 安全和权限提示词

```
实现前端安全最佳实践：

1. 输入验证和清理：
   - 文件类型严格验证
   - 文件大小限制检查
   - XSS防护（DOMPurify）
   - SQL注入防护

2. 错误处理：
   - 敏感信息不暴露
   - 友好的错误提示
   - 错误日志记录
   - 重试机制

3. 数据保护：
   - 本地存储加密
   - 敏感数据不缓存
   - 自动登出机制
   - 数据传输加密

4. 访问控制：
   - API调用频率限制
   - 文件上传大小限制
   - 并发请求控制
   - 资源访问权限

5. 安全头部：
   - CSP内容安全策略
   - HTTPS强制重定向
   - 安全Cookie设置
   - 防点击劫持

请确保前端应用的安全性和稳定性。
```

## 📱 移动端优化提示词

```
创建移动端友好的响应式界面：

1. 移动端导航：
   - 汉堡菜单设计
   - 底部标签栏导航
   - 手势滑动支持
   - 返回按钮处理

2. 触摸优化：
   - 按钮最小44px触摸区域
   - 滑动手势支持
   - 长按菜单
   - 双击缩放

3. 性能优化：
   - 图片懒加载
   - 虚拟滚动
   - 代码分割
   - 预加载关键资源

4. 移动端特有功能：
   - 文件相机拍照上传
   - 语音输入问答
   - 震动反馈
   - 分享到社交媒体

5. 适配不同屏幕：
   - iPhone各尺寸适配
   - Android各尺寸适配
   - 平板电脑布局
   - 横屏模式支持

请确保在所有移动设备上都有良好的用户体验。
```
