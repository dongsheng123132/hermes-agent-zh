#!/usr/bin/env bash
# 仓库验证 + 推送脚本
# 用法: bash scripts/verify-and-push.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==================================="
echo " hermes-agent-zh 推送前验证 + 部署"
echo "==================================="

# 1. 禁区扫描
echo ""
echo "[1/5] 禁区字符串扫描..."

declare -a FORBIDDEN_PATTERNS=(
  "uclaw2026activate"
  "pumzjQEvN5"
  "xiapanyun"
  "DEALER_PUBLIC_KEY"
  "apiKeyFromFingerprint"
  "ensureLicensedOrActivate"
)

# 排除自身禁区声明文件
EXCLUDE_PATHS=(
  ".gitleaks.toml"
  "CONTRIBUTING.md"
  "STATUS.md"
  "PULL_REQUEST_TEMPLATE.md"
)

LEAK_FOUND=0
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  echo -n "  扫描 \"$pattern\" ... "
  HITS=$(grep -rn "$pattern" . --include="*.md" --include="*.yaml" --include="*.yml" --include="*.json" 2>/dev/null | grep -v "/.git/" || true)

  # 过滤声明文件
  for excluded in "${EXCLUDE_PATHS[@]}"; do
    HITS=$(echo "$HITS" | grep -v "$excluded" || true)
  done

  if [ -n "$HITS" ]; then
    echo "❌ 发现 $(echo "$HITS" | wc -l) 处！"
    echo "$HITS"
    LEAK_FOUND=1
  else
    echo "✓"
  fi
done

if [ "$LEAK_FOUND" -eq 1 ]; then
  echo ""
  echo "❌ 禁区字符串泄漏！请修复后重跑。"
  exit 1
fi

# 2. 文件统计
echo ""
echo "[2/5] 文件统计..."
TOTAL_FILES=$(find . -type f \( -name "*.md" -o -name "*.toml" -o -name "*.yml" -o -name "*.yaml" -o -name "*.example" -o -name "*.sh" -o -name "*.json" -o -name "*.ts" -o -name "*.css" \) | grep -v "/.git/" | grep -v "node_modules" | wc -l)
DOC_CHARS=$(find docs -name "*.md" -exec cat {} + 2>/dev/null | wc -m)
echo "  总文件: $TOTAL_FILES"
echo "  docs 字符: $DOC_CHARS"

# 3. License 检查
echo ""
echo "[3/5] License 文件检查..."
for f in LICENSE-CODE LICENSE-DOCS BRAND.md CONTRIBUTING.md; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ❌ 缺失: $f"
    exit 1
  fi
done

# 4. README 检查
echo ""
echo "[4/5] README 关键内容检查..."
for keyword in "30 秒选路" "LICENSE-CODE" "LICENSE-DOCS" "u-hermes.org" "MIT" "CC BY-NC-ND"; do
  if grep -q "$keyword" README.md; then
    echo "  ✓ README 含: $keyword"
  else
    echo "  ⚠ README 缺: $keyword"
  fi
done

# 5. Git 推送（如果是 git 仓库）
echo ""
echo "[5/5] Git 状态..."
if [ -d ".git" ]; then
  echo "  git status:"
  git status -s
  echo ""
  echo "  → 检查无误，运行下面命令推送："
  echo ""
  echo "  git add ."
  echo "  git commit -m \"v1.5: complete tutorial + site + marketing + publishing\""
  echo "  git push origin main"
else
  echo "  仓库未 git init。运行下面命令初始化："
  echo ""
  echo "  git init"
  echo "  git add ."
  echo "  git commit -m \"init: hermes-agent-zh v1.5\""
  echo "  git branch -M main"
  echo "  git remote add origin git@github.com:dongsheng123132/hermes-agent-zh.git"
  echo "  git push -u origin main"
fi

echo ""
echo "==================================="
echo " ✅ 验证通过"
echo "==================================="
