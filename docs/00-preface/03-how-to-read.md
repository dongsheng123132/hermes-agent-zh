# 前言 03 · 怎么读这本教程

## 章节结构总览

```
00 前言            ← 你在这里
01 入门            零基础 → 跑通第一次对话
02 安装            Linux / macOS / Windows-WSL / 云端
03 核心功能        Skills / Memory / MCP / Cron / Multi-Agent
04 Provider 配置   OpenAI / 国产 / Ollama / OpenRouter
05 实战案例        编程 / 知识库 / 定时 / 团队 / USB
06 工程进阶        便携打包 / Electron / patch / Provider 模板
07 排错            安装失败 / 网络问题 / FAQ
99 附录            CLI 速查 / 配置模板 / 术语 / 资源
```

按"完整版"顺序读 = 一本厚书的体验。但**没必要**。

---

## 三种推荐路径

### 路径 1：30 分钟尝鲜（小白）

- [01-basics/02-3min-quickstart](../01-basics/02-3min-quickstart.md)（5 分钟）
- 选你的系统装：[02-installation/](/installation/)（20 分钟）
- 第一次对话：[01-basics/03-first-conversation](../01-basics/03-first-conversation.md)（5 分钟）

跑通后：合上电脑，去做点别的；下次再来挑案例做。

### 路径 2：周末项目（程序员）

周六上午：路径 1
周六下午：[03-core-features/](/core-features/)（理解 Skills/Memory/Cron）
周日：挑 [05-cases/](/cases/) 一个案例做出来

约 12-15 小时完整闭环。

### 路径 3：硬核研究（产品/创业者）

按章节顺序通读 + 把 [06-engineering/](/engineering/) 的代码亲手敲一遍。约 30 小时。

---

## 阅读约定

### 代码块标记

```bash
# 这是 Linux/Mac/WSL 命令行
ls -la
```

```powershell
# 这是 Windows PowerShell
Get-ChildItem
```

```yaml
# 这是 hermes 的 config.yaml 配置
providers:
  deepseek:
    api_key: ${DEEPSEEK_API_KEY}
```

```python
# 这是 Python 代码（一般是 Skill 实现）
def my_skill(input: str) -> str:
    return f"Hello {input}"
```

### 图标

- ✅ 操作正确 / 推荐做法
- ❌ 操作错误 / 不要这样做
- ⚠️ 注意事项 / 容易踩坑
- 💡 小贴士 / 提速建议
- 🔗 相关章节链接
- 🐎 hermes-agent 相关
- 🐢 慢但稳的方案
- 🚀 快但需要前置条件的方案

### 路径约定

- `~/.u-hermes/` —— 默认数据目录（可改）
- `~/.u-hermes/data/.env` —— 主配置文件
- `~/.u-hermes/data/config.yaml` —— 进阶配置
- `~/.u-hermes/venv/` —— Python 虚拟环境
- `~/.u-hermes/data/sessions/` —— 历史会话存储
- `~/.u-hermes/data/skills/` —— 自定义 Skill

### 端口约定

| 服务 | 默认端口 | 说明 |
|---|---|---|
| Gateway API | 8642 | hermes 主 API |
| Web UI | 8648 | 浏览器界面（如果装了 hermes-web-ui） |

---

## 卡住怎么办

按这个顺序排查：

1. **先看本章末尾的"常见问题"** —— 90% 的卡点已被列出
2. **查 [07-troubleshooting/](/troubleshooting/)** —— 系统化排错决策树
3. **搜 [hermes-agent GitHub Issues](https://github.com/NousResearch/hermes-agent/issues)** —— 也许别人已经报过
4. **Google 关键报错** —— 但请翻第二页才有英文社区的好答案
5. **本仓库提 Issue** —— [hermes-agent-zh Issues](https://github.com/dongsheng123132/hermes-agent-zh/issues)

---

## 配套实体书

本教程将由出版社以**《零基础玩转 hermes-agent：从入门到自动化》**（暂名）出版（2026 年下半年）。

**实体书 vs GitHub 教程的区别**：

| 项 | GitHub 教程 | 实体书 |
|---|---|---|
| 价格 | 免费 | ¥58-78 |
| 更新 | 紧跟版本 | 出版后冻结 |
| 排版 | Markdown | 专业排版 + 配图 |
| 章节深度 | 一致 | 一致（书是 GitHub 的精修版） |
| 附赠 | 无 | 配套代码二维码、社群入口 |

如果你喜欢实体书的阅读体验或想送朋友，请关注作者邮箱通知：`hefangsheng@gmail.com`。

---

**开始正式学习** → [01-basics/01-what-is-hermes](../01-basics/01-what-is-hermes.md)
