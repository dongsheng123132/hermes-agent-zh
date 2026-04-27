# 06-1 便携打包：把 hermes 装进 USB

> 这一章讲：把 hermes-agent + Python + Node + 所有依赖打包成一个可移植目录的工程方法。
>
> 这是把"开源 Agent"做成"商业产品"的第一步硬骨头。

---

## 目标

```
做出一个可移植目录（U 盘 / 压缩包），用户只需：
  1. 把目录复制到自己电脑
  2. 双击启动脚本
  3. 不需要装 Python / 不需要 pip / 不需要联网
  → hermes 就能跑起来
```

---

## 挑战拆解

| 问题 | 为什么难 |
|---|---|
| 用户没 Python | 需要带便携 Python |
| 用户不能 sudo | 一切写到便携目录，不动系统 |
| 用户没网 | 所有依赖（pip wheels）预下载 |
| 跨机器复用 | 路径不能写死 |
| 国内网络 | 不能依赖 GitHub / PyPI 在线下载 |

---

## 方案：三层结构

```
便携目录/
├── runtime/              # 运行时（Python + Node）
│   ├── python/           # Python 3.13 embeddable
│   └── node/             # Node.js 20 portable
├── packages/             # 离线依赖
│   └── pip-wheels/       # 所有 pip 依赖的 .whl 文件
├── app/                  # 应用代码
│   ├── hermes-agent/     # hermes 源码（pip install --target 装这里）
│   └── data/             # 用户数据（首次启动创建）
└── 启动 hermes.bat        # 启动脚本（Windows）
└── start-hermes.sh        # 启动脚本（Linux/Mac）
```

---

## 步骤 1：下载便携 Python

### Windows: Python embeddable

[Python embeddable](https://www.python.org/downloads/windows/) 是官方提供的"压缩包版" Python，~10 MB，解压即用。

```bash
# 在"制盘机"上跑（用国内镜像快）
curl -L -o python-3.13.0-embed-amd64.zip \
  https://registry.npmmirror.com/-/binary/python/3.13.0/python-3.13.0-embed-amd64.zip

# 解压到便携目录
mkdir -p portable/runtime/python
unzip python-3.13.0-embed-amd64.zip -d portable/runtime/python/
```

### Linux: 用系统 Python（不打包）

Linux 默认有 Python，便携场景一般跑在 Live USB 系统里，用系统 Python。

如需绝对独立，用 [python-build-standalone](https://github.com/indygreg/python-build-standalone)。

### Mac: 用 Homebrew Python（不打包）

Mac 同上。商业版打包可考虑 [conda-pack](https://conda.github.io/conda-pack/)。

---

## 步骤 2：让 embeddable Python 能 pip install

embeddable 默认**不带 pip**，且 import 路径有限制（只看 `python313._pth`）。

### 解开限制

修改 `runtime/python/python313._pth`：

```
python313.zip
.
import site               # ← 取消这行注释（默认是 #import site）
Lib\site-packages
..\..\app\hermes-agent     # ← 加这行，让它能 import 我们装到 app/ 的依赖
```

### 装 pip

```bash
# 下载 get-pip.py
curl -L -o get-pip.py https://bootstrap.pypa.io/get-pip.py

# 用 embeddable Python 跑
runtime/python/python.exe get-pip.py --no-warn-script-location
```

完成后 `runtime/python/Scripts/pip.exe` 就有了。

---

## 步骤 3：离线下载所有依赖

```bash
# 在制盘机上预下载 hermes 依赖
runtime/python/python.exe -m pip download \
  --dest packages/pip-wheels/ \
  --platform win_amd64 \
  --python-version 313 \
  --only-binary=:all: \
  hermes-agent==0.11.0
```

参数解释：
- `--dest` —— 下到哪
- `--platform win_amd64` —— **不在制盘机上装**，下载用户机的格式
- `--python-version 313` —— 指定目标 Python 版本
- `--only-binary=:all:` —— 不要下源码包（用户没编译环境）

下完 `pip-wheels/` 大约 200 MB（几十个 .whl 文件）。

### 处理"没有 wheel 的包"

某些 C 扩展（如 `uvloop`）没有 Windows wheel。两个选择：

**A. 排除该包**

如果非必需（uvloop 是性能优化），从 hermes 依赖里去掉：

```bash
pip download --no-deps hermes-agent==0.11.0
# 然后手动 download 它的依赖（除了 uvloop）
```

**B. 用纯 Python 替代**

hermes 配置里：

```yaml
HERMES_LOOP: asyncio   # 不用 uvloop
```

---

## 步骤 4：用户机首次启动

`启动 hermes.bat`：

```batch
@echo off
chcp 65001 >nul
setlocal

set ROOT=%~dp0
set PYTHON=%ROOT%runtime\python\python.exe
set DATA=%ROOT%app\data

echo Starting hermes...

REM 第一次启动，安装离线 wheels
if not exist "%ROOT%app\hermes-agent\hermes" (
  echo First run, installing dependencies offline...
  "%PYTHON%" -m pip install ^
    --no-index ^
    --find-links "%ROOT%packages\pip-wheels" ^
    --target "%ROOT%app\hermes-agent" ^
    hermes-agent
)

REM 启动 gateway
set HERMES_HOME=%DATA%
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
set PYTHONPATH=%ROOT%app\hermes-agent

"%PYTHON%" -m hermes_agent.gateway run

pause
```

`start-hermes.sh`（Linux/Mac）：

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PYTHON="$ROOT/runtime/python/bin/python3"
DATA="$ROOT/app/data"

if [ ! -d "$ROOT/app/hermes-agent/hermes" ]; then
    echo "First run, installing offline..."
    "$PYTHON" -m pip install \
      --no-index \
      --find-links "$ROOT/packages/pip-wheels" \
      --target "$ROOT/app/hermes-agent" \
      hermes-agent
fi

export HERMES_HOME="$DATA"
export PYTHONIOENCODING=utf-8
export PYTHONUTF8=1
export PYTHONPATH="$ROOT/app/hermes-agent"

"$PYTHON" -m hermes_agent.gateway run
```

---

## 步骤 5：处理路径问题

### 中文路径乱码

Windows 默认 GBK 编码，便携 USB 路径含中文（如"D:\我的U盘\hermes\"）会出 ImportError。

**解决**：

```batch
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
```

bat 文件**保存为 UTF-8 with BOM**（不是 UTF-8），否则 `chcp 65001` 命令本身会乱。

### 空格路径

```batch
REM 永远用引号包路径
"%PYTHON%" -m hermes_agent.gateway run

REM 不要这样
%PYTHON% -m hermes_agent.gateway run
```

### 不同盘符

便携 USB 可能在 D: / E: / F: ... 不同电脑插上盘符不同。

**解决**：所有路径用 `%~dp0`（bat）或 `$(dirname "$0")`（bash）拿当前脚本所在目录，不要写死。

---

## 步骤 6：第一次启动的体验优化

第一次跑 `pip install --no-index` 安装依赖大约 30-60 秒。给用户**进度反馈**：

```batch
echo [1/3] 解压 Python 运行时...
echo [2/3] 安装 hermes（首次约 1 分钟）...
"%PYTHON%" -m pip install --no-index --find-links ... 2>nul
echo [3/3] 启动 hermes...
```

更高级：写一个 Electron 启动器，弹个进度窗口（详见 [06-2](./02-electron-launcher.md)）。

---

## 步骤 7：分发

打包好的便携目录（约 800 MB - 1.2 GB）怎么发：

| 方式 | 优点 | 缺点 |
|---|---|---|
| 实体 U 盘 | 用户体验最好（即插即用） | 物流成本 |
| 压缩包下载 | 容易 | 1 GB 下载慢 |
| Docker 镜像 | 跨平台 | 用户要装 Docker |
| 安装脚本（在线下载） | 文件小 | 国内网速难保证 |

我（作者）的产品 [U-Hermes 马盘](https://u-hermes.org) 走 **U 盘 + 网店**：用户买实体 U 盘，无需技术能力。

---

## 步骤 8：升级

便携版升级有两种思路：

### A. 全量替换

新版本发布 → 用户下载新便携包 → 拷贝 `app/data/` 老数据到新包。

简单但每次升级都很大。

### B. 增量更新

```
启动时检查 ~/runtime/python/version
对比官网最新版
不一致 → 拉新依赖（patch）→ 重启
```

类似 Electron 的 `auto-updater`。

---

## 实战清单

| 步骤 | 难度 | 估时 |
|---|---|---|
| 下载 Python embeddable | ⭐ | 5 分钟 |
| 改 _pth 装 pip | ⭐⭐ | 30 分钟（第一次踩坑） |
| pip download 离线 wheels | ⭐⭐ | 30 分钟 |
| 启动脚本（中文路径处理） | ⭐⭐⭐ | 2 小时 |
| 测试不同 Windows 版本 | ⭐⭐⭐ | 半天 |
| 测试不同盘符 | ⭐⭐ | 1 小时 |

---

## 参考实现

完整可跑的脚本（**已脱敏 / 不含商业版激活逻辑**）见：

- 本仓库 [examples/scripts/build-portable.sh](https://github.com/dongsheng123132/hermes-agent-zh/tree/main/examples/scripts/) （v1.5 发布）
- 作者商业产品 [U-Hermes Linux 开源版](https://github.com/dongsheng123132/u-hermes)（Linux 部分完全开源，Windows 闭源）

---

**[← 06 工程进阶目录](./)** · **[06-2 Electron 启动器 →](./02-electron-launcher.md)**
