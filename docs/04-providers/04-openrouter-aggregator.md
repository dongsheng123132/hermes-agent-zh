# 04-4 OpenRouter 聚合服务（一个 Key 接 300+ 模型）

> 这一章讲：用 [OpenRouter](https://openrouter.ai) 一个 API Key 接遍 300+ 模型，省去注册一堆账号的烦恼。
>
> 适合：经常切换模型试效果、不想为每家平台都开账号的用户。

---

## OpenRouter 是什么

[OpenRouter](https://openrouter.ai) 是一个**LLM 聚合服务**：

- 一个账号、一个 API Key、一种统一接口
- 接 OpenAI、Anthropic、Google、DeepSeek、Mistral、Meta、Cohere、Perplexity 等 300+ 模型
- 后台用美元计费（你充值美元，按 token 用量扣）
- **支持加密货币付款**，国内用户可以买 USDT 充值

---

## 为什么用 OpenRouter

✅ **省事**：一个 key 全家桶
✅ **比官方便宜**：很多模型 OpenRouter 给的价格比官方还低 10-20%（薄利多销策略）
✅ **新模型快**：上游 release 后通常 1-2 天就接入
✅ **A/B 测试方便**：一行代码改 model id 就换提供商
✅ **故障转移**：模型可以配 fallback 链（GPT-4o 挂了自动换 Claude）

❌ **不是省钱方案**：和直连官方差不多，胜在便利性
❌ **国内访问需代理**：服务器在美国

---

## 1. 注册

1. [https://openrouter.ai/](https://openrouter.ai/) 用 Google 账号登录
2. 充值（信用卡 / Stripe / 加密货币 USDT）—— 最低 $5
3. 创建 API Key：[https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)

---

## 2. 配 hermes

`.env`：

```env
OPENROUTER_API_KEY=sk-or-v1-xxx你的key
HTTPS_PROXY=http://127.0.0.1:7890
HTTP_PROXY=http://127.0.0.1:7890
NO_PROXY=127.0.0.1,localhost,::1
```

`config.yaml`：

```yaml
providers:
  openrouter:
    type: openai_compatible
    base_url: https://openrouter.ai/api/v1
    api_key: ${OPENROUTER_API_KEY}
    models:
      - openai/gpt-4o
      - openai/gpt-4o-mini
      - anthropic/claude-sonnet-4-5
      - anthropic/claude-opus-4-5
      - google/gemini-2.0-pro
      - deepseek/deepseek-chat
      - meta-llama/llama-3.3-70b-instruct
      - mistralai/mistral-large
```

> 模型 ID 格式：`厂商/模型名`，与 OpenAI 直连不同（OpenAI 是 `gpt-4o`，OpenRouter 是 `openai/gpt-4o`）。

---

## 3. 测试

```bash
hermes chat --provider openrouter --model openai/gpt-4o --once "你好"
hermes chat --provider openrouter --model anthropic/claude-sonnet-4-5 --once "你好"
hermes chat --provider openrouter --model deepseek/deepseek-chat --once "你好"
```

效果应该和直连官方一致。

---

## 模型推荐（OpenRouter 上的）

| 任务 | 模型 ID | 单价 |
|---|---|---|
| 日常便宜 | `openai/gpt-4o-mini` | $0.15/M tokens |
| 通用最强 | `openai/gpt-4o` 或 `anthropic/claude-sonnet-4-5` | $2.5-3/M |
| 编程 | `anthropic/claude-sonnet-4-5` | $3/M |
| 推理 | `openai/o1-mini` | $1.1/M |
| 长上下文 | `google/gemini-2.0-pro` | $1.25/M |
| 中文强 | `deepseek/deepseek-chat` | $0.27/M |
| 开源最强 | `meta-llama/llama-3.3-70b-instruct` | $0.59/M |
| 免费试用 | `meta-llama/llama-3.3-70b-instruct:free` | $0 |

> 标 `:free` 后缀的有免费额度（每分钟限速）。

---

## 故障转移配置

OpenRouter 支持"主模型挂了换备用"：

`config.yaml` 里加：

```yaml
providers:
  openrouter:
    # ... 同上
    extra_headers:
      HTTP-Referer: https://hermes-agent-zh.local
      X-Title: hermes-zh-tutorial

# hermes 层的 fallback（伪 yaml，看 hermes 实际语法）
defaults:
  provider: openrouter
  model: anthropic/claude-sonnet-4-5
  fallbacks:
    - anthropic/claude-haiku-4-5
    - openai/gpt-4o
```

---

## 余额监控

OpenRouter 有用量仪表盘：[https://openrouter.ai/activity](https://openrouter.ai/activity)

每次请求的成本能看到，excel 也能导出。建议每月初检查一次。

---

## 加密货币充值（国内用户福音）

1. 进入 [https://openrouter.ai/credits](https://openrouter.ai/credits)
2. 选 "Cryptocurrency"
3. 选 USDT（TRC20 / ERC20 / BEP20 都行）
4. 钱包转账到指定地址
5. 一般 5-10 分钟到账

国内用户可以从币安/Okex 等买 USDT，再转过来。

---

## 国内中转 API（OpenRouter 替代品）

如果你连 OpenRouter 都连不上（代理不稳），中文社区有些"中转 API"服务：

- [API2D](https://api2d.com)
- [GPTGod](https://gptgod.com)
- 其他（搜 "ChatGPT 中转 API"）

它们通常：
- ✅ 国内直连，无需代理
- ✅ 支持人民币、微信支付
- ❌ 价格略高（加价 20-50%）
- ❌ 可能数据透明度差，**敏感数据慎用**

接入方法和 OpenRouter 类似（OpenAI 兼容协议），改 base_url 即可。

---

## 常见坑

### "Insufficient credits"

充值。OpenRouter 不预扣，调用前余额必须 > 0。

### 模型 ID 写错

OpenRouter 模型 ID 严格区分。`gpt-4o` 不行，必须 `openai/gpt-4o`。完整列表：[https://openrouter.ai/models](https://openrouter.ai/models)。

### 国内连不上

OpenRouter 服务器在 Cloudflare，代理质量差时会断。建议代理软件设 "智能分流"，让 `openrouter.ai` 走美国节点。

---

**完成 04-providers** → [05-cases/](../05-cases/) 看实战案例
