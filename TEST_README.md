# RAG审计API测试文档

## 整合后的测试结构

为了避免重复测试和提高效率，我们已经整合了所有测试脚本。

## 📋 当前测试文件结构

```
├── tests/
│   ├── test_pytest.py           # 主要测试文件（整合所有功能）
│   ├── test_unit_core.py        # 单元测试（带mock）
│   ├── test_unit_embed.py       # 向量化单元测试
│   ├── test_integration_api.py  # 简单集成测试
│   ├── conftest.py             # pytest配置
│   └── fixtures/               # 测试数据
├── run_tests_unified.py        # 统一测试运行脚本
├── run_tests.sh               # 便捷运行脚本
├── pytest.ini                # Pytest配置
└── TEST_README.md             # 本文档
```

## 🚀 快速开始

### 1. 环境准备

确保设置了必要的环境变量：

```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_KEY="your-supabase-key"
export GOOGLE_API_KEY="your-google-api-key"
export ETHERSCAN_API_KEY="your-etherscan-key"  # 可选，用于地址分析
```

### 2. 启动API服务

```bash
uvicorn app.rag_audit_api:app --reload
```

### 3. 安装测试依赖

```bash
pip install pytest requests httpx
```

## 🧪 测试方式

### 方式1: 使用统一测试脚本 (推荐)

```bash
# 运行不同类型的测试
python run_tests_unified.py smoke           # 冒烟测试（快速验证基础功能）
python run_tests_unified.py integration     # 集成测试（完整流程）
python run_tests_unified.py performance     # 性能测试（响应时间和并发）
python run_tests_unified.py all             # 所有测试

# 单独测试特定接口
python run_tests_unified.py health          # 健康检查
python run_tests_unified.py ask "问题"      # 问答接口
python run_tests_unified.py ingest          # 文件上传
```

### 方式2: 使用Pytest

```bash
# 运行所有测试
pytest tests/test_pytest.py -v

# 运行冒烟测试（快速验证基础功能）
pytest tests/test_pytest.py -m "smoke" -v

# 运行集成测试
pytest tests/test_pytest.py -m "integration" -v

# 运行性能测试
pytest tests/test_pytest.py -m "performance" -v

# 排除慢速测试
pytest tests/test_pytest.py -m "not slow" -v

# 运行特定测试
pytest tests/test_pytest.py::TestHealthEndpoint::test_health_check -v
```

### 方式3: 使用传统脚本

```bash
# 快速测试 (排除慢速测试)
./run_tests.sh quick

# 完整测试
./run_tests.sh full
```

## 🏷️ 测试标记说明

- `@pytest.mark.smoke`: 冒烟测试，验证基础功能，运行快速
- `@pytest.mark.integration`: 集成测试，测试完整流程
- `@pytest.mark.performance`: 性能测试，测试响应时间和并发能力
- `@pytest.mark.slow`: 慢速测试，可能需要较长时间

## 🚀 快速开始

```bash
# 1. 启动API服务
python -m uvicorn app.rag_audit_api:app --reload

# 2. 运行冒烟测试（快速验证）
python run_tests_unified.py smoke

# 3. 运行完整测试
python run_tests_unified.py all
```

## 📊 测试覆盖范围

### 冒烟测试 (smoke)
- ✅ 健康检查接口
- ✅ 基础参数验证
- ✅ 错误处理

### 集成测试 (integration)
- ✅ 文件上传和分析
- ✅ 问答功能
- ✅ 数据库交互
- ✅ 完整工作流程

### 性能测试 (performance)
- ✅ 响应时间测试
- ✅ 并发请求测试
- ✅ 负载测试

## 🗂️ 已移除的重复文件

为了避免重复和混乱，以下文件已被移除并整合：
- ❌ `tests/test_individual_endpoints.py` → 整合到 `test_pytest.py`
- ❌ `tests/quick_test.py` → 整合到 `run_tests_unified.py`
- ❌ `tests/performance_test.py` → 整合到 `test_pytest.py`
- ❌ `debug_api.py` → 调试功能整合到统一脚本
```

### 方式4: 单独接口测试

```bash
# 健康检查
python test_individual_endpoints.py health

# 文件上传分析
python test_individual_endpoints.py analyze-file

# 合约地址分析
python test_individual_endpoints.py analyze-address 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984

# 批量上传报告
python test_individual_endpoints.py ingest

# 问答功能
python test_individual_endpoints.py ask "这个合约有什么安全问题？"
```

## 📊 接口测试详情

### 1. 健康检查接口 (`/health`)

- **方法**: GET
- **功能**: 检查API服务状态
- **预期响应**: `{"status": "ok"}`

### 2. 分析接口 (`/analyze`)

- **方法**: POST
- **功能**: 分析Solidity合约
- **输入方式**:
  - 文件上传: `file` (multipart/form-data)
  - 合约地址: `address` + `contract_name` (form data)
- **预期响应**:
  ```json
  {
    "doc_id": "string",
    "slither_findings": 0,
    "echidna_fails": 0
  }
  ```

### 3. 批量上传接口 (`/ingest`)

- **方法**: POST
- **功能**: 批量上传Slither/Echidna报告
- **输入**: 多个JSON文件 (multipart/form-data)
- **预期响应**:
  ```json
  {
    "files": 2,
    "chunks_inserted": 10
  }
  ```

### 4. 问答接口 (`/ask`)

- **方法**: POST
- **功能**: 基于向量检索的智能问答
- **输入**:
  ```json
  {
    "question": "这个合约有什么安全问题？",
    "top_k": 5
  }
  ```
- **预期响应**:
  ```json
  {
    "answer": "根据分析结果..."
  }
  ```

## 🔧 测试配置

### Pytest标记

- `@pytest.mark.slow`: 标记慢速测试 (如文件分析)
- `@pytest.mark.integration`: 标记集成测试
- `@pytest.mark.skipif`: 条件跳过测试

### 环境变量要求

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `SUPABASE_URL` | ✅ | Supabase项目URL |
| `SUPABASE_KEY` | ✅ | Supabase API密钥 |
| `GOOGLE_API_KEY` | ✅ | Google Gemini API密钥 |
| `ETHERSCAN_API_KEY` | ❌ | Etherscan API密钥 (地址分析用) |

## 📝 测试示例

### 示例1: 测试文件上传分析

```python
# 创建测试合约
sol_content = '''
pragma solidity ^0.8.0;
contract TestContract {
    function withdraw() public {
        // 潜在的重入攻击漏洞
        msg.sender.call{value: address(this).balance}("");
    }
}
'''

# 上传并分析
with open('test.sol', 'w') as f:
    f.write(sol_content)

files = {'file': open('test.sol', 'rb')}
response = requests.post('http://localhost:8000/analyze', files=files)
```

### 示例2: 测试问答功能

```python
payload = {
    "question": "这个合约有重入攻击漏洞吗？如何修复？",
    "top_k": 5
}

response = requests.post(
    'http://localhost:8000/ask',
    json=payload,
    headers={'Content-Type': 'application/json'}
)

print(response.json()['answer'])
```

## 🐛 故障排除

### 常见问题

1. **API服务连接失败**
   ```
   ❌ 无法连接到API服务
   ```
   **解决**: 确保API服务正在运行 `uvicorn app.rag_audit_api:app --reload`

2. **环境变量缺失**
   ```
   ❌ 缺少环境变量: SUPABASE_URL
   ```
   **解决**: 设置所需的环境变量

3. **慢速测试超时**
   ```
   TimeoutError: 分析超时
   ```
   **解决**: 增加超时时间或跳过慢速测试 `pytest -m "not slow"`

4. **Etherscan API限制**
   ```
   ❌ Etherscan 获取源码失败
   ```
   **解决**: 检查ETHERSCAN_API_KEY或使用文件上传方式

### 调试技巧

1. **查看详细错误信息**:
   ```bash
   pytest tests/test_pytest.py -v -s --tb=long
   ```

2. **运行单个测试**:
   ```bash
   pytest tests/test_pytest.py::test_health_check -v -s
   ```

3. **查看API响应**:
   ```bash
   python test_individual_endpoints.py health
   ```

## 📈 测试报告

测试完成后，会生成以下文件：

- `test_results.json`: 详细测试结果 (综合测试)
- pytest报告: 控制台输出 (pytest测试)

## 🤝 贡献

如需添加新的测试用例：

1. 在 `tests/test_pytest.py` 中添加pytest测试
2. 在 `test_individual_endpoints.py` 中添加单独测试
3. 更新本文档

## 📞 支持

如遇到问题，请检查：

1. API服务是否正常运行
2. 环境变量是否正确设置
3. 网络连接是否正常
4. 依赖包是否已安装
