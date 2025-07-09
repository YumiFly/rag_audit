#!/bin/bash

# RAG审计API测试运行脚本
# ======================

set -e

echo "🚀 RAG审计API测试工具"
echo "===================="

# 检查环境变量
check_env_vars() {
    local missing_vars=()
    
    if [ -z "$SUPABASE_URL" ]; then
        missing_vars+=("SUPABASE_URL")
    fi
    
    if [ -z "$SUPABASE_KEY" ]; then
        missing_vars+=("SUPABASE_KEY")
    fi
    
    if [ -z "$GOOGLE_API_KEY" ]; then
        missing_vars+=("GOOGLE_API_KEY")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ 缺少环境变量: ${missing_vars[*]}"
        echo "请设置这些环境变量后重新运行"
        echo ""
        echo "示例:"
        echo "export SUPABASE_URL='your-supabase-url'"
        echo "export SUPABASE_KEY='your-supabase-key'"
        echo "export GOOGLE_API_KEY='your-google-api-key'"
        echo "export ETHERSCAN_API_KEY='your-etherscan-key'  # 可选"
        exit 1
    fi
}

# 检查API服务是否运行
check_api_service() {
    echo "🔍 检查API服务状态..."
    
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "❌ API服务未运行，请先启动服务:"
        echo "   uvicorn app.rag_audit_api:app --reload"
        exit 1
    fi
    
    echo "✅ API服务正在运行"
}

# 安装依赖
install_deps() {
    echo "📦 检查并安装测试依赖..."
    
    if ! python -c "import pytest" 2>/dev/null; then
        echo "安装pytest..."
        pip install pytest
    fi
    
    if ! python -c "import requests" 2>/dev/null; then
        echo "安装requests..."
        pip install requests
    fi
    
    if ! python -c "import httpx" 2>/dev/null; then
        echo "安装httpx..."
        pip install httpx
    fi
}

# 运行快速测试
run_quick_tests() {
    echo ""
    echo "🏃‍♂️ 运行快速测试 (排除慢速测试)..."
    echo "================================"
    
    python -m pytest tests/test_pytest.py -m "not slow" -v
}

# 运行完整测试
run_full_tests() {
    echo ""
    echo "🏃‍♂️ 运行完整测试..."
    echo "=================="
    
    python -m pytest tests/test_pytest.py -v
}

# 运行综合测试
run_comprehensive_tests() {
    echo ""
    echo "🏃‍♂️ 运行综合测试..."
    echo "=================="
    
    python tests/test_api.py
}

# 显示使用说明
show_usage() {
    echo "使用方法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  quick      - 运行快速测试 (排除慢速测试)"
    echo "  full       - 运行完整测试"
    echo "  comprehensive - 运行综合测试"
    echo "  individual - 运行单独接口测试"
    echo "  help       - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 quick"
    echo "  $0 full"
    echo "  $0 comprehensive"
}

# 运行单独接口测试
run_individual_tests() {
    echo ""
    echo "🔧 单独接口测试工具"
    echo "=================="
    echo ""
    echo "可用命令:"
    echo "  python test_individual_endpoints.py health"
    echo "  python test_individual_endpoints.py analyze-file"
    echo "  python test_individual_endpoints.py analyze-address 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    echo "  python test_individual_endpoints.py ingest"
    echo "  python test_individual_endpoints.py ask \"这个合约有什么安全问题？\""
    echo ""
    echo "示例运行:"
    echo ""
    
    # 运行健康检查示例
    echo "🔍 示例: 健康检查"
    python test_individual_endpoints.py health
}

# 主函数
main() {
    case "${1:-quick}" in
        "quick")
            check_env_vars
            check_api_service
            install_deps
            run_quick_tests
            ;;
        "full")
            check_env_vars
            check_api_service
            install_deps
            run_full_tests
            ;;
        "comprehensive")
            check_env_vars
            check_api_service
            install_deps
            run_comprehensive_tests
            ;;
        "individual")
            check_env_vars
            check_api_service
            install_deps
            run_individual_tests
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            echo "❌ 未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
