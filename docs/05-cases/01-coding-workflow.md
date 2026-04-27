# 05-1 编程工作流（替代 / 增强 Cursor / Aider / Claude Code）

> 这一章讲：把 hermes 配成你的 24 小时编程搭档。对标 Cursor 用户痛点，给出 hermes 解法。

---

## 谁该读

- 已经在用 Cursor / Claude Code / Aider 但想"自托管 + 跨会话记忆"
- 不想被 Anthropic 订阅绑定，但又要 Claude Sonnet 的代码能力
- 团队想统一一套自托管编程 Agent

---

## 总体架构

```
你的 IDE (VS Code / JetBrains)
       ↓ 你 @hermes
hermes-agent (本地)
       ↓
   ┌───────┬─────────┬─────────┐
   ↓       ↓         ↓         ↓
 shell    git    file_edit   web_search
 (跑测试) (commit) (改代码)   (查文档)
       ↓
   Memory (跨会话记住项目偏好)
```

---

## 核心 Skill：项目助手

```yaml
# ~/.u-hermes/data/skills/project_assistant.yaml
name: project_assistant
description: |
  当用户要求"看代码""改代码""跑测试""提交 PR"时使用。
  自动检测当前在哪个 git 仓库，加载该项目的 README / CONVENTIONS.md。
parameters:
  - name: action
    type: string
    enum: [explain, refactor, test, commit, review]
  - name: target
    type: string
    description: "文件路径或 'staged' / 'last-commit'"
script: |
  #!/usr/bin/env bash
  case "$1" in
    explain)
      cat "$2" | head -200
      git -C $(dirname "$2") log --oneline -20 -- "$2"
      ;;
    test)
      cd $(git -C $(dirname "$2") rev-parse --show-toplevel)
      [ -f package.json ] && npm test 2>&1 | tail -50
      [ -f pytest.ini ] && pytest 2>&1 | tail -50
      [ -f Cargo.toml ] && cargo test 2>&1 | tail -50
      ;;
    review)
      git diff --staged
      ;;
  esac
```

---

## 工作流 1：自动审 PR

### 配置

```yaml
crons:
  - name: "auto-review-prs"
    schedule: "0 */2 * * 1-5"  # 工作日每 2 小时
    prompt: |
      用 gh CLI 查我的所有 open PR
      对每个 PR：
      1. gh pr diff 拿 diff
      2. 评估：代码风格 / 潜在 bug / 测试覆盖 / 性能
      3. 写成评审评论草稿（不发送）
      4. 放到 ~/pr-reviews/{pr-number}.md
      
      最后用 lark_send 给我一条汇总
```

### 验收

每 2 小时收到一条飞书消息："你有 3 个 PR 待审，已生成草稿在 `~/pr-reviews/`"

---

## 工作流 2：失败测试自动诊断

### 触发

CI 失败 → webhook → hermes 自动诊断

```yaml
# ~/.u-hermes/data/webhooks.yaml
webhooks:
  /webhook/ci-failure:
    handler: ci_failure_handler
```

```python
# handler
def handle(payload):
    repo = payload['repo']
    sha = payload['commit_sha']
    log_url = payload['log_url']
    
    hermes_chat(prompt=f"""
    CI 在 {repo} commit {sha} 失败。
    1. 用 web_fetch 拉日志：{log_url}
    2. 找根因（哪个测试 / 哪行报错）
    3. 用 file_read 看相关源码
    4. 提出 3 个可能的修复方案
    5. 把分析写到 ~/ci-failures/{sha}.md
    6. lark_send 通知我
    """)
```

---

## 工作流 3：跨会话项目记忆

### 让 hermes 记住你的项目

第一次进项目：

```
> 这是我的 Next.js + tRPC + Prisma 项目，
> 数据库用 PostgreSQL + Supabase。
> 我用 pnpm 不用 npm。
> 部署在 Vercel。
> commit 风格：conventional commits（feat / fix / chore）。
> 测试用 Vitest。
> 不要写注释除非业务逻辑非显然。
```

hermes 自动 `memory_save`。下次新会话：

```
> 加一个用户头像上传功能

[hermes 自动调 memory_search "项目偏好"]
[hermes 知道你用 Next.js + tRPC + Supabase Storage]
[直接给出符合你技术栈的代码]
```

### 多项目隔离

每个项目独立 `HERMES_HOME`：

```bash
# ~/.bashrc / ~/.zshrc
hermes-here() {
    HERMES_HOME=$PWD/.hermes hermes "$@"
}

# 用法
cd ~/projects/my-app
hermes-here chat
# 数据存 ~/projects/my-app/.hermes/，不串项目
```

---

## 工作流 4：自动写发布说明

### 配置

```yaml
# ~/.u-hermes/data/skills/release_notes.yaml
name: release_notes
description: "基于 git log 生成发布说明"
parameters:
  - name: from_tag
  - name: to_tag
script: |
  git log $1..$2 --pretty=format:"- %s (%h)" --no-merges
```

### 用法

```
> 用 release_notes 从 v1.0.0 到 HEAD 生成发布说明，
> 按 feat/fix/docs/refactor 分类，去除内部重构

[hermes 调 git log]
[整理分类 + 翻译成中英双语]
[写到 RELEASE-NOTES-v1.1.0.md]
```

---

## 工作流 5：本地版 "Claude Code"

### 把 hermes 用得像 Claude Code

```bash
# ~/.bashrc
alias hcc='hermes chat --provider anthropic --model claude-sonnet-4-5 --auto-tools'

# 在任何 git 仓库里
cd ~/projects/my-app
hcc

> 帮我加一个"导出 CSV"按钮
[hermes 自动改 React 组件 + tRPC route + Prisma schema + 跑迁移]
```

### vs 真 Claude Code

| 项 | Claude Code | hermes + Claude API |
|---|---|---|
| 月费 | $20+ Pro 订阅 | 按 API 用量（约 ¥30-100/月） |
| 跨项目记忆 | 弱 | 强（hermes Memory） |
| 自定义工具 | 有限 | 完全自由（写 Skills） |
| 数据隐私 | 上传 Anthropic | 你的本地 |
| 启动速度 | 秒级 | 秒级 |
| Anthropic 系工具集成 | 强 | 一般 |

---

## VS Code 集成（可选）

### 方法 A：用 hermes 的 LSP

hermes-agent v0.11.0 实验性支持 LSP 模式：

```bash
hermes lsp run --port 8643
```

VS Code 配 `.vscode/settings.json`：

```json
{
  "hermes.lspUrl": "ws://127.0.0.1:8643"
}
```

但目前 VS Code 没官方扩展，需自己写。

### 方法 B：终端 + 快捷键

更简单：在 VS Code 里开终端，定个快捷键直接进 `hermes chat`。

---

## 团队协作场景

### 场景：3 人小团队共享 hermes

部署一台 hermes 到内网服务器：

```bash
# 服务器
hermes gateway run --host 0.0.0.0 --port 8642
```

队员各自访问 `http://hermes-server.internal:8642`。

**多用户隔离**：每个人独立 `chat_id`：

```bash
# 用户 A
HERMES_USER=alice hermes chat --gateway http://hermes-server:8642

# 用户 B
HERMES_USER=bob hermes chat --gateway http://hermes-server:8642
```

各自 Memory / sessions 独立，但 Skills / Cron 共享（团队公共）。

---

## 安全建议

⚠️ 编程场景特别危险：

- 不要在生产分支让 hermes auto-confirm 跑命令
- `rm -rf` 类的工具调用必须配白名单
- 重要 commit 之前手动 `git commit`，不要让 hermes 直接 push
- API Key 别写代码里，hermes 会"看到"你写的代码（包括泄漏的 key）

---

**[← 05 案例目录](./)** · **[05-2 办公自动化 →](./02-office-automation.md)**
