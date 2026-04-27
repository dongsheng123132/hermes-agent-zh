# 02-4 云端部署（VPS / 阿里云 ECS / DigitalOcean）

> 这一章讲：在公网 VPS 上跑 hermes，让你出门在外也能用。
>
> 适合：有自己服务器、想做"私人 7×24 AI 助手"的用户。

---

## 服务器选型

| 厂商 | 配置 | 月费 | 优劣 |
|---|---|---|---|
| **阿里云 ECS（轻量）** | 2C2G 国内节点 | ¥99/年特价 | 国内访问快、备案麻烦 |
| **腾讯云 / 华为云** | 2C2G | 类似 | 同上 |
| **DigitalOcean** | 2C2G 新加坡 | $12/mo (~¥86) | 不用备案，国外稳 |
| **Vultr / Hetzner** | 2C2G | $5-12/mo | 同上 |
| **Oracle Always Free** | ARM 4C24G | 免费 | 配置烦但配置好后白嫖 |

**最低要求**：1C1G 也能跑，但建议 2C2G 让向量数据库流畅。

---

## 1. 装 hermes（用 Linux 章节流程）

跟 [02-1 Linux](./01-linux-native.md) 完全一样：

```bash
ssh root@your-server-ip
sudo apt update && sudo apt install -y python3 python3-venv pipx
pipx install hermes-agent
mkdir -p ~/.u-hermes/data
nano ~/.u-hermes/data/.env
# 填 API Key
```

---

## 2. 用 systemd 跑成服务

```bash
sudo nano /etc/systemd/system/hermes.service
```

内容（替换 `YOUR_USER`）：

```ini
[Unit]
Description=hermes-agent gateway
After=network.target

[Service]
Type=simple
User=YOUR_USER
EnvironmentFile=/home/YOUR_USER/.u-hermes/data/.env
Environment="HERMES_HOME=/home/YOUR_USER/.u-hermes/data"
ExecStart=/home/YOUR_USER/.local/bin/hermes gateway run
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
sudo systemctl status hermes  # 看是否绿色 active (running)
```

---

## 3. 配置 nginx 反向代理 + HTTPS

### 3.1 装 nginx + certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.2 域名解析

把你的域名（如 `hermes.example.com`）A 记录指向服务器 IP。

### 3.3 写 nginx 配置

`/etc/nginx/sites-available/hermes`：

```nginx
server {
    listen 80;
    server_name hermes.example.com;

    # ⚠️ 鉴权：不加这一段，全网都能用你的 API Key
    auth_basic "hermes restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;

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

### 3.4 创建 HTTP Basic Auth 密码

```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd youruser
# 提示输入密码
```

### 3.5 启用 + HTTPS

```bash
sudo ln -s /etc/nginx/sites-available/hermes /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 自动配 HTTPS
sudo certbot --nginx -d hermes.example.com
```

certbot 会自动改 nginx 配置加上 SSL 段，并开 80→443 跳转。

---

## 4. 验证

浏览器打开 `https://hermes.example.com`，应该弹 HTTP Basic Auth 弹窗，输入用户名密码后看到 hermes 响应。

API 调用：

```bash
curl -u youruser:yourpass https://hermes.example.com/health
```

---

## 5. 安全加固

### 5.1 防火墙

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
# 注意：8642 不直接对外暴露，nginx 反代
```

### 5.2 fail2ban 防爆破

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### 5.3 限速

nginx 配置里加：

```nginx
limit_req_zone $binary_remote_addr zone=hermes_limit:10m rate=10r/s;

server {
    # ...
    location / {
        limit_req zone=hermes_limit burst=20;
        # ... proxy_pass
    }
}
```

防止有人滥用你的 API 烧 token。

---

## 6. 数据备份

hermes 数据全在 `~/.u-hermes/data/`：

```bash
# 每周备份到 S3 / 阿里云 OSS / 自己的 NAS
tar czf hermes-backup-$(date +%Y%m%d).tar.gz ~/.u-hermes/data/
rclone copy hermes-backup-*.tar.gz remote:hermes-backups/
```

---

## 7. 常见坑

### certbot 失败 "Failed authorization"

域名 DNS 没生效。等 5 分钟再试。或先 `dig hermes.example.com` 确认 A 记录正确。

### nginx 502

```bash
sudo systemctl status hermes  # 看 hermes 是否在跑
sudo journalctl -u hermes --tail 50  # 看 hermes 日志
```

最常见：API Key 没配 → hermes 启动失败。

### CPU 占用 100%

通常是某个 Skill / Cron 死循环。先停服务定位：

```bash
sudo systemctl stop hermes
tail -100 ~/.u-hermes/data/logs/agent.log
```

---

## 进阶：Docker 部署

如果你更熟 Docker：

```dockerfile
FROM python:3.12-slim
RUN pip install hermes-agent
WORKDIR /data
ENV HERMES_HOME=/data
EXPOSE 8642
CMD ["hermes", "gateway", "run"]
```

```bash
docker build -t hermes:0.11.0 .
docker run -d --name hermes \
  -v $HOME/.u-hermes/data:/data \
  -p 127.0.0.1:8642:8642 \
  --env-file ~/.u-hermes/data/.env \
  hermes:0.11.0
```

然后用同样的 nginx 反代到 `127.0.0.1:8642`。

---

**完成 02-installation** → [03-core-features/](../03-core-features/) 进入核心功能学习
