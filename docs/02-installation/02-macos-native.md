# 02-2 macOS 原生安装

> 这一章讲：在 macOS（Intel 或 Apple Silicon M1/M2/M3）上装 hermes-agent。
>
> 适合：Mac 用户。完全零基础。

---

## 准备

| 要求 | 推荐 |
|---|---|
| macOS | 12 Monterey 及以上 |
| 芯片 | Intel / Apple Silicon 都支持 |
| 磁盘 | 1.5 GB |
| Homebrew | 必装（[brew.sh](https://brew.sh) 一行命令） |

---

## 1. 装 Homebrew（如果还没有）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

国内网络不通的话用清华镜像：

```bash
git clone --depth=1 https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/install.git brew-install
/bin/bash brew-install/install.sh
```

---

## 2. 装 Python 和 pipx

```bash
brew install python@3.12 pipx
pipx ensurepath
# 重开终端让 PATH 生效
```

---

## 3. 装 hermes-agent

```bash
pipx install hermes-agent
```

国内 PyPI 慢的话：

```bash
pipx install --pip-args="-i https://pypi.tuna.tsinghua.edu.cn/simple" hermes-agent
```

---

## 4. 配 API Key

```bash
mkdir -p ~/.u-hermes/data
nano ~/.u-hermes/data/.env
```

填入：

```env
DEEPSEEK_API_KEY=sk-粘贴你的key

NO_PROXY=127.0.0.1,localhost,::1
no_proxy=127.0.0.1,localhost,::1
```

保存退出。

---

## 5. 启动

```bash
HERMES_HOME=~/.u-hermes/data hermes gateway run
```

看到 `Listening on http://127.0.0.1:8642` 即成功。

新开终端：

```bash
HERMES_HOME=~/.u-hermes/data hermes chat
```

---

## 写成 launchd 开机自启（可选）

`~/Library/LaunchAgents/com.dongsheng.hermes.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.dongsheng.hermes</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/YOUR_NAME/.local/bin/hermes</string>
    <string>gateway</string>
    <string>run</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HERMES_HOME</key>
    <string>/Users/YOUR_NAME/.u-hermes/data</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
```

加载：

```bash
launchctl load ~/Library/LaunchAgents/com.dongsheng.hermes.plist
```

---

## 常见 macOS 坑

### "无法验证开发者" 弹窗

如果你跑某个 hermes 用到的二进制（比如 `uv`）时被 Gatekeeper 拦：

```bash
xattr -rd com.apple.quarantine /path/to/binary
```

### Apple Silicon 上某些 wheel 没预编译

罕见。通常是 `pip install` 时报错 "no wheel found"。解决：

```bash
pipx install --pip-args="--no-binary :all:" hermes-agent
```

会从源码编译，慢一点。

### Python 版本冲突

如果你之前装过 Anaconda：

```bash
which python3   # 看是 brew 的还是 anaconda 的
# 推荐：让 brew 的优先
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

---

**下一章**：[02-3 Windows + WSL 安装](./03-windows-wsl.md)
