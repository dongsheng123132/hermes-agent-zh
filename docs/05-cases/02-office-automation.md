# 05-2 办公自动化（日报 / 周报 / 邮件 / 会议纪要）

> 这一章讲：让 hermes 处理你最烦的办公重复活儿。对标《零基础玩转 OpenClaw》第二部"办公场景"。

---

## 场景速查

| 痛点 | 解决方案 | 估时 |
|---|---|---|
| 日报周报写不出来 | [日报机器人](#1-日报机器人) | 30 分钟 |
| 邮件回不过来 | [邮件助手](#2-邮件助手) | 20 分钟 |
| 会议没纪要 | [会议纪要 Skill](#3-会议纪要) | 30 分钟 |
| 文档太多看不完 | [文档摘要](#4-文档摘要) | 20 分钟 |
| 跨语言沟通 | [实时翻译](#5-实时翻译-skill) | 15 分钟 |

---

## 1. 日报机器人

### 场景

每天下班前要交一份"今天干了什么"的日报。痛点：经常忘了写就什么都想不起来。

### hermes 设计

让 hermes 监控你今天的：
- git commit 记录
- 浏览器历史（可选）
- 微信 / Slack 群里你的发言
- IDE 打开过的文件

下班自动整理成日报草稿。

### 配置

```yaml
# ~/.u-hermes/data/skills/daily_report.yaml
name: daily_report
description: "整理今天的工作日报"
script: |
  #!/usr/bin/env bash
  TODAY=$(date +%Y-%m-%d)

  # 1. 收集 git commits
  git -C ~/projects log --since="$TODAY 00:00" --pretty=format:"- %s" > /tmp/today-commits.txt

  # 2. 收集你在文件系统上动过的文件
  find ~/projects -type f -newer /tmp/yesterday-marker -name "*.py" -o -name "*.ts" \
    | head -20 > /tmp/today-files.txt

  # 3. （可选）从你的笔记里找今天的内容
  grep -r "$TODAY" ~/notes/ > /tmp/today-notes.txt

  cat /tmp/today-commits.txt /tmp/today-files.txt /tmp/today-notes.txt
```

### Cron 触发

```yaml
crons:
  - name: "daily-report"
    schedule: "0 18 * * 1-5"  # 工作日下午 6 点
    prompt: |
      调用 daily_report Skill 收集今天的工作信息
      用以下结构整理成日报（中文，正式语气）：

      ## 今日完成
      - [按类别归类]

      ## 进行中
      - [未完成的]

      ## 明日计划
      - [基于今天的工作推断]

      ## 风险 / 阻塞
      - [如果有的话]

      保存到 ~/Desktop/daily-{date}.md，并复制到剪贴板
```

### 验收

下午 6 点你电脑上会出现 `daily-2026-04-26.md`，你只需要：
1. 改 1-2 个细节
2. 复制粘贴到公司日报系统

---

## 2. 邮件助手

### 场景

每天处理 30+ 邮件。痛点：分类、优先级、起草回复都耗时。

### hermes 工作流

```
新邮件到 → IMAP webhook → hermes 工作流：
  1. 读邮件内容
  2. 分类（询价/汇报/广告/紧急/...）
  3. 优先级评分（1-5）
  4. 起草回复（保存到草稿箱，不发送）
  5. 紧急的发飞书通知你
```

### 配置（IMAP 监控）

```yaml
# ~/.u-hermes/data/skills/email_check.yaml
name: email_check
description: "检查新邮件并分类"
script: |
  #!/usr/bin/env python3
  import imaplib, email
  from datetime import datetime, timedelta

  # 连接你的邮箱（推荐用 IMAP App-specific password，不是主密码）
  mail = imaplib.IMAP4_SSL("imap.qq.com")
  mail.login("you@qq.com", "$IMAP_PASSWORD")
  mail.select("inbox")

  # 取最近 1 小时的邮件
  cutoff = (datetime.now() - timedelta(hours=1)).strftime("%d-%b-%Y")
  status, ids = mail.search(None, f'(SINCE "{cutoff}")')

  for eid in ids[0].split():
    _, msg_data = mail.fetch(eid, "(RFC822)")
    msg = email.message_from_bytes(msg_data[0][1])
    print(f"--- Email {eid.decode()} ---")
    print(f"From: {msg['From']}")
    print(f"Subject: {msg['Subject']}")
    print(f"Body: {msg.get_payload()[:500]}")
```

### Cron + 处理

```yaml
crons:
  - name: "email-classifier"
    schedule: "*/15 * * * *"
    prompt: |
      调用 email_check 拉新邮件
      对每封：
      1. 分类：[询价/汇报/广告/紧急/其他]
      2. 评分：1（最低）-5（最高）
      3. 如果评分 ≥ 4，调用 lark_notify 推送给我
      4. 起草回复（不发送）→ 写到 ~/emails/draft-{from}.md
```

### ⚠️ 安全提醒

- **不要**让 hermes 自动发邮件！永远人工审核
- IMAP 密码用 App-specific（QQ 邮箱"授权码"，Gmail "应用专用密码"），不要用主密码
- 邮箱密码存到系统 keyring，不要明文写 .env

---

## 3. 会议纪要

### 场景

腾讯会议 / 飞书会议 / Zoom 录音 → hermes 转写 + 整理成纪要。

### 配置

```yaml
# ~/.u-hermes/data/skills/meeting_minutes.yaml
name: meeting_minutes
description: "把音频文件转成结构化会议纪要"
parameters:
  - name: audio_path
    type: string
script: |
  #!/usr/bin/env bash
  AUDIO=$1
  OUT_TXT="${AUDIO%.*}.txt"
  OUT_MD="${AUDIO%.*}-minutes.md"

  # 转写（用 OpenAI Whisper API 或本地 whisper.cpp）
  curl https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F file=@"$AUDIO" \
    -F model=whisper-1 \
    -F language=zh \
    > "$OUT_TXT"

  echo "$OUT_TXT"
```

### 触发

```
你：[拖一个 .mp3 / .m4a 文件给 hermes，说]
> 这是今天的产品评审会议，整理成纪要

hermes：
[meeting_minutes 转写]
[基于转写文本整理成结构化纪要]

## 会议主题
...

## 参会人
...

## 关键决策
1. ...
2. ...

## 行动项（带责任人 + 截止日期）
- [ ] @张三 周五前提交 PRD
- [ ] @李四 评估技术方案

## 待跟进问题
- ...

写入 ~/meetings/2026-04-26-product-review.md
```

### 配套：本地 whisper（离线 / 隐私）

如果你不想把会议录音传 OpenAI：

```bash
# 装 whisper.cpp（不需要 GPU）
brew install whisper-cpp

# 用本地模型
whisper-cpp -f meeting.m4a -l zh -m models/ggml-medium.bin
```

把 `meeting_minutes.yaml` 里 curl 那段换成本地命令即可。

---

## 4. 文档摘要

### 场景

每天收到 5+ 长文档（PDF / Word / Markdown）。痛点：不可能都读完。

### Skill

```yaml
# ~/.u-hermes/data/skills/doc_summary.yaml
name: doc_summary
description: "对长文档生成结构化摘要"
parameters:
  - name: doc_path
    type: string
  - name: max_length
    type: integer
    default: 500
script: |
  #!/usr/bin/env bash
  # 把任何格式转成纯文本
  case "$1" in
    *.pdf) pdftotext "$1" -;;
    *.docx) pandoc "$1" -t plain;;
    *.md|*.txt) cat "$1";;
    *) echo "Unsupported format"; exit 1;;
  esac
```

### 用法

```
你：> 帮我读 ~/Downloads/2026-AI-trends.pdf 的关键内容

hermes：
[调 doc_summary 提取]
[整理成结构化摘要]

## 核心论点
...

## 5 个关键数据
1. ...

## 与我的工作相关的 3 点
（hermes 会基于你 Memory 中的工作内容自动联想）
```

---

## 5. 实时翻译 Skill

### 场景

跨境合作、看英文文档、写国际化文案。

### Skill

```yaml
# ~/.u-hermes/data/skills/translate.yaml
name: translate
description: "翻译文本（中英互译，保留专业术语）"
parameters:
  - name: text
    type: string
  - name: target_lang
    type: string
    default: "en"
script: |
  # 简单实现：直接让 hermes 自己翻译（不需要外部 API）
  # 这里只是一个 wrapper，让 hermes 知道"何时该翻译"
  echo "$1"
```

### 用法

```
> 把这段 PRD 翻译成英文（保留 OKR、PRD、Sprint 这些英文不变）：
（粘贴 PRD 内容）

hermes：[直接出英文版]
```

---

## 工作日完整模板（懒人版）

把下面的 cron 一键加到 `~/.u-hermes/data/crons.yaml`：

```yaml
crons:
  - name: "morning-briefing"
    schedule: "30 8 * * 1-5"
    prompt: |
      早安。整理：
      1. 我今天日历的会议（日历集成 Skill）
      2. 昨晚到现在的邮件（紧急的）
      3. 我关注的 GitHub 项目的更新
      推送到飞书 / 微信

  - name: "daily-report"
    schedule: "0 18 * * 1-5"
    prompt: |
      [日报机器人配置，见上面 1.]

  - name: "email-classifier"
    schedule: "*/15 9-19 * * 1-5"
    prompt: |
      [邮件助手配置，见上面 2.]

  - name: "weekly-review"
    schedule: "0 17 * * 5"  # 周五下午 5 点
    prompt: |
      整理本周：
      - 完成的任务（合并 5 个日报）
      - 未完成的（迁移到下周）
      - 学习心得 / 想法（从 Memory 抽）
      写到 ~/weekly/{week-num}.md
```

---

## 安全 / 合规清单

办公场景特别敏感，每条都要确认：

- ✅ 公司禁止用 OpenAI 等海外服务？→ 全部切到 DeepSeek / 本地 Ollama
- ✅ 客户邮件涉及敏感数据？→ 用本地 whisper + 本地 Ollama
- ✅ hermes 自动发邮件？→ **永远不要**！只起草，人工发
- ✅ IMAP 密码哪里存？→ 系统 keyring，不要 .env 明文
- ✅ 会议录音哪里存？→ 本地，不要传云
- ✅ 公司有审计要求？→ hermes 所有动作都写日志，定期检查 `~/.u-hermes/data/logs/`

---

**[← 05-1 编程工作流](./01-coding-workflow.md)** · **[05-3 企业 IM 接入 →](./03-enterprise-im.md)**
