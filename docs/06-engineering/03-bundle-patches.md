# 06-3 Bundle Patches：让 hermes-web-ui 跑在便携模式

> 这一章讲：上游 hermes-web-ui 默认是"系统安装"模式。便携模式必须 patch。这是产品化最容易踩坑的部分。

---

## 问题

`hermes-web-ui` 是社区写的 Web 界面，默认假设：

```javascript
// 上游代码（伪）
const HOME = os.homedir() + '/.hermes';   // 读用户主目录
const config = readJson(HOME + '/config.json');

// 检测 gateway 是否运行
const pid = readPidFile('/tmp/hermes.pid');
if (!processExists(pid)) {
  showWarning('Gateway 未运行，请先启动');
}

// 启动 gateway
spawn('hermes', ['gateway', 'run']);   // 假设 hermes 在 PATH
```

便携模式下这些**全部错**：

- ❌ 没 `~/.hermes`（数据在便携目录）
- ❌ 没 `/tmp/hermes.pid`（多机共用 PID 检测会乱）
- ❌ 没 `hermes` 在 PATH（要用便携 Python）

---

## 思路：字符串替换

`hermes-web-ui` 是 webpack bundle 后的 .js 文件。我们**不 fork 上游**，只在打包时**字符串替换**：

```javascript
// 替换前（上游）
const HOME = os.homedir() + '/.hermes';

// 替换后（便携）
const HOME = process.env.HERMES_HOME;
```

这种 patch 维护成本最低。

---

## 实战：9 个 patches

下面是基于 hermes-web-ui v0.4.x 的 9 个关键 patch（所有都是字符串替换）。

> 注：以下示例是**通用工程方法论**，具体 patch 字符串会随上游版本变化。本仓库（hermes-agent-zh）的 patch 不含任何商业版（U-Hermes Pro）的特定逻辑。

### Patch 1: 数据目录

```diff
- const HOME = os.homedir() + '/.hermes';
+ const HOME = process.env.HERMES_HOME || (os.homedir() + '/.hermes');
```

### Patch 2: 配置文件路径

```diff
- const CONFIG_PATH = HOME + '/config.json';
+ const CONFIG_PATH = process.env.HERMES_CONFIG_PATH || (HOME + '/config.json');
```

### Patch 3: PID 文件位置

```diff
- const PID_FILE = '/tmp/hermes.pid';
+ const PID_FILE = path.join(HOME, 'gateway.pid');
```

### Patch 4: gateway 二进制路径

```diff
- spawn('hermes', ['gateway', 'run'])
+ spawn(process.env.HERMES_BIN || 'hermes', ['gateway', 'run'])
```

### Patch 5: 端口检测

```diff
- if (port !== 8642) showWarning('非默认端口');
+ if (port !== 8642 && !process.env.HERMES_ALLOW_CUSTOM_PORT) showWarning('非默认端口');
```

### Patch 6: 屏蔽"升级到 0.5"提示

便携 USB 不应该提示用户升级（升级动了文件用户没权限）：

```diff
- showUpdateNotification(latestVersion);
+ if (!process.env.HERMES_PORTABLE_MODE) showUpdateNotification(latestVersion);
```

### Patch 7: 健康检查 endpoint

便携模式下 hermes 端口可能不是 8642（被占用时随机）：

```diff
- fetch('http://127.0.0.1:8642/health')
+ fetch(`http://127.0.0.1:${process.env.HERMES_PORT || 8642}/health`)
```

### Patch 8: WebSocket 连接

```diff
- new WebSocket('ws://127.0.0.1:8642/ws')
+ new WebSocket(`ws://127.0.0.1:${process.env.HERMES_PORT || 8642}/ws`)
```

### Patch 9: 启动检查

```diff
- if (!isHermesInstalled()) showInstallGuide();
+ if (!isHermesInstalled() && !process.env.HERMES_PORTABLE_MODE) showInstallGuide();
```

---

## 实现：build-portable.mjs

```javascript
#!/usr/bin/env node
// 把 hermes-web-ui 打包到便携目录，并应用 9 个 patches
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = 'node_modules/hermes-web-ui/dist';
const DST = 'portable/app/hermes-web-ui';

const PATCHES = [
  {
    file: 'server/index.js',
    find: `os.homedir() + '/.hermes'`,
    replace: `process.env.HERMES_HOME || (os.homedir() + '/.hermes')`,
    label: 'patch 1: data dir',
  },
  {
    file: 'server/index.js',
    find: `'/tmp/hermes.pid'`,
    replace: `path.join(HOME, 'gateway.pid')`,
    label: 'patch 3: pid file',
  },
  // ... 更多 patches
];

async function applyPatch(filePath, patch) {
  const content = await readFile(filePath, 'utf-8');
  if (!content.includes(patch.find)) {
    console.warn(`[patch] ⚠ ${patch.label}: 未匹配到 "${patch.find.substring(0, 50)}..."`);
    console.warn(`[patch]   可能上游版本变了，需要更新 patch 字符串`);
    return false;
  }
  const patched = content.replace(patch.find, patch.replace);
  await writeFile(filePath, patched);
  console.log(`[patch] ✓ ${patch.label}`);
  return true;
}

async function main() {
  // 1. 复制
  await mkdir(DST, { recursive: true });
  await cp(SRC, DST, { recursive: true });
  
  // 2. 打 patches
  let okCount = 0;
  for (const p of PATCHES) {
    const ok = await applyPatch(join(DST, p.file), p);
    if (ok) okCount++;
  }
  
  console.log(`\n[patch] 应用 ${okCount}/${PATCHES.length} 个 patches`);
  
  if (okCount < PATCHES.length) {
    process.exit(1);   // 任何 patch 失败都算严重问题
  }
}

main();
```

---

## 多版本兼容

上游 0.3.x 和 0.4.x 文件结构不同：

```
0.3.x: server/lib/gateway-manager.js
0.4.x: dist/server/index.js (bundle 内联)
```

策略：

```javascript
const PATCHES_03 = [...];  // 0.3.x 专用
const PATCHES_04 = [...];  // 0.4.x 专用

async function detectVersion() {
  const pkg = JSON.parse(await readFile('node_modules/hermes-web-ui/package.json', 'utf-8'));
  return pkg.version.startsWith('0.3.') ? '03' : '04';
}

const PATCHES = (await detectVersion()) === '03' ? PATCHES_03 : PATCHES_04;
```

---

## 维护：上游升级时

`hermes-web-ui` 出 0.5.x，9 个 patch 字符串可能全部失效。维护流程：

### 1. 跑 build-portable.mjs

如果有 patch 失败：

```
[patch] ⚠ patch 3: 未匹配到 "'/tmp/hermes.pid'..."
[patch]   可能上游版本变了
```

### 2. 找替代字符串

```bash
grep "/tmp/hermes" node_modules/hermes-web-ui/dist/server/index.js
# 输出：const PID_FILE = path.join(os.tmpdir(), "hermes-gateway.pid");
```

上游改了变量名。更新 patch：

```javascript
{
  find: `path.join(os.tmpdir(), "hermes-gateway.pid")`,
  replace: `path.join(process.env.HERMES_HOME, 'gateway.pid')`,
}
```

### 3. 测试

```bash
node build-portable.mjs
HERMES_HOME=/tmp/test ./portable/start-hermes.sh
# 验证 PID 文件落到 /tmp/test/gateway.pid
```

### 4. 提交 patch 更新

```bash
git commit -m "patch: hermes-web-ui v0.5.0 PID file path renamed"
```

---

## 替代方案：Fork 上游

如果上游变化太大，每次都 patch 太累，可以 fork：

```bash
git clone https://github.com/<上游>/hermes-web-ui my-fork
cd my-fork
# 改代码
# 发到自己的 npm 包 my-hermes-web-ui

# 在便携项目里用
npm install my-hermes-web-ui
```

**优点**：完全控制
**缺点**：
- 维护成本高（每次上游更新要 rebase）
- 可能被上游 license 限制
- 用户疑惑"为什么是 fork 不是官方"

---

## Patch 测试

每个 patch 写 minimal test：

```javascript
// tests/patch-1-data-dir.test.js
const { spawn } = require('child_process');
const fs = require('fs');

test('HERMES_HOME 环境变量被尊重', async () => {
  const tmpHome = '/tmp/hermes-test-' + Date.now();
  fs.mkdirSync(tmpHome);
  
  const proc = spawn('node', ['portable/server/index.js'], {
    env: { HERMES_HOME: tmpHome },
  });
  
  await waitForPort(8642);
  
  // 验证 hermes 真的在 tmpHome 里读写
  expect(fs.existsSync(`${tmpHome}/config.json`)).toBeTruthy();
  
  proc.kill();
});
```

---

## CI 集成

```yaml
# .github/workflows/build-portable.yml
on:
  schedule:
    - cron: "0 0 * * 0"   # 每周日检查上游新版
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: node build-portable.mjs
      - name: Test patches applied
        run: npm run test:patches
      - name: Upload portable artifact
        uses: actions/upload-artifact@v4
        with:
          name: portable-${{ github.sha }}
          path: portable/
```

每周自动检测上游新版本是否破坏 patches，提前预警。

---

## 商业版增加的 patches（不在本教程范围）

我（作者）的 [U-Hermes Pro](https://u-hermes.org) 商业版还有 3 个**附加** patch：

- 激活码门 patch（未激活时跳转到激活页）
- 虾盘云 provider 注入
- 飞书登录 SSO

**不在本教程公开**（商业秘密）。但你掌握上面 9 个公开 patch 的方法，自己写其他 patch 也是同样套路。

---

**[← 06-2 Electron](./02-electron-launcher.md)** · **[06-4 Provider 模板 →](./04-provider-template.md)**
