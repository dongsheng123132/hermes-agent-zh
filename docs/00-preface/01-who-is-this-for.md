# 前言 01 · 这本教程写给谁

## 三类读者画像

### 🟢 完全零基础

你是谁：会用电脑，但没写过代码；用过 ChatGPT、Kimi、豆包，但只是网页对话；想"让 AI 真正帮我做事"却不知道怎么开始。

**直接看**：[01-basics/02-3min-quickstart](../01-basics/02-3min-quickstart.md) → [02-installation/](../02-installation/) → [05-cases/](../05-cases/)

跳过：`06-engineering/`（工程方法论，需要编程基础）

---

### 🟡 程序员 / 效率工具爱好者

你是谁：会用 Linux/Mac 终端；写过一些 Python 或 JavaScript；用过 Claude Code、Cursor、Aider 这类 AI 编程助手；想了解"自托管的 AI Agent 框架长什么样"。

**全本可读**。重点章节：

- [03-core-features/](../03-core-features/) —— Skills、Memory、MCP、Cron 是 hermes 区别于 Claude Code 的核心
- [05-cases/01-coding-workflow](../05-cases/01-coding-workflow.md) —— 编程工作流案例
- [06-engineering/](../06-engineering/) —— 如果你想自己改 hermes 或做产品

---

### 🔴 想做 AI 产品 / 创业者

你是谁：在做或打算做基于 hermes 的商业产品；研究怎么把开源 Agent 框架打包成 SaaS 或便携设备；想了解作者本人的 [U-Hermes 马盘](https://u-hermes.org) 是怎么做出来的（虽然商业版闭源，但工程方法论本教程有）。

**核心章节**：

- [06-engineering/](../06-engineering/) —— 全部 4 章
- [05-cases/05-portable-usb](../05-cases/05-portable-usb.md) —— 便携 USB 案例研究
- 联系作者：`hefangsheng@gmail.com`

---

## 不适合谁

❌ **如果你想要"GUI 开箱即用"的 AI 助手**，本教程的命令行细节会让你头大。建议看：
- ChatGPT / Claude 网页版
- Kimi / 豆包 等国产对话产品
- 或直接买一只 [U-Hermes 马盘](https://u-hermes.org)（双击 .exe 就能用）

❌ **如果你想了解 LLM 训练 / 微调原理**，那是另一个领域。本教程只讲"用现成模型 API + Agent 框架做应用"。

❌ **如果你只想做客服机器人 / IM 集成**，姊妹项目 [OpenClaw](https://github.com/openclaw/openclaw)（及其中文教程）比 hermes 更对口。

---

## 你需要什么

| 项目 | 最低要求 | 推荐 |
|---|---|---|
| **电脑** | Linux / Mac / Windows（Win 用 WSL） | 任意 |
| **Python** | 3.10+ | 3.12 |
| **磁盘** | 1.5 GB（hermes 主体） | 5 GB（含 Ollama 本地模型） |
| **网络** | 用国产模型即可 | 海外模型需代理 |
| **API Key** | 至少一个（DeepSeek 免费送 ¥5） | DeepSeek + Kimi 双备份 |

---

## 怎么读最高效

1. **先跑通"最小回路"**：[01-basics/02-3min-quickstart](../01-basics/02-3min-quickstart.md)。哪怕只跑成功一次，也能让你建立"hermes 是个什么东西"的具体感觉。
2. **再按需配置**：[02-installation/](../02-installation/) 选你的系统装，[04-providers/](../04-providers/) 选你的模型。
3. **挑一个案例做出来**：[05-cases/](../05-cases/) 五个里挑一个最有动力的（编程？知识库？定时机器人？）做完整。
4. **遇到问题查附录**：[07-troubleshooting/03-faq](../07-troubleshooting/03-faq.md) 是高频问题速查。

---

**下一篇**：[02 · 为什么 2026 学 hermes](./02-why-hermes.md)
