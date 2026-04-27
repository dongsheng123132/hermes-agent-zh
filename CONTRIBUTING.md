# 贡献指南

感谢你愿意帮助改进本教程！本仓库欢迎以下类型的贡献：

- 🐛 **错别字 / 技术错误修正**
- 📝 **章节内容补充**（FAQ、踩坑案例、新版本适配）
- 💻 **代码示例**（新的 Skill、配置模板、工作流）
- 🌍 **小段翻译/术语对照**

---

## 提交前必读：禁区清单 ⚠️

**本教程作者维护一个商业版闭源仓库 `u-hermes-pro`。出于商业秘密保护，下列内容绝不能进入本仓库或本教程**：

### 第一层：常量 / 秘密
- ❌ ED25519 dealer 公钥（开头是 `pumzj...` 的 base64 字符串）
- ❌ `uclaw2026activate` 字符串（任何形式）
- ❌ 字符串 `xiapanyun`（这是商业版的 provider ID）
- ❌ 虾盘云 API 端点 `api.u-claw.org` 和 `api.u-claw.org.cn` 的激活路径
- ❌ USB 指纹算法（`SHA256(model:serialNumber:pnpDeviceId)` 的具体哈希拼接顺序）

### 第二层：逻辑 / 算法
- ❌ "把硬件指纹换成 sk-xxx API key" 的转换流程
- ❌ ED25519 签名验证 license 的代码
- ❌ "未激活弹窗" 的 UX 流程
- ❌ 虾盘云双节点双写激活的网络逻辑

### 第三层：来源
不要直接复制以下文件的内容（即使去掉常量也不行，因为它们的整体逻辑就是禁区）：
- `u-hermes-pro/shared/src/license/` 全部
- `u-hermes-pro/shared/src/uclaw-cloud/` 全部
- `u-hermes-pro/launcher/electron/main.js` 中的 license 检查段
- `u-hermes-pro/launcher/electron/ipc-handlers.js` 中的激活相关 IPC

### 自动化检查

本仓库 `.gitleaks.toml` 配置了 CI 强制扫描。如果你的 PR 包含上述任何字符串，CI 会失败。

---

## PR 提交检查清单

提交 PR 前请确认：

- [ ] 我**没有**复制 `u-hermes-pro` 目录里 `shared/src/license/`、`shared/src/uclaw-cloud/` 的代码
- [ ] 我**没有**包含 `pumzj`、`uclaw2026activate`、`xiapanyun` 等字符串
- [ ] 如果我修改了文档（`docs/*.md`），我了解这部分内容采用 CC BY-NC-ND 4.0 许可
- [ ] 如果我新增了代码片段（`examples/`、文档代码块），我了解这部分采用 MIT 许可
- [ ] 我的修改和 hermes-agent v0.11.0（本教程目标版本）兼容，或我已在 PR 描述中标注"需要 v0.X 以上"

---

## 文档写作风格

参考已有章节的写作风格：

1. **每章开头**：用 1-2 句话明确"这章讲什么 / 谁该读"
2. **代码示例**：所有命令都加 `# 注释`，所有配置都加 `# 解释`
3. **图片**：放 `assets/` 对应子目录；mermaid 源码与渲染图同时保留
4. **链接**：内部链接用相对路径（`./02-installation/01-linux-native.md`），外部链接用完整 URL
5. **避免装腔作势**：直接讲事实，不要 "众所周知" / "毋庸置疑" / "显而易见"
6. **代码块加语言标记**：` ```bash `、` ```python `、` ```yaml ` 等

---

## 本地预览（如启用 Docusaurus 后）

```bash
cd site
npm install
npm run dev
# 访问 http://localhost:3000
```

如果还没启用 Docusaurus，直接在 GitHub 页面阅读 Markdown 即可。

---

## 提问 / 讨论

- 报 Bug 或建议：开 [Issue](https://github.com/dongsheng123132/hermes-agent-zh/issues)
- 商业合作：邮件 `hefangsheng@gmail.com`

谢谢！
