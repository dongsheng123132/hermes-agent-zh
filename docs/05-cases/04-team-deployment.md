# 05-4 团队私有化部署

> 这一章讲：把 hermes 部署到公司内网，让 3-50 人团队共享一个自托管的 AI Agent。

---

## 适合谁

- 创业公司技术团队（3-20 人）
- 中型企业某个部门
- 学校实验室 / 研究组
- 数据合规要求高的行业（金融、医疗、政企）

不适合：50+ 人大型企业（需要 SSO、审计、配额管理这些 hermes 还不内置）。

---

## 三种部署模式

| 模式 | 难度 | 适合 | 资源 |
|---|---|---|---|
| **A. 单机内网** | ⭐ | 3-10 人 | 1 台 4C8G 服务器 |
| **B. Docker Compose** | ⭐⭐ | 10-30 人 | 1-2 台 8C16G |
| **C. K8s 多副本** | ⭐⭐⭐ | 30-100 人 | 完整 K8s 集群 |

本章重点讲 A、B。C 简要带过。

---

## 模式 A：单机内网部署

### 1. 服务器准备

```
推荐配置：
  CPU: 4 核
  RAM: 8 GB
  磁盘: 100 GB SSD
  系统: Ubuntu 24.04 LTS
  网络: 内网 IP（如 10.0.0.10）
```

### 2. 装 hermes

跟 [02-1 Linux](../02-installation/01-linux-native.md) 一样。

### 3. 改成多用户模式

`~/.u-hermes/data/config.yaml`：

```yaml
gateway:
  host: 0.0.0.0     # 监听内网，不只 127.0.0.1
  port: 8642
  
  multi_user: true  # 启用多用户
  user_isolation: true  # 各用户 sessions / memory 隔离
  
  auth:
    type: bearer    # 简单 token 鉴权
    tokens_file: /etc/hermes/users.yaml
```

`/etc/hermes/users.yaml`：

```yaml
users:
  - id: alice
    token: "alice-secret-token-xxx"
    role: admin
  - id: bob
    token: "bob-secret-token-yyy"
    role: user
  - id: charlie
    token: "charlie-secret-token-zzz"
    role: user
    quota:
      monthly_tokens: 1000000   # 每月限 100 万 token
```

### 4. systemd 跑成服务

详见 [02-4 云端部署](../02-installation/04-cloud-server.md) 的 systemd 段。

### 5. 队员怎么用

```bash
# Alice 在自己电脑（内网）
HERMES_GATEWAY=http://10.0.0.10:8642 \
HERMES_TOKEN=alice-secret-token-xxx \
  hermes chat

# Bob
HERMES_GATEWAY=http://10.0.0.10:8642 \
HERMES_TOKEN=bob-secret-token-yyy \
  hermes chat
```

各自的 sessions / memory 独立。

### 6. 共享 vs 独立资源

| 资源 | 默认 | 可改 |
|---|---|---|
| API Key（OpenAI 等） | 共享（公司账号） | 每人独立（按需） |
| Skills | 共享（管理员维护） | 用户私有 Skill 也支持 |
| Memory | 隔离（每人独立） | — |
| Sessions | 隔离 | — |
| Cron | 隔离 | — |
| 日志 | 全局 | 管理员可查 |

---

## 模式 B：Docker Compose 部署

### docker-compose.yaml

```yaml
version: "3.9"

services:
  hermes:
    image: python:3.12-slim
    container_name: hermes-gateway
    restart: unless-stopped
    volumes:
      - hermes-data:/data
    environment:
      HERMES_HOME: /data
      HERMES_GATEWAY_PORT: 8642
      HERMES_MULTI_USER: "true"
    command: |
      bash -c "
        pip install hermes-agent &&
        hermes gateway run
      "
    ports:
      - "127.0.0.1:8642:8642"  # 通过 nginx 反代

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - hermes

  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    volumes:
      - ollama-data:/root/.ollama
    ports:
      - "127.0.0.1:11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

volumes:
  hermes-data:
  ollama-data:
```

### nginx.conf

```nginx
events {}
http {
  upstream hermes {
    server hermes:8642;
  }
  
  server {
    listen 443 ssl;
    server_name hermes.internal;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
      proxy_pass http://hermes;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
  }
}
```

### 启动

```bash
docker compose up -d
docker compose logs -f hermes
```

队员访问 `https://hermes.internal/`。

---

## 模式 C：K8s 多副本（简要）

```yaml
# k8s/hermes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hermes-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hermes
  template:
    metadata:
      labels:
        app: hermes
    spec:
      containers:
      - name: hermes
        image: your-registry/hermes:0.11.0
        env:
        - name: HERMES_HOME
          value: /data
        - name: HERMES_REDIS_URL
          value: redis://hermes-redis:6379
        volumeMounts:
        - name: shared-data
          mountPath: /data
      volumes:
      - name: shared-data
        persistentVolumeClaim:
          claimName: hermes-pvc
```

需要：
- Redis 做 sessions 状态共享
- PVC 做 Memory 持久化（多副本访问同一份）
- Service + Ingress 暴露
- HPA 按 CPU 自动扩缩

> ⚠️ hermes v0.11.0 对多副本支持还在实验阶段。生产建议先单副本。

---

## 团队管理：管理员视角

### 1. 监控

```bash
# 实时日志
tail -f ~/.u-hermes/data/logs/agent.log

# 用户用量统计
hermes admin usage --since=7d
# 输出:
# alice    24,500 tokens   $0.49
# bob      102,300 tokens  $2.05
# charlie  8,200 tokens    $0.16
```

### 2. 配额限制

`/etc/hermes/users.yaml` 的 `quota` 字段：

```yaml
- id: charlie
  quota:
    monthly_tokens: 1000000
    daily_tokens: 50000
    max_concurrent: 2
```

超额自动拒绝。

### 3. 共享 Skills 库

```
/etc/hermes/shared-skills/
├── company_doc_search.yaml    # 搜公司知识库
├── jira_query.yaml            # 查 Jira
├── deploy_status.yaml         # 看部署状态
├── pr_review.yaml             # 评审 PR
└── meeting_book.yaml          # 预订会议室
```

所有用户都能调，统一维护。

### 4. 审计日志

`/etc/hermes/audit.yaml`：

```yaml
audit:
  enabled: true
  log_path: /var/log/hermes/audit.log
  events:
    - tool_call         # 所有工具调用
    - skill_invoke      # 所有 Skill 调用
    - memory_save       # 记忆写入
    - api_call          # LLM API 调用（带 token 数）
```

定期查：

```bash
grep "rm -rf" /var/log/hermes/audit.log    # 危险命令调用记录
```

---

## 安全最佳实践

### 1. 网络

- ✅ hermes gateway **不暴露公网**（除非有 nginx + 鉴权 + WAF）
- ✅ HTTPS 内网（用 step-ca 自签 CA）
- ✅ 防火墙白名单：只允许办公 IP 访问

### 2. 凭证

- ✅ API Key 用 Vault / AWS Secrets Manager 管理
- ✅ 不要把 OpenAI key 给所有用户（共享公司账号）
- ✅ 用户 token 定期轮换（推荐月度）

### 3. 数据

- ✅ 公司敏感数据用 Ollama 本地模型，不传海外
- ✅ Memory 定期备份（`tar czf hermes-backup.tar.gz ~/.u-hermes/data/`）
- ✅ 用户离职：删除其 token + 归档其 sessions

### 4. 工具

- ✅ shell 工具加白名单：只允许特定目录
- ✅ git 工具禁止 push 到 main / master
- ✅ 禁用 `system` / `subprocess.Popen` 类高危工具

### 5. 合规

- ✅ 中国数据安全法：用户数据不出境 → 用国产 / 本地模型
- ✅ GDPR：用户能导出 / 删除自己的数据
- ✅ 行业合规（金融 / 医疗）：与法务对齐审计要求

---

## 成本估算

```
3 人小团队，每人每天 50 次对话，30 天：
  - DeepSeek: 3 × 50 × 30 × 平均 5k tokens × $0.27/M = $6/月
  - Claude Sonnet: 3 × 50 × 30 × 平均 3k tokens × $3/M = $40/月

服务器:
  - 阿里云 4C8G ECS：¥150/月
  - 域名 + HTTPS：¥0（免费）

总计: ¥200-500/月（10 人团队 ¥600-1500/月）
```

vs 给每个人买 Claude Pro 订阅 $20 × 3 = $60/月，**自托管能省 30-50%**，且数据隐私更好。

---

## 团队培训路径

### 第 1 周：基础

- 让所有人跟 [📅 7 天速成](../00-preface/04-7day-plan.md) 学
- 每天下班半小时分享心得
- 周五公开演示

### 第 2 周：定制

- 收集大家"我希望 hermes 能..."的需求
- 管理员开发对应 Skills
- 上线 + 文档化

### 第 3 周：优化

- 看 audit log 哪些任务用得最多
- 把高频任务封装成 Cron 自动跑
- 团队共享 Memory（公司知识库索引）

---

**[← 05-3 企业 IM](./03-enterprise-im.md)** · **[05-5 便携 USB →](./05-portable-usb.md)**
