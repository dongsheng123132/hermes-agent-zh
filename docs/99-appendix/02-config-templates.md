# 附录 02 · 配置模板速查

> 这一节是常用配置文件的"复制即用"模板。详细说明请回到对应正文章节。

---

## .env 模板（最小可用）

文件位置：`~/.u-hermes/data/.env`

```env
# 选一行取消注释填入你的 key
DEEPSEEK_API_KEY=sk-xxx

# 必须保留（防止 hermes 把本地请求走代理）
NO_PROXY=127.0.0.1,localhost,::1
no_proxy=127.0.0.1,localhost,::1
```

完整版：[`examples/configs/hermes.env.example`](https://github.com/dongsheng123132/hermes-agent-zh/blob/main/examples/configs/hermes.env.example)

---

## config.yaml 模板（多 provider）

文件位置：`~/.u-hermes/data/config.yaml`

```yaml
providers:
  deepseek:
    type: openai_compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models: [deepseek-chat, deepseek-reasoner]

  alibaba:
    type: openai_compatible
    base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
    api_key: ${DASHSCOPE_API_KEY}
    models: [qwen-plus, qwen-turbo, qwen-max]

  ollama:
    type: openai_compatible
    base_url: http://127.0.0.1:11434/v1
    api_key: ollama
    models: [qwen2.5:7b, deepseek-r1:7b]

defaults:
  provider: deepseek
  model: deepseek-chat

gateway:
  host: 127.0.0.1
  port: 8642

web_ui:
  host: 127.0.0.1
  port: 8648
```

完整版：[`examples/configs/hermes.config.yaml.example`](https://github.com/dongsheng123132/hermes-agent-zh/blob/main/examples/configs/hermes.config.yaml.example)

---

## systemd 服务（开机自启）

文件位置：`/etc/systemd/system/hermes.service`

```ini
[Unit]
Description=hermes-agent gateway
After=network.target

[Service]
Type=simple
User=YOUR_USER_NAME
WorkingDirectory=/home/YOUR_USER_NAME/.u-hermes
EnvironmentFile=/home/YOUR_USER_NAME/.u-hermes/data/.env
ExecStart=/home/YOUR_USER_NAME/.u-hermes/venv/bin/hermes gateway run
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable hermes
sudo systemctl start hermes
sudo systemctl status hermes
```

---

## nginx 反向代理（公网访问）

文件位置：`/etc/nginx/sites-available/hermes`

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8642;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 300s;
    }
}
```

启用：

```bash
sudo ln -s /etc/nginx/sites-available/hermes /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

⚠️ 公网暴露 hermes 一定要加**鉴权**（HTTP Basic Auth 或 API Key 校验），否则任何人都能用你的 API Key 跑 LLM。详见 [02-installation/04-cloud-server](../02-installation/04-cloud-server.md)。

---

## Ollama 启动（开机自启）

```bash
# 安装
curl -fsSL https://ollama.com/install.sh | sh

# 装好就自动是 systemd 服务
sudo systemctl status ollama

# 拉模型
ollama pull qwen2.5:7b
ollama pull deepseek-r1:7b
```

hermes 接 Ollama 见 [04-providers/03-ollama-local](../04-providers/03-ollama-local.md)。

---

## 自定义 Skill 模板

文件位置：`~/.u-hermes/data/skills/my_skill.yaml`

```yaml
name: my_skill
description: "用一句话描述这个 Skill 干什么（hermes 决策时会读这一句）"
parameters:
  - name: input_text
    description: "输入参数说明"
    type: string
    required: true
script: |
  #!/usr/bin/env bash
  # 在这里写你的逻辑，可以用 bash / python / node
  echo "你输入的是: $1"
```

更多 Skill 写法：[03-core-features/01-skills-system](../03-core-features/01-skills-system.md)。

---

## Cron 定时任务模板

文件位置：`~/.u-hermes/data/crons.yaml`

```yaml
crons:
  - name: "每日早报"
    schedule: "0 8 * * *"   # 每天早上 8 点
    prompt: "总结今天的科技新闻并发送到我的飞书"
    provider: deepseek

  - name: "每周代码扫描"
    schedule: "0 9 * * 1"   # 每周一早上 9 点
    prompt: "扫描 ~/projects 下所有 git 仓库，整理一份本周新增 TODO 的清单"
    provider: deepseek
```

更多见 [03-core-features/04-cron-and-scheduling](../03-core-features/04-cron-and-scheduling.md)。

---

**返回**：[附录目录](./)
