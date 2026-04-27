# 06-2 Electron 启动器：给便携 hermes 加个图形界面

> 这一章讲：用 Electron 包一个"双击 .exe 就能用"的启动器，让纯小白也能用 hermes。

---

## 为什么要 Electron

便携 hermes 的 `.bat` 启动有 3 个问题：

1. **黑乎乎的 cmd 窗口**：用户看不懂在干什么
2. **错误时弹一行红字就没了**：用户不知道怎么处理
3. **没有"配置 / 退出"按钮**：用户不会改设置

Electron 解决这些 = 给 hermes 一个像样的 GUI 外壳。

---

## 架构

```
用户双击 U-Hermes.exe
       ↓
Electron 主进程（main.js）
       ↓ spawn 子进程
[Python 子进程] hermes gateway run
       ↓ 监听 8642
[Electron 渲染进程] 加载 http://127.0.0.1:8642 用 BrowserWindow
       ↓
用户看到 hermes Web UI
```

Electron 的角色：
- 启动器（拉起 Python 子进程）
- 进程守护（崩溃自动重启）
- 状态显示（端口探测、初始化进度）
- 系统集成（任务栏图标、菜单、自动启动）

---

## 最小可跑实现

### 项目结构

```
launcher/
├── package.json
├── main.js          # Electron 主进程
├── preload.js       # 渲染进程 preload
├── ui/
│   ├── index.html
│   └── style.css
└── assets/
    └── icon.ico
```

### package.json

```json
{
  "name": "hermes-launcher",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --dir"
  },
  "devDependencies": {
    "electron": "^32.0.0",
    "electron-builder": "^25.0.0"
  }
}
```

### main.js（核心）

```javascript
const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const { join } = require('path');
const net = require('net');

let hermesProcess = null;
let mainWindow = null;

const ROOT = process.cwd();   // 便携目录根
const PYTHON_BIN = process.platform === 'win32'
  ? join(ROOT, 'runtime/python/python.exe')
  : join(ROOT, 'runtime/python/bin/python3');

function isPortListening(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let done = false;
    sock.setTimeout(timeout);
    sock.once('connect', () => { done = true; sock.destroy(); resolve(true); });
    sock.once('timeout', () => { if (!done) { sock.destroy(); resolve(false); } });
    sock.once('error', () => { if (!done) resolve(false); });
    sock.connect(port, host);
  });
}

async function waitForPort(port, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await isPortListening(port)) return true;
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

function startHermes() {
  console.log('[launcher] starting hermes...');
  
  hermesProcess = spawn(PYTHON_BIN, ['-m', 'hermes_agent.gateway', 'run'], {
    cwd: ROOT,
    env: {
      ...process.env,
      HERMES_HOME: join(ROOT, 'app/data'),
      PYTHONPATH: join(ROOT, 'app/hermes-agent'),
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  hermesProcess.stdout.on('data', (data) => {
    console.log('[hermes]', data.toString());
  });
  hermesProcess.stderr.on('data', (data) => {
    console.error('[hermes-err]', data.toString());
  });
  hermesProcess.on('exit', (code) => {
    console.log(`[hermes] exited ${code}`);
    hermesProcess = null;
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  // 先显示加载页
  mainWindow.loadFile('ui/loading.html');

  // 启动 hermes 子进程
  startHermes();

  // 等端口
  const ok = await waitForPort(8642, 30000);
  if (!ok) {
    dialog.showErrorBox('启动失败', 'hermes 30 秒内未就绪。请查看日志或重启。');
    app.quit();
    return;
  }

  // 加载 hermes Web UI
  mainWindow.loadURL('http://127.0.0.1:8642');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (hermesProcess) {
    console.log('[launcher] killing hermes...');
    hermesProcess.kill();
  }
  app.quit();
});

// 单实例锁（防止双击多开）
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
```

### ui/loading.html

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>U-Hermes 启动中...</title>
<style>
  body { font: 16px/1.5 sans-serif; margin: 80px; text-align: center; }
  .spinner { display: inline-block; width: 40px; height: 40px;
    border: 4px solid #ddd; border-top: 4px solid #333;
    border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style></head>
<body>
  <h1>🐎 U-Hermes</h1>
  <div class="spinner"></div>
  <p>正在启动，请稍候 30 秒...</p>
  <p>首次运行会安装依赖，约 1 分钟。</p>
</body></html>
```

---

## 端口管理

便携 USB 可能插到不同电脑，端口可能被占用。

### 自动找空闲端口

```javascript
async function findFreePort(start = 8642, end = 8742) {
  for (let port = start; port <= end; port++) {
    if (!(await isPortListening(port))) return port;
  }
  throw new Error('No free port');
}

// 使用
const PORT = await findFreePort();
hermesProcess = spawn(PYTHON_BIN, [
  '-m', 'hermes_agent.gateway', 'run',
  '--port', String(PORT),
], ...);
mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
```

---

## 子进程生命周期

### 崩溃自动重启

```javascript
hermesProcess.on('exit', (code) => {
  if (code !== 0 && app.isReady()) {
    console.log('[launcher] hermes crashed, restarting...');
    setTimeout(startHermes, 3000);
  }
});
```

### 优雅退出

Windows 上 `process.kill()` 可能不彻底。用 PID + taskkill：

```javascript
function killProcessTree(pid) {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(pid), '/f', '/t']);
  } else {
    process.kill(-pid, 'SIGTERM');   // 杀进程组
  }
}

app.on('before-quit', () => {
  if (hermesProcess) killProcessTree(hermesProcess.pid);
});
```

---

## 系统集成

### 任务栏图标

```javascript
const { Tray, Menu } = require('electron');
let tray;

app.whenReady().then(() => {
  tray = new Tray(join(__dirname, 'assets/icon.ico'));
  tray.setToolTip('U-Hermes 运行中');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开 hermes', click: () => mainWindow.show() },
    { label: '重启 hermes', click: () => { hermesProcess?.kill(); setTimeout(startHermes, 1000); } },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]));
});
```

### 关闭到托盘（不退出）

```javascript
mainWindow.on('close', (e) => {
  if (!app.isQuitting) {
    e.preventDefault();
    mainWindow.hide();
  }
});
```

---

## 打包成 .exe

### electron-builder 配置

`electron-builder.yml`：

```yaml
appId: com.dongsheng.hermes
productName: U-Hermes
directories:
  output: dist
win:
  target:
    - target: portable
      arch: x64
  icon: assets/icon.ico
files:
  - main.js
  - preload.js
  - ui/**
  - assets/**
extraResources:
  - from: ../runtime
    to: runtime
  - from: ../packages
    to: packages
```

### 打包

```bash
cd launcher
npm install
npm run build
# 产物: dist/U-Hermes.exe (大约 80 MB Electron 自身 + runtime + packages 总共 ~1 GB)
```

---

## 减小体积

Electron 默认 80 MB+。优化：

### 1. 去掉 devtools

```yaml
asarUnpack:
  - "node_modules/electron/**"
files:
  - "!**/*.{md,map,ts}"
```

### 2. 用 Electron 替代品

- [Tauri](https://tauri.app/) —— Rust + 系统 WebView，10 MB
- [Wails](https://wails.io/) —— Go + 系统 WebView，10 MB

但 Electron 兼容性最好，新手别折腾。

---

## 调试

### 开发模式

```bash
npm run start
# Electron 窗口 + DevTools (F12)
```

### 日志

把 Electron 日志写文件：

```javascript
const log = require('electron-log');
log.transports.file.resolvePathFn = () => join(ROOT, 'app/data/logs/launcher.log');

console.log = log.log;
console.error = log.error;
```

用户报错时让他发 `app/data/logs/launcher.log`。

---

## 安全注意

⚠️ Electron 是个完整的 Chromium，安全风险大：

- ✅ `contextIsolation: true`（默认）
- ✅ `nodeIntegration: false`（默认）
- ✅ 不要在渲染进程加载远程网页（XSS 风险）
- ✅ 用 preload 暴露最小 API
- ✅ 验证 hermes API 来自本机（不允许远程）

---

## 商业版增强

我（作者）的 [U-Hermes 商业版](https://u-hermes.org) 在以上基础上加了：

- 激活码验证（绑定 USB 硬件指纹）
- 在线更新（增量下载新版本）
- 飞书 / 微信扫码登录
- 配置面板（图形化改 .env / config.yaml）
- 销售支持窗口（弹出帮助 + 客服微信）

这些不在本教程公开范围（商业版闭源），但你可以基于本章方法**自己设计**类似功能。

---

**[← 06-1 便携打包](./01-portable-packaging.md)** · **[06-3 Bundle Patches →](./03-bundle-patches.md)**
