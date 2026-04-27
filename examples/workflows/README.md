# 工作流模板（cron + skills 组合）

5 个完整可跑的 cron 工作流模板。复制到 `~/.u-hermes/data/crons.yaml` 调整后即可使用。

| 文件 | 频率 | 用途 |
|---|---|---|
| [daily-briefing.yaml](./daily-briefing.yaml) | 工作日 8:30 | 早间简报（新闻 + 会议 + 待办） |
| [daily-report.yaml](./daily-report.yaml) | 工作日 18:00 | 日报自动生成 |
| [content-pipeline.yaml](./content-pipeline.yaml) | 周一 6:00 | 自媒体内容流水线（超级个体案例 1） |
| [auto-pr-review.yaml](./auto-pr-review.yaml) | 工作日每 2 小时 | 自动审查 PR |
| [weekly-knowledge-base.yaml](./weekly-knowledge-base.yaml) | 周日 17:00 | 知识库整理 |

## 使用方法

1. 复制本目录任一 yaml 文件
2. 合并到你的 `~/.u-hermes/data/crons.yaml`
3. 改 `chat_id` / `provider` / `model` 等配置
4. 跑 `hermes cron reload`
5. 验证：`hermes cron list`

## 依赖的 Skills

这些工作流依赖以下 Skills（在 `examples/skills/` 中）：

- `web_clip` —— 抓网页
- `pdf_summary` —— PDF 摘要
- `lark_send` —— 飞书发消息
- `image_gen` —— 生成图像
- `github_search` —— GitHub 搜索

部署所有 Skills：

```bash
cp examples/skills/*.yaml ~/.u-hermes/data/skills/
hermes skill reload
```

## 安全提醒

⚠️ 这些工作流会**自动**调用 LLM API，会产生费用：

- 简单工作流（briefing / report）：每次 ~$0.01-0.05
- 复杂工作流（content-pipeline）：每次 ~$0.10-0.30
- 高频工作流（auto-pr-review，每 2 小时）：每月 ~$5-15

建议先用 DeepSeek（最便宜）跑 1 周，看费用满意再切换更强模型。

---

**[← examples 目录](../)**
