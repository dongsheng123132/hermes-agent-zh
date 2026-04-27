# 变更日志

## [v2.0] — 2026-04-27

公开发布。绑定自定义域名 **dev.u-hermes.org**。

**新增**：
- `site/` —— Docusaurus 3.6 完整站点配置（中文 i18n + 暗红主题 + GitHub Pages 自动部署）
- `site/static/CNAME` —— 绑 dev.u-hermes.org
- `scripts/verify-and-push.sh` —— 禁区扫描 + License 检查 + git 推送一键脚本
- `.github/workflows/deploy-pages.yml` —— GitHub Pages 自动部署
- `.github/workflows/gitleaks.yml` —— CI 强制扫描禁区字符串

## [v1.5] — 2026-04-26

完成所有占位章节，达到实体书可送审规模。

**新增章节（9 章）**：
- 03-core-features/01-skills-system
- 03-core-features/02-memory-and-context
- 03-core-features/03-mcp-protocol
- 03-core-features/04-cron-and-scheduling
- 03-core-features/05-multi-agent
- 06-engineering/01-portable-packaging
- 06-engineering/02-electron-launcher
- 06-engineering/03-bundle-patches
- 06-engineering/04-provider-template

**新增示例（13 文件）**：
- examples/skills/ × 5（web_clip / pdf_summary / lark_send / image_gen / github_search + README）
- examples/workflows/ × 5（daily-briefing / daily-report / content-pipeline / auto-pr-review / weekly-knowledge-base + README）
- examples/configs/provider-templates.json

**统计**：
- 章节完成度 100%（38/38）
- docs 字符 235k ≈ 实体书 280 页 96% 体量

## [v1.1] — 2026-04-26

对齐 AI Agent 教程畅销模式。

**新增章节**：
- 00-preface/04-7day-plan — 7 天速成日程
- 05-cases/01-coding-workflow — 编程工作流
- 05-cases/02-office-automation — 办公自动化
- 05-cases/03-enterprise-im — 企业 IM 接入（飞书/钉钉/企微/Slack）
- 05-cases/04-team-deployment — 团队私有化部署
- 05-cases/06-solo-entrepreneur — 超级个体创业 5 案例

**重写**：
- README 顶部（30 秒选路表 / 拟人化"马" / 多渠道占位 / 对标仓 vs 表）

## [v1.0-draft] — 2026-04-26

仓库初始化。

**目标版本**：
- `hermes-agent` v0.11.0
- `hermes-web-ui` v0.4.x

**初始章节**：
- 仓库骨架（README / 双 LICENSE / BRAND / CONTRIBUTING / .gitleaks.toml）
- Linux 原生安装、国产 Provider 配置、配置模板、上游资源
- 前言、零基础入门

---

## 版本对应表

| 教程版本 | hermes-agent | hermes-web-ui | 备注 |
|---|---|---|---|
| v2.0 | v0.11.0 | v0.4.x | 当前（含 DeepSeek V4 部分章节） |
| v1.5 | v0.11.0 | v0.4.x | 章节 100% 完成 |
| v1.1 | v0.11.0 | v0.4.x | 畅销模式对齐 |
| v1.0 | v0.11.0 | v0.4.x | 初始 |
