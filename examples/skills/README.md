# Skills 模板（直接拿走改改就能用）

5 个完整可跑的自定义 Skill 模板。

| 文件 | 用途 | 依赖 |
|---|---|---|
| [web_clip.yaml](./web_clip.yaml) | 抓网页存为 markdown | python-readability + html2text |
| [pdf_summary.yaml](./pdf_summary.yaml) | PDF 文档摘要 | poppler-utils 或 PyPDF2 |
| [lark_send.yaml](./lark_send.yaml) | 飞书发消息 | LARK_APP_ID / LARK_APP_SECRET |
| [image_gen.yaml](./image_gen.yaml) | 生成图像 | OPENAI_API_KEY 或 DASHSCOPE_API_KEY |
| [github_search.yaml](./github_search.yaml) | 搜你的 GitHub | GITHUB_TOKEN |

## 安装

```bash
# 单个
cp examples/skills/web_clip.yaml ~/.u-hermes/data/skills/

# 全部
cp examples/skills/*.yaml ~/.u-hermes/data/skills/

# 重载
hermes skill reload
```

## 验证

```bash
hermes chat
> /skills list
# 应该看到上面 5 个

> /skill web_clip --url https://example.com
# 直接调用测试
```

## 依赖安装

```bash
# 通用
pip install readability-lxml html2text PyPDF2

# Linux
sudo apt install poppler-utils

# Mac
brew install poppler
```

## 写自己的 Skill

模板 + 教程见 [03-1 Skills 系统](../../docs/03-core-features/01-skills-system.md)。

## License

所有 Skills 采用 MIT License（见 [LICENSE-CODE](../../LICENSE-CODE)），自由使用、修改、商用。

---

**[← examples 目录](../)**
