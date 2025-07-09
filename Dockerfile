FROM python:3.11-slim

# ========= 1. 系统依赖 =========
RUN apt-get update && apt-get install -y \
    curl git jq unzip ca-certificates docker.io \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ========= 2. 安装 solc =========
RUN curl -L https://github.com/ethereum/solidity/releases/download/v0.8.25/solc-static-linux \
    -o /usr/local/bin/solc && chmod +x /usr/local/bin/solc

# ========= 3. 安装 Python 依赖 =========
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt

# ========= 4. 设置工作目录，但不拷贝代码 =========
WORKDIR /app

EXPOSE 8000

# ========= 5. 启动容器后手动加载挂载的代码 =========
CMD ["bash", "start.sh"]


