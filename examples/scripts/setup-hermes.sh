#!/usr/bin/env bash
# hermes-agent · Linux 一键安装脚本
#
# 用法：
#   chmod +x setup-hermes.sh
#   ./setup-hermes.sh
#
# 默认安装目录：${HOME}/.u-hermes/
# License: MIT

set -euo pipefail

echo "🐎 hermes-agent · Linux 安装"
echo "============================="

# 1. 平台检查
if [ ! -f /etc/os-release ]; then
    echo "⚠  无法识别 Linux 发行版"
    exit 1
fi
. /etc/os-release
echo "检测到: $PRETTY_NAME"

# 2. apt 依赖
echo ""
echo "[1/4] 安装系统依赖（Python / curl）..."
sudo apt update -qq
sudo apt install -y python3 python3-venv python3-full curl git build-essential

# 3. 创建数据目录
HERMES_HOME="${HOME}/.u-hermes"
DATA_DIR="${HERMES_HOME}/data"
VENV_DIR="${HERMES_HOME}/venv"

echo ""
echo "[2/4] 创建 ${HERMES_HOME} ..."
mkdir -p "${HERMES_HOME}" "${DATA_DIR}/logs" "${DATA_DIR}/sessions"

# 4. Python venv + hermes-agent
echo ""
echo "[3/4] 创建 venv 并安装 hermes-agent ..."
python3 -m venv "${VENV_DIR}"
"${VENV_DIR}/bin/pip" install --upgrade pip --quiet
"${VENV_DIR}/bin/pip" install hermes-agent --quiet

# 5. 默认 .env
ENV_FILE="${DATA_DIR}/.env"
if [ ! -f "${ENV_FILE}" ]; then
    echo ""
    echo "[4/4] 生成 ${ENV_FILE} ..."
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    if [ -f "${SCRIPT_DIR}/../configs/hermes.env.example" ]; then
        cp "${SCRIPT_DIR}/../configs/hermes.env.example" "${ENV_FILE}"
    fi
fi

echo ""
echo "✅ 安装完成"
echo ""
echo "下一步："
echo "  1. 编辑 ${ENV_FILE} 取消一行注释填入 API Key"
echo "  2. 运行 $(dirname $0)/start-hermes.sh"
echo ""
