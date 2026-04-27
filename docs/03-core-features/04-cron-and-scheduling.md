# 03-4 Cron：让 hermes 主动行动

> 这一章讲：怎么让 hermes 在你不在电脑前的时候自己跑活儿。

---

## Cron 是什么

**Cron = "在指定时间触发 hermes 执行某个 prompt"**。这是 hermes 区别于 ChatGPT / Claude 网页版的核心能力 —— **主动行动（Proactive Action）**。

举例：
- 每天早 8 点扫一遍我的 GitHub Issue → 整理摘要发飞书
- 每周一汇总上周代码变更 → 写周报
- 每 15 分钟检查邮件 → 分类 + 起草回复

---

## 5 分钟跑通第一个 cron

`~/.u-hermes/data/crons.yaml`：

```yaml
crons:
  - name: "hello-cron"
    schedule: "*/2 * * * *"   # 每 2 分钟（测试用）
    prompt: |
      用 file_write 把当前时间写到 ~/Desktop/cron-test.txt
```

启动：

```bash
hermes cron start
# 后台运行
```

观察 `~/Desktop/cron-test.txt`，每 2 分钟应该被更新。

调试结束改回正常时间：

```yaml
schedule: "0 8 * * *"  # 每天早 8 点
```

---

## Cron 表达式速查

```
 ┌───────────── 分 (0-59)
 │ ┌───────────── 小时 (0-23)
 │ │ ┌───────────── 月份内的日 (1-31)
 │ │ │ ┌───────────── 月 (1-12)
 │ │ │ │ ┌───────────── 星期 (0-6, 0=周日)
 │ │ │ │ │
 * * * * *
```

| 表达式 | 含义 |
|---|---|
| `0 8 * * *` | 每天早 8:00 |
| `0 18 * * 1-5` | 工作日下午 6:00 |
| `*/15 * * * *` | 每 15 分钟 |
| `0 */2 * * *` | 每 2 小时 |
| `0 9 * * 1` | 每周一早 9:00 |
| `0 0 1 * *` | 每月 1 号 0:00 |
| `0 0 1 1 *` | 每年 1 月 1 日 0:00 |
| `0 9-18/2 * * 1-5` | 工作日 9-18 点每 2 小时（9, 11, 13, 15, 17） |

工具：[https://crontab.guru/](https://crontab.guru/) 可视化测试。

---

## 完整 cron 配置示例

```yaml
crons:
  - name: "morning-briefing"
    schedule: "30 8 * * 1-5"
    description: "工作日早间简报"
    timezone: "Asia/Shanghai"
    
    provider: deepseek          # 该任务用哪个模型
    model: deepseek-chat
    
    prompt: |
      整理今天的早间简报：
      
      1. 用 web_search 找 3 条今天的 AI 行业重要新闻
      2. 用 calendar Skill 列今天我的会议
      3. 用 github MCP 列我有 5 个待审 PR
      4. 用 lark_send 推送到我的"个人助理"群
    
    timeout: 300                # 5 分钟超时
    max_retries: 2              # 失败重试 2 次
    
    on_failure: notify_admin    # 失败回调（自定义 Skill）
    on_success: log_only        
    
    enabled: true
```

---

## 实用 cron 模板（直接抄）

### 1. 日报机器人

```yaml
- name: "daily-report"
  schedule: "0 18 * * 1-5"
  prompt: |
    收集今天我做的事：
    1. shell: git -C ~/projects/* log --since="今天 00:00" --pretty=format:"- %s"
    2. 读 ~/notes/$(date +%Y-%m-%d).md（如果有今日笔记）
    3. 整理成日报草稿，结构：完成/进行中/明日计划/风险
    4. 写到 ~/Desktop/daily-$(date +%Y-%m-%d).md
    5. lark_send 给我提醒
```

### 2. 邮件巡检

```yaml
- name: "email-check"
  schedule: "*/30 9-19 * * 1-5"
  prompt: |
    用 imap_check Skill 拉新邮件
    对每封：
      1. 分类（询价/汇报/广告/紧急）
      2. 紧急的（评分 ≥ 4）发飞书通知
      3. 起草回复（保存草稿，不发送）
```

### 3. GitHub 监控

```yaml
- name: "github-watch"
  schedule: "0 */2 * * *"
  prompt: |
    用 github MCP 检查：
    1. 我的 PR 是否有新评论
    2. 我关注的项目是否发了 Release
    3. 我的 Issue 是否有 @mention
    
    汇总后用 lark_send 推送（仅在有变更时）
```

### 4. 网页监控

```yaml
- name: "site-watch"
  schedule: "*/30 * * * *"
  prompt: |
    用 web_fetch 抓 https://example.com/pricing
    和上次结果（~/.u-hermes/state/pricing-last.html）对比
    如果价格变了：
      - 保存新版本
      - lark_send 通知我
```

### 5. 知识库整理

```yaml
- name: "weekly-knowledge-base"
  schedule: "0 17 * * 0"   # 每周日下午 5 点
  prompt: |
    1. 列出 ~/notes/ 本周新增的 .md 文件
    2. 给每个文件生成摘要 + 标签
    3. 更新 ~/notes/INDEX.md（按主题归类）
    4. 把"重要笔记"转写到 Notion（用 notion MCP）
```

### 6. 财务对账

```yaml
- name: "monthly-finance"
  schedule: "0 9 1 * *"    # 每月 1 号早 9 点
  prompt: |
    1. 读 ~/finance/ 下上个月的 *.csv（支付宝/微信导出）
    2. 用 python 工具分类汇总
    3. 写到 ~/finance/monthly-$(date -d "last month" +%Y-%m).md
    4. lark_send 摘要 + 财报附件
```

### 7. 自动备份

```yaml
- name: "auto-backup"
  schedule: "0 3 * * *"
  prompt: |
    跑 shell 命令：
    1. tar czf ~/backups/notes-$(date +%Y%m%d).tar.gz ~/notes/
    2. rclone copy ~/backups/notes-*.tar.gz remote:hermes-backups/
    3. find ~/backups/ -name "notes-*.tar.gz" -mtime +30 -delete
    
    用 lark_send 报告备份大小 + 是否成功
```

---

## Cron + Memory + Skills 三件套

cron 真正强大是和另外两个组合：

```
[Cron 触发]
   ↓
[hermes 读 Memory] ← 知道你是谁、当前项目什么
   ↓
[hermes 调 Skills + MCP] ← 实际干活
   ↓
[结果写回 Memory] ← 下次可参考
   ↓
[发通知给你]
```

例：

```yaml
- name: "smart-daily-report"
  schedule: "0 18 * * 1-5"
  prompt: |
    [memory_search "本周目标"]
    [hermes 知道用户本周目标是"完成登录功能 + 修 3 个 bug"]
    
    [shell git log → 看完成度]
    [hermes 计算今天进展占周目标的百分比]
    
    [lark_send "今日进度 30%，本周目标剩余 5 个任务"]
    [memory_save "今日进度 30%"]
```

下周一新会话时，hermes 看 Memory：

```
[memory_hits]
  - 上周完成 80% 目标
  - 拖延的两个任务是 X 和 Y

[hermes 主动建议]
"上周拖延的 X 任务，要不要本周优先排？"
```

---

## 多 cron 协同

```yaml
crons:
  - name: "step-1-collect"
    schedule: "0 8 * * *"
    prompt: |
      收集今天数据 → 写 ~/.u-hermes/state/today-raw.json
  
  - name: "step-2-analyze"
    schedule: "5 8 * * *"     # 5 分钟后
    prompt: |
      读 today-raw.json → 分析 → 写 today-analysis.json
  
  - name: "step-3-report"
    schedule: "10 8 * * *"    # 10 分钟后
    prompt: |
      读 today-analysis.json → 生成报告 → 发飞书
```

或用 `depends_on` 显式链：

```yaml
- name: "step-2-analyze"
  depends_on: step-1-collect
  delay: 5m
  prompt: ...
```

---

## 监控 cron

### 列出所有

```bash
hermes cron list
```

### 看运行历史

```bash
hermes cron history --name=daily-report --last=7
# 输出 7 次执行的状态、耗时、错误
```

### 实时日志

```bash
tail -f ~/.u-hermes/data/logs/cron.log
```

---

## 限制 / 注意事项

### 1. 别让 cron 烧 token

每次 cron 执行都会调 LLM API。如果设置 `*/1 * * * *` (每分钟)，一个月就是 43,200 次调用，可能产生意外账单。

```yaml
# 加预算限制
cron_global:
  max_calls_per_day: 100
  max_cost_per_month: 50.0   # USD
```

### 2. 别死循环

cron 调 cron 是死循环：

```yaml
# ❌ 不要这样
prompt: |
  hermes cron add ...    # 让 hermes 加 cron，结果新 cron 又加 cron
```

### 3. 时区

```yaml
timezone: "Asia/Shanghai"   # 默认服务器本地时区
```

服务器在国外的话**一定要显式设置**，否则你以为的早 8 点可能是凌晨 3 点。

### 4. 突发事件不适合 cron

cron 是**周期性**任务。"用户登录失败超过 3 次报警" 这种事件驱动应该用 webhook（[02-4 云端](../02-installation/04-cloud-server.md)）。

---

## 进阶：动态 cron

让 hermes 自己加 / 删 cron：

```
> 我每周二下午 3 点开例会，你帮我加个提醒，提前 30 分钟通知我

[hermes 调 cron_add]
[新增 cron: 30 14 * * 2 -> "提醒例会即将开始"]

✓ 已加。下周二 14:30 你会收到提醒
```

下次决定不用了：

```
> 取消"例会提醒"

[hermes 调 cron_remove]
✓ 已删除
```

---

**[← 03-3 MCP](./03-mcp-protocol.md)** · **[03-5 Multi-Agent →](./05-multi-agent.md)**
