#!/usr/bin/env bash
# hermes-agent · 启动脚本
#
# 用法：./start-hermes.sh
# License: MIT

set -euo pipefail

HERMES_HOME="${HOME}/.u-hermes"
DATA_DIR="${HERMES_HOME}/data"
VENV="${HERMES_HOME}/venv"
LOG="${DATA_DIR}/logs/agent.log"

echo "🐎 hermes-agent 启动"
echo "===================="

if [ ! -x "${VENV}/bin/hermes" ]; then
    echo "⚠  找不到 ${VENV}/bin/hermes，先跑 setup-hermes.sh"
    exit 1
fi

if [ ! -f "${DATA_DIR}/.env" ] || ! grep -qE "^(DEEPSEEK|OPENAI|ANTHROPIC|DASHSCOPE|MOONSHOT|ZHIPUAI)_API_KEY=" "${DATA_DIR}/.env" 2>/dev/null; then
    echo "⚠  ${DATA_DIR}/.env 没有 API Key"
    echo "   编辑 .env，取消一行注释，填入你的 key"
    read -r -p "继续启动？[y/N] " ans
    [ "$ans" = "y" ] || exit 1
fi

cd "${HERMES_HOME}"
HERMES_HOME="${DATA_DIR}" \
PYTHONIOENCODING=utf-8 \
PYTHONUTF8=1 \
    "${VENV}/bin/hermes" gateway run > "${LOG}" 2>&1 &

PID=$!
echo "  pid: ${PID}"
echo "  log: ${LOG}"

# 等 gateway listen
for i in $(seq 1 30); do
    if ss -tln 2>/dev/null | grep -q ":8642"; then break; fi
    sleep 0.5
done

if ! ss -tln 2>/dev/null | grep -q ":8642"; then
    echo "❌ gateway 30 秒内没起来，查 ${LOG}"
    exit 1
fi

echo ""
echo "✅ hermes 已启动: http://127.0.0.1:8642"
command -v xdg-open >/dev/null && xdg-open http://127.0.0.1:8642 2>/dev/null || true

read -r -p "按回车关闭本窗口（gateway 继续后台跑）..."
