# 前言 04 · 7 天速成日程

> 这一节是"上班族 / 学生"的硬核学习路径：每天 2 小时，7 天把 hermes-agent 从陌生玩到能给你打工。
>
> 对标 [datawhalechina/openclaw-tutorial](https://github.com/datawhalechina/openclaw-tutorial) 的 7 天节奏，但聚焦 hermes 流派。

---

## 总览

| Day | 主题 | 学完能干什么 | 章节链接 |
|---|---|---|---|
| **1** | 跑起来 | 装好 hermes，第一次对话成功 | [01-2](../01-basics/02-3min-quickstart.md) |
| **2** | 配模型 | DeepSeek 跑通 + Ollama 本地跑通 | [04-2](../04-providers/02-domestic-providers.md) |
| **3** | 工具调用 | hermes 自动改你的文件、跑你的脚本 | [01-3](../01-basics/03-first-conversation.md) |
| **4** | Skills 与 Memory | 写第一个自定义 Skill / 看 hermes 怎么记忆 | 03-1 / 03-2 |
| **5** | 定时任务 | 让 hermes 每天 8 点给你日报 | 03-4 |
| **6** | 实战项目 | 搭一个"自动审 PR + 写发布说明" | [05-1](../05-cases/01-coding-workflow.md) |
| **7** | 超级个体 | 玩转 5 个 ROI 9000%+ 创业案例 | [05-6](../05-cases/06-solo-entrepreneur.md) |

---

## 📅 Day 1：跑起来（2 小时）

### 目标

让你看到 **hermes 真的回答你**。这一天什么都别想，只追求"跑通"。

### 任务

- [ ] 选你的系统跟着安装：[Linux](../02-installation/01-linux-native.md) / [macOS](../02-installation/02-macos-native.md) / [Windows-WSL](../02-installation/03-windows-wsl.md)
- [ ] 注册 [DeepSeek](https://platform.deepseek.com/api_keys) 拿到 API Key（手机号注册，免费 ¥5）
- [ ] 配 `~/.u-hermes/data/.env`：`DEEPSEEK_API_KEY=sk-xxx`
- [ ] 跑 `hermes chat --provider deepseek`
- [ ] 第一句话："用一段话介绍你自己"

### 验收

✅ 能看到流式输出的回答
✅ 能用 `/exit` 退出
✅ 能再次进入并保持上次会话历史

### 卡住怎么办

看 [07-1 安装失败](../07-troubleshooting/01-install-failures.md) 的决策树。

### 今晚做点啥（可选）

读 [01-1 hermes-agent 是什么](../01-basics/01-what-is-hermes.md)，建立"它和 ChatGPT 的差异"的概念。

---

## 📅 Day 2：配模型（2 小时）

### 目标

学会 **切换不同 AI 服务商**。这一天理解"hermes 不绑定任何厂商"。

### 任务

- [ ] 跟 [04-2 国产 Provider](../04-providers/02-domestic-providers.md) 配 **2 个 provider**（推荐 DeepSeek + Kimi）
- [ ] 学会用 `/provider <name>` 在会话中切换
- [ ] 装 [Ollama](../04-providers/03-ollama-local.md)，下载 `qwen2.5:7b`
- [ ] 跑同一个问题对比 3 个模型的回答

### 验收

✅ 能用 `/provider deepseek` 和 `/provider moonshot` 切换
✅ Ollama 本地能问答（断网也能用）

### 进阶（可选）

试试 [04-4 OpenRouter](../04-providers/04-openrouter-aggregator.md)：一个 key 接 300+ 模型。

---

## 📅 Day 3：工具调用（2 小时）

### 目标

让 hermes **真的动你的电脑**。这是 Agent 与 ChatGPT 的根本差异。

### 任务

- [ ] 跑这些指令观察 hermes 怎么调工具：
  ```
  > 我桌面有几个 .png？
  > 帮我写一个 hello.py 打印当前时间
  > 现在跑一下 hello.py
  > 把桌面上所有 .txt 文件移到 ~/notes/
  ```
- [ ] 读 [01-3 第一次对话深度解读](../01-basics/03-first-conversation.md)
- [ ] 开 `--debug` 模式看 hermes 内部流程：
  ```bash
  hermes chat --debug
  ```

### 验收

✅ 能描述 hermes 怎么"决策→调工具→获取结果→再回答"五个阶段
✅ 看过至少 1 次完整 debug 日志

### ⚠️ 安全提醒

今天开始 hermes 会真的改你的文件！**永远不要在含重要数据的目录裸跑**。建议：
- 在专门的工作目录（如 `~/hermes-sandbox/`）测试
- 重要数据先 `git commit` 备份
- 学会用 `--no-auto-confirm` 模式（每步问你）

---

## 📅 Day 4：Skills + Memory（2 小时）

### 目标

让 hermes **学你的偏好** + **扩展自定义工具**。

### 任务

- [ ] 写第一个 Skill：在 `~/.u-hermes/data/skills/translate.yaml` 里：

```yaml
name: translate
description: "把中文翻译成英文（适合做 PR title）"
parameters:
  - name: text
    type: string
    required: true
script: |
  #!/usr/bin/env bash
  echo "Translation request: $1"
  # 这里可以调任何翻译 API
```

- [ ] 跑 `hermes chat`，问 "把 '修复登录 bug' 翻译成英文"
- [ ] 看 `~/.u-hermes/data/memory/` 怎么存你的会话记忆
- [ ] 试 `/memory search` 命令

### 验收

✅ 自定义 Skill 能被 hermes 主动选择并调用
✅ 在新会话里 hermes 还记得你的偏好（"我用 pnpm 不用 npm"）

---

## 📅 Day 5：定时任务（2 小时）

### 目标

让 hermes **主动行动**：在你不在的时候自己跑。

### 任务

- [ ] 配置一个每日早 8 点的任务：

```yaml
# ~/.u-hermes/data/crons.yaml
crons:
  - name: "每日早报"
    schedule: "0 8 * * *"
    prompt: |
      搜索过去 24 小时关于 "AI Agent" 的新闻，整理 5 条最重要的，
      写成中文，每条不超过 100 字，发到我的桌面 ~/Desktop/daily-report.md
```

- [ ] 跑 `hermes cron list` 验证已注册
- [ ] 改 schedule 为 `*/5 * * * *`（每 5 分钟），等待第一次执行
- [ ] 验证 `~/Desktop/daily-report.md` 真的被生成

### 验收

✅ Cron 任务自动执行
✅ 输出文件按预期生成
✅ 改回原来的 `0 8 * * *` 不再每 5 分钟跑

---

## 📅 Day 6：实战项目（3 小时，时间多花点）

### 目标

把前 5 天学的揉在一起，**做一个真实有用的工作流**。

### 推荐项目（任选一）

**项目 A：自动审 PR**

让 hermes 每小时检查你 GitHub 的 open PR，按"代码风格、潜在 bug、测试覆盖"三个维度写评论。

**项目 B：知识库自动整理**

让 hermes 监控你的 `~/Notes/` 目录，每周一自动把上周新增笔记按主题归类，输出索引文件。

**项目 C：会议纪要机器人**

录音上传到指定目录 → hermes 调用 Whisper 转写 → 生成结构化纪要。

### 任务

- [ ] 选一个项目
- [ ] 用 [05-1 编程工作流](../05-cases/01-coding-workflow.md) 或 [05-2 办公自动化](../05-cases/02-office-automation.md) 做参考
- [ ] 至少跑通 3 次（让你确信不是偶然）

### 验收

✅ 项目跑通且每次稳定
✅ 你能自信地对朋友说："这是我自己搭的"

---

## 📅 Day 7：超级个体（3 小时）

### 目标

了解 **hermes 怎么变成你的"小老板"** —— 让它替你赚钱。

### 任务

- [ ] 通读 [05-6 超级个体创业案例](../05-cases/06-solo-entrepreneur.md)
- [ ] 选一个案例本周开始执行（不必今天做完）
- [ ] 加入本仓库 GitHub Discussions，分享你的"7 天毕业作品"
- [ ] 思考下个月做什么（写在 `~/.u-hermes/data/memory/goals.md`，hermes 会记住）

### 毕业证书（哈哈）

完成 7 天后，请：

1. **给本仓库点 ⭐**
2. **发一条 PR 到 [hermes-agent-zh/showcase/](#)**（用户秀作品 PR 通道，下个版本开通）

---

## 节奏建议

| 角色 | 怎么安排 |
|---|---|
| 工作日上班族 | 每晚 2 小时，1 周完成 |
| 学生 | 周末两天集中干，工作日复习 |
| 在职转行 | 每天 3-4 小时，4 天完成 |
| 周末自学 | 周六周日各 6 小时 |

---

## 卡进度怎么办

每一天结束都看一下今天的"验收"清单。如果没达成：

1. **不要硬撑**：暂停一天找出根本原因（去 [07-troubleshooting](/troubleshooting/) 查）
2. **不要跳过**：Day 3 不通就别开始 Day 4，工具调用是后续基础
3. **找帮助**：本仓库 [Issues](https://github.com/dongsheng123132/hermes-agent-zh/issues) 或邮件作者

---

**完成 7 天后，你已经超过 95% 的 hermes 用户**。剩下的 5% 是产品 / 开发者级别，看 [06-engineering](/engineering/)。

---

**[← 03 怎么读](./03-how-to-read.md)** · **[01 入门 →](../01-basics/01-what-is-hermes.md)**
