# 04-2 国产 AI 服务商配置

> 这一章讲：6 家主流国产大模型（DeepSeek、通义千问、Kimi、智谱、MiniMax、百度文心）怎么注册、怎么填到 hermes 的 `.env` 里。
>
> 适合：希望直连、不用代理、付费方便（支持微信/支付宝）的国内用户。

---

## 怎么选

| Provider | 优势 | 推荐场景 | 单 token 成本 |
|---|---|---|---|
| **DeepSeek** | 性价比之王、推理能力强 | 90% 场景首选；编程任务表现好 | 极低（chat 仅 ¥0.001/1k） |
| **通义千问（阿里云）** | 长上下文、官方稳定 | 文档处理、长篇翻译 | 低 |
| **Kimi（Moonshot）** | 128k/200k 长上下文 | 整本书翻译、整库代码分析 | 中 |
| **智谱 GLM** | 中文理解好、多模态 | 中文写作、图文混合任务 | 中 |
| **MiniMax** | 角色扮演、对话流畅 | 客服 bot、聊天产品 | 中 |
| **百度文心（千帆）** | 大厂背书、企业接入 | 企业合规要求高的场景 | 中-高 |

**我的推荐顺序**（个人经验）：DeepSeek → Kimi（长文本） → 通义（备份）。其余按需。

---

## 1. DeepSeek（首推）

### 注册申请

1. 打开 [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. 手机号注册，送几块钱免费额度
3. 进入 "API keys" 页：[https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)
4. 点 "创建 API key"，复制（注意：**只显示一次**）

### 配 hermes

编辑 `~/.u-hermes/data/.env`：

```env
DEEPSEEK_API_KEY=sk-粘贴你的key
```

### 在 config.yaml 显式指定

如果你希望同时配多个 provider，编辑 `~/.u-hermes/data/config.yaml`：

```yaml
providers:
  deepseek:
    type: openai_compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models:
      - deepseek-chat
      - deepseek-reasoner

defaults:
  provider: deepseek
  model: deepseek-chat
```

### 模型选择

- `deepseek-chat` —— 通用对话，速度快，价格极便宜
- `deepseek-reasoner` —— 推理增强（类似 o1），适合数学/编程

---

## 2. 通义千问（阿里云 DashScope）

### 注册申请

1. 打开 [https://bailian.console.aliyun.com/?apiKey=1](https://bailian.console.aliyun.com/?apiKey=1)
2. 阿里云账号登录（没有就注册）
3. 进入 "API-KEY 管理"，点 "创建我的 API-KEY"
4. 复制 key

### 配 hermes

```env
DASHSCOPE_API_KEY=sk-粘贴你的key
```

### config.yaml

```yaml
providers:
  alibaba:
    type: openai_compatible
    base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
    api_key: ${DASHSCOPE_API_KEY}
    models:
      - qwen-plus
      - qwen-turbo
      - qwen-max
      - qwen3-72b-instruct
```

### 模型选择

- `qwen-turbo` —— 最便宜，日常够用
- `qwen-plus` —— 平衡（推荐默认）
- `qwen-max` —— 最强但贵
- `qwen3-72b-instruct` —— 开源 Qwen 系列

---

## 3. Kimi（月之暗面 Moonshot）

### 注册申请

1. 打开 [https://platform.moonshot.cn/](https://platform.moonshot.cn/)
2. 手机号注册
3. 进入 "API Key 管理"：[https://platform.moonshot.cn/console/api-keys](https://platform.moonshot.cn/console/api-keys)
4. 点 "新建"，复制

### 配 hermes

```env
MOONSHOT_API_KEY=sk-粘贴你的key
```

### config.yaml

```yaml
providers:
  moonshot:
    type: openai_compatible
    base_url: https://api.moonshot.cn/v1
    api_key: ${MOONSHOT_API_KEY}
    models:
      - moonshot-v1-8k
      - moonshot-v1-32k
      - moonshot-v1-128k
      - moonshot-v1-auto
```

### 模型选择

- `moonshot-v1-8k` / `32k` / `128k` —— 数字代表上下文窗口（token 数）
- `moonshot-v1-auto` —— 让 Kimi 根据输入自动选窗口（**推荐**，省钱）

**Kimi 的强项是长文本**：上传一整本 PDF、一整个代码库都不在话下。

---

## 4. 智谱 GLM

### 注册申请

1. 打开 [https://bigmodel.cn/](https://bigmodel.cn/)
2. 注册 → "API Keys"：[https://bigmodel.cn/usercenter/apikeys](https://bigmodel.cn/usercenter/apikeys)
3. 点 "添加新的 API Key"

### 配 hermes

```env
ZHIPUAI_API_KEY=粘贴你的key
```

### config.yaml

```yaml
providers:
  zhipu:
    type: openai_compatible
    base_url: https://open.bigmodel.cn/api/paas/v4
    api_key: ${ZHIPUAI_API_KEY}
    models:
      - glm-4-plus
      - glm-4
      - glm-4-flash
      - glm-4v
```

> 注意：智谱的 key 不是 `sk-` 开头，而是一串字符。直接复制粘贴即可。

---

## 5. MiniMax

### 注册申请

1. 打开 [https://platform.minimaxi.com/](https://platform.minimaxi.com/)
2. 注册 → "接口密钥"：[https://platform.minimaxi.com/user-center/basic-information/interface-key](https://platform.minimaxi.com/user-center/basic-information/interface-key)
3. 复制（**JWT 格式，会很长，以 `eyJ...` 开头**）

### 配 hermes

```env
MINIMAX_API_KEY=eyJ粘贴你的长长的JWT
```

### config.yaml

```yaml
providers:
  minimax:
    type: openai_compatible
    base_url: https://api.minimax.chat/v1
    api_key: ${MINIMAX_API_KEY}
    models:
      - MiniMax-Text-01
      - abab6.5s-chat
```

---

## 6. 百度文心（千帆）

### 注册申请

1. 打开 [https://cloud.baidu.com/](https://cloud.baidu.com/)
2. 注册 → 进入 "千帆大模型平台"
3. 创建 API Key：[https://console.bce.baidu.com/iam/#/iam/apikey/list](https://console.bce.baidu.com/iam/#/iam/apikey/list)
4. 复制（格式 `bce-v3/ALTAK-xxx`）

### 配 hermes

```env
QIANFAN_API_KEY=bce-v3/ALTAK-粘贴你的key
```

### config.yaml

```yaml
providers:
  baidu:
    type: openai_compatible
    base_url: https://qianfan.baidubce.com/v2
    api_key: ${QIANFAN_API_KEY}
    models:
      - ernie-4.0-turbo-8k
      - ernie-speed-128k
      - ernie-lite-8k
```

---

## 同时配多个 provider

完全支持。`config.yaml` 同时写多个 `providers:` 即可：

```yaml
providers:
  deepseek:    # ...
  alibaba:     # ...
  moonshot:    # ...

defaults:
  provider: deepseek
  model: deepseek-chat
```

切换时在 `hermes chat` 里输入：

```
/provider moonshot
/model moonshot-v1-128k
```

或在 Web UI 上点切换。

---

## 验证配置

跑一句话测试：

```bash
~/.u-hermes/venv/bin/hermes chat --provider deepseek --once "用一句话介绍你自己"
```

如果返回流式回答，配置成功。

---

## 充值 / 余额监控

每家平台都有自己的控制台。建议设置：

- **告警阈值**：余额低于 ¥10 时邮件告警（很多平台支持）
- **月度预算**：DeepSeek 免费额度 ¥5 通常够你跑一周；Kimi 长文本注意计费

---

## 常见问题

### "401 Unauthorized" / "Invalid API Key"

- key 粘贴时是否带了首尾空格？打开 `.env` 检查
- key 是否填错位置？`DEEPSEEK_API_KEY` 不能填到 `OPENAI_API_KEY`

### "余额不足"

充值即可。所有平台都支持微信/支付宝。

### "模型不存在"

模型名打错了。参考本章每节"模型选择"列表。

### 想用 OpenAI/Anthropic 但国内访问不了

看下一章 [04-1 海外 Provider](./01-openai-anthropic.md)，需要配代理。

---

**下一章**：[04-3 Ollama 本地模型](./03-ollama-local.md)
