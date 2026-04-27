# 07-1 安装失败排错

> 90% 的安装问题集中在以下场景。按这个顺序排查。

---

## 决策树

```
hermes 装不上？
├── pip install 卡住 / 失败
│   ├── 网络问题 → 见 [02-network-issues](./02-network-issues.md)
│   ├── 权限问题 → 用 pipx 或 --user
│   └── 依赖冲突 → 创独立 venv
│
├── pip install 成功，但 hermes 命令找不到
│   └── PATH 没加 → ~/.local/bin
│
├── hermes 启动报 401
│   └── API Key 没配 / 配错位置
│
├── hermes 启动卡住，端口 8642 没监听
│   ├── 端口被占 → 改端口
│   └── 启动 crash → 看日志
│
└── 启动成功但对话报错
    └── 见 04-providers 章节验证 provider 配置
```

---

## 问题 1：`pip install hermes-agent` 慢/失败

### 症状

```
ERROR: Could not install packages due to an OSError: [Errno 32] Broken pipe
```

或卡在 90% 不动。

### 原因

国内 PyPI 访问慢，连接断开。

### 解决

**方案 A：换清华镜像**

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple hermes-agent
```

**方案 B：用 pipx**

```bash
pipx install --pip-args="-i https://pypi.tuna.tsinghua.edu.cn/simple" hermes-agent
```

**方案 C：用 uv**（最快）

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install hermes-agent --index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 问题 2：`hermes: command not found`

### 症状

装完了，但跑 `hermes` 报 command not found。

### 原因

pipx / pip user 装的二进制在 `~/.local/bin/`，没在 PATH。

### 解决

```bash
# 看二进制在哪
ls ~/.local/bin/hermes        # pipx / pip --user
ls /usr/local/bin/hermes      # sudo pip
ls $(python -m site --user-base)/bin/hermes

# 加到 PATH
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证
which hermes
```

如果你用 zsh：替换 `~/.bashrc` 为 `~/.zshrc`。

---

## 问题 3：启动报 `401 Unauthorized`

### 症状

```
$ hermes chat
Error: 401 Unauthorized from provider
```

### 原因

API Key 没配 / 配错。

### 排查

```bash
# 1. .env 文件存在？
ls -la ~/.u-hermes/data/.env

# 2. 内容里有 key？
grep "API_KEY" ~/.u-hermes/data/.env

# 3. key 没多余空格？
cat -A ~/.u-hermes/data/.env | grep API_KEY
# 不该有 ^I（Tab） 或行尾的 $
```

### 常见错误写法

```env
# ❌ 加了引号
DEEPSEEK_API_KEY="sk-xxx"

# ❌ key 后面有空格
DEEPSEEK_API_KEY=sk-xxx  

# ❌ 等号两边有空格
DEEPSEEK_API_KEY = sk-xxx

# ✅ 正确
DEEPSEEK_API_KEY=sk-xxx
```

### 还是不行

确认 hermes 真读到了 .env：

```bash
HERMES_HOME=~/.u-hermes/data hermes chat --provider deepseek --debug
```

`--debug` 会输出当前生效的 key 前 10 字符。

---

## 问题 4：端口 8642 被占用

### 症状

```
Error: Address already in use
```

### 排查

```bash
# Linux / Mac
lsof -i :8642
# 或
ss -tlnp | grep 8642

# Windows / WSL
netstat -an | grep 8642
```

### 解决

**方案 A：杀掉占用进程**

```bash
kill <PID>
```

**方案 B：改 hermes 端口**

`.env` 里加：

```env
HERMES_GATEWAY_PORT=18642
```

---

## 问题 5：启动后 30 秒内 gateway 没起来

### 症状

```bash
./start-hermes.sh
# ❌ gateway 30 秒内没起来
```

### 排查

```bash
tail -100 ~/.u-hermes/data/logs/agent.log
```

常见原因：

| 错误 | 解决 |
|---|---|
| `ModuleNotFoundError: No module named 'xxx'` | venv 损坏 → 删 ~/.u-hermes/venv 重装 |
| `KeyError: 'DEEPSEEK_API_KEY'` | .env 没配 |
| `OSError: [Errno 28] No space left on device` | 磁盘满了 |
| `ConnectionError to api.deepseek.com` | 网络 / 代理问题 |

---

## 问题 6：venv 损坏

### 症状

启动报：

```
ImportError: cannot import name 'xxx' from 'yyy'
```

或一些 native 库的 segfault。

### 解决

重建 venv：

```bash
rm -rf ~/.u-hermes/venv
python3 -m venv ~/.u-hermes/venv
~/.u-hermes/venv/bin/pip install --upgrade pip
~/.u-hermes/venv/bin/pip install hermes-agent
```

数据（sessions/memory）不会丢，因为它们在 `~/.u-hermes/data/` 不在 venv。

---

## 问题 7：M1/M2 Mac 装不上某个依赖

### 症状

```
ERROR: Could not build wheels for psycopg2 ... no matching wheel found
```

### 解决

通常是 native 编译需要 Xcode tools：

```bash
xcode-select --install
brew install postgresql   # 部分依赖需要
```

或避开：

```bash
pip install hermes-agent --no-deps
pip install <missing-deps-list-manually>
```

---

## 问题 8：Windows 原生（非 WSL）问题多

如果你坚持在 Windows 原生跑 hermes（非 WSL2），常见问题：

| 错误 | 解决 |
|---|---|
| `'hermes' is not recognized` | PATH 没加，加 `%APPDATA%\Python\Scripts` |
| `uvloop install failed` | uvloop 不支持 Windows，改 asyncio：`HERMES_LOOP=asyncio` |
| `subprocess.run failed` | shell 工具默认用 bash，Windows 没 bash → 装 Git Bash 或用 WSL |

**强烈建议**：放弃 Windows 原生，用 WSL2，看 [02-3 Windows-WSL](../02-installation/03-windows-wsl.md)。

---

## 仍然卡住

按下面优先级寻求帮助：

1. **本仓库 Issues**：[https://github.com/dongsheng123132/hermes-agent-zh/issues](https://github.com/dongsheng123132/hermes-agent-zh/issues)
2. **hermes 上游 Issues**：[https://github.com/NousResearch/hermes-agent/issues](https://github.com/NousResearch/hermes-agent/issues)
3. **社区**：Nous Research Discord

提 Issue 时附带：

- 你的系统版本（`uname -a` / `sw_vers` / `winver`）
- Python 版本（`python --version`）
- 完整错误日志（`~/.u-hermes/data/logs/agent.log` 最后 50 行）
- 你跑的命令

---

**下一章**：[07-2 网络问题](./02-network-issues.md)
