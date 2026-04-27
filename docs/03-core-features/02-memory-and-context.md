# 03-2 Memory：让 hermes 跨会话记住你

> 这一章讲：hermes 的长期记忆系统怎么工作 / 怎么管理。

---

## Memory 是什么

**Memory = hermes 跨会话保留的"事实数据库"**。和 ChatGPT 的 Memory 功能类似，但**完全在你本地**，且**自动**抽取（不需要你显式说"记住这个"）。

---

## 4 种记忆类型

hermes 内部把 Memory 分成 4 类：

### 1. User Profile（用户偏好）
- 你的姓名、职业、所在城市
- 你的工作习惯（早起 / 夜猫子）
- 你的技术栈（Python / Go / Rust）
- 你不喜欢什么（"不要写注释"、"不要用 emoji"）

### 2. Project Context（项目上下文）
- 当前在哪个项目
- 该项目的技术栈
- 该项目的代码风格
- 该项目过去遇到过什么 bug

### 3. Conversation History（会话历史）
- 过去对话的摘要（不是完整记录，是 LLM 抽出的关键点）
- 哪些任务做过、结果是什么

### 4. World Facts（世界事实）
- 你提供的领域知识（"我们公司有 50 人"、"我们用 AWS us-east-1"）
- hermes 学到的工具用法（哪个 API 限速）

---

## 物理存储

```
~/.u-hermes/data/memory/
├── profile.json          —— User Profile（结构化）
├── projects/
│   ├── my-app/
│   │   ├── context.json
│   │   └── history.json
│   └── another-app/
├── conversations/
│   └── 2026-04-26-session-xxx.json
├── facts.json            —— World Facts
└── vector_db/            —— 向量索引（用于相似度搜索）
    ├── faiss.index
    └── metadata.json
```

---

## 怎么读 / 怎么写

### LLM 视角

每次对话开始，hermes 自动做：

```
1. 读用户 input → 计算 embedding
2. vector_db 搜 top-K 相似记忆
3. 把记忆塞进 system prompt
4. LLM 处理 input
5. 对话结束，LLM 用一个轻量请求"提取本次值得记住的"
6. 写入 memory + 向量库
```

### 用户视角

```
[新会话]
> 帮我加个登录功能

[hermes 内部]
[memory_search "用户项目偏好"]
hits:
  - "用户的 my-app 项目用 Next.js + tRPC + Supabase Auth"
  - "用户偏好 zod 做表单校验"

[hermes 不需要再问你技术栈，直接给符合的代码]
```

---

## 显式管理 Memory

虽然 Memory 自动抽取，但你可以显式管理。

### 添加

```
> 记一下：我们公司用 AWS 上海区，VPC ID 是 vpc-abc123
[hermes 调 memory_save]
✓ 已记住
```

### 查询

```
> /memory search VPC

找到 1 条：
- "用户公司用 AWS 上海区，VPC ID vpc-abc123" (置信度 0.95)
```

### 删除

```
> /memory delete VPC ID
✓ 已删除 1 条记忆
```

### 列表

```
> /memory list --recent=10
最近 10 条：
1. 2026-04-26 14:23  用户偏好 pnpm 不用 npm
2. 2026-04-26 13:45  my-app 用 Next.js 14
3. ...
```

---

## Memory 的"嵌入模型"

hermes 默认用 OpenAI 的 `text-embedding-3-small` 做 embedding（每个文本 → 1536 维向量）。

国内场景可以换：

```yaml
# ~/.u-hermes/data/config.yaml
memory:
  embedding:
    provider: alibaba  # 用通义嵌入
    model: text-embedding-v3
    api_key: ${DASHSCOPE_API_KEY}
```

或本地：

```yaml
memory:
  embedding:
    provider: local
    model: bge-large-zh  # 通过 Ollama 跑
    base_url: http://127.0.0.1:11434/v1
```

---

## 控制什么会被记住

默认 hermes 会记住"模型判断重要"的内容。但你可以配置规则。

### 黑名单（不记）

```yaml
memory:
  exclude_patterns:
    - "API key"
    - "password"
    - "secret"
    - "token"
    - "私人"
```

匹配的内容**永远不会**进 Memory。

### 白名单（一定记）

```yaml
memory:
  always_remember:
    - "项目偏好"
    - "技术栈"
    - "团队成员"
```

### 时效

```yaml
memory:
  retention:
    user_profile: forever       # 永久
    project_context: 365d        # 1 年
    conversation_history: 90d    # 3 个月
    world_facts: forever
  auto_archive:
    after: 180d
    to: ~/.u-hermes/archive/
```

180 天没访问的记忆自动归档（不删除，挪到归档目录，节省主索引大小）。

---

## 隐私：Memory 不该有的内容

⚠️ **Memory 是明文存的**（除非你加密整个 `~/.u-hermes/`）。

不应该让 hermes 学习的：
- ❌ 真实密码
- ❌ 信用卡信息
- ❌ 私钥（SSH / GPG / API）
- ❌ 个人身份证 / 护照号

**hermes 不会主动让你输入这些**，但你可能不小心提到。建议：

```yaml
memory:
  redaction:
    enabled: true
    patterns:
      - regex: '\b[0-9]{17}[0-9X]\b'   # 中国身份证
        replacement: '[ID-REDACTED]'
      - regex: 'sk-[a-zA-Z0-9]{20,}'    # API key 格式
        replacement: '[KEY-REDACTED]'
```

每条进 Memory 前自动脱敏。

---

## 备份与恢复

### 备份

```bash
tar czf hermes-memory-$(date +%Y%m%d).tar.gz ~/.u-hermes/data/memory/
```

### 恢复

```bash
rm -rf ~/.u-hermes/data/memory/
tar xzf hermes-memory-20260420.tar.gz -C ~/
hermes memory rebuild-index   # 重建向量索引
```

### 跨设备同步

```
方式 A: 同步 ~/.u-hermes/data/memory/ 到 Dropbox / iCloud / NAS
方式 B: 用 git-crypt 加密后 push 到私有 GitHub 仓
方式 C: 自托管 Syncthing
```

---

## 团队共享 vs 个人 Memory

### 个人（默认）
每人自己的 Memory，互不干扰。

### 团队共享（高级）

```yaml
memory:
  shared:
    enabled: true
    backend: postgres  # 用共享数据库
    url: postgresql://hermes-shared.internal:5432/memory
    namespaces:
      personal: user-${USER_ID}    # 个人 Memory（私有）
      team: team-${TEAM_ID}        # 团队 Memory（共享）
      public: public               # 全公司可读
```

每个查询会同时搜 3 个命名空间，但只能写自己的。

例：

```
> 我们团队习惯用 GitFlow 不用 trunk-based

[hermes 写到 team-${TEAM_ID}]

[同事下次新开会话]
[memory_search "git 工作流"]
[hits 包括: "团队习惯用 GitFlow 不用 trunk-based"]
[同事的 hermes 自动应用同样规则]
```

---

## 调试 Memory

### 看 hermes 实际"看到了什么"

```bash
hermes chat --debug --show-memory-hits
> 帮我改这个 React 组件

[debug memory hits, top 5]
1. (0.92) "用户 my-app 项目用 React 19 + Tailwind"
2. (0.85) "用户偏好 shadcn/ui 不用 MUI"
3. (0.78) "用户讨厌 div 嵌套太深"
4. (0.71) "上次类似任务用了 useTransition"
5. (0.68) "用户的 ESLint 配置不允许 any"
```

### 性能问题

如果 Memory 越来越大导致响应慢：

```bash
hermes memory stats
# 输出:
# Total entries: 12,453
# Index size: 89 MB
# Avg search latency: 45ms

# 优化
hermes memory optimize    # 清理过期 + 重建索引
hermes memory archive --older=180d
```

---

## 高级：自定义记忆策略

```python
# ~/.u-hermes/data/memory_handlers/custom.py
def should_remember(message, context):
    """决定哪些消息进 Memory"""
    # 例：只记长度 > 50 的关键决策
    if len(message) < 50:
        return False
    if "决定" in message or "选择" in message:
        return True
    return False

def extract_facts(messages):
    """从一批消息里抽取结构化事实"""
    # 例：用 LLM 抽 user_preference / project_decision / lesson_learned
    return [
        {"type": "preference", "fact": "..."},
        {"type": "decision", "fact": "..."},
    ]
```

---

**[← 03-1 Skills](./01-skills-system.md)** · **[03-3 MCP 协议 →](./03-mcp-protocol.md)**
