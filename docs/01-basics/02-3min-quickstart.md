# 01-2 三分钟跑起来

> 这一章讲：用最快的方式跑一次 hermes，让你建立直觉。
>
> 适合：还在犹豫"装这个值不值"的人。

---

## 选你的系统

| 系统 | 估时 | 推荐路径 |
|---|---|---|
| **Linux / WSL** | 3 分钟 | 看下面 ↓ |
| **macOS** | 3 分钟 | 看下面 ↓（一样的命令） |
| **Windows 原生** | 5 分钟 | 跳到 [02-installation/03-windows-wsl](../02-installation/03-windows-wsl.md) |

---

## Linux / macOS / WSL

### 一行装

```bash
pipx install hermes-agent
```

> 没有 `pipx`？先装：`brew install pipx`（Mac）或 `sudo apt install pipx`（Debian/Ubuntu）。
>
> 不想用 pipx？也可以 `pip install --user hermes-agent`，但日后升级稍麻烦。

### 配 API Key（DeepSeek 免费送 ¥5，最适合试）

打开 [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 注册手机号，**复制 key**。

然后：

```bash
mkdir -p ~/.u-hermes/data
echo "DEEPSEEK_API_KEY=sk-粘贴你的key" > ~/.u-hermes/data/.env
```

### 第一次对话

```bash
HERMES_HOME=~/.u-hermes/data hermes chat --provider deepseek
```

进入后试试：

```
> 用一句话介绍 Linux 是什么
```

如果你看到流式输出的回答 —— **🎉 跑通了**。

---

## 试试工具调用

在同一个会话里：

```
> 我桌面上有几个 .png 文件？
```

hermes 会决策"我需要调 shell 工具"，然后输出：

```
[hermes 调用工具 shell]
$ ls ~/Desktop/*.png 2>/dev/null | wc -l
3

你桌面上有 3 个 .png 文件。
```

注意它**自动选了 shell 工具，写了命令，跑了，把结果用人话报给你**。这就是 Agent。

---

## 进一步玩玩

### 让它帮你写文件

```
> 帮我写一个名叫 hello.py 的 Python 脚本，打印当前时间。放在桌面上。
```

它会用 `file_write` 工具创建文件。

### 让它跑命令

```
> 现在跑一下 hello.py
```

它会用 `shell` 工具执行。

### 看历史会话

```
> /history
```

hermes 会列出最近的会话，你可以 `/resume` 接着聊。

---

## 退出

```
> /exit
```

或 `Ctrl+D`。

---

## 我的建议

跑通这一次后：

1. **不要急着再装别的** —— 让大脑消化"AI 居然能直接动我电脑"这个事
2. **想想你日常哪个重复任务可以让 AI 做** —— 这是后续学习的目标
3. **看一下 [01-3 第一次对话深度解读](./03-first-conversation.md)** —— 解释刚才发生了什么

---

## 没跑通？

最常见三种原因：

### 1. `hermes: command not found`

```bash
# pipx 装的 binary 在哪？
ls ~/.local/bin/hermes
# 加到 PATH
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. `401 Unauthorized`

API Key 没填好。检查 `.env` 文件：

```bash
cat ~/.u-hermes/data/.env
```

确保：
- 没有首尾空格
- 没有引号（直接写 `DEEPSEEK_API_KEY=sk-xxx`，不是 `="sk-xxx"`）
- key 是完整的（DeepSeek 大概 50 个字符）

### 3. `connection timeout`

如果用国产 provider（DeepSeek 等）出现这个，多半是你的代理把国内地址也走代理了。临时关代理：

```bash
unset HTTPS_PROXY HTTP_PROXY
hermes chat --provider deepseek
```

---

**下一章**：[01-3 第一次对话深度解读](./03-first-conversation.md)
