#!/usr/bin/env python3
"""
测试整合验证脚本
===============

验证测试整合是否成功，检查是否有重复或遗漏的测试功能。
"""

import os
import subprocess
from pathlib import Path

def check_file_exists(filepath):
    """检查文件是否存在"""
    exists = Path(filepath).exists()
    status = "✅" if exists else "❌"
    print(f"{status} {filepath}")
    return exists

def check_pytest_markers():
    """检查pytest标记是否正确配置"""
    print("\n🏷️ 检查pytest标记...")
    
    try:
        result = subprocess.run(
            ["python", "-m", "pytest", "--markers"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        markers = result.stdout
        required_markers = ["smoke", "integration", "performance", "slow"]
        
        for marker in required_markers:
            if marker in markers:
                print(f"✅ {marker} 标记已配置")
            else:
                print(f"❌ {marker} 标记未找到")
                
    except Exception as e:
        print(f"❌ 检查pytest标记失败: {e}")

def check_test_structure():
    """检查测试文件结构"""
    print("\n📁 检查测试文件结构...")
    
    # 应该存在的文件
    required_files = [
        "tests/test_pytest.py",
        "tests/test_unit_core.py", 
        "tests/test_unit_embed.py",
        "tests/test_integration_api.py",
        "tests/conftest.py",
        "run_tests_unified.py",
        "TEST_README.md"
    ]
    
    # 应该被移除的文件
    removed_files = [
        "tests/test_individual_endpoints.py",
        "tests/quick_test.py", 
        "tests/performance_test.py",
        "debug_api.py"
    ]
    
    print("\n应该存在的文件:")
    all_exist = True
    for file in required_files:
        exists = check_file_exists(file)
        if not exists:
            all_exist = False
    
    print("\n应该被移除的文件:")
    all_removed = True
    for file in removed_files:
        exists = Path(file).exists()
        if exists:
            print(f"⚠️  {file} 仍然存在（应该被移除）")
            all_removed = False
        else:
            print(f"✅ {file} 已移除")
    
    return all_exist and all_removed

def check_test_functionality():
    """检查测试功能是否完整"""
    print("\n🧪 检查测试功能...")
    
    # 检查主测试文件中的测试函数
    test_file = Path("tests/test_pytest.py")
    if not test_file.exists():
        print("❌ 主测试文件不存在")
        return False
    
    content = test_file.read_text()
    
    # 检查关键测试功能
    required_tests = [
        "test_health",
        "test_ask",
        "test_ingest", 
        "test_analyze",
        "performance",
        "@pytest.mark.smoke",
        "@pytest.mark.integration",
        "@pytest.mark.performance"
    ]
    
    missing_tests = []
    for test in required_tests:
        if test in content:
            print(f"✅ {test} 功能存在")
        else:
            print(f"❌ {test} 功能缺失")
            missing_tests.append(test)
    
    return len(missing_tests) == 0

def main():
    print("测试整合验证")
    print("=" * 50)
    
    # 检查测试文件结构
    structure_ok = check_test_structure()
    
    # 检查pytest标记
    check_pytest_markers()
    
    # 检查测试功能
    functionality_ok = check_test_functionality()
    
    print("\n" + "=" * 50)
    print("验证结果:")
    
    if structure_ok and functionality_ok:
        print("✅ 测试整合成功！")
        print("\n推荐使用方式:")
        print("python run_tests_unified.py smoke     # 快速验证")
        print("python run_tests_unified.py all       # 完整测试")
        return True
    else:
        print("❌ 测试整合存在问题，请检查上述错误")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
