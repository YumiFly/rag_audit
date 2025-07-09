"""
整合的API测试套件
================

这是一个整合了所有API测试功能的统一测试套件，避免重复测试。

使用pytest运行测试：
pytest tests/test_pytest.py -v                    # 运行所有测试
pytest tests/test_pytest.py::test_health -v       # 运行健康检查测试
pytest tests/test_pytest.py -k "health or ask" -v # 运行特定测试
pytest tests/test_pytest.py -m "smoke" -v         # 运行冒烟测试
pytest tests/test_pytest.py -m "integration" -v   # 运行集成测试

测试标记：
- smoke: 基础冒烟测试
- integration: 集成测试
- performance: 性能测试
"""

import os
import json
import tempfile
import time
import pytest
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="session")
def api_client():
    """创建API客户端会话"""
    session = requests.Session()

    # 检查API服务是否运行
    try:
        response = session.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            pytest.skip("API服务未运行")
    except requests.exceptions.RequestException:
        pytest.skip("无法连接到API服务")

    return session

# ==================== 测试数据 Fixtures ====================

@pytest.fixture
def sample_solidity_code():
    """提供示例Solidity代码"""
    return '''
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestContract {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function emergencyWithdraw() public {
        require(msg.sender == owner, "Only owner");
        payable(owner).transfer(address(this).balance);
    }
}
'''

@pytest.fixture
def sample_reports():
    """提供示例报告数据"""
    slither_report = {
        "slitherVersion": "0.9.3",
        "results": {
            "detectors": [
                {
                    "check": "reentrancy-eth",
                    "impact": "High",
                    "confidence": "Medium",
                    "description": "Reentrancy vulnerability detected",
                    "elements": []
                }
            ]
        }
    }
    
    echidna_report = {
        "echidnaVersion": "2.0.0",
        "results": [
            {
                "contract": "TestContract",
                "test": "echidna_test_balance",
                "status": "failed",
                "error": "assertion failed"
            }
        ]
    }
    
    return slither_report, echidna_report

# ==================== 冒烟测试 (基础功能) ====================

@pytest.mark.smoke
class TestHealthEndpoint:
    """健康检查接口测试"""

    def test_health_check(self, api_client):
        """测试健康检查接口"""
        response = api_client.get(f"{BASE_URL}/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

# ==================== 集成测试 ====================

@pytest.mark.integration
class TestAnalyzeEndpoint:
    """分析接口测试"""

    @pytest.mark.smoke
    def test_analyze_missing_input(self, api_client):
        """测试缺少输入参数的情况"""
        response = api_client.post(f"{BASE_URL}/analyze")
        
        assert response.status_code == 400
        assert "需要上传源码文件或提供 address" in response.json()["detail"]
    
    @pytest.mark.slow
    def test_analyze_with_file(self, api_client, sample_solidity_code):
        """测试文件上传分析"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False) as f:
            f.write(sample_solidity_code)
            sol_file = f.name
        
        try:
            with open(sol_file, 'rb') as f:
                files = {'file': ('TestContract.sol', f, 'text/plain')}
                data = {'contract_name': 'TestContract'}
                
                response = api_client.post(
                    f"{BASE_URL}/analyze",
                    files=files,
                    data=data,
                    timeout=300
                )
                
                assert response.status_code == 200
                result = response.json()
                
                assert "doc_id" in result
                assert "slither_findings" in result
                assert "echidna_fails" in result
                assert isinstance(result["slither_findings"], int)
                assert isinstance(result["echidna_fails"], int)
                
        finally:
            if os.path.exists(sol_file):
                os.unlink(sol_file)
    
    @pytest.mark.skipif(
        not os.getenv('ETHERSCAN_API_KEY'),
        reason="需要ETHERSCAN_API_KEY环境变量"
    )
    @pytest.mark.slow
    def test_analyze_with_address(self, api_client):
        """测试合约地址分析"""
        # 使用UNI token合约地址
        address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
        
        data = {
            'address': address,
            'contract_name': 'UNI_Token'
        }
        
        response = api_client.post(
            f"{BASE_URL}/analyze",
            data=data,
            timeout=300
        )
        
        assert response.status_code == 200
        result = response.json()
        
        assert "doc_id" in result
        assert "slither_findings" in result
        assert "echidna_fails" in result

class TestIngestEndpoint:
    """批量上传接口测试"""
    
    def test_ingest_empty_files(self, api_client):
        """测试空文件列表"""
        response = api_client.post(f"{BASE_URL}/ingest")
        
        assert response.status_code == 422  # FastAPI validation error
    
    def test_ingest_with_reports(self, api_client, sample_reports):
        """测试批量上传报告"""
        slither_report, echidna_report = sample_reports
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='_slither.json', delete=False) as f1:
            json.dump(slither_report, f1)
            slither_file = f1.name
            
        with tempfile.NamedTemporaryFile(mode='w', suffix='_echidna.json', delete=False) as f2:
            json.dump(echidna_report, f2)
            echidna_file = f2.name
        
        try:
            with open(slither_file, 'rb') as f1, open(echidna_file, 'rb') as f2:
                files = [
                    ('files', ('test_slither.json', f1, 'application/json')),
                    ('files', ('test_echidna.json', f2, 'application/json'))
                ]
                
                response = api_client.post(
                    f"{BASE_URL}/ingest",
                    files=files
                )

                # 打印错误信息以便调试
                if response.status_code != 200:
                    print(f"Error response: {response.status_code}")
                    print(f"Error detail: {response.text}")

                assert response.status_code == 200
                result = response.json()
                
                assert "files" in result
                assert "chunks_inserted" in result
                assert result["files"] == 2
                assert result["chunks_inserted"] >= 0
                
        finally:
            for file_path in [slither_file, echidna_file]:
                if os.path.exists(file_path):
                    os.unlink(file_path)
    
    def test_ingest_unsupported_format(self, api_client):
        """测试不支持的文件格式"""
        unsupported_data = {"unknown": "format"}
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(unsupported_data, f)
            test_file = f.name
        
        try:
            with open(test_file, 'rb') as f:
                files = [('files', ('unsupported.json', f, 'application/json'))]
                
                response = api_client.post(
                    f"{BASE_URL}/ingest",
                    files=files
                )
                
                assert response.status_code == 400
                assert "不支持的格式" in response.json()["detail"]
                
        finally:
            if os.path.exists(test_file):
                os.unlink(test_file)

class TestAskEndpoint:
    """问答接口测试"""
    
    def test_ask_missing_question(self, api_client):
        """测试缺少问题参数"""
        response = api_client.post(
            f"{BASE_URL}/ask",
            json={},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # FastAPI validation error
    
    def test_ask_with_question(self, api_client):
        """测试正常问答"""
        payload = {
            "question": "这个合约有什么安全问题？",
            "top_k": 3
        }
        
        response = api_client.post(
            f"{BASE_URL}/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        # 打印错误信息以便调试
        if response.status_code != 200:
            print(f"Error response: {response.status_code}")
            print(f"Error detail: {response.text}")

        # 如果数据库中没有数据，可能会返回空答案，但不应该报错
        assert response.status_code == 200
        result = response.json()
        
        assert "answer" in result
        assert isinstance(result["answer"], str)
    
    def test_ask_with_custom_top_k(self, api_client):
        """测试自定义top_k参数"""
        payload = {
            "question": "合约是否安全？",
            "top_k": 10
        }
        
        response = api_client.post(
            f"{BASE_URL}/ask",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        # 打印错误信息以便调试
        if response.status_code != 200:
            print(f"Error response: {response.status_code}")
            print(f"Error detail: {response.text}")

        assert response.status_code == 200
        result = response.json()
        assert "answer" in result

# ==================== 性能测试 ====================

@pytest.mark.performance
def test_health_performance(api_client):
    """测试健康检查接口的性能"""
    response_times = []

    for _ in range(10):
        start_time = time.time()
        response = api_client.get(f"{BASE_URL}/health")
        end_time = time.time()

        assert response.status_code == 200
        response_times.append(end_time - start_time)

    avg_time = sum(response_times) / len(response_times)
    max_time = max(response_times)

    print(f"平均响应时间: {avg_time:.3f}s")
    print(f"最大响应时间: {max_time:.3f}s")

    # 性能断言：平均响应时间应小于1秒
    assert avg_time < 1.0, f"平均响应时间过长: {avg_time:.3f}s"

@pytest.mark.performance
def test_ask_performance(api_client):
    """测试问答接口的性能"""
    payload = {
        "question": "什么是重入攻击？",
        "top_k": 3
    }

    start_time = time.time()
    response = api_client.post(f"{BASE_URL}/ask", json=payload, timeout=30)
    end_time = time.time()

    response_time = end_time - start_time
    print(f"问答响应时间: {response_time:.3f}s")

    assert response.status_code == 200
    # 问答接口响应时间应在合理范围内（30秒内）
    assert response_time < 30.0, f"问答响应时间过长: {response_time:.3f}s"

@pytest.mark.performance
def test_concurrent_health_requests():
    """测试并发健康检查请求"""
    def make_request():
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200

    # 并发10个请求
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [future.result() for future in as_completed(futures)]

    # 所有请求都应该成功
    assert all(results), "并发请求中有失败的请求"
    print(f"✅ 并发测试通过: {len(results)}/10 个请求成功")

# ==================== 测试配置 ====================

# 测试标记说明
pytestmark = [
    pytest.mark.integration,  # 集成测试标记
]

# 慢速测试标记
def pytest_configure(config):
    """配置pytest标记"""
    config.addinivalue_line(
        "markers", "smoke: marks tests as smoke tests (basic functionality)"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "performance: marks tests as performance tests"
    )
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
