# 04-1 OpenAI / Anthropic / Google（海外 Provider）

> 这一章讲：OpenAI GPT、Anthropic Claude、Google Gemini 这三家海外大模型怎么配到 hermes。需要代理。
>
> 适合：能用代理的用户、追求最强模型的人。

---

## 怎么选

| Provider | 优势 | 推荐场景 | 价格 |
|---|---|---|---|
| **OpenAI GPT** | 生态最成熟、工具调用最稳 | 通用首选 | 中-高 |
| **Anthropic Claude** | 编程/长文本/推理强 | 编程任务、复杂推理 | 中-高 |
| **Google Gemini** | 多模态强、上下文 1M+ | 图文混合、超长文档 | 中（部分免费额度） |

**编程优先**：Claude > GPT > Gemini（社区共识）
**通用优先**：GPT > Claude > Gemini

---

## 1. OpenAI

### 注册

1. [https://platform.openai.com/](https://platform.openai.com/) 注册（需海外手机号）
2. 充值 $5 起（信用卡或 [虎皮椒](https://www.huipijiao.com/) 等代充）
3. 创建 API Key：[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 配 .env

```env
OPENAI_API_KEY=sk-proj-xxx你的key
HTTPS_PROXY=http://127.0.0.1:7890
HTTP_PROXY=http://127.0.0.1:7890
NO_PROXY=127.0.0.1,localhost,::1
```

### config.yaml

```yaml
providers:
  openai:
    type: openai_compatible
    base_url: https://api.openai.com/v1
    api_key: ${OPENAI_API_KEY}
    models:
      - gpt-4o
      - gpt-4o-mini
      - gpt-4-turbo
      - o1-preview
      - o1-mini
```

### 模型选择

- `gpt-4o-mini` — 性价比，日常够用
- `gpt-4o` — 通用最强（推荐默认）
- `o1-preview` / `o1-mini` — 推理模型，慢但深思熟虑

---

## 2. Anthropic Claude

### 注册

1. [https://console.anthropic.com/](https://console.anthropic.com/) 注册
2. 充值（信用卡）
3. 创建 API Key：[https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

### 配 .env

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx你的key
HTTPS_PROXY=http://127.0.0.1:7890
HTTP_PROXY=http://127.0.0.1:7890
NO_PROXY=127.0.0.1,localhost,::1
```

### config.yaml

```yaml
providers:
  anthropic:
    type: anthropic
    base_url: https://api.anthropic.com/v1
    api_key: ${ANTHROPIC_API_KEY}
    models:
      - claude-sonnet-4-5
      - claude-opus-4-5
      - claude-haiku-4-5
```

> 注意 `type: anthropic`（不是 `openai_compatible`）。Anthropic 用自家 Messages API。

### 模型选择

- `claude-haiku-4-5` — 快、便宜，简单任务
- `claude-sonnet-4-5` — 平衡（推荐默认，编程/复杂任务首选）
- `claude-opus-4-5` — 最强但贵 5x

---

## 3. Google Gemini

### 注册

1. [https://aistudio.google.com/](https://aistudio.google.com/) Google 账号登录
2. 点 "Get API key"：[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
3. **免费额度**：每分钟 15 次（够个人用）

### 配 .env

```env
GOOGLE_API_KEY=AIza你的key
HTTPS_PROXY=http://127.0.0.1:7890
HTTP_PROXY=http://127.0.0.1:7890
NO_PROXY=127.0.0.1,localhost,::1
```

### config.yaml

```yaml
providers:
  google:
    type: openai_compatible
    base_url: https://generativelanguage.googleapis.com/v1beta/openai
    api_key: ${GOOGLE_API_KEY}
    models:
      - gemini-2.0-flash
      - gemini-2.0-pro
      - gemini-1.5-pro
```

> Google 提供"OpenAI 兼容"端点（注意 base_url 末尾的 `/openai`）。也可以走原生 Gemini API，但 hermes 用兼容层更省事。

### 模型选择

- `gemini-2.0-flash` — 免费且非常快
- `gemini-2.0-pro` — 上下文 2M token（处理超长文档）
- `gemini-1.5-pro` — 旧版稳定

---

## 关于代理

hermes 默认会读环境变量 `HTTPS_PROXY` / `HTTP_PROXY`。如果你的代理软件是：

- **Clash / ClashX** — 默认 `http://127.0.0.1:7890`
- **V2Ray / Xray** — 默认 `http://127.0.0.1:10809`
- **Shadowsocks** — 需要套 `privoxy` 或类似 HTTP→SOCKS 转换器

**关键：必须设 `NO_PROXY=127.0.0.1,localhost,::1`**，否则 hermes 内部组件之间的本地调用也会走代理，会卡死。

---

## 测试

```bash
# 测 OpenAI
hermes chat --provider openai --once "用一句话介绍你自己"

# 测 Claude
hermes chat --provider anthropic --once "用一句话介绍你自己"

# 测 Gemini
hermes chat --provider google --once "用一句话介绍你自己"
```

---

## 常见坑

### "connection timeout"

代理没生效或 NO_PROXY 没设。先确认能上：

```bash
curl -x http://127.0.0.1:7890 https://api.openai.com/v1/models
```

### "Insufficient quota" / "余额不足"

充值。所有海外都需要信用卡。

### Claude 报 `Tool calling format error`

Anthropic 工具调用格式和 OpenAI 不同。确保你的 `provider type` 设了 `anthropic`，不是 `openai_compatible`。

### 想要 Claude 但又不能直接付美金

国内有"中转 API"服务（比如 [OpenRouter](https://openrouter.ai/)），帮你用人民币付钱，看下一章 [04-4 OpenRouter](./04-openrouter-aggregator.md)。

---

**下一章**：[04-3 Ollama 本地模型](./03-ollama-local.md)
