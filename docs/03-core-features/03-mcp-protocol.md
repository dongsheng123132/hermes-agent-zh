# 03-3 MCP 协议：让 hermes 接入第三方服务

> 这一章讲：MCP（Model Context Protocol）是什么、怎么让 hermes 用 MCP 接入 GitHub / Slack / Notion 等。

---

## MCP 是什么

**MCP（Model Context Protocol）= Anthropic 提出的"AI Agent 与外部服务通信"标准**。

把它理解成 **AI 时代的 USB**：
- USB 让你不管什么键盘鼠标都能插
- MCP 让 AI Agent 不管什么外部服务都能接

发布时间 2024 年底，2026 年已成为事实标准（Claude / hermes / Cursor / Continue 都支持）。

---

## 没 MCP 之前 vs 之后

### 没 MCP（2024 之前）
每个 Agent 框架要给每个服务**单独写适配器**：

```
hermes ← 适配器 → GitHub
        ← 适配器 → Slack
        ← 适配器 → Notion
        ← 适配器 → Linear
        ← 适配器 → Jira
        ...
```

每来一个新服务，所有 Agent 都要重新适配。

### 有 MCP 后

```
hermes ←──── MCP Protocol ────→ MCP Server (GitHub)
                              → MCP Server (Slack)
                              → MCP Server (Notion)
                              ...
```

每个服务**只需写一次** MCP Server，所有支持 MCP 的 Agent 都能用。

---

## 已有的 MCP Server 生态

截至 2026 年初，主流 MCP Server：

| 服务 | 官方 / 社区 | 安装 |
|---|---|---|
| GitHub | 官方 | `npx @modelcontextprotocol/server-github` |
| GitLab | 社区 | `pip install mcp-server-gitlab` |
| Slack | 官方 | `npx @modelcontextprotocol/server-slack` |
| Notion | 官方 | `npx @modelcontextprotocol/server-notion` |
| Linear | 社区 | `pip install mcp-server-linear` |
| Jira | 社区 | `pip install mcp-server-jira` |
| Postgres | 官方 | `npx @modelcontextprotocol/server-postgres` |
| 飞书 | 中文社区 | `pip install mcp-server-feishu` |
| 钉钉 | 中文社区 | `pip install mcp-server-dingtalk` |

完整列表：[https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

## hermes 接 MCP 的方法

### 1. 配置 MCP Server

`~/.u-hermes/data/mcp.yaml`：

```yaml
servers:
  github:
    type: npm
    package: "@modelcontextprotocol/server-github"
    env:
      GITHUB_TOKEN: ${GITHUB_TOKEN}

  slack:
    type: npm
    package: "@modelcontextprotocol/server-slack"
    env:
      SLACK_BOT_TOKEN: ${SLACK_BOT_TOKEN}

  notion:
    type: npm
    package: "@modelcontextprotocol/server-notion"
    env:
      NOTION_TOKEN: ${NOTION_TOKEN}

  postgres:
    type: npm
    package: "@modelcontextprotocol/server-postgres"
    args:
      - "postgresql://user:pass@localhost/mydb"
```

`.env`：

```env
GITHUB_TOKEN=ghp_xxx
SLACK_BOT_TOKEN=xoxb-xxx
NOTION_TOKEN=secret_xxx
```

### 2. 启动 hermes（自动拉起 MCP Server）

```bash
hermes gateway run
# hermes 会自动 spawn 所有配置的 MCP Server 子进程
```

### 3. 在对话里用

```
> 看一下我 GitHub repo `my-app` 里今天新建的 Issue

[hermes 通过 MCP 调 github.list_issues(repo=my-app, since=today)]
[返回 5 个 Issue 列表]

我看到 5 个新 Issue：
1. #234 用户登录失败
2. #235 性能优化
...
```

### 4. 跨服务组合

```
> 把 GitHub Issue #234 的内容同步到 Notion，并在 Slack 通知 @张三

[hermes 拆解为 3 步]
[step 1: github.get_issue(234) → 拿内容]
[step 2: notion.create_page(parent=..., content=...) → 同步]
[step 3: slack.send_message(channel=张三, text=已同步到 Notion: <link>)]

完成 ✓
```

这是 MCP 的真正威力：**hermes 可以编排多个服务做组合任务**。

---

## 自己写 MCP Server

如果你有内部服务想接 hermes（公司内的工单系统、自研 CMS 等），MCP Server 也很简单。

### Python 示例（5 分钟版）

```python
# mcp_my_service.py
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("my-service")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_tickets",
            description="搜索我公司工单系统",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_tickets":
        # 调你内部 API
        results = my_api_search(arguments["query"])
        return [TextContent(type="text", text=str(results))]

if __name__ == "__main__":
    import asyncio
    from mcp.server.stdio import stdio_server
    
    async def main():
        async with stdio_server() as streams:
            await server.run(*streams, server.create_initialization_options())
    
    asyncio.run(main())
```

### 让 hermes 用它

```yaml
# mcp.yaml
servers:
  my-service:
    type: python
    command: python3
    args:
      - /path/to/mcp_my_service.py
```

启动后：

```
> 搜一下工单里关于"支付失败"的

[hermes 通过 MCP 调 my-service.search_tickets(query="支付失败")]
找到 3 条：
1. T-2024-001 用户支付失败 - 已解决
2. T-2024-013 微信支付失败 - 进行中
3. ...
```

---

## MCP vs Skill 怎么选

| 维度 | MCP | Skill |
|---|---|---|
| 可移植性 | 跨 Agent（Claude / hermes / Cursor 都能用） | 只 hermes |
| 上手难度 | 中（要写 MCP server） | 低（一个 yaml） |
| 性能 | 略高（独立进程） | 略快（同进程） |
| 工具数量 | 1 个 server 可暴露多个工具 | 1 yaml 1 工具 |
| 生态 | 已有大量现成 server | 完全你自己写 |
| 推荐场景 | 接知名服务 / 多 Agent 共用 | 简单脚本 / 个人化 |

**经验**：
- 接 GitHub / Slack / Notion 等 **公共服务** → 用现成 MCP Server
- 公司内部系统 → 写 MCP Server（团队多人共用）
- 个人简单工具（"查我桌面今天新增文件"） → Skill 就够

---

## 调试 MCP

### 1. 单独跑 MCP Server

```bash
GITHUB_TOKEN=xxx npx @modelcontextprotocol/server-github
# 通过 stdin/stdout 发送 JSON-RPC 测试
```

### 2. hermes 端日志

```bash
HERMES_LOG_LEVEL=DEBUG hermes gateway run
# 输出会显示每次 MCP 调用的请求/响应
```

### 3. mcp inspector

```bash
npx @modelcontextprotocol/inspector npx @modelcontextprotocol/server-github
```

会开一个 Web UI（[http://localhost:3000](http://localhost:3000)），让你手动测试 MCP Server 的所有工具。

---

## 国内场景：飞书 MCP

```bash
pip install mcp-server-feishu
```

`mcp.yaml`：

```yaml
servers:
  feishu:
    type: python
    command: python3
    args: [-m, mcp_server_feishu]
    env:
      FEISHU_APP_ID: ${LARK_APP_ID}
      FEISHU_APP_SECRET: ${LARK_APP_SECRET}
```

可用工具：
- `feishu.send_message`
- `feishu.create_doc`
- `feishu.search_user`
- `feishu.book_meeting_room`
- ...

```
> 在飞书发一条给"产品评审群"："今天 3 点开会"

[hermes 通过 MCP 调 feishu.send_message]
✓ 已发送
```

---

## 安全

⚠️ MCP Server 是子进程，能执行任意操作。

- ✅ 只用官方 / 受信社区的 MCP Server
- ✅ token 用最小权限（GitHub PAT 只给 repo:read，不给 repo:write）
- ✅ 监控 MCP Server 网络请求（看是否上传你数据）
- ✅ 公司敏感场景：自己 fork 后审计代码再用

---

**[← 03-2 Memory](./02-memory-and-context.md)** · **[03-4 Cron 定时任务 →](./04-cron-and-scheduling.md)**
