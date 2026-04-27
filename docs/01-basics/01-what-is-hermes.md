# 01-1 hermes-agent 是什么

> 这一章讲：hermes-agent 是什么、谁做的、和 OpenClaw / Claude Code / LangChain 有什么区别。
>
> 适合：刚听说"hermes"想了解一下的人。

---

## 一句话定义

**hermes-agent 是 Nous Research 开源的"自学习 AI Agent 框架"**，专注于让 AI 不只是"对话"，还能：

1. **学**：把会话经验自动变成可复用 Skill
2. **记**：跨会话保留你的偏好和项目上下文
3. **干**：定时触发、主动行动，不只是被动回答

---

## 谁做的

[Nous Research](https://nousresearch.com)（"诺斯研究"），一个独立 AI 研究团队，以训练开源大模型（Hermes 系列模型）出名。hermes-agent 是他们的开源 Agent 框架，**MIT License**。

---

## 它能做什么

下面是一个真实的 hermes 会话片段（简化）：

```
$ hermes chat
> 帮我写个 bash 脚本，每天 8 点把我 Desktop 下当天新增的文件归档到 ~/Archive/{date}/

[hermes]
我会创建 archive.sh，并加到 cron。
执行计划：
  1. 写 archive.sh
  2. chmod +x
  3. crontab -e 加: 0 8 * * * /home/user/archive.sh

是否继续？[Y/n] y

[hermes 调用工具 file_write]
✓ 写入 /home/user/archive.sh

[hermes 调用工具 shell]
✓ chmod +x /home/user/archive.sh

[hermes 调用工具 cron_add]
✓ 已添加: 0 8 * * * /home/user/archive.sh

完成。我已记住你"每日归档 Desktop"的偏好，
未来类似任务我会推荐这个模式。
```

注意三点：

1. **多步规划**（不是一次回答完，而是分步执行）
2. **工具调用**（直接动文件、直接改 cron，不只是给你说怎么做）
3. **学习闭环**（"已记住偏好"—— 下次它知道你的习惯）

---

## hermes 内置了什么

### 工具（Tools）

40+ 内置工具，包括：

- `shell` — 执行 shell 命令
- `file_read` / `file_write` / `file_search` — 文件操作
- `web_search` / `web_fetch` — 网络搜索 / 抓页面
- `python` — 跑 Python 代码
- `cron_add` / `cron_list` — 定时任务管理
- `memory_search` / `memory_save` — 记忆系统
- `skill_invoke` — 调用自定义 Skill
- 等等

### Skills（自定义工具）

你可以写自己的 Skill。简单到这样：

```yaml
# ~/.u-hermes/data/skills/translate.yaml
name: translate
description: "把中文翻译成英文"
parameters:
  - name: text
    type: string
script: |
  # ... 这里可以是 bash / python / node 脚本
```

hermes 会自动发现这个 Skill 并在合适时机调用。

### Memory（记忆）

每次会话结束，hermes 自动把"值得记住的"抽出来存到向量数据库。下次新开会话能调用。

### Cron（定时）

```
> 每天早 8 点提醒我喝水
[hermes] 已加入 cron: 0 8 * * * "提醒：喝水"
```

### MCP 协议

支持 Model Context Protocol，可以接入任何遵守 MCP 的外部服务（比如 Slack、GitHub、Linear、Notion 的 MCP server）。

---

## 和别家比

| 项目 | 上手难度 | 自学习 | 长期记忆 | 主动行动 | 商业可用 |
|---|---|---|---|---|---|
| **hermes-agent** | 中 | ✅ | ✅ | ✅ | MIT 任意用 |
| **OpenClaw** | 中 | 部分 | ✅ | ✅ | MIT 任意用 |
| **Claude Code** | 低 | ❌ | 部分 | ❌ | 需付 Anthropic 订阅 |
| **Cursor** | 低 | ❌ | ❌ | ❌ | 付费 |
| **LangChain** | 高 | 自己写 | 自己写 | 自己写 | MIT 任意用 |
| **AutoGPT** | 高 | 部分 | ❌ | ❌ | MIT |

---

## 适合用 hermes 的场景

✅ 想自托管，不上云
✅ 重度命令行用户
✅ 多 Provider 切换需求（一会 GPT 一会 DeepSeek）
✅ 需要定时任务（每天扫一遍 Issue / 监控网页）
✅ 想做"长期合作的 AI"，不是一次性对话
✅ 想做基于 hermes 的二次产品（这是本教程作者的路径）

## 不适合用 hermes 的场景

❌ 完全不会用终端
❌ 只想要简单聊天
❌ 数据必须留在云上（合规要求）
❌ 想要的是"客服机器人 + IM 集成"（看 OpenClaw 更对口）

---

## 它的 license 是什么

**MIT License**。意味着：

- 个人随便用 ✅
- 改源码后做商业产品 ✅
- 卖钱 ✅
- 不必开源你的修改 ✅

唯一要求：在你的产品里附 MIT License 文本（一份就够）。

---

## 当前版本

本教程基于 **hermes-agent v0.11.0**（2026-04-23 发布）。

更新很活跃，建议：
- 锁版本：`pip install hermes-agent==0.11.0`（避免被 breaking change 打断）
- 跟新闻：[GitHub Releases](https://github.com/NousResearch/hermes-agent/releases)

---

**下一章**：[01-2 三分钟跑起来](./02-3min-quickstart.md)
