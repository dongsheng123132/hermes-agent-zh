# 前言 02 · 为什么 2026 学 hermes

> 简短版：因为 2026 年 AI Agent 进入"自托管"时代，hermes 是上手最低的开源选项之一，而且它的核心能力（自学习 Skills、跨会话记忆、主动行动）正好是别家短板。

---

## 时间线

- 2023 年：ChatGPT API 发布。"会聊天"。
- 2024 年：LangChain、AutoGPT 出现。"工具调用"开始火，但配置复杂。
- 2025 年：Claude Code、Cursor、Aider、Devin 把"AI 写代码"做出来。
- **2026 年（现在）**：
  - **GitHub 趋势榜的关键词从"对话"变成"自托管 Agent"**
  - OpenClaw 三个月飙升 25 万 stars
  - hermes-agent 在 GitHub 增长曲线陡峭
  - 中信出版社、清华出版社开始批量出"AI Agent 实战"类书

也就是说，**到了从"用 ChatGPT 网页版"过渡到"装一个自己的 Agent"的临界点**。

---

## hermes vs 同类

| 维度 | hermes-agent | OpenClaw | Claude Code | LangChain |
|---|---|---|---|---|
| **定位** | 自学习 Coding Agent | 通用 AI 助手 + IM 机器人 | Anthropic 官方 CLI | 开发框架 |
| **License** | MIT | MIT | 闭源 | MIT |
| **自托管难度** | 中（pip install 一行） | 中 | 不能（必须用官方服务） | 高（要自己写很多代码） |
| **跨会话记忆** | ✅ 内置 | ✅ 内置 | ❌（每次新开会话） | ❌（要自己实现） |
| **自动学 Skills** | ✅ | 部分 | ❌ | ❌ |
| **MCP 协议** | ✅ | ✅ | ✅ | 部分 |
| **主动行动（Cron）** | ✅ 内置 | ✅ 内置 | ❌ | ❌ |
| **Provider 数量** | 200+（OpenRouter 集成） | 多 | 仅 Anthropic | 多 |

**结论**：
- 想要"对话型助手 + IM 机器人" → 看 OpenClaw
- 想要"官方一体化、零配置" → 用 Claude Code
- 想要"自己搭框架，控制最强" → LangChain
- **想要"能学习、能记住、能自动执行的 Coding Agent"** → 选 hermes

---

## hermes 的三大核心特性（区别于其他）

### 1. 自学习 Skills（Self-Learning Skills）

hermes 会把你和它的对话经验**自动结晶成可复用的 Skill**。比如你教它"我的项目用 pnpm，npm 不要用"，它会保存这条偏好，下次自动应用。

这种"学习闭环"是别家 Agent（包括 Claude Code）目前没有的。

### 2. 跨会话长期记忆

hermes 的 Memory 系统是 **基于向量数据库 + LLM 抽取的混合记忆**。它会主动记下：

- 你的项目偏好
- 你的工作流模式
- 历史失败/成功经验

下次新开会话，它能直接调用这些。

### 3. 主动行动（Proactive）

hermes 内置 Cron 调度。你可以让它：

- 每天早 8 点扫描你的 GitHub Issue 并发邮件汇总
- 每周一汇总过去一周代码变更
- 监控某个网页变化，发现就推送

这是 ChatGPT、Claude 网页版完全做不到的（必须用户主动发起）。

---

## 为什么不直接用 ChatGPT/Claude 网页版

| 维度 | ChatGPT 网页版 | hermes 自托管 |
|---|---|---|
| 数据隐私 | 上传到 OpenAI | 你的硬盘 |
| Token 计费 | 月付订阅 | 按 API 用量（一般更便宜） |
| 主动行动 | ❌ 不能 | ✅ Cron 内置 |
| 跨会话记忆 | 部分（Memory 功能） | 完整 |
| 多模型切换 | ❌ 锁定 GPT | ✅ 200+ provider |
| 代码隐私 | 上传到 OpenAI | 不离开本机 |
| 定制 Skill | ❌ 只能用官方 GPTs | ✅ 自己写 |

**简单说**：你愿意为"数据隐私 + 强定制"付一点学习成本，hermes 就是答案。

---

## 这条路有多陡

老实说：**比用网页版陡一些，比写 LangChain 平很多**。

- 第一次跑通：30 分钟（含装 Python venv + 配第一个 API Key）
- 配出"自己的工作流"：3-5 天
- 改源码 / 做产品：看你目标，但本教程的 [06-engineering/](../06-engineering/) 把作者踩过的坑都写了

---

## 一个真实例子

我（本教程作者）做的 [U-Hermes 马盘](https://u-hermes.org) —— 把 hermes 装进 USB，插上电脑双击就能跑 AI 编程助手。

这个产品**完全建立在本教程讲的 hermes 上**。商业版闭源，但 [05-cases/05-portable-usb](../05-cases/05-portable-usb.md) 这一章会把"怎么把 hermes 打包成便携 USB"的工程方法毫无保留地讲一遍 —— 你照着做能复现 80% 功能。

---

**下一篇**：[03 · 怎么读这本教程](./03-how-to-read.md)
