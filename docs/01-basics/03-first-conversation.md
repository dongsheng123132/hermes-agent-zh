# 01-3 第一次对话深度解读

> 这一章讲：上一章你跑通了一次 hermes，到底底下发生了什么？这帮你建立"为什么 hermes 这样设计"的直觉。
>
> 适合：跑通了想多了解一点的人。可跳过，不影响后续章节。

---

## 一次对话的 5 个阶段

```
你的输入
   ↓
[1] 上下文组装（system prompt + memory + 历史 + 你的输入）
   ↓
[2] LLM 调用 → 产出文本 + 工具调用计划
   ↓
[3] 工具执行（如果有）→ 结果回填给 LLM
   ↓
[4] LLM 第二次调用（基于工具结果，组织最终回答）
   ↓
[5] Memory 抽取（值得记的存到向量库）
   ↓
返回给你
```

---

## 阶段 1：上下文组装

hermes 给 LLM 的 prompt 大概长这样（伪结构）：

```
[system prompt]
你是 hermes-agent。当前用户偏好：用 pnpm 不用 npm。
当前可用工具：shell, file_read, file_write, web_fetch ...

[memory hits]
（向量搜索从过去会话里捞出 3-5 条相关记忆，比如"用户的项目在 ~/projects/"）

[recent messages]
（最近 N 条对话）

[user input]
我桌面上有几个 .png 文件？
```

**为什么这样设计**：让 LLM 既知道你的偏好（不会推荐你用不喜欢的工具），又知道当前可调的工具。

---

## 阶段 2：LLM 决策

LLM（DeepSeek / GPT / Claude）拿到上面的 prompt，输出：

```
我需要查桌面上的 .png 文件数量。
我会调用 shell 工具：ls ~/Desktop/*.png | wc -l
```

这是 LLM 的"思考"，hermes 解析出 `tool: shell, args: ls ~/Desktop/*.png | wc -l`。

> 💡 hermes 用的是 OpenAI Function Calling 协议（兼容大多数 provider）。这就是为什么你可以无缝切换 GPT 和 DeepSeek —— 协议层一致。

---

## 阶段 3：工具执行

hermes 真的去你机器上跑：

```bash
ls ~/Desktop/*.png 2>/dev/null | wc -l
# 输出: 3
```

输出 `3` 被回填到 LLM。

> ⚠️ **安全提示**：hermes 会真的执行命令，包括删文件、改配置。第一次跑会问你确认；如果你跑 `--auto` 模式则不会。**永远不要在重要数据机器上裸跑 hermes**，建议在虚拟机或 Docker 容器里。

---

## 阶段 4：LLM 组织最终回答

LLM 第二次被调用，prompt 里多了工具结果：

```
[tool result]
shell output: 3

[task]
基于工具结果回答用户。
```

LLM 输出：

```
你桌面上有 3 个 .png 文件。
```

这就是你看到的最终答复。

---

## 阶段 5：Memory 抽取

hermes 用一个独立的 LLM 请求（成本极低）问："这次对话里有什么值得记住的？"

可能抽出：

```
- 用户经常问桌面文件
- 用户机器型号: Linux (从 ls 结果推断)
```

存到 `~/.u-hermes/data/memory/` 下的向量数据库。**下次新开会话**，向量搜索会把相关记忆带回来。

---

## 为什么不一次性输出，要分阶段

3 个原因：

### 1. 工具结果是动态的

LLM 不知道你桌面有几个 png。必须先跑 `ls` 才能给出准确答案。"先决策调工具，再基于结果回答" 是 Agent 范式的核心。

### 2. 同一次任务可能多步

```
> 把 ~/Desktop/*.png 都备份到 ~/Backup/ 然后清空桌面
```

hermes 会决策出 3 步：

```
1. shell: mkdir -p ~/Backup
2. shell: cp ~/Desktop/*.png ~/Backup/
3. shell: rm ~/Desktop/*.png
```

每步执行后给下一步喂结果。

### 3. 错误恢复

第 2 步如果失败（比如目标目录满了），LLM 看到 stderr 后会调整策略，比如：

```
[shell error: No space left on device]
我注意到 ~/Backup 没空间了。建议：
1. 改用 ~/.local/share/Backup/
2. 或者先清理旧备份
你倾向哪个？
```

---

## 记忆是怎么"找到"的

当你在一个新会话里说：

```
> 我桌面那些 png 还在吗？
```

hermes 会：

1. 用你这句话做 embedding（向量化）
2. 在 memory 向量库里找最相似的 K 条
3. 把 K 条记忆塞进 system prompt 给 LLM

如果之前你做过"备份桌面 png"，相关记忆会浮出来：

```
[memory hit, similarity 0.87]
2026-04-26 用户备份桌面 png 到 ~/Backup/，原桌面已清空
```

LLM 看到这个，回答会**自动带历史信息**：

```
根据我的记录，2026-04-26 你已经把它们备份到 ~/Backup/ 并清空了桌面。
要我现在确认一下 ~/Backup/ 里还有吗？
```

这就是"长期记忆" —— 不需要你重复说，hermes 自己记住。

---

## 看实际细节

你可以打开 hermes 的"详细日志模式"看每一步：

```bash
hermes chat --debug
```

会输出每次 LLM 调用的完整 prompt 和工具调用过程。第一次看会震撼"原来 prompt 这么长"，但理解后就建立了 mental model。

---

## 进一步阅读

- [03-core-features/01-skills-system](../03-core-features/01-skills-system.md) —— Skills 系统（怎么扩展工具集）
- [03-core-features/02-memory-and-context](../03-core-features/02-memory-and-context.md) —— Memory 系统（怎么管理长期记忆）
- [03-core-features/03-mcp-protocol](../03-core-features/03-mcp-protocol.md) —— MCP 协议（怎么接外部服务）

---

**完成 01-入门** → [02-installation/](../02-installation/) 选你的系统正式装
