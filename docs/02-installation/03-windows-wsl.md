# 02-3 Windows + WSL 安装

> 这一章讲：在 Windows 11 上通过 WSL2（Windows Subsystem for Linux）跑 hermes。
>
> 适合：Windows 用户但能接受装一个"虚拟 Linux 子系统"。
>
> **不适合**：完全不想碰 Linux 终端的纯 Windows 用户 —— 那个场景看 [05-cases/05-portable-usb](../05-cases/05-portable-usb.md)（即装即用的 U-Hermes 马盘）。

---

## 为什么不直接 Windows 原生

hermes-agent 是 Python 项目，**Windows 原生支持不如 Linux 完善**：

- 部分依赖（如 `uvloop`）在 Windows 上没预编译 wheel
- shell 工具调用兼容性差（Windows cmd / PowerShell 与 Unix bash 差异大）
- 路径分隔符（`\` vs `/`）经常出 bug

**用 WSL2 = 在 Windows 里跑一个完整 Ubuntu**，所有 Linux 教程直接复用。

---

## 1. 装 WSL2

PowerShell（管理员）：

```powershell
wsl --install -d Ubuntu-24.04
```

重启电脑后，自动启动 Ubuntu 终端，让你创建用户名密码。

> 💡 如果命令报错，先升级 Windows 11 到最新版本，并在 BIOS 启用虚拟化（VT-x / AMD-V）。

---

## 2. 进 Ubuntu 子系统

```powershell
wsl
```

或开始菜单搜 "Ubuntu" 直接启动。

进入后跑：

```bash
sudo apt update
sudo apt install -y python3 python3-venv pipx curl git
pipx ensurepath
```

---

## 3. 装 hermes（同 Linux 章节）

```bash
pipx install hermes-agent
```

清华镜像：

```bash
pipx install --pip-args="-i https://pypi.tuna.tsinghua.edu.cn/simple" hermes-agent
```

---

## 4. 配 .env

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

---

## 5. 启动

```bash
HERMES_HOME=~/.u-hermes/data hermes gateway run
```

---

## Windows 主机访问 WSL 服务

WSL2 的 `127.0.0.1:8642` 在 Windows 浏览器里是**直接可访问的**（Windows 11 自动做端口转发）。

打开 `http://localhost:8642`，应该能看到 hermes 响应。

如果不行：

```powershell
# PowerShell 管理员
netsh interface portproxy add v4tov4 listenport=8642 listenaddress=0.0.0.0 connectport=8642 connectaddress=$(wsl hostname -I).Trim()
```

---

## Windows 文件 vs WSL 文件

WSL 默认挂载 Windows 盘到 `/mnt/c/`：

```bash
ls /mnt/c/Users/YourName/Desktop/   # 你的 Windows 桌面
```

> ⚠️ 跨文件系统访问慢。**hermes 数据放 WSL 内部**（`~/.u-hermes/`），不要放 `/mnt/c/`。

---

## 常见坑

### `pipx ensurepath` 后 hermes 还是找不到

```bash
echo $PATH | grep -o '\.local/bin'
# 如果没输出，手动加
echo 'export PATH=$HOME/.local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### WSL 启动慢

第一次启动 WSL2 慢正常（~10 秒）。后续 < 2 秒。可以让它常驻：

```powershell
wsl --set-default Ubuntu-24.04
```

### 时间不同步

WSL 偶尔时钟漂移。

```bash
sudo hwclock --hctosys
```

---

## 想免折腾？

WSL 还是有学习成本的。如果你**完全不想碰命令行**，看 [05-cases/05-portable-usb](../05-cases/05-portable-usb.md)：作者本人做的 [U-Hermes 马盘](https://u-hermes.org) 是"插上 U 盘双击 .exe 就能用"的方案，跳过所有 WSL 配置。

---

**下一章**：[02-4 云端部署](./04-cloud-server.md)
