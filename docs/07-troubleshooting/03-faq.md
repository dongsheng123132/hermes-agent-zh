# 07-3 FAQ · 高频问题

> 30 个最高频问题。Ctrl+F 搜你的关键词。

---

## 安装

### Q1：装在哪？

`~/.u-hermes/`。可改：

```bash
HERMES_HOME=/path/to/wherever hermes ...
```

### Q2：占多少磁盘？

主体 ~1.5 GB（venv + 依赖）。加上 Ollama 一个 7B 模型 ~4 GB。

### Q3：能不能装多个版本？

可以，每个用独立 venv：

```bash
python3 -m venv ~/.u-hermes-v0.10
~/.u-hermes-v0.10/bin/pip install hermes-agent==0.10.0

python3 -m venv ~/.u-hermes-v0.11
~/.u-hermes-v0.11/bin/pip install hermes-agent==0.11.0
```

### Q4：升级会丢数据吗？

不会。`pip install --upgrade hermes-agent` 只更新代码，`~/.u-hermes/data/` 里的 sessions/memory/skills 都保留。

### Q5：完全卸载

```bash
rm -rf ~/.u-hermes/
pipx uninstall hermes-agent  # 如果用 pipx
```

---

## 配置

### Q6：.env 和 config.yaml 都配了，谁优先？

config.yaml 优先。但 config.yaml 里的 `${VAR}` 占位符会从 .env 读取。

### Q7：能不能多 provider 同时配？

可以。config.yaml 里 `providers:` 字典写多个。运行时 `/provider <name>` 切换。

### Q8：API Key 加密存储？

hermes 不内置加密。如果你担心，可以：

- 用系统 keyring（`pip install keyring`，但 hermes 还没原生支持）
- 用 SOPS / age 加密 .env，启动前临时解密
- 商业版（如 [U-Hermes 马盘](https://u-hermes.org)）有硬件指纹绑定的加密机制

### Q9：能不能多用户共享一台 hermes？

可以但要小心。每个用户单独 `HERMES_HOME=`，避免 sessions 串。或开多个 gateway 实例（不同端口）。

### Q10：how to set per-project context?

进项目目录后启动：

```bash
cd ~/projects/my-app
HERMES_HOME=$PWD/.hermes hermes chat
```

每个项目独立数据。

---

## 模型 / Provider

### Q11：DeepSeek 和 Kimi 哪个好？

- 通用对话：DeepSeek 性价比高（最便宜）
- 长文档：Kimi（128k/200k 窗口大）
- 编程：DeepSeek > Kimi
- 推理任务：DeepSeek-Reasoner 强（类 o1）

### Q12：本地模型够用吗？

7B 模型简单对话够，但工具调用准确率 60-70%（云模型 95%+）。日常用本地，复杂任务切云。

### Q13：能不能不用 API Key 跑？

可以，用 Ollama 本地模型，详见 [04-3 Ollama](../04-providers/03-ollama-local.md)。

### Q14：免费 Provider？

- Google Gemini Free（每分钟 15 次）
- Groq（极快但限速）
- OpenRouter 部分模型 `:free` 后缀

### Q15：能不能给企业用，要发票

各家都支持开发票（DeepSeek、阿里云、腾讯云）。OpenAI / Anthropic 不行。

---

## 工具调用

### Q16：hermes 调 shell 把我重要文件删了怎么办

⚠️ **永远不要在重要数据机器裸跑 hermes**。建议：

- 在虚拟机 / Docker 容器里跑
- 用 `--no-auto-confirm` 模式（每次工具调用都问你）
- 把项目放 git，定期 commit

### Q17：能限制 hermes 只动某个目录吗？

`config.yaml`：

```yaml
tools:
  shell:
    allowed_paths:
      - ~/projects
      - /tmp
    blocked_paths:
      - /etc
      - /usr
```

具体语法看 hermes-agent v0.11.0 的官方文档。

### Q18：自定义 Skill 怎么写？

放 `~/.u-hermes/data/skills/<name>.yaml`。详见 [03-core-features/01-skills-system](../03-core-features/01-skills-system.md)。

### Q19：MCP 是什么

Model Context Protocol，详见 [03-core-features/03-mcp-protocol](../03-core-features/03-mcp-protocol.md)。

### Q20：能不能调用我自己的 API？

可以，写 Skill 包一层 `curl` 即可。

---

## 性能

### Q21：第一次启动很慢

正常。hermes 第一次启动会下载内置 prompt 模板和 skill 索引。后续 < 5 秒。

### Q22：内存占用大

主要是 sessions + memory 向量库。大概 hermes 主进程 200-500 MB，加上 Python 解释器开销。

### Q23：能跑在树莓派上吗？

理论上可以（ARM64 支持）。但 LLM 调用还是需要外网 API（树莓派没法本地跑 7B 模型）。

---

## 数据 / 隐私

### Q24：我的对话上传到哪？

- 用 OpenAI/Claude/DeepSeek API → 上传到对应 provider（按其隐私政策）
- 用 Ollama → 完全本地，不上传任何数据
- hermes 本身不上传任何数据到第三方

### Q25：怎么导出历史会话

```bash
ls ~/.u-hermes/data/sessions/   # 每个文件一次会话（JSON）
```

复制走即可。

### Q26：如何删除 memory

```bash
rm -rf ~/.u-hermes/data/memory/
```

下次启动会重建空的。

### Q27：能合规用吗（公司数据）

- 用 Ollama 完全本地：✅
- 用国内云 provider（阿里、腾讯）：合规要求看公司
- 用 OpenAI：通常不合规（数据出境）
- 商业版 [U-Hermes](https://u-hermes.org) 有"安全沙箱"模式，更严格

---

## 报错

### Q28："provider not found"

config.yaml 里没定义这个 provider。或 typo 了。

### Q29："context length exceeded"

对话太长，超过模型上下文窗口。换长上下文模型（`moonshot-v1-128k`、`gemini-2.0-pro`）或 `/reset` 清会话。

### Q30："tool execution timeout"

某个 Skill 死循环或卡了。看 `~/.u-hermes/data/logs/agent.log` 找元凶。

---

## 升级 / 兼容性

### 教程是 v0.11.0 的，我装的更高版本能用吗

大部分章节兼容。breaking change 集中在：

- config.yaml 字段名
- Skill 接口
- MCP 协议版本

如果某章和你用的版本不一致，看仓库的 CHANGELOG.md 版本对应表（[GitHub](https://github.com/dongsheng123132/hermes-agent-zh/blob/main/CHANGELOG.md)）。

---

## 还有问题？

- 本仓库 Issues：[https://github.com/dongsheng123132/hermes-agent-zh/issues](https://github.com/dongsheng123132/hermes-agent-zh/issues)
- hermes 上游：[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent/issues)
- 邮件：`hefangsheng@gmail.com`

---

**返回**：[排错目录](./) · [主页](/)
