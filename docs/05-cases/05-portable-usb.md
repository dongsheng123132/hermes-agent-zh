# 05-5 案例研究：把 hermes 装进 U 盘（U-Hermes 马盘）

> 这一章讲：**把 hermes-agent 打包成"插上 U 盘双击 .exe 就能用"的便携产品**，是怎么做到的。
>
> 适合：想做产品的开发者、好奇背后实现的读者。

---

## 这是什么

[U-Hermes 马盘](https://u-hermes.org) 是本教程作者做的商业产品：

- 一根 U 盘，里面装好了 hermes-agent + Python runtime + 配置好的 web UI
- 插到任何 Windows 电脑（不需要联网安装），双击 `.exe` 就跑起来
- 内置激活码系统，付费用户购买后可用
- Linux Live USB 版本完全开源（[u-hermes GitHub](https://github.com/dongsheng123132/u-hermes)）

本章讲**开源 Linux Live 版**的实现（商业版闭源，但工程方法论本教程的 [06-engineering/](../06-engineering/) 全部公开）。

---

## 工程目标

把"用户跑 `pip install hermes-agent`"这一步**完全替换为"用户插 U 盘"**。挑战：

1. 用户机器**没有 Python**：得带个便携 Python
2. 用户**不能 sudo**：所有数据写到 U 盘自身
3. 用户**可能没网**：所有依赖（pip wheels）预装
4. **跨机器复用**：今天插 A 机，明天插 B 机，会话历史不丢
5. **国内网络**：不能依赖 GitHub / PyPI 在线下载

---

## 方案一：Linux Live USB（开源，免费）

完全照搬 hermes 章节但跑在 Ubuntu Live 模式。流程：

### 1. Ventoy 制盘

Ventoy 是开源工具，把 U 盘做成"多 ISO 启动盘"：

```bash
# 下载 Ventoy
wget https://github.com/ventoy/Ventoy/releases/download/v1.0.99/ventoy-1.0.99-linux.tar.gz
tar -xf ventoy-1.0.99-linux.tar.gz
cd ventoy-1.0.99
sudo ./Ventoy2Disk.sh -i /dev/sdX     # 替换 sdX 为你的 U 盘
```

PowerShell（Windows）也有 Ventoy，参考 [u-hermes GitHub](https://github.com/dongsheng123132/u-hermes) 的 `linux/1-prepare-usb.ps1`。

### 2. 拷 Ubuntu ISO

```bash
# 下载 Ubuntu 24.04 LTS Desktop
wget https://releases.ubuntu.com/24.04/ubuntu-24.04.1-desktop-amd64.iso

# 拷到 U 盘根目录
cp ubuntu-24.04.1-desktop-amd64.iso /media/USB-VENTOY/
```

### 3. 创建 persistence 分区

Ventoy 1.0.99+ 支持持久化（让用户的修改下次开机还在）。在 U 盘建一个 `casper-rw` 文件：

```bash
truncate -s 8G /media/USB-VENTOY/persistence.dat
mkfs.ext4 -L casper-rw /media/USB-VENTOY/persistence.dat
```

详见 `linux/3-create-persistence.ps1`。

### 4. 拷 hermes setup 脚本

把 [`examples/scripts/setup-hermes.sh`](https://github.com/dongsheng123132/hermes-agent-zh/blob/main/examples/scripts/setup-hermes.sh) 和 `start-hermes.sh` 拷到 U 盘 `/U-Hermes/` 目录下。

```bash
mkdir -p /media/USB-VENTOY/U-Hermes
cp examples/scripts/setup-hermes.sh /media/USB-VENTOY/U-Hermes/
cp examples/scripts/start-hermes.sh /media/USB-VENTOY/U-Hermes/
```

### 5. 用户怎么用

1. 把 U 盘插到任何电脑
2. 重启，从 U 盘启动（按 F12 选 USB）
3. 选 Ubuntu 24.04，回车
4. 进 Live Desktop 后，打开终端跑：
   ```bash
   cd /cdrom/U-Hermes
   ./setup-hermes.sh
   ```
5. 配 API Key，跑 `start-hermes.sh`，浏览器打开 `http://127.0.0.1:8642`

下次插 U 盘：persistence 让你的会话历史 / API Key 都还在。

---

## 方案二：Windows 便携版（U-Hermes 商业版）

> 这部分**逻辑公开**，但具体激活/指纹代码闭源。读者完全可以复现 80% 功能。

### 工程构成

```
U盘根目录/
├── runtime/
│   ├── python/         便携 Python 3.13（含 .pip 标准库）
│   └── node/           便携 Node.js 20
├── hermes-agent/       hermes 源码 + 所有 pip 依赖（pip download 离线）
├── hermes-web-ui/      hermes-web-ui 静态资源（含若干 patches）
├── launcher.exe        Electron 启动器
├── 启动 U-Hermes.bat    简单包装，双击触发 launcher
└── data/               用户数据（首次启动创建）
```

### 关键技术点

#### A. 便携 Python

下载 [Python embeddable](https://www.python.org/downloads/windows/) 的 `python-3.13-embed-amd64.zip`：

```bash
# Windows
curl -O https://www.python.org/ftp/python/3.13.0/python-3.13.0-embed-amd64.zip
mkdir -p runtime/python
cd runtime/python
unzip ../python-3.13.0-embed-amd64.zip
```

embeddable 不带 pip。手动加：

```bash
curl -O https://bootstrap.pypa.io/get-pip.py
runtime/python/python.exe get-pip.py
```

详细方法看 [06-engineering/01-portable-packaging](../06-engineering/01-portable-packaging.md)。

#### B. 离线 pip 依赖

```bash
# 在制盘机上下载所有 hermes 依赖
runtime/python/python.exe -m pip download \
  --dest pip-wheels/ \
  --platform win_amd64 \
  --python-version 313 \
  hermes-agent
```

用户机上不需要联网，从 `pip-wheels/` 安装。

#### C. Electron 启动器

[Electron](https://www.electronjs.org/) 包装一个 GUI：

- 用户双击 → Electron 启动
- Electron 主进程 spawn `python.exe -m hermes_agent.gateway`
- Electron 窗口 = WebView 加载 `http://127.0.0.1:8642`
- 用户关闭窗口 → 主进程清理子进程

伪代码：

```javascript
const { spawn } = require('child_process');
const { app, BrowserWindow } = require('electron');

const hermesProcess = spawn(
  path.join(usbRoot, 'runtime/python/python.exe'),
  ['-m', 'hermes_agent.gateway', 'run'],
  {
    env: {
      ...process.env,
      HERMES_HOME: path.join(usbRoot, 'data'),
      PYTHONIOENCODING: 'utf-8',
    },
  }
);

await waitForPort('127.0.0.1', 8642, 30000);

const win = new BrowserWindow({ width: 1200, height: 800 });
win.loadURL('http://127.0.0.1:8642');

app.on('window-all-closed', () => {
  hermesProcess.kill();
  app.quit();
});
```

完整实现见 [06-engineering/02-electron-launcher](../06-engineering/02-electron-launcher.md)。

#### D. hermes-web-ui patch

hermes-web-ui 默认是"系统安装"模式（读 `~/.hermes`、检测系统进程）。便携模式必须改：

- 读取 `<usb_root>/data/` 而非 `~/.hermes`
- 不检测全局 PID（U 盘进程独立）
- 屏蔽"升级到 hermes-web-ui x.y" 弹窗（避免在用户 U 盘上动态下载）

详见 [06-engineering/03-bundle-patches](../06-engineering/03-bundle-patches.md)。

---

## 商业版增强（闭源部分）

为什么有人愿意花钱买而不自己做？商业版 [U-Hermes 马盘](https://u-hermes.org) 提供：

- ✅ **预装 API 额度**：买盘送虾盘云 ¥30 起步额度（不用自己注册一堆 API）
- ✅ **激活码系统**：基于 USB 硬件指纹，防伪 + 防丢用户体验
- ✅ **自动配国产 Provider**：开盘即用，不用手填 .env
- ✅ **图形配置面板**：不用编辑 YAML
- ✅ **中文界面 + 中文报错**

这些是**产品化**功能，不是技术挑战。开源版做完前述步骤就能跑，但 UX 没那么"友好"。

---

## 如果你想自己做同类产品

**完全可以**。本教程的所有公开方法（[06-engineering/](../06-engineering/)）足够你复现。建议：

1. 从开源 Linux Live 版起步（没有打包成本）
2. 想做 Windows 便携？跟 [06-engineering/01-portable-packaging](../06-engineering/01-portable-packaging.md)
3. 想做 Electron GUI？跟 [06-engineering/02-electron-launcher](../06-engineering/02-electron-launcher.md)
4. 想做激活码系统？这部分本教程不讲（涉及商业秘密），自己设计或借鉴成熟方案

---

## 下载 / 购买

- **开源 Linux 版**：[github.com/dongsheng123132/u-hermes](https://github.com/dongsheng123132/u-hermes)
- **商业 Windows 便携版**：
  - 官网：[u-hermes.org](https://u-hermes.org)
  - 淘宝 / 拼多多 / 抖音店铺，搜 "U-Hermes 马盘"
  - 价格 ¥199 起

---

## 工程感想

做这个产品最大的工程挑战不是技术，是**让用户"无脑"**。每一处 UX 友好都需要 100 倍工程功夫：

- 自动检测端口冲突 → 30 行代码
- 兼容老 Windows（Win 10 1809）→ 需要专门下载 VC++ Redistributable
- U 盘热插拔保护 → flush 文件系统、清进程
- 中文路径乱码 → PYTHONIOENCODING + chcp 65001 + 还要 BOM

这就是为什么"工程化的 Agent"是 2026 年新机会：上游 hermes-agent v0.11.0 已经很强，但**让大众能用**仍是巨大空白。

---

**完成 05-cases** → [06-engineering/](../06-engineering/) 看深度工程方法

---

> 💡 注：本章"商业版" / "马盘" 用语属于作者本人产品的描述。本教程主体内容讲的是**通用 hermes-agent 知识**，不是 U-Hermes 产品手册。U-Hermes 是作为"如何把开源框架做成产品"的案例研究出现的。
