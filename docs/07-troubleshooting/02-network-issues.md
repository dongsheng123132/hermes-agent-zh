# 07-2 网络问题排错

> 这一章讲：代理、DNS、超时、SSL 错误等网络问题。
>
> 国内用户最常遇到的就是这一类。

---

## 国内场景速查

| 我用的 provider | 需要代理吗？ |
|---|---|
| DeepSeek / 通义 / Kimi / 智谱 / 文心 / MiniMax | ❌ 不需要，国内直连 |
| OpenAI / Anthropic / Google | ✅ 需要 |
| OpenRouter | ✅ 需要 |
| Ollama 本地 | ❌ 不需要（本地） |

---

## 问题 1：代理设了还是连不上海外

### 症状

```
$ hermes chat --provider openai
ConnectionError: timeout connecting to api.openai.com
```

但你已经设了 `HTTPS_PROXY=http://127.0.0.1:7890`。

### 排查

```bash
# 1. 代理软件真的开着吗？
curl -x http://127.0.0.1:7890 https://api.openai.com/v1/models -m 5
# 应该返回 401（key 没传）但不该 timeout

# 2. 浏览器里能上 api.openai.com 吗？
# 浏览器开同一个代理，访问 https://api.openai.com/v1/models
```

### 常见原因

#### A. 代理端口错了

不同代理软件默认端口：

- Clash / ClashX: `7890`
- V2Ray / Xray: `10809`
- Shadowsocks: 通常没 HTTP 端口（只有 SOCKS5）

确认你的代理软件实际监听端口：

```bash
# Linux / Mac
lsof -i -P | grep LISTEN | grep -E "789|108"
```

#### B. 没设 NO_PROXY

```env
# 必须有这两行，否则 hermes 内部本地调用也会走代理卡死
NO_PROXY=127.0.0.1,localhost,::1
no_proxy=127.0.0.1,localhost,::1
```

#### C. 代理是 SOCKS5 不是 HTTP

如果你的代理只支持 SOCKS5，hermes 默认不读取。两个办法：

**方案 A**：用 [privoxy](https://www.privoxy.org/) 转 SOCKS5 → HTTP

**方案 B**：套 polipo / mitmproxy 同样的事

**方案 C**：换支持 HTTP 模式的代理软件（Clash 默认双开 HTTP 和 SOCKS5）

---

## 问题 2：国内 provider 也 timeout

### 症状

```bash
$ hermes chat --provider deepseek
ConnectionError: timeout connecting to api.deepseek.com
```

### 原因

通常是**代理把国内地址也走代理了**（典型错误）。

### 解决

**临时关代理**：

```bash
unset HTTPS_PROXY HTTP_PROXY
hermes chat --provider deepseek
```

**永久解决：在代理软件里把国内地址加到直连规则**。Clash 配置示例：

```yaml
rules:
  - DOMAIN-SUFFIX,deepseek.com,DIRECT
  - DOMAIN-SUFFIX,aliyuncs.com,DIRECT
  - DOMAIN-SUFFIX,moonshot.cn,DIRECT
  - DOMAIN-SUFFIX,bigmodel.cn,DIRECT
  # ... 其他规则
```

---

## 问题 3：DNS 污染

### 症状

```
[Errno -2] Name or service not known
```

或

```
SSL: CERTIFICATE_VERIFY_FAILED
```

### 排查

```bash
# DNS 解析对不对？
nslookup api.openai.com
nslookup api.deepseek.com

# 应该返回正常 IP；如果返回 0.0.0.0 / 127.0.0.1 / 不存在 → DNS 污染
```

### 解决

**方案 A：换 DNS**

`/etc/resolv.conf`（Linux）：

```
nameserver 1.1.1.1
nameserver 8.8.8.8
nameserver 223.5.5.5    # 国内备份（阿里）
```

> Windows: 网络设置改 DNS 为 1.1.1.1。
>
> Mac: 系统偏好 → 网络 → 高级 → DNS。

**方案 B：用 DNS over HTTPS**

```bash
sudo apt install -y systemd-resolved
sudo systemctl enable --now systemd-resolved
```

编辑 `/etc/systemd/resolved.conf`：

```ini
[Resolve]
DNS=1.1.1.1#one.one.one.one 8.8.8.8#dns.google
DNSOverTLS=yes
FallbackDNS=223.5.5.5
```

```bash
sudo systemctl restart systemd-resolved
```

---

## 问题 4：SSL 证书错误

### 症状

```
ssl.SSLCertVerificationError: certificate verify failed
```

### 原因

通常是**系统时间错了**或**CA 证书过期**。

### 解决

```bash
# 1. 同步时间
sudo apt install -y ntp
sudo systemctl restart ntp

# 2. 更新 CA
sudo apt update
sudo apt install -y ca-certificates --reinstall
sudo update-ca-certificates --fresh
```

Mac：

```bash
brew install ca-certificates
```

---

## 问题 5：超时但偶尔成功

### 症状

时好时坏，重试几次能用。

### 原因

代理稳定性差。常见于免费机场、VPN 节点拥挤时。

### 解决

**方案 A：增大 hermes 超时**

`.env`：

```env
HERMES_REQUEST_TIMEOUT=120
```

**方案 B：换稳定代理**

推荐付费机场或自建 VPS（搬瓦工、Vultr）。

**方案 C：用 OpenRouter**

OpenRouter 的服务器在 Cloudflare 全球网络，国内通过日韩 / 美西节点访问通常比直连 OpenAI 稳。

---

## 问题 6：本地服务"被代理"

### 症状

```
Error connecting to 127.0.0.1:8642
```

但 hermes 明明在跑。

### 原因

`HTTPS_PROXY` 没排除本地。请求 `127.0.0.1:8642` 也走了代理。

### 解决

设 `NO_PROXY`（详见问题 1.B）。

---

## 问题 7：Cloudflare 1015 / 1020 错误

### 症状

```
Error 1015: You are being rate limited
Error 1020: Access denied
```

访问 OpenRouter / Anthropic 时常见。

### 原因

Cloudflare WAF 把你 IP 标记为可疑（同 IP 太多人共用 / 节点被 ban）。

### 解决

- 换代理节点
- 等几小时再试
- 用住宅 IP 代理而非数据中心 IP

---

## 问题 8：长会话突然断开

### 症状

聊到第 N 句突然：

```
ConnectionResetError: connection reset by peer
```

### 原因

- 代理超时（多数代理 keepalive 5 分钟）
- LLM 推理超过 5 分钟（o1 模型常见）

### 解决

`.env`：

```env
HERMES_REQUEST_TIMEOUT=600    # 10 分钟
HERMES_KEEPALIVE=30           # 每 30s 心跳
```

---

## 问题 9：HTTPS_PROXY 在脚本里没生效

### 症状

终端跑 hermes 没问题；写成 systemd 服务后报代理错。

### 原因

systemd 不继承 shell 环境变量。

### 解决

systemd unit 里显式写：

```ini
[Service]
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="NO_PROXY=127.0.0.1,localhost,::1"
```

---

## 调试模式

任何时候排查网络都先开调试：

```bash
hermes chat --provider openai --debug 2>&1 | tee debug.log
```

`debug.log` 里会有完整的 HTTP 请求记录。

---

**下一章**：[07-3 FAQ](./03-faq.md)
