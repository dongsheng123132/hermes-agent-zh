# 04-3 Ollama 本地模型

> 这一章讲：用 Ollama 在你自己电脑上跑大模型，0 token 费用、0 网络延迟、100% 数据隐私。
>
> 适合：处理敏感数据、家里有显卡、想离线也能用 hermes 的人。

---

## Ollama 是什么

[Ollama](https://ollama.com) 是个开源工具，让你**像装 npm 包一样装大模型**：

```bash
ollama pull qwen2.5:7b   # 下载 Qwen 7B 模型
ollama run qwen2.5:7b    # 进入对话
```

它会自动处理 GPU 加速、量化、API 封装。**hermes 通过 OpenAI 兼容协议接 Ollama**，配置极简单。

---

## 硬件要求

| 模型规模 | 内存（CPU 模式） | 显存（GPU 模式） | 速度感受 |
|---|---|---|---|
| 1-3B（如 `llama3.2:3b`） | 4 GB | 4 GB | 笔记本流畅 |
| 7-8B（如 `qwen2.5:7b`） | 8 GB | 8 GB | 流畅 |
| 14B（如 `qwen2.5:14b`） | 16 GB | 12 GB | 略慢 |
| 32B+ | 32 GB+ | 24 GB+ | 慢但能用 |
| 70B+ | 64 GB+ | 48 GB+（双卡） | 重度任务 |

**入门推荐**：`qwen2.5:7b`（中文好、7B 平衡）或 `deepseek-r1:7b`（推理增强）。

---

## 1. 装 Ollama

### Linux / WSL

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS

[官网下载](https://ollama.com/download/mac) `.dmg`，双击装。

或：

```bash
brew install ollama
```

### Windows

[官网下载](https://ollama.com/download/windows) `.exe`，双击装。

---

## 2. 启动服务

### Linux

ollama 装好就是 systemd 服务，自动启动：

```bash
sudo systemctl status ollama
```

监听 `127.0.0.1:11434`。

### macOS

桌面右上角会有 ollama 图标，点开运行。

### Windows

任务栏图标，自动后台跑。

---

## 3. 拉模型

```bash
ollama pull qwen2.5:7b
# 下载约 4-5 GB，国内一般 1-2 分钟（ollama 在国内有 CDN 节点）
```

其他推荐模型：

```bash
ollama pull deepseek-r1:7b     # 推理增强（DeepSeek 蒸馏的）
ollama pull qwen2.5:14b        # 14B 中文强
ollama pull llama3.2:3b        # 小而轻
ollama pull phi-4              # 微软小模型，逻辑好
```

查看本地已下载：

```bash
ollama list
```

删除：

```bash
ollama rm qwen2.5:7b
```

---

## 4. 配 hermes 接 Ollama

编辑 `~/.u-hermes/data/.env`：

```env
# 把 Ollama 当成 OpenAI 兼容服务
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://127.0.0.1:11434/v1

NO_PROXY=127.0.0.1,localhost,::1
no_proxy=127.0.0.1,localhost,::1
```

> ⚠️ Ollama 不需要真 API Key，填字符串 "ollama" 就行（hermes 要求字段非空）。

或在 `config.yaml` 显式配（推荐，可与其他 provider 并存）：

```yaml
providers:
  ollama:
    type: openai_compatible
    base_url: http://127.0.0.1:11434/v1
    api_key: ollama
    models:
      - qwen2.5:7b
      - deepseek-r1:7b

defaults:
  provider: ollama
  model: qwen2.5:7b
```

---

## 5. 测试

```bash
hermes chat --provider ollama --model qwen2.5:7b --once "用一句话介绍你自己"
```

第一次推理会慢（模型加载到 GPU/RAM），后续秒回。

---

## Ollama 的局限

❗ **本地小模型 ≠ 大模型云服务**。具体差距：

| 任务 | 7B 本地 | GPT-4o / Claude |
|---|---|---|
| 简单对话 | ✅ 够用 | ✅ |
| 工具调用准确率 | 60-70% | 95%+ |
| 复杂代码生成 | 一般 | 强 |
| 长文档分析 | 受上下文限制 | 强 |
| 多语言 | 中文强（Qwen） | 全语言强 |

**实战建议**：

- **隐私任务用 Ollama**：处理敏感日志、内部文档
- **生产任务用云模型**：编程助手、长流程 Agent
- **混合策略**：日常 hermes 用 DeepSeek API，敏感时切换到 Ollama

---

## 工具调用兼容性

7B 模型的工具调用准确率约 60-70%，会出现：

- "我应该调 shell 工具"（说是说，但没真的输出 tool_call JSON）
- 调用了但参数错了
- 重复调用同一个工具

**优化建议**：

1. 选支持 function calling 的模型：`qwen2.5:7b`、`llama3.2:3b` 都内训了 function calling
2. 在 prompt 里强调"必须用工具"
3. 简化任务粒度（不要让 7B 模型一次做 10 步规划）

---

## 显卡 vs CPU

### 看你有没有 NVIDIA GPU

```bash
# Linux
nvidia-smi
# 输出 GPU 信息 = 有
```

```powershell
# Windows
Get-WmiObject Win32_VideoController | Select-Object Name
```

ollama 自动检测并用 GPU。

### Mac M1/M2/M3

ollama 自动用 Metal Performance Shaders（Apple 的 GPU 加速），不用配置。

### 没显卡（纯 CPU）

也能跑，就是慢。7B 模型 CPU 推理大约每秒 5-10 token。

---

## 节省内存：量化

ollama 默认拉的是 **Q4_K_M 量化版本**（4-bit 量化，损失 < 1% 性能但内存减半）。

如果你想要更小：

```bash
ollama pull qwen2.5:7b-q3_K_M   # 3-bit，更小但精度降
```

或更精确：

```bash
ollama pull qwen2.5:7b-fp16     # 半精度，更准但 14 GB
```

---

## 常见坑

### "model 'xxx' not found"

```bash
ollama list   # 看本地有什么
ollama pull MISSING_MODEL_NAME
```

### CPU 100% 但很慢

7B 模型用纯 CPU 推理就这样，正常。考虑：
- 换更小模型（`llama3.2:3b`）
- 加显卡
- 用云 API

### 工具调用一直失败

试试 `qwen2.5:7b-instruct` 版本（明确支持 instruct/function calling），或换更大模型 `qwen2.5:14b`。

### 内存爆了

模型加载需要的内存约 = 模型文件大小 × 1.2。如果你 8 GB RAM 想跑 7B 模型很勉强。

---

**下一章**：[04-4 OpenRouter 聚合](./04-openrouter-aggregator.md)
