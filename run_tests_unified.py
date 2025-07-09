#!/usr/bin/env python3
"""
统一测试运行脚本
===============

这个脚本整合了所有测试功能，避免重复的测试脚本。

使用方法：
python run_tests_unified.py smoke           # 运行冒烟测试
python run_tests_unified.py integration     # 运行集成测试
python run_tests_unified.py performance     # 运行性能测试
python run_tests_unified.py all             # 运行所有测试
python run_tests_unified.py health          # 单独测试健康检查
python run_tests_unified.py ask "问题"      # 单独测试问答
python run_tests_unified.py ingest          # 单独测试文件上传

环境要求：
- API服务运行在 http://localhost:8000
- 已安装 pytest, requests 等依赖
"""

import sys
import subprocess
import requests
import json
import tempfile
import os
from pathlib import Path

BASE_URL = "http://localhost:8000"

def check_api_service():
    """检查API服务是否运行"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API服务运行正常")
            return True
        else:
            print(f"❌ API服务响应异常: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 无法连接到API服务: {e}")
        print("请确保API服务运行在 http://localhost:8000")
        return False

def run_pytest_tests(marker=None, verbose=True):
    """运行pytest测试"""
    cmd = ["python", "-m", "pytest", "tests/test_pytest.py"]
    
    if marker:
        cmd.extend(["-m", marker])
    
    if verbose:
        cmd.append("-v")
    
    cmd.extend(["-s", "--tb=short"])  # 显示输出和简短回溯
    
    print(f"运行命令: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False)
    return result.returncode == 0

def test_single_endpoint(endpoint, data=None):
    """测试单个接口"""
    print(f"🔍 测试 {endpoint} 接口...")
    
    try:
        if endpoint == "health":
            response = requests.get(f"{BASE_URL}/health")
            print(f"状态码: {response.status_code}")
            print(f"响应: {response.json()}")
            
        elif endpoint == "ask":
            question = data if data else "什么是智能合约的重入攻击？"
            payload = {"question": question, "top_k": 3}
            response = requests.post(f"{BASE_URL}/ask", json=payload, timeout=30)
            print(f"状态码: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"问题: {question}")
                print(f"回答: {result.get('answer', '')[:200]}...")
            else:
                print(f"错误: {response.text}")
                
        elif endpoint == "ingest":
            # 创建测试数据
            test_data = {
                "slitherVersion": "0.9.3",
                "results": {
                    "detectors": [{
                        "check": "test-check",
                        "impact": "High", 
                        "confidence": "Medium",
                        "description": "测试检测结果",
                        "elements": []
                    }]
                }
            }
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(test_data, f)
                temp_file = f.name
            
            try:
                with open(temp_file, 'rb') as f:
                    files = {'files': ('test.json', f, 'application/json')}
                    response = requests.post(f"{BASE_URL}/ingest", files=files, timeout=30)
                    print(f"状态码: {response.status_code}")
                    if response.status_code == 200:
                        print(f"响应: {response.json()}")
                    else:
                        print(f"错误: {response.text}")
            finally:
                os.unlink(temp_file)
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    # 检查API服务
    if not check_api_service():
        sys.exit(1)
    
    print(f"\n{'='*50}")
    print(f"运行测试: {command}")
    print(f"{'='*50}")
    
    success = True
    
    if command == "smoke":
        print("运行冒烟测试...")
        success = run_pytest_tests("smoke")
        
    elif command == "integration":
        print("运行集成测试...")
        success = run_pytest_tests("integration")
        
    elif command == "performance":
        print("运行性能测试...")
        success = run_pytest_tests("performance")
        
    elif command == "all":
        print("运行所有测试...")
        success = run_pytest_tests()
        
    elif command == "health":
        success = test_single_endpoint("health")
        
    elif command == "ask":
        question = sys.argv[2] if len(sys.argv) > 2 else None
        success = test_single_endpoint("ask", question)
        
    elif command == "ingest":
        success = test_single_endpoint("ingest")
        
    else:
        print(f"未知命令: {command}")
        print(__doc__)
        sys.exit(1)
    
    print(f"\n{'='*50}")
    if success:
        print("✅ 测试完成")
    else:
        print("❌ 测试失败")
        sys.exit(1)

if __name__ == "__main__":
    main()
