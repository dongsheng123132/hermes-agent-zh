# 附录 01 · CLI 命令速查

> hermes-agent v0.11.0 命令行速查表。Ctrl+F 搜你要的。

---

## 常用命令

```bash
# 启动 gateway（API 服务）
hermes gateway run

# 进入交互式对话
hermes chat

# 一次性查询（非交互）
hermes chat --once "你好"

# 指定 provider / model
hermes chat --provider deepseek --model deepseek-chat

# 调试模式（输出每次 LLM 调用细节）
hermes chat --debug

# 查看版本
hermes --version

# 查看帮助
hermes --help
hermes chat --help
```

---

## 会话内命令（`hermes chat` 里）

| 命令 | 作用 |
|---|---|
| `/exit` 或 Ctrl+D | 退出 |
| `/reset` | 清空当前会话 |
| `/history` | 显示历史会话列表 |
| `/resume <id>` | 恢复某个历史会话 |
| `/provider <name>` | 切换 provider |
| `/model <name>` | 切换 model |
| `/skills` | 列出可用 Skills |
| `/skill <name> <args>` | 直接调用 Skill |
| `/memory search <query>` | 搜索记忆 |
| `/cron list` | 显示定时任务 |
| `/help` | 显示所有命令 |

---

## 环境变量

| 变量 | 作用 | 默认 |
|---|---|---|
| `HERMES_HOME` | 数据目录 | `~/.u-hermes/data` |
| `HERMES_GATEWAY_PORT` | API 端口 | `8642` |
| `HERMES_WEBUI_PORT` | Web UI 端口 | `8648` |
| `HERMES_REQUEST_TIMEOUT` | API 超时（秒） | `60` |
| `HERMES_LOG_LEVEL` | 日志级别 | `INFO` |
| `HERMES_LOOP` | 事件循环（asyncio/uvloop） | `uvloop`（Linux/Mac） |
| `OPENAI_API_KEY` | OpenAI key | — |
| `OPENAI_BASE_URL` | OpenAI 兼容端点 | — |
| `ANTHROPIC_API_KEY` | Claude key | — |
| `DEEPSEEK_API_KEY` | DeepSeek key | — |
| `DASHSCOPE_API_KEY` | 通义 key | — |
| `MOONSHOT_API_KEY` | Kimi key | — |
| `ZHIPUAI_API_KEY` | 智谱 key | — |
| `HTTPS_PROXY` / `HTTP_PROXY` | 代理 | — |
| `NO_PROXY` | 代理白名单（必设 `127.0.0.1,localhost,::1`） | — |

---

## 配置文件路径

| 文件 | 作用 |
|---|---|
| `$HERMES_HOME/.env` | 环境变量（API Key 等） |
| `$HERMES_HOME/config.yaml` | 详细配置 |
| `$HERMES_HOME/skills/` | 自定义 Skill |
| `$HERMES_HOME/sessions/` | 历史会话 |
| `$HERMES_HOME/memory/` | 记忆向量库 |
| `$HERMES_HOME/logs/` | 日志 |

---

## 端口

| 端口 | 服务 |
|---|---|
| 8642 | Gateway API（hermes 主服务） |
| 8648 | Web UI（hermes-web-ui） |
| 11434 | Ollama 本地（默认） |
| 7890 | HTTP 代理（Clash 默认） |

---

**返回**：[附录目录](./)
