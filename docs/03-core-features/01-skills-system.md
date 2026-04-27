# 03-1 Skills 系统：让 hermes 学会你的工具

> 这一章讲：怎么写、怎么调用、怎么调试自定义 Skill。

---

## Skill 是什么

**Skill = hermes 的"自定义工具"**。每个 Skill 是一段 YAML 配置 + 一段脚本，让 hermes 知道"我能干这件事"。

举例：你想让 hermes 帮你查股票，hermes 内置工具里没有这个。写一个 `stock_quote` Skill：

```yaml
# ~/.u-hermes/data/skills/stock_quote.yaml
name: stock_quote
description: "查询 A 股 / 美股 / 港股实时价格"
parameters:
  - name: ticker
    type: string
    description: "股票代码，如 600519、AAPL、00700.HK"
    required: true
script: |
  #!/usr/bin/env bash
  curl -s "https://qt.gtimg.cn/q=$1" | iconv -f GBK -t UTF-8
```

**之后** hermes 见到 "茅台股价多少" 这种问题会自动决策"调 stock_quote 工具，参数 600519"。

---

## Skill vs 内置工具

| 内置工具 | Skill |
|---|---|
| `shell` / `file_read` / `web_fetch` 等 | 你自己写的 |
| 由 hermes 维护 | 你维护 |
| 全局可用 | 当前用户可用（或团队共享） |
| 不能修改 | 可改可删 |

---

## 写第一个 Skill

### 1. Hello World

```yaml
# ~/.u-hermes/data/skills/hello.yaml
name: hello
description: "向某人打招呼（用于测试 Skill 系统）"
parameters:
  - name: name
    type: string
    required: true
script: |
  #!/usr/bin/env bash
  echo "Hello, $1!"
```

测试：

```
$ hermes chat
> 用 hello Skill 跟"小明"打招呼

[hermes 调 hello("小明")]
[输出: Hello, 小明!]

向小明问好成功 ✓
```

### 2. 多参数

```yaml
name: weather
description: "查询某城市某天的天气"
parameters:
  - name: city
    type: string
    required: true
  - name: date
    type: string
    description: "YYYY-MM-DD 格式，默认今天"
    default: "today"
script: |
  #!/usr/bin/env bash
  CITY=$1
  DATE=$2
  curl -s "https://wttr.in/$CITY?format=3&date=$DATE"
```

### 3. 复杂参数（结构化）

```yaml
name: send_email
description: "发送邮件（使用 SMTP）"
parameters:
  - name: to
    type: string
    required: true
  - name: subject
    type: string
    required: true
  - name: body
    type: string
    required: true
  - name: attachments
    type: array
    items:
      type: string
    required: false
script: |
  #!/usr/bin/env python3
  import smtplib, sys, json, os
  from email.mime.multipart import MIMEMultipart
  from email.mime.text import MIMEText
  
  # hermes 把参数作为 JSON 通过 stdin 传入
  args = json.loads(sys.stdin.read())
  
  msg = MIMEMultipart()
  msg['From'] = os.environ['SMTP_USER']
  msg['To'] = args['to']
  msg['Subject'] = args['subject']
  msg.attach(MIMEText(args['body'], 'plain', 'utf-8'))
  
  with smtplib.SMTP_SSL('smtp.qq.com', 465) as smtp:
      smtp.login(os.environ['SMTP_USER'], os.environ['SMTP_PASS'])
      smtp.send_message(msg)
  
  print("邮件已发送")
```

---

## description 怎么写（最关键）

**Skill 的 description 决定了 hermes 是否会主动调用它**。LLM 看 description 决策"用户问的问题，我应该用哪个工具"。

### ✅ 好的 description

```yaml
description: "查询 A 股 / 美股 / 港股的实时价格。用户提到具体公司或股票代码时使用。"
```

明确说"什么时候该用我"。

### ❌ 差的 description

```yaml
description: "Skill"     # 啥也没说
description: "查股票"    # 太短，LLM 不知道边界
description: "这是我写的一个 Python 脚本，可以查询股票，使用了腾讯的 API ..."  # 太啰嗦
```

### 黄金公式

```
[一句话说能力] + [明确触发条件] + [可选：参数说明]
```

比如：

```yaml
description: |
  发送邮件。当用户说"发邮件"、"通知 XX"、"邮件提醒 XX" 时使用。
  注意：to 参数必须是合法邮箱地址。
```

---

## 参数类型

支持的类型：

| 类型 | YAML 写法 | 示例 |
|---|---|---|
| string | `type: string` | "hello" |
| integer | `type: integer` | 42 |
| number | `type: number` | 3.14 |
| boolean | `type: boolean` | true / false |
| array | `type: array` + `items: ...` | [1, 2, 3] |
| object | `type: object` + `properties: ...` | {key: val} |
| enum | `enum: [a, b, c]` | "b" |

### 复杂示例

```yaml
parameters:
  - name: action
    type: string
    enum: [create, update, delete]
    required: true
  - name: count
    type: integer
    minimum: 1
    maximum: 100
    default: 1
  - name: tags
    type: array
    items:
      type: string
    default: []
  - name: metadata
    type: object
    properties:
      author:
        type: string
      version:
        type: string
```

---

## script 怎么写

### 方式 1：Bash（最简单）

```yaml
script: |
  #!/usr/bin/env bash
  echo "Got args: $@"
```

参数按 `$1 $2 $3 ...` 传入。

### 方式 2：Python（最灵活）

```yaml
script: |
  #!/usr/bin/env python3
  import sys, json
  
  # 方式 A：参数从 stdin 读 JSON
  args = json.loads(sys.stdin.read())
  print(f"Got: {args}")
  
  # 方式 B：从命令行参数
  # print(f"Got: {sys.argv}")
```

### 方式 3：调用现有工具

```yaml
script: |
  #!/usr/bin/env bash
  # 直接 wrap 命令行工具
  ffmpeg -i "$1" -ss "$2" -t "$3" -c copy /tmp/clip.mp4
  echo "/tmp/clip.mp4"
```

### 方式 4：HTTP API 调用

```yaml
script: |
  #!/usr/bin/env bash
  curl -s -X POST "https://api.example.com/endpoint" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$1\"}"
```

### 方式 5：调用本地服务

```yaml
script: |
  #!/usr/bin/env bash
  # 比如调用本地的 ollama
  curl -s http://127.0.0.1:11434/api/generate \
    -d "{\"model\":\"qwen2.5:7b\",\"prompt\":\"$1\"}"
```

---

## 返回值

hermes 把 stdout 内容作为工具结果回填给 LLM。

```bash
# Skill 输出
echo "查询到：茅台 1850.50 元"

# hermes 收到后给 LLM 的工具结果
"查询到：茅台 1850.50 元"

# LLM 基于这个结果组织最终回答
"茅台目前股价 1850.5 元，处于历史相对高位..."
```

### 结构化返回（推荐）

```bash
# 输出 JSON 让 LLM 更好解析
cat <<EOF
{
  "ticker": "600519",
  "name": "贵州茅台",
  "price": 1850.50,
  "change": "+1.2%",
  "volume": 12345
}
EOF
```

LLM 看到结构化数据更容易写出"价格 1850.5，涨 1.2%，成交量 12345"。

### 错误处理

```bash
if [ -z "$1" ]; then
  echo "ERROR: ticker is required" >&2
  exit 1
fi
```

非 0 退出码 + stderr 错误信息 → hermes 知道失败了，会让 LLM 自动重试或告诉用户。

---

## 调试 Skill

### 1. 命令行直接跑

```bash
echo '{"city":"北京","date":"today"}' | bash ~/.u-hermes/data/skills/weather.yaml.script
# 或者
python3 ~/.u-hermes/data/skills/weather.yaml.script "北京" "today"
```

让 hermes 之外能跑，再放到 hermes 里。

### 2. hermes debug 模式

```bash
hermes chat --debug
> 查北京天气

[debug] 候选 Skills: [..., weather, ...]
[debug] LLM 决策: weather(city="北京", date="today")
[debug] 执行 Skill weather...
[debug] stdout: "Beijing: ☀️ +25°C"
[debug] LLM 第二轮基于工具结果回答...
```

### 3. /skills 命令

```bash
$ hermes chat
> /skills list
weather    - 查询某城市某天的天气
hello      - 向某人打招呼
stock_quote - 查询股票
...

> /skill stock_quote 600519
[直接调用 Skill，跳过 LLM 决策]
{"ticker": "600519", ...}
```

---

## Skill 模板（复制即用）

`examples/skills/` 目录有 5 个完整模板：

- `web_clip.yaml` —— 抓网页保存 markdown
- `image_gen.yaml` —— 调 DALL-E 生成配图
- `pdf_summary.yaml` —— PDF 摘要
- `lark_send.yaml` —— 发飞书
- `cron_helper.yaml` —— 给 cron 配置加任务

---

## 团队共享 Skill

```bash
# 公司内网放 Git 仓库
git clone git@gitlab.internal:devops/hermes-skills.git \
  ~/.u-hermes/data/skills

# 升级
cd ~/.u-hermes/data/skills && git pull
```

新成员入职跑这条命令，就有了团队的所有自定义 Skill。

---

## 安全：Skill 是危险的

⚠️ **Skill 可以执行任意代码**。从陌生地方下载 Skill 等于给陌生人 root 权限。

**checklist**：

- ✅ 只用自己 / 信任团队的 Skill
- ✅ Skill 文件加 600 权限：`chmod 600 ~/.u-hermes/data/skills/*.yaml`
- ✅ 危险命令（`rm -rf`、`curl | bash`）写白名单或拒绝
- ✅ 第三方 Skill 先在 Docker 容器里跑通再用

---

## 进阶：动态 Skill（self-learning）

hermes v0.11.0 实验性支持"hermes 自己写 Skill"：

```
> 我经常需要把 markdown 转 PDF。能不能你自动学会？

[hermes 内部决策]
[hermes 调用 skill_create 工具]
[生成 ~/.u-hermes/data/skills/md_to_pdf.yaml]
[用 pandoc 实现]

我已经为你写好 md_to_pdf Skill。下次说"转 PDF"我会自动用它。

[7 天后]
> 把 ~/notes/2026-04.md 转 PDF

[hermes 直接调 md_to_pdf，无需重新决策]
```

这是 hermes 区别于其他 Agent 的核心 —— **Self-Learning Skills**。

---

**[← 03 核心功能目录](./)** · **[03-2 Memory →](./02-memory-and-context.md)**
