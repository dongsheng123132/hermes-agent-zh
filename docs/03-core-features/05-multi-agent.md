# 03-5 Multi-Agent：多 Agent 协作

> 这一章讲：怎么让多个 hermes Agent 分工协作完成复杂任务。

---

## 为什么要 Multi-Agent

**单个 Agent 的瓶颈**：
- 上下文窗口有限（128k 也会爆）
- LLM 在"决策 + 执行 + 总结"全混一起时容易乱
- 一次请求过长 = 慢 + 贵

**Multi-Agent 的优势**：
- 拆分任务 → 每个子 Agent 专注一块
- 并行执行 → 总耗时缩短
- 角色化 → "审稿 Agent" 比"啥都干 Agent" 更准

---

## 三种协作模式

### 模式 1：Pipeline（流水线）

```
Agent A (调研) → Agent B (起草) → Agent C (审稿) → Agent D (发布)
```

每个 Agent 输出 = 下一个 Agent 输入。

### 模式 2：Fan-out（并行扇出）

```
                ┌→ Agent B (中文版)
Agent A (规划) ─┼→ Agent C (英文版)
                └→ Agent D (日文版)

      → Agent E (汇总三个版本) →
```

主 Agent 拆任务，并行让多个 worker 跑，最后合并。

### 模式 3：Critic-Worker（审-改）

```
Agent W (写) → Agent C (评) → Agent W (改) → Agent C (评) → ... → 通过
```

一个 Agent 写，另一个 Agent 评，循环直到满意。

---

## hermes 实现 Multi-Agent

### 配置

`~/.u-hermes/data/agents.yaml`：

```yaml
agents:
  planner:
    role: "任务规划师"
    provider: anthropic
    model: claude-sonnet-4-5
    system_prompt: |
      你是任务规划师。把复杂任务拆成可并行执行的子任务。
      输出 JSON 格式：[{agent: "name", task: "..."}]
    tools: []   # 规划师不需工具
  
  researcher:
    role: "研究员"
    provider: deepseek
    model: deepseek-chat
    system_prompt: |
      你是研究员。给定主题，用 web_search / web_fetch 找资料并总结。
    tools: [web_search, web_fetch]
  
  writer:
    role: "作家"
    provider: anthropic
    model: claude-sonnet-4-5
    system_prompt: |
      你是中文作家。基于研究员给的素材，写成结构化文章。
    tools: [file_write]
  
  critic:
    role: "审稿人"
    provider: anthropic
    model: claude-sonnet-4-5
    system_prompt: |
      你是严苛的审稿人。挑文章的事实错误、逻辑漏洞、文风问题。
      输出 JSON：{ok: bool, issues: [...]}
    tools: []
```

### 调用

```python
# Python API
from hermes import MultiAgent

ma = MultiAgent(config_path="~/.u-hermes/data/agents.yaml")

result = ma.run_pipeline([
    ("planner", "为公众号写一篇 2000 字的'AI Agent 入门'"),
    ("researcher", "{plan.research_topic}"),
    ("writer", "基于 {researcher.output} 写文章"),
    ("critic", "{writer.output}"),
])

print(result.final)
```

### 命令行用法

```bash
hermes multi-agent run \
  --workflow article-pipeline.yaml \
  --input "为公众号写一篇 2000 字的'AI Agent 入门'"
```

`article-pipeline.yaml`：

```yaml
workflow:
  steps:
    - name: plan
      agent: planner
      input: "{{ input }}"
    
    - name: research
      agent: researcher
      input: "{{ plan.output.research_topic }}"
    
    - name: write
      agent: writer
      input: "{{ research.output }}"
    
    - name: review
      agent: critic
      input: "{{ write.output }}"
      retry_until: "output.ok == true"
      max_retries: 3
```

---

## 实战案例：自动写文章

```
┌──────────────────────────────────────────────────┐
│ 用户输入: "写一篇关于 hermes Cron 的入门文"      │
│           ↓                                       │
│  Planner Agent (Claude Sonnet)                    │
│           ↓ 输出 JSON 计划                        │
│  {                                                │
│    "research_topics": [                           │
│      "Cron 表达式语法",                           │
│      "hermes cron 配置",                          │
│      "5 个真实用例"                              │
│    ]                                              │
│  }                                                │
│           ↓                                       │
│  Researcher Agent × 3 (DeepSeek，并行)            │
│           ↓ 三份素材                              │
│  Writer Agent (Claude Sonnet)                     │
│           ↓ 草稿 v1                              │
│  Critic Agent (Claude Sonnet)                     │
│           ↓ "事实错误 3 处，逻辑跳跃 2 处"        │
│  Writer Agent (拿到反馈再写)                      │
│           ↓ 草稿 v2                              │
│  Critic Agent                                     │
│           ↓ "OK"                                  │
│  最终文章                                         │
└──────────────────────────────────────────────────┘
```

### 性能对比

| 方案 | 总耗时 | 总成本 | 文章质量 |
|---|---|---|---|
| 单 Agent (Claude) 一把梭 | 90 秒 | $0.45 | 中 |
| Multi-Agent (上图) | 60 秒 | $0.30 | 高 |

并行 + 角色专注 = 快又好。

---

## 角色设计原则

### 1. 单一职责

❌ 错的：

```yaml
do_everything_agent:
  system_prompt: "你能做研究、写作、审稿、发布..."
```

✅ 对的：

```yaml
researcher: "只做研究"
writer: "只写作"
critic: "只审稿"
```

每个 Agent 的 system prompt 应该 < 500 字，超过就该拆。

### 2. 输入输出格式化

每个 Agent 的输出**最好是 JSON**，下一个 Agent 直接消费：

```yaml
planner:
  output_schema:
    type: object
    properties:
      research_topics:
        type: array
        items:
          type: string
      target_length:
        type: integer
```

避免上一个 Agent 输出散文，下一个再 LLM 解析。

### 3. 模型 / 价格分级

```yaml
# 难任务用强模型
planner: claude-sonnet-4-5   # 规划要思考
critic: claude-sonnet-4-5    # 评论要严谨

# 简单任务用便宜模型
researcher: deepseek-chat    # 检索 + 总结，DeepSeek 够
formatter: deepseek-chat     # 格式化，简单任务
```

---

## 反模式（不要这样）

### ❌ Multi-Agent 用在简单任务

如果任务一个 Agent 能干完，**不要**强行拆。Multi-Agent 有协调成本，简单任务反而更慢。

### ❌ 死循环

```
Critic: "改"
Writer: 改
Critic: "再改"
Writer: 再改
... (循环)
```

必须设 `max_retries`。

### ❌ Agent 之间转发太多

```
A → B → C → D → E ...
```

每次 Agent 间转发都是一次 LLM 调用。3 个 Agent 是甜蜜点，超过 5 个该重新设计。

### ❌ 共享状态混乱

不要让多个 Agent 同时写同一个 Memory key，会乱。让 **Planner / Coordinator** 集中写。

---

## 进阶：Agent 之间用 MCP 通信

把每个 Agent 包成 MCP Server，互相调用：

```yaml
# Researcher Agent 暴露成 MCP
mcp_servers:
  researcher:
    type: hermes-agent
    config: agents.researcher
```

Writer Agent 调用：

```python
# Writer 的 system prompt
"""
你可以调用工具 researcher.search(topic) 来获取资料。
"""
```

Writer 决策时会自动调 researcher MCP，不需要硬编码。

---

## 团队场景：每人一个 Agent

```yaml
agents:
  alice_pa:
    role: "Alice 的私人助理"
    memory_namespace: alice
    tools: [calendar, email, todo]
  
  bob_pa:
    role: "Bob 的私人助理"
    memory_namespace: bob
    tools: [calendar, email, todo]
  
  team_coordinator:
    role: "团队协调员"
    can_delegate_to: [alice_pa, bob_pa]
    memory_namespace: team
```

```
> 协调员，下周一找时间开会，alice 和 bob 都要在
[coordinator 调 alice_pa.find_free_slots(下周)]
[coordinator 调 bob_pa.find_free_slots(下周)]
[coordinator 找交集]
[coordinator 调 alice_pa.book + bob_pa.book]
✓ 已约：下周一 14:00-15:00
```

---

## 调试

```bash
hermes multi-agent debug --workflow article-pipeline.yaml
# 输出每个 Agent 的输入/输出/耗时/成本
```

可视化（实验性）：

```bash
hermes multi-agent visualize --workflow article-pipeline.yaml
# 生成 mermaid 流程图
```

---

**[← 03-4 Cron](./04-cron-and-scheduling.md)** · **[完成 03 核心功能 → 04 Provider](../04-providers/)**
