#!/usr/bin/env bash
set -euo pipefail

# 读取环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 默认使用多进程 workers=2，可按需调整
exec uvicorn app.rag_audit_api:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers ${UVICORN_WORKERS:-2}
