# 02-1 Linux 原生安装

> 这一章讲：在 Ubuntu / Debian / Fedora 等任何主流 Linux 发行版上，用 Python venv 装上 hermes-agent，跑起来一个能聊天能做工具调用的本地 Agent。
>
> 适合：能开终端、会用 sudo 的 Linux 用户。完全零基础。

---

## 准备

| 要求 | 推荐 |
|---|---|
| 系统 | Ubuntu 22.04 / 24.04，Debian 12，Fedora 40 都行 |
| Python | 3.10+ |
| 磁盘 | 1.5 GB（含 venv + 依赖 + 几次会话日志） |
| 网络 | 用国产模型不需要代理；用 OpenAI/Anthropic 需要 |

---

## 一键脚本

我把整套流程写成了 [`setup-hermes.sh`](../../examples/scripts/setup-hermes.sh)，**复制粘贴跑**：

```bash
# 下载到本地
curl -fsSL -O https://raw.githubusercontent.com/dongsheng123132/hermes-agent-zh/main/examples/scripts/setup-hermes.sh
chmod +x setup-hermes.sh

# 跑
./setup-hermes.sh
```

脚本做了以下事情：

1. `apt install` 系统依赖（python3、python3-venv、curl、git）
2. 创建 `~/.u-hermes/` 目录树
3. 在 `~/.u-hermes/venv/` 建 Python venv
4. `pip install hermes-agent`（这一步会下 ~200 MB 依赖，国内一般 1-2 分钟）
5. 生成 `~/.u-hermes/data/.env` 模板（默认全部注释，让你下一步填 key）

跑完会显示：

```
✅ 安装完成

下一步：
  1. 编辑 ~/.u-hermes/data/.env 取消一行注释填入 API Key
  2. 运行 start-hermes.sh
```

---

## 配 API Key

打开 `~/.u-hermes/data/.env`：

```bash
nano ~/.u-hermes/data/.env
```

找到下面这行（默认有 `#` 注释），**去掉 `#` 并填上你的 key**：

```env
DEEPSEEK_API_KEY=sk-xxx你的密钥xxx
```

> 没 key？打开 [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 注册即可（手机号验证，免费送几块钱额度，国内直连不用代理）。
>
> 想用其他 provider？看 [04-providers/](../04-providers/) 章节。

保存（`Ctrl+O` → `Enter` → `Ctrl+X`）。

---

## 启动

```bash
curl -fsSL -O https://raw.githubusercontent.com/dongsheng123132/hermes-agent-zh/main/examples/scripts/start-hermes.sh
chmod +x start-hermes.sh
./start-hermes.sh
```

正常会输出：

```
✅ hermes 已启动: http://127.0.0.1:8642
```

浏览器打开 `http://127.0.0.1:8642/health`，看到 JSON 响应说明跑起来了。

---

## 第一次对话

新开一个终端：

```bash
~/.u-hermes/venv/bin/hermes chat
```

会进入交互模式。试试：

```
> 用一段话介绍 Linux 是什么
```

如果你看到流式输出的回答，恭喜，hermes 已经能用了。下一章 [03-first-conversation](../01-basics/03-first-conversation.md) 会带你试更复杂的交互。

---

## 升级 / 卸载

**升级**：

```bash
~/.u-hermes/venv/bin/pip install --upgrade hermes-agent
```

**卸载**：

```bash
rm -rf ~/.u-hermes/
```

---

## 常见问题

### `pip install hermes-agent` 卡在 90%

国内 PyPI 访问慢。换源：

```bash
~/.u-hermes/venv/bin/pip install -i https://pypi.tuna.tsinghua.edu.cn/simple hermes-agent
```

### gateway 起不来，端口 8642 被占用

```bash
lsof -i :8642  # 看看谁占用了
# 改 hermes 端口：编辑 ~/.u-hermes/data/.env，加一行
# HERMES_GATEWAY_PORT=18642
```

### 启动很慢

第一次启动 hermes 会下载内置 prompt 模板和 skill 索引，大概 30 秒。后续启动 < 5 秒。

更多排错请看 [07-troubleshooting/01-install-failures](../07-troubleshooting/01-install-failures.md)。

---

## 想要更省事？

如果你不想折腾终端、不想配 venv、不想搞代理 —— 看 [05-cases/05-portable-usb](../05-cases/05-portable-usb.md)，那里讲了"插上 U 盘双击就能用"的 [U-Hermes 马盘](https://u-hermes.org) 方案。本教程作者就是马盘的开发者，但本章是上游 hermes-agent 的纯净安装方法。

---

**下一章**：[02-2 macOS 原生安装](./02-macos-native.md)
