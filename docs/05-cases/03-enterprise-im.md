# 05-3 企业 IM 接入（飞书 / 钉钉 / 企微 / Slack）

> 这一章讲：让 hermes 跑在你的企业 IM 群里，团队随时 @ 它干活。
>
> 对标《零基础玩转 OpenClaw》第三部"企业 IM 接入"。

---

## 场景

```
你的飞书群：
[小王] @hermes 帮我查上周后端的 deploy 失败次数
[hermes] 查询了 GitHub Actions，上周共 23 次构建，2 次失败：
         - 周二 14:30: 数据库迁移脚本超时
         - 周四 09:15: 单元测试失败（commit a3b2c1）
         详情：[GitHub link]
[小张] @hermes 起草今天的周会议程
[hermes] [生成议程草稿]
```

---

## 通道选型

| IM | 难度 | 推荐场景 |
|---|---|---|
| **飞书** | ⭐⭐ | 中小创业团队、字节系 |
| **钉钉** | ⭐⭐ | 大型企业、阿里系 |
| **企业微信** | ⭐⭐⭐ | 国企、传统行业 |
| **Slack** | ⭐ | 跨国团队、技术公司 |
| **Telegram** | ⭐ | 个人 / 极客团队 |
| **Discord** | ⭐ | 社区 / 游戏团队 |

> 💡 hermes 的 multi-channel 接入比 OpenClaw 弱（OpenClaw 是这方面强项）。如果你**主要诉求**就是 IM 机器人，建议用 [OpenClaw](https://github.com/openclaw/openclaw)。本章讲"hermes 怎么接 IM"，但定位是"编程 Agent + IM 入口"，不是 IM 机器人。

---

## 1. 飞书接入（最详细）

### 1.1 创建飞书应用

1. 打开 [https://open.feishu.cn/app](https://open.feishu.cn/app)
2. "创建企业自建应用"
3. 记下 `App ID` 和 `App Secret`

### 1.2 给应用权限

需要的权限：
- ✅ 接收群消息：`im:message.group_msg:readonly`
- ✅ 发送消息：`im:message:send_as_bot`
- ✅ 获取群信息：`im:chat:readonly`

### 1.3 配 hermes Skill

```yaml
# ~/.u-hermes/data/skills/lark_send.yaml
name: lark_send
description: "向飞书群发消息"
parameters:
  - name: chat_id
    type: string
  - name: message
    type: string
script: |
  #!/usr/bin/env bash
  TOKEN=$(curl -s "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
    -H "Content-Type: application/json" \
    -d "{\"app_id\":\"$LARK_APP_ID\",\"app_secret\":\"$LARK_APP_SECRET\"}" \
    | jq -r '.tenant_access_token')

  curl "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"receive_id\":\"$1\",\"msg_type\":\"text\",\"content\":\"{\\\"text\\\":\\\"$2\\\"}\"}"
```

### 1.4 配置事件订阅

飞书后台 → "事件订阅" → 配置 webhook URL：`https://hermes.example.com/webhook/lark`

hermes 监听这个 URL：

```yaml
# ~/.u-hermes/data/webhooks.yaml
webhooks:
  /webhook/lark:
    handler: lark_message_handler
    auth: lark_signature
```

### 1.5 消息处理 Handler

```python
# ~/.u-hermes/data/handlers/lark_message_handler.py
def handle(payload):
    if payload['type'] == 'event_callback':
        event = payload['event']
        if event['type'] == 'im.message.receive_v1':
            msg = event['message']
            # 是否 @hermes
            mentions = msg.get('mentions', [])
            if any('hermes' in m['key'] for m in mentions):
                # 触发 hermes 对话
                hermes_chat(
                    text=msg['content'],
                    chat_id=msg['chat_id'],
                    callback=lark_send
                )
```

### 1.6 测试

在飞书群里 `@hermes 你好`，hermes 回复。

---

## 2. 钉钉接入

### 2.1 创建机器人

1. 钉钉群 → 群设置 → 智能群助手 → 添加机器人 → 自定义机器人
2. 安全设置：选 "加签"（最安全）
3. 记下 webhook URL 和 secret

### 2.2 配 Skill

```yaml
# ~/.u-hermes/data/skills/dingtalk_send.yaml
name: dingtalk_send
script: |
  #!/usr/bin/env python3
  import time, hmac, hashlib, base64, urllib.parse, requests, sys, os, json

  webhook = os.environ['DINGTALK_WEBHOOK']
  secret = os.environ['DINGTALK_SECRET']
  msg = sys.argv[1]

  ts = str(round(time.time() * 1000))
  sign_str = f'{ts}\n{secret}'
  sign = base64.b64encode(hmac.new(secret.encode(), sign_str.encode(), hashlib.sha256).digest())
  sign = urllib.parse.quote_plus(sign)

  url = f'{webhook}&timestamp={ts}&sign={sign}'
  requests.post(url, json={"msgtype":"text","text":{"content":msg}})
```

### 2.3 接收消息（outbound webhook）

钉钉机器人也可以接收 @ 它的消息：

```
钉钉群 → 机器人设置 → 消息推送地址：https://hermes.example.com/webhook/dingtalk
```

类似飞书的处理，hermes 监听该 URL，解析 @ 触发。

---

## 3. 企业微信

### 3.1 创建应用

1. 企业微信管理后台 → 应用管理 → 创建应用
2. 拿 `corpid`、`corpsecret`、`agentid`

### 3.2 配 Skill

```yaml
# ~/.u-hermes/data/skills/wecom_send.yaml
name: wecom_send
script: |
  #!/usr/bin/env bash
  TOKEN=$(curl -s "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=$WECOM_CORPID&corpsecret=$WECOM_SECRET" | jq -r '.access_token')

  curl "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=$TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"touser\":\"@all\",\"msgtype\":\"text\",\"agentid\":$WECOM_AGENTID,\"text\":{\"content\":\"$1\"}}"
```

### 3.3 接收：自建应用 callback URL

需要：备案的域名 + HTTPS + 服务器（详见 [02-4 云端部署](../02-installation/04-cloud-server.md)）。

---

## 4. Slack（最简单）

### 4.1 创建 App

1. [https://api.slack.com/apps](https://api.slack.com/apps) → Create New App
2. From scratch → 装到你的 workspace
3. 启用 "Bot Token Scopes": `chat:write`, `app_mentions:read`
4. Install to Workspace → 拿 Bot Token (`xoxb-...`)

### 4.2 配 Skill

```yaml
# ~/.u-hermes/data/skills/slack_send.yaml
name: slack_send
script: |
  curl -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"$1\",\"text\":\"$2\"}"
```

### 4.3 接收消息

启用 "Event Subscriptions" → Request URL: `https://hermes.example.com/webhook/slack`

监听 `app_mention` 事件即可。

---

## 5. Telegram（个人 / 极客团队）

### 5.1 创建 Bot

1. Telegram 找 `@BotFather`
2. `/newbot` → 起名 → 拿 token

### 5.2 配 Skill（极简）

```yaml
# ~/.u-hermes/data/skills/telegram_send.yaml
name: telegram_send
script: |
  curl "https://api.telegram.org/bot$TG_TOKEN/sendMessage" \
    -d "chat_id=$1" -d "text=$2"
```

### 5.3 接收消息（webhook 或 polling）

**Webhook**（需要 HTTPS）：

```bash
curl "https://api.telegram.org/bot$TG_TOKEN/setWebhook?url=https://hermes.example.com/webhook/tg"
```

**Polling**（简单，不需要 HTTPS）：

```python
# ~/.u-hermes/scripts/telegram_polling.py
import requests, time, os
token = os.environ['TG_TOKEN']
offset = 0
while True:
    r = requests.get(f'https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=30')
    for update in r.json()['result']:
        offset = update['update_id'] + 1
        # 触发 hermes 对话...
    time.sleep(1)
```

---

## 6. 多通道统一架构

```
┌────────────────────────────────────────────┐
│ 飞书 / 钉钉 / 企微 / Slack / Telegram        │
│           ↓ webhook                         │
│   hermes 统一 webhook handler               │
│           ↓ 标准化消息格式                   │
│   hermes core (chat / skills / cron)        │
│           ↓ 调用 *_send Skill 回写           │
│   原 IM 通道                                 │
└────────────────────────────────────────────┘
```

### 标准化消息格式

```yaml
# 所有 IM 接入后转成统一格式
{
  "channel": "lark",
  "chat_id": "xxx",
  "user_id": "yyy",
  "user_name": "张三",
  "text": "@hermes 帮我查 PR",
  "timestamp": 1714128000
}
```

---

## 安全清单

- ✅ webhook URL **必须**配签名验证（每个 IM 都有不同方法）
- ✅ HTTPS（用 nginx + certbot 配，详见 [02-4](../02-installation/04-cloud-server.md)）
- ✅ 限速（防止 IM 被刷攻击你 hermes）
- ✅ token 只放服务端 .env，不要硬编码
- ✅ 所有 IM 操作记录到 `~/.u-hermes/data/logs/im.log`，定期审计

---

## 常见坑

### 飞书 webhook 一直 403

签名校验失败。检查：
- App Secret 是否正确
- 时间戳是否在 5 分钟内
- 加签字符串顺序

### 钉钉 markdown 显示乱码

钉钉的 markdown 比标准少几个语法，避免：
- 不支持 `<table>`
- 不支持 ~~ 删除线
- `\n` 必须用 `\n\n`

### 多个机器人互相 @ 死循环

加判断：`if 'is_bot' in user: skip`

---

**[← 05-2 办公自动化](./02-office-automation.md)** · **[05-4 团队部署 →](./04-team-deployment.md)**
