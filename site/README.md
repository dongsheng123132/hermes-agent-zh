# 教程站点（Docusaurus）

这是 hermes-agent-zh 教程的 Docusaurus 静态站点配置。

## 本地预览

```bash
cd site
npm install         # 第一次跑
npm run start       # 启动开发服务器
# 访问 http://localhost:3000/hermes-agent-zh/
```

## 构建

```bash
npm run build
# 产物在 site/build/
```

## 部署到 GitHub Pages

GitHub Actions 自动部署（见 `.github/workflows/deploy-pages.yml`）。每次 push 到 main 分支，自动构建并发布到 https://dongsheng123132.github.io/hermes-agent-zh/。

手动部署：

```bash
GIT_USER=dongsheng123132 npm run deploy
```

## 自定义域名（可选）

将来如果想用 `tutorial.u-hermes.org` 这种自定义域名：

1. 在 `site/static/CNAME` 写入域名
2. 在 DNS 加 CNAME 记录指向 `dongsheng123132.github.io`

## 章节路径

教程章节内容在 `../docs/`，本站点不复制内容，直接通过 `path: '../docs'` 引用。

修改章节直接改 `docs/` 下的 .md 文件，不要改 `site/`。
