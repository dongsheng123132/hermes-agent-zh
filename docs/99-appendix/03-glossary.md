# 附录 03 · 术语表

> 教程里出现的关键名词解释。按字母顺序。

---

## A

**Agent（智能体）**：能感知环境、自主决策、执行动作的程序。hermes-agent 是 Coding Agent，专注于"帮人写代码 + 自动化"。

**API Key**：调用大模型 API 的密钥，类似密码。本教程里指 OpenAI / DeepSeek / Anthropic 等服务的 token。

---

## C

**Claude Code**：Anthropic 官方 CLI 编程助手，闭源、需 Anthropic 订阅。和 hermes 是同类竞品。

**Cron**：Linux 经典定时任务。hermes 内置 cron 调度，可让 Agent 定时执行任务。

---

## E

**Embedding（向量化）**：把文本转成数字向量。hermes 用 embedding 实现"长期记忆搜索"。

**Electron**：Chromium + Node.js 的桌面 GUI 框架。U-Hermes 商业版用 Electron 做启动器。

---

## F

**Function Calling**：OpenAI 提出的"LLM 调用工具"协议。hermes 用此协议让 LLM 调 shell / file / web 等工具。

---

## G

**Gateway**：hermes 的核心 API 服务，监听 8642 端口，对外暴露聊天/工具调用接口。

---

## H

**hermes-agent**：本教程主角，Nous Research 开源的自学习 AI Agent 框架。

**hermes-web-ui**：第三方为 hermes 写的 Web 界面，浏览器使用 hermes 的 GUI。

---

## L

**LLM（大语言模型）**：Large Language Model，如 GPT、Claude、DeepSeek、Qwen 等。

**LangChain**：另一个 LLM 应用开发框架，比 hermes 灵活但需更多手写代码。

---

## M

**MCP（Model Context Protocol）**：Anthropic 提出的"AI Agent 与外部服务通信"标准。hermes 支持 MCP，可接入 Slack/GitHub/Notion 等 MCP server。

**Memory（记忆）**：hermes 跨会话的长期记忆系统，基于向量数据库 + LLM 抽取。

---

## N

**Nous Research**：hermes-agent 的开源团队，独立 AI 研究组织。

---

## O

**Ollama**：本地跑大模型的工具，详见 [04-3 Ollama](../04-providers/03-ollama-local.md)。

**OpenAI 兼容协议**：OpenAI Chat Completions API 的格式被广泛模仿（DeepSeek、通义、Kimi、Ollama 等都支持）。hermes 大多数 provider 走这个协议。

**OpenClaw**：另一个开源 AI Agent 框架，与 hermes 同类，2026 年初在 GitHub 飙升 25 万 stars。

**OpenRouter**：LLM 聚合服务，一个 key 接 300+ 模型。

---

## P

**Provider**：LLM 服务提供商。如 OpenAI、Anthropic、DeepSeek、Ollama 都是 provider。

**Persistence**：Ventoy / Linux Live USB 的持久化机制，让用户在 U 盘上的修改下次开机还在。

**Patch**：本教程里通常指 hermes-web-ui 的"小修改"，让其支持便携模式。

**pipx**：Python 工具的隔离安装器。比 `pip install --user` 更干净。

---

## S

**Skill**：hermes 自定义工具，YAML 定义 + 脚本执行。详见 [03-core-features/01-skills-system](../03-core-features/01-skills-system.md)。

**Self-Learning**：hermes 的"自学习"特性，把对话经验自动结晶为可复用 Skill。

**systemd**：Linux 系统服务管理器。把 hermes 设为开机自启服务用它。

---

## T

**Token**：LLM 计费的最小单位（约一个汉字 = 1.5 token）。

**Tool Call**：LLM 决策"我应该调用什么工具"的输出。hermes 解析并执行。

---

## U

**U-Hermes**：本教程作者做的商业便携 AI 产品，[u-hermes.org](https://u-hermes.org)。又称"马盘"。

**uv**：Astral 出品的 Python 包管理器，比 pip 快 10-100 倍。本教程在某些场景推荐用 uv。

---

## V

**venv**：Python 虚拟环境，隔离依赖。

**Ventoy**：开源多 ISO U 盘启动器。U-Hermes Linux 版基于 Ventoy 制盘。

---

## W

**WSL（Windows Subsystem for Linux）**：Windows 11 内置的 Linux 子系统，让 Windows 用户能跑完整 Ubuntu。

---

**返回**：[附录目录](./)
