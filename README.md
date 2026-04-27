# 🐎 零基础玩转 hermes-agent · 让"马"替你 24 小时写代码

> **GitHub 上最热的开源 AI 编程 Agent 框架**，从 0 到 24 小时数字员工，一本教程全搞定。
>
> 装不上、不安全、烧 Token、不会用？这本教程就是来帮你避坑的。

[![docs license](https://img.shields.io/badge/docs-CC%20BY--NC--ND%204.0-blue)](./LICENSE-DOCS) [![code license](https://img.shields.io/badge/code-MIT-green)](./LICENSE-CODE) [![hermes-agent](https://img.shields.io/badge/hermes--agent-v0.11.0-orange)](https://github.com/NousResearch/hermes-agent/releases) [![Stars](https://img.shields.io/github/stars/dongsheng123132/hermes-agent-zh?style=social)](https://github.com/dongsheng123132/hermes-agent-zh)

---

## 📖 配套纸质书已在路上

> **《零基础玩转 hermes-agent：让"马"替你 24 小时写代码》**（暂名）—— 即将由出版社出版（2026 下半年）。
>
> 在本 GitHub 教程基础上"全面重写 + 逐条验证"，新增 **120 条 CLI 命令**、**8 套配置模板**、**5 大场景案例**、**安全防护清单**。
>
> 📧 **预约订阅**：发邮件至 `hefangsheng@gmail.com`，纸书发售第一时间通知。

---

## ⚡ 30 秒选路（你属于哪一种？）

| 你是谁 | 推荐方案 | 为什么 | 估时 |
|---|---|---|---|
| 🟢 **完全不想折腾的小白** | [U-Hermes 马盘](https://u-hermes.org)（成品 U 盘） | 双击 .exe 就能用，预装 ¥30 API 额度 | **0 分钟** |
| 🟡 **想试试不花钱** | [Linux Live USB](./docs/02-installation/01-linux-native.md) | 一根空 U 盘 + 4 个脚本 | 30 分钟 |
| 🔵 **有 Mac/Linux 终端基础** | [3 分钟快速开始](./docs/01-basics/02-3min-quickstart.md) | `pipx install hermes-agent` 一行装好 | 3 分钟 |
| 🟠 **Windows 用户** | [WSL2 安装](./docs/02-installation/03-windows-wsl.md) | 装个 Linux 子系统再走 Linux 流程 | 15 分钟 |
| 🔴 **想做产品 / 创业** | [06-工程进阶](./docs/06-engineering/) + [05-超级个体案例](./docs/05-cases/) | 把 hermes 打包成商业产品的全套方法 | 16 小时 |
| 🟣 **想 7 天系统学完** | [📅 7 天速成路径](./docs/00-preface/04-7day-plan.md) | Day1-Day7 完整路线图 | 1 周 |
| ⚫ **企业团队部署** | [04-团队部署案例](./docs/05-cases/04-team-deployment.md) + [02-4 云端部署](./docs/02-installation/04-cloud-server.md) | 内网 / 私有化 / 多人共享 | 1 天 |

---

## 🎯 这本教程能帮你做到什么

读完这本教程，你将掌握：

✅ **零基础上手**：哪怕你只会用 ChatGPT 网页版，也能自己跑起 hermes
✅ **5 大场景实战**：编程工作流 / 知识库 / 定时监控 / 团队部署 / 便携 USB
✅ **省钱省到底**：DeepSeek 免费 ¥5 → Ollama 完全免费本地化
✅ **避坑指南**：作者踩过的 30+ 个坑全部公开
✅ **超级个体玩法**：5 个 ROI 9000%+ 的"一个人干一家公司"案例
✅ **办公自动化**：日报/周报/邮件/会议纪要自动化
✅ **企业 IM 接入**：飞书/钉钉/企微/Slack 多通道集成
✅ **工程进阶**：把 hermes 打包成便携 USB 的全套方法

---

## 📚 完整目录（35 章 + 附录）

### 序章
- 📖 [前言 · 这本教程写给谁](./docs/00-preface/01-who-is-this-for.md)
- 🐎 [前言 · 为什么 2026 学 hermes](./docs/00-preface/02-why-hermes.md)
- 🗺️ [前言 · 怎么读这本教程](./docs/00-preface/03-how-to-read.md)
- 📅 [前言 · 7 天速成日程](./docs/00-preface/04-7day-plan.md)

### 第 1 部：3 分钟到 3 小时（入门）
- [01-1 hermes-agent 是什么](./docs/01-basics/01-what-is-hermes.md)
- [01-2 三分钟跑起来](./docs/01-basics/02-3min-quickstart.md)
- [01-3 第一次对话深度解读](./docs/01-basics/03-first-conversation.md)

### 第 2 部：装到自己电脑
- [02-1 Linux 原生](./docs/02-installation/01-linux-native.md)
- [02-2 macOS 原生](./docs/02-installation/02-macos-native.md)
- [02-3 Windows WSL](./docs/02-installation/03-windows-wsl.md)
- [02-4 云端部署](./docs/02-installation/04-cloud-server.md)

### 第 3 部：核心功能
- 03-1 Skills 系统
- 03-2 Memory 长期记忆
- 03-3 MCP 协议
- 03-4 Cron 定时任务
- 03-5 Multi-Agent 协作

### 第 4 部：AI 服务商配置
- [04-1 OpenAI / Claude / Gemini](./docs/04-providers/01-openai-anthropic.md)
- [04-2 国产云](./docs/04-providers/02-domestic-providers.md)（DeepSeek / 通义 / Kimi / 智谱 / MiniMax / 文心）
- [04-3 Ollama 本地](./docs/04-providers/03-ollama-local.md)
- [04-4 OpenRouter 聚合](./docs/04-providers/04-openrouter-aggregator.md)

### 第 5 部：实战案例（含超级个体）
- [05-1 编程工作流](./docs/05-cases/01-coding-workflow.md)
- [05-2 办公自动化](./docs/05-cases/02-office-automation.md)
- [05-3 企业 IM 接入](./docs/05-cases/03-enterprise-im.md)（飞书/钉钉/企微/Slack）
- [05-4 团队私有化部署](./docs/05-cases/04-team-deployment.md)
- [05-5 便携 USB 案例](./docs/05-cases/05-portable-usb.md)
- [05-6 ⭐ 超级个体创业案例](./docs/05-cases/06-solo-entrepreneur.md)（5 个 ROI 9000%+ 案例）

### 第 6 部：工程进阶（产品化）
- 06-1 便携打包（Python embed + Node + pip wheels）
- 06-2 Electron 启动器（端口管理、子进程）
- 06-3 hermes-web-ui patch 管理
- 06-4 Provider 模板架构

### 第 7 部：排错与 FAQ
- [07-1 安装失败](./docs/07-troubleshooting/01-install-failures.md)
- [07-2 网络问题](./docs/07-troubleshooting/02-network-issues.md)
- [07-3 高频 FAQ](./docs/07-troubleshooting/03-faq.md)（30 个常见问题）

### 附录
- [99-1 CLI 速查](./docs/99-appendix/01-cli-reference.md)
- [99-2 配置模板](./docs/99-appendix/02-config-templates.md)
- [99-3 术语表](./docs/99-appendix/03-glossary.md)
- [99-4 上游资源](./docs/99-appendix/04-resources.md)

---

## 🐎 为什么叫"马"

hermes 是希腊神话里的**信使之神**，骑神驹 Pegasus 在天地间穿梭。我们做的便携产品 [U-Hermes](https://u-hermes.org) 中文叫"**马盘**"—— 它像一匹马，跟着你走、为你跑腿、24 小时不困不累。

OpenClaw 用"龙虾"（养虾），我们用"马"（骑马、养马、放马）。这是中文 AI Agent 圈两个不同流派的拟人化品牌：
- 🦞 **龙虾派**（OpenClaw）：通用 AI 助手 + IM 机器人
- 🐎 **马派**（hermes）：编程 Agent + 自动化执行

两者并不冲突，本教程作者也维护 [U-Claw 虾盘项目](https://u-claw.org)。

---

## 🚀 7 个懒人方案（不想折腾？挑一个）

| # | 方案 | 适合 | 难度 |
|---|---|---|---|
| 1 | 🐎 **U-Hermes 马盘**（成品 U 盘） | 完全小白 | ⭐ |
| 2 | 🐳 **Docker 一键** | 有 Docker 基础 | ⭐⭐ |
| 3 | 🐧 **Ubuntu Live USB** | 不想动主系统 | ⭐⭐ |
| 4 | ☁️ **腾讯云 / 阿里云一键部署** | 有服务器 | ⭐⭐ |
| 5 | 📦 **本仓库 setup-hermes.sh 脚本** | 终端基础 | ⭐⭐ |
| 6 | 🍰 **宝塔面板插件** | 已用宝塔 | ⭐⭐ |
| 7 | 📱 **直接用云端 hermes 对话框** | 试试不深入 | ⭐ |

详细配置看 [02-installation](./docs/02-installation/)。

---

## 🎓 推荐学习路径

### 路径 A：30 分钟尝鲜（小白）
[3 分钟跑起来](./docs/01-basics/02-3min-quickstart.md) → 看看[01-3 对话原理](./docs/01-basics/03-first-conversation.md) → 合上电脑

### 路径 B：周末项目（程序员，12 小时）
路径 A → [03 核心功能](./docs/03-core-features/) → 挑 [05 实战案例](./docs/05-cases/) 一个做完整

### 路径 C：7 天系统学（学生 / 转行）
跟 [📅 7 天速成日程](./docs/00-preface/04-7day-plan.md) 走，每天 2 小时

### 路径 D：硬核研究（产品 / 创业，30 小时）
通读 + 把 [06 工程进阶](./docs/06-engineering/) 代码亲手敲一遍

---

## ⚠️ 双 License 说明（重要）

本仓库**两类内容分别采用不同许可**：

| 内容 | 许可 | 你能做什么 |
|---|---|---|
| **代码、配置、脚本**（`examples/` 全部、所有 ```代码块``` 内容） | [MIT](./LICENSE-CODE) | 自由使用、修改、商用、再分发 |
| **教程文字、章节叙事**（`docs/` 下所有 `.md` 散文部分、`assets/` 图片） | [CC BY-NC-ND 4.0](./LICENSE-DOCS) | 个人免费阅读、转发、引用（**禁商用、禁改编、禁翻印实体书**） |
| **品牌商标**（"U-Hermes"、"马盘"、Logo） | [全部保留](./BRAND.md) | 不允许在商业产品中使用 |

**简单说**：
- 想用代码做项目 → 完全自由 ✅
- 想分享 / 写读后感 → 完全自由 ✅
- 想翻印实体书 / 做付费课程 / 改编出新教程 → 必须找作者授权 ❌

---

## 🆚 vs 其他 AI Agent 教程

| 教程 | 主角 | 拟人 | 章数 | License | 配套书 |
|---|---|---|---|---|---|
| **本教程** | hermes-agent | 🐎 马 | 35+ | MIT + CC BY-NC-ND | 待出版 |
| [xianyu110/awesome-openclaw-tutorial](https://github.com/xianyu110/awesome-openclaw-tutorial) | OpenClaw | 🦞 龙虾 | 15 章 + 15 附录 | GPL-3.0 | 清华社《超级个体实操手册》¥42 |
| [datawhalechina/hello-claw](https://github.com/datawhalechina/hello-claw) | OpenClaw | 🦞 龙虾 | 龙虾大学 11 场景 | CC BY-NC-SA | 无 |
| [datawhalechina/openclaw-tutorial](https://github.com/datawhalechina/openclaw-tutorial) | OpenClaw | 🦞 龙虾 | 7 天日程 | — | 无 |
| [mengjian-github/openclaw101](https://github.com/mengjian-github/openclaw101) | OpenClaw | 🦞 龙虾 | 资源聚合 | MIT | 无 |

**本教程独特之处**：
- 唯一聚焦 **hermes-agent**（编程 Agent 流派，区别于 OpenClaw 的客服流派）
- 唯一覆盖 "**便携 USB 工程方法论**"（来自作者实战）
- 唯一**双 License**（让你放心商用代码，又保留作者出书权）

---

## 🌐 多渠道关注（更新最快）

| 平台 | 内容 |
|---|---|
| **微信公众号** | 即将开通：搜索 "U-Hermes 马盘" |
| **B 站** | 即将开通：视频教程合集 |
| **小红书** | 即将开通：使用案例 |
| **知乎专栏** | 即将开通：深度分析 |
| **GitHub** | [本仓库](https://github.com/dongsheng123132/hermes-agent-zh) Star + Watch |
| **抖音** | 即将开通：1 分钟科普 |

---

## 🔗 相关项目

- [u-hermes.org](https://u-hermes.org) — U-Hermes 马盘官网
- [u-hermes (Linux 开源版)](https://github.com/dongsheng123132/u-hermes)
- [u-claw.org](https://u-claw.org) — U-Claw 虾盘姊妹产品
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — 上游主项目
- [本教程 GitHub](https://github.com/dongsheng123132/hermes-agent-zh)

---

## 🤝 贡献 / 反馈

- 错别字 / 技术错误：[提 Issue](https://github.com/dongsheng123132/hermes-agent-zh/issues) 或 PR
- 阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)（特别是**禁区清单**）
- 商业合作（出版社 / 培训 / 企业内训 / 课程定制）：邮件 `hefangsheng@gmail.com` / 微信 `hecare888`

---

## 🎉 致谢

- 上游：[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — MIT License
- 对标参考（同行 OpenClaw 流派的优秀教程）：
  - [xianyu110/awesome-openclaw-tutorial](https://github.com/xianyu110/awesome-openclaw-tutorial)（4.3k stars，配套清华社《超级个体实操手册》）
  - [datawhalechina/hello-claw](https://github.com/datawhalechina/hello-claw)
  - [datawhalechina/openclaw-tutorial](https://github.com/datawhalechina/openclaw-tutorial)
  - [mengjian-github/openclaw101](https://github.com/mengjian-github/openclaw101)
- 出版业对标书：
  - 《零基础玩转 OpenClaw：从入门到精通》（向安玲、张诗瑶、张亚男 / 中信出版社 / 2026 / ¥39.8 / ISBN 9787521739282）
  - 《零基础玩转 OpenClaw：让"龙虾"替你 24 小时赚钱》（张云波 / 电子工业出版社 / 2026）
  - 《OpenClaw 超级个体实操手册》（清华大学出版社 / ¥42）

---

**作者**：何方升（dongsheng）· `hefangsheng@gmail.com` · 微信 `hecare888`

**官网**：[u-hermes.org](https://u-hermes.org) · [u-claw.org](https://u-claw.org)

> 如果这本教程帮到你，请帮我点 ⭐ Star，让更多人看到。
