# 🔐 智能合约安全分析平台

一个基于RAG（检索增强生成）架构的全栈智能合约安全分析平台，集成多种安全分析工具，提供现代化Web界面和智能问答功能。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a393.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

## ✨ 核心功能

### 🔍 智能合约分析
- **多工具集成**: 支持Slither、Mythril、Echidna等主流安全分析工具
- **实时分析**: 上传合约代码即可获得详细的安全分析报告
- **漏洞检测**: 自动识别常见的智能合约安全漏洞
- **风险评估**: 提供详细的风险等级和修复建议

### 🤖 AI智能问答
- **RAG架构**: 基于向量检索的智能合约安全问题解答
- **上下文理解**: 支持多轮对话，理解复杂的技术问题
- **专业解答**: 针对智能合约安全问题提供专业建议
- **实时响应**: 快速获得准确的技术支持

### 📊 批量报告管理
- **批量上传**: 支持多个报告文件同时上传和处理
- **智能解析**: 自动解析不同格式的安全分析报告
- **统计分析**: 提供详细的统计数据和趋势分析
- **报告预览**: 支持JSON、文本等多种格式的报告预览

### 🌐 现代化Web界面
- **响应式设计**: 支持桌面和移动设备的完美体验
- **暗色主题**: 现代化的暗色主题界面设计
- **实时更新**: 分析进度和结果的实时显示
- **交互式图表**: 直观的数据可视化和统计图表

## 📊 系统架构

### 整体架构图

```mermaid
graph TB
    %% 用户交互层
    subgraph "用户交互层"
        UI[Web界面/API客户端]
        CLI[命令行工具]
    end
    
   %% API网关层
    subgraph "API服务层"
        API["FastAPI服务器\nrag_audit_api.py"]
        HEALTH["/health\n健康检查"]
        ANALYZE["/analyze\n合约分析"]
        INGEST["/ingest\n批量上传"]
        ASK["/ask\n智能问答"]

        API --> HEALTH
        API --> ANALYZE
        API --> INGEST
        API --> ASK
    end
    
    %% 核心处理层
    subgraph "智能合约分析引擎"
        SLITHER[Slither静态分析<br/>安全漏洞检测]
        ECHIDNA[Echidna模糊测试<br/>属性验证]
        PARSER[报告解析器<br/>flatten_slither/echidna]
    end
    
    %% AI处理层
    subgraph "AI智能处理层"
        GEMINI[Google Gemini AI]
        EMBED[文本向量化<br/>embedding-001]
        GEN[文本生成<br/>gemini-pro]
    end
    
    %% 数据存储层
    subgraph "数据存储层"
        SUPABASE[(Supabase数据库)]
        VECTORS[(audit_vectors表\n向量存储)]
        SEARCH["向量相似度搜索\nmatch_documents()"]
    end
    
    %% 外部服务
    subgraph "外部服务"
        ETHERSCAN[Etherscan API<br/>合约源码获取]
        GITHUB[GitHub<br/>代码仓库]
    end
    
    %% 数据流连接
    UI --> API
    CLI --> API
    
    API --> HEALTH
    API --> ANALYZE
    API --> INGEST
    API --> ASK
    
    %% 分析流程
    ANALYZE --> SLITHER
    ANALYZE --> ECHIDNA
    ANALYZE --> ETHERSCAN
    
    SLITHER --> PARSER
    ECHIDNA --> PARSER
    
    %% 数据处理流程
    PARSER --> EMBED
    INGEST --> EMBED
    EMBED --> GEMINI
    EMBED --> VECTORS
    
    %% 问答流程
    ASK --> EMBED
    ASK --> SEARCH
    SEARCH --> VECTORS
    VECTORS --> GEN
    GEN --> GEMINI
    
    %% 存储连接
    VECTORS --> SUPABASE
    SEARCH --> SUPABASE
    
    %% 样式定义
    classDef userLayer fill:#e1f5fe
    classDef apiLayer fill:#f3e5f5
    classDef analysisLayer fill:#fff3e0
    classDef aiLayer fill:#e8f5e8
    classDef dataLayer fill:#fce4ec
    classDef externalLayer fill:#f1f8e9
    
    class UI,CLI userLayer
    class API,HEALTH,ANALYZE,INGEST,ASK apiLayer
    class SLITHER,ECHIDNA,PARSER analysisLayer
    class GEMINI,EMBED,GEN aiLayer
    class SUPABASE,VECTORS,SEARCH dataLayer
    class ETHERSCAN,GITHUB externalLayer
```

## 🔄 数据流程

### RAG问答流程时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant API as FastAPI服务
    participant Slither as Slither分析器
    participant Echidna as Echidna测试器
    participant Gemini as Google Gemini AI
    participant DB as Supabase数据库
    participant Vector as 向量存储

    %% 合约分析流程
    Note over User,Vector: 智能合约分析流程
    User->>API: POST /analyze (上传.sol文件)
    API->>Slither: 执行静态分析
    Slither-->>API: 返回安全漏洞报告
    API->>Echidna: 执行模糊测试
    Echidna-->>API: 返回属性测试结果
    API->>Gemini: 调用embedding-001生成向量
    Gemini-->>API: 返回768维向量
    API->>Vector: 存储分析结果和向量
    Vector->>DB: 保存到audit_vectors表
    API-->>User: 返回分析结果摘要

    %% 智能问答流程
    Note over User,Vector: RAG智能问答流程
    User->>API: POST /ask (提问)
    API->>Gemini: 将问题转换为向量
    Gemini-->>API: 返回问题向量
    API->>Vector: 执行向量相似度搜索
    Vector->>DB: 调用match_documents()函数
    DB-->>Vector: 返回相关文档
    Vector-->>API: 返回top_k相关内容
    API->>Gemini: 基于上下文生成回答
    Gemini-->>API: 返回AI生成的回答
    API-->>User: 返回智能问答结果
```

## 🛠️ 技术栈架构

### 技术组件详细架构

```mermaid
graph TB
    %% 用户交互层
    subgraph "用户交互层"
        UI[Web界面/API客户端]
        CLI[命令行工具]
    end
    
    %% API网关层
    subgraph "API服务层"
        API["FastAPI服务器\nrag_audit_api.py"]
        HEALTH["/health\n健康检查"]
        ANALYZE["/analyze\n合约分析"]
        INGEST["/ingest\n批量上传"]
        ASK["/ask\n智能问答"]
    end
    
    %% 核心处理层
    subgraph "智能合约分析引擎"
        SLITHER[Slither静态分析<br/>安全漏洞检测]
        ECHIDNA[Echidna模糊测试<br/>属性验证]
        PARSER[报告解析器<br/>flatten_slither/echidna]
    end
    
    %% AI处理层
    subgraph "AI智能处理层"
        GEMINI[Google Gemini AI]
        EMBED[文本向量化<br/>embedding-001]
        GEN[文本生成<br/>gemini-pro]
    end
    
    %% 数据存储层
    subgraph "数据存储层"
        SUPABASE[(Supabase数据库)]
        VECTORS[(audit_vectors表\n向量存储)]
        SEARCH["向量相似度搜索\nmatch_documents()"]
    end
    
    %% 外部服务
    subgraph "外部服务"
        ETHERSCAN[Etherscan API<br/>合约源码获取]
        GITHUB[GitHub<br/>代码仓库]
    end
    
    %% 数据流连接
    UI --> API
    CLI --> API
    
    API --> HEALTH
    API --> ANALYZE
    API --> INGEST
    API --> ASK
    
    %% 分析流程
    ANALYZE --> SLITHER
    ANALYZE --> ECHIDNA
    ANALYZE --> ETHERSCAN
    
    SLITHER --> PARSER
    ECHIDNA --> PARSER
    
    %% 数据处理流程
    PARSER --> EMBED
    INGEST --> EMBED
    EMBED --> GEMINI
    EMBED --> VECTORS
    
    %% 问答流程
    ASK --> EMBED
    ASK --> SEARCH
    SEARCH --> VECTORS
    VECTORS --> GEN
    GEN --> GEMINI
    
    %% 存储连接
    VECTORS --> SUPABASE
    SEARCH --> SUPABASE
    
    %% 样式定义
    classDef userLayer fill:#e1f5fe
    classDef apiLayer fill:#f3e5f5
    classDef analysisLayer fill:#fff3e0
    classDef aiLayer fill:#e8f5e8
    classDef dataLayer fill:#fce4ec
    classDef externalLayer fill:#f1f8e9
    
    class UI,CLI userLayer
    class API,HEALTH,ANALYZE,INGEST,ASK apiLayer
    class SLITHER,ECHIDNA,PARSER analysisLayer
    class GEMINI,EMBED,GEN aiLayer
    class SUPABASE,VECTORS,SEARCH dataLayer
    class ETHERSCAN,GITHUB externalLayer
```

### 核心技术组件

#### 后端技术栈
- **Web框架**: FastAPI - 现代、快速的Python Web框架
- **AI服务**: Google Gemini AI (embedding-001, gemini-pro)
- **数据库**: Supabase (PostgreSQL + pgvector)
- **分析工具**: Slither v0.9.3, Echidna
- **向量存储**: 768维向量嵌入
- **外部API**: Etherscan API
- **测试框架**: pytest

#### 前端技术栈
- **框架**: Next.js 14 - React全栈框架
- **语言**: TypeScript - 类型安全的JavaScript
- **样式**: Tailwind CSS - 实用优先的CSS框架
- **组件库**: Shadcn/ui - 现代化UI组件库
- **图标**: Lucide React - 精美的图标库
- **状态管理**: React Hooks - 现代化状态管理

#### 开发工具
- **容器化**: Docker & Docker Compose
- **依赖管理**: Poetry (Python), npm (Node.js)
- **代码质量**: ESLint, Prettier
- **版本控制**: Git

## 🔑 核心特性

### RAG架构优势
- **检索增强生成**: 结合向量检索和AI生成，提供准确的智能合约审计问答
- **语义搜索**: 基于768维向量的语义相似度搜索
- **上下文感知**: 根据检索到的相关审计报告生成针对性回答

### 多工具集成
- **Slither静态分析**: 检测常见的智能合约安全漏洞
- **Echidna模糊测试**: 基于属性的自动化测试
- **双重验证**: 静态分析和动态测试相结合

### 容错与性能
- **重试机制**: 针对AI API超时的指数退避重试
- **备用方案**: 零向量备用确保系统稳定性
- **并发处理**: 支持批量数据处理和并发请求

### 数据处理能力
- **多格式支持**: Solidity源码、JSON报告、合约地址
- **批量处理**: 支持大规模审计报告的批量上传和处理
- **增量更新**: 支持审计数据的增量添加和更新

## 🚀 快速开始

### 环境要求
- **Node.js**: 18.0+ (推荐使用LTS版本)
- **Python**: 3.8+
- **PostgreSQL**: 12+ (或使用Supabase)
- **Docker**: 20.0+ (可选，用于容器化部署)

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd rag-audit-api
```

#### 2. 环境配置
```bash
# 后端环境变量
cd backend
cp .env.example .env

# 编辑.env文件，配置以下变量：
# SUPABASE_URL="your-supabase-url"
# SUPABASE_KEY="your-supabase-key"
# GOOGLE_API_KEY="your-google-api-key"
# ETHERSCAN_API_KEY="your-etherscan-key"  # 可选
```

#### 3. 后端设置
```bash
# 安装Poetry (如果未安装)
curl -sSL https://install.python-poetry.org | python3 -

# 安装依赖
poetry install

# 运行数据库迁移 (如果需要)
poetry run alembic upgrade head

# 启动后端服务
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. 前端设置
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 5. 访问应用
- **前端应用**: http://localhost:3000
- **后端API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 🐳 Docker部署

### 使用Docker Compose (推荐)
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独构建
```bash
# 构建后端镜像
docker build -t smart-contract-analyzer-backend ./backend

# 构建前端镜像
docker build -t smart-contract-analyzer-frontend ./frontend

# 运行后端
docker run -p 8000:8000 --env-file backend/.env smart-contract-analyzer-backend

# 运行前端
docker run -p 3000:3000 smart-contract-analyzer-frontend
```

## 📡 API接口

### 主要端点

#### 智能合约分析
| 接口 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/v1/analyze` | POST | 分析智能合约 | files, contract_name |
| `/api/v1/analyze/{analysis_id}` | GET | 获取分析结果 | analysis_id |
| `/api/v1/analyze/history` | GET | 获取分析历史 | page, limit |

#### AI问答
| 接口 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/v1/chat` | POST | 发送问答请求 | question, top_k |
| `/api/v1/chat/history` | GET | 获取对话历史 | page, limit |

#### 报告管理
| 接口 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/v1/reports/upload` | POST | 上传报告 | files |
| `/api/v1/reports` | GET | 获取报告列表 | page, limit |
| `/api/v1/reports/{report_id}` | DELETE | 删除报告 | report_id |

#### 系统接口
| 接口 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/docs` | GET | API文档 |

详细的API文档请访问: http://localhost:8000/docs

## 🧪 测试

```bash
# 运行冒烟测试（快速验证）
python run_tests_unified.py smoke

# 运行完整测试
python run_tests_unified.py all

# 使用pytest
pytest tests/test_pytest.py -v
```

详细测试说明请参考 [TEST_README.md](TEST_README.md)

## 🔧 配置说明

### 环境变量配置
```bash
# 后端配置 (backend/.env)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GOOGLE_API_KEY=your_google_api_key
ETHERSCAN_API_KEY=your_etherscan_key
SECRET_KEY=your_secret_key
DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]

# 前端配置 (frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=智能合约安全分析平台
```

### 数据库配置
```sql
-- 创建数据库
CREATE DATABASE smart_contract_db;

-- 启用pgvector扩展 (如果使用PostgreSQL)
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建audit_vectors表
CREATE TABLE audit_vectors (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 💡 使用示例

### Web界面使用
1. **智能合约分析**
   - 访问 http://localhost:3000/analyze
   - 上传.sol文件或输入合约地址
   - 查看详细的安全分析报告

2. **AI智能问答**
   - 访问 http://localhost:3000/chat
   - 输入智能合约安全相关问题
   - 获得基于RAG的专业解答

3. **批量报告管理**
   - 访问 http://localhost:3000/batch-upload
   - 批量上传分析报告
   - 查看统计数据和报告预览

4. **分析历史**
   - 访问 http://localhost:3000/history
   - 查看所有分析历史记录
   - 导出和管理分析数据

### API使用示例

#### 智能合约分析
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "files=@contract.sol" \
  -F "contract_name=MyContract"
```

#### RAG智能问答
```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "什么是重入攻击？如何防范？",
    "top_k": 5
  }'
```

#### 批量上传审计报告
```bash
curl -X POST "http://localhost:8000/api/v1/reports/upload" \
  -F "files=@slither_report.json" \
  -F "files=@echidna_report.json"
```

## 📁 项目结构

```
rag-audit-api/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── api/            # API路由
│   │   │   └── v1/         # API版本1
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic模式
│   │   ├── services/       # 业务逻辑
│   │   └── main.py         # 应用入口
│   ├── tests/              # 测试文件
│   ├── alembic/            # 数据库迁移
│   ├── pyproject.toml      # Python依赖配置
│   └── Dockerfile          # 后端Docker配置
├── frontend/               # 前端代码
│   ├── app/                # Next.js应用路由
│   │   ├── analyze/        # 智能合约分析页面
│   │   ├── chat/           # AI问答页面
│   │   ├── history/        # 分析历史页面
│   │   ├── batch-upload/   # 批量上传页面
│   │   └── layout.tsx      # 根布局
│   ├── components/         # React组件
│   │   ├── ui/             # UI基础组件
│   │   └── navigation/     # 导航组件
│   ├── lib/                # 工具函数
│   ├── public/             # 静态资源
│   ├── package.json        # Node.js依赖
│   └── Dockerfile          # 前端Docker配置
├── docker-compose.yml      # Docker编排配置
├── .gitignore              # Git忽略文件
└── README.md              # 项目文档
```

## 🧪 测试

### 后端测试
```bash
cd backend

# 运行所有测试
poetry run pytest

# 运行特定测试
poetry run pytest tests/test_api.py -v

# 运行覆盖率测试
poetry run pytest --cov=app tests/

# 运行冒烟测试（快速验证）
python run_tests_unified.py smoke

# 运行完整测试
python run_tests_unified.py all
```

### 前端测试
```bash
cd frontend

# 运行单元测试
npm test

# 运行E2E测试
npm run test:e2e

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint
```

详细测试说明请参考 [TEST_README.md](TEST_README.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 🆘 故障排除

### 常见问题

#### Node.js版本问题
如果遇到"Unexpected token '?'"或类似的语法错误：
```bash
# 检查Node.js版本
node --version

# 如果版本低于18，请升级
# 使用nvm升级 (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 或直接下载安装
# 访问 https://nodejs.org/ 下载LTS版本
```

#### 数据库连接问题
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 测试数据库连接
psql -h localhost -U username -d database_name

# 检查Supabase连接
curl -H "apikey: YOUR_SUPABASE_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

#### 端口冲突问题
```bash
# 检查端口占用
lsof -i :3000  # 前端端口
lsof -i :8000  # 后端端口

# 修改端口
# 后端
uvicorn app.main:app --port 8001

# 前端
npm run dev -- --port 3001
```

#### 依赖安装问题
```bash
# 清理缓存重新安装
# Python
poetry cache clear --all pypi
poetry install

# Node.js
rm -rf node_modules package-lock.json
npm install
```

## 📈 路线图

### 已完成 ✅
- [x] 基础RAG架构和API服务
- [x] Slither和Echidna集成
- [x] 现代化Web前端界面
- [x] AI智能问答功能
- [x] 批量报告管理
- [x] Docker容器化部署

### 进行中 🚧
- [ ] 用户认证和权限管理
- [ ] 更多数据可视化图表
- [ ] 性能优化和缓存机制

### 计划中 📋
- [ ] 支持更多静态分析工具 (MythX, Securify)
- [ ] 增加智能合约形式化验证
- [ ] 支持多链智能合约分析 (Ethereum, BSC, Polygon)
- [ ] 集成更多AI模型选择 (Claude, GPT-4)
- [ ] 移动端应用开发
- [ ] 企业级部署方案

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式
1. **报告问题**: 在 [Issues](https://github.com/your-repo/issues) 中报告bug或提出功能请求
2. **提交代码**: Fork项目，创建分支，提交Pull Request
3. **改进文档**: 帮助完善文档和示例
4. **分享经验**: 在社区中分享使用经验和最佳实践

### 开发流程
1. Fork 项目到你的GitHub账户
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- **Python**: 遵循PEP 8规范，使用black格式化
- **TypeScript**: 使用ESLint和Prettier
- **提交信息**: 使用清晰的提交信息描述更改

## 📞 支持与联系

### 获取帮助
- 📖 **文档**: 查看项目Wiki获取详细文档
- 🐛 **问题报告**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📧 **邮件**: support@example.com

### 社区
- 🌟 **给项目点星**: 如果这个项目对您有帮助，请给我们一个星标！
- 🔄 **分享项目**: 帮助更多人了解这个项目
- 🤝 **参与贡献**: 加入我们的开发者社区

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

```
MIT License

Copyright (c) 2024 Smart Contract Security Analysis Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 致谢

感谢以下开源项目和服务提供商：

### 核心技术
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Python Web框架
- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Shadcn/ui](https://ui.shadcn.com/) - 现代化UI组件库

### 安全分析工具
- [Slither](https://github.com/crytic/slither) - 智能合约静态分析工具
- [Echidna](https://github.com/crytic/echidna) - 智能合约模糊测试工具
- [Mythril](https://github.com/ConsenSys/mythril) - 智能合约安全分析工具

### AI和数据服务
- [Google Gemini AI](https://ai.google.dev/) - AI服务支持
- [Supabase](https://supabase.com/) - 数据库和向量存储
- [OpenAI](https://openai.com/) - AI模型和API

### 开发工具
- [Docker](https://www.docker.com/) - 容器化平台
- [Poetry](https://python-poetry.org/) - Python依赖管理
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！ ⭐**

[🏠 首页](http://localhost:3000) | [📖 文档](http://localhost:8000/docs) | [🐛 问题反馈](https://github.com/your-repo/issues) | [💬 讨论](https://github.com/your-repo/discussions)

</div>
