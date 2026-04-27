import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from '../css/landing.module.css';

type Route = {
  emoji: string;
  who: string;
  to: string;
  external?: boolean;
  recommend: string;
  why: string;
  time: string;
};

const routes: Route[] = [
  {
    emoji: '🟢',
    who: '完全不想折腾的小白',
    to: 'https://u-hermes.org',
    external: true,
    recommend: 'U-Hermes 马盘（成品 U 盘）',
    why: '双击 .exe 就能用，预装 ¥30 API 额度',
    time: '0 分钟',
  },
  {
    emoji: '🟡',
    who: '想试试不花钱',
    to: '/installation/linux-native',
    recommend: 'Linux Live USB',
    why: '一根空 U 盘 + 4 个脚本',
    time: '30 分钟',
  },
  {
    emoji: '🔵',
    who: '有 Mac/Linux 终端基础',
    to: '/basics/02-3min-quickstart',
    recommend: '3 分钟快速开始',
    why: 'pipx install hermes-agent 一行装好',
    time: '3 分钟',
  },
  {
    emoji: '🟠',
    who: 'Windows 用户',
    to: '/installation/windows-wsl',
    recommend: 'WSL2 安装',
    why: '装个 Linux 子系统再走 Linux 流程',
    time: '15 分钟',
  },
  {
    emoji: '🔴',
    who: '想做产品 / 创业',
    to: '/engineering/portable-packaging',
    recommend: '工程进阶 + 超级个体',
    why: '把 hermes 打包成商业产品的全套方法',
    time: '16 小时',
  },
  {
    emoji: '🟣',
    who: '想 7 天系统学完',
    to: '/preface/04-7day-plan',
    recommend: '7 天速成路径',
    why: 'Day1-Day7 完整路线图',
    time: '1 周',
  },
  {
    emoji: '⚫',
    who: '企业团队部署',
    to: '/cases/team-deployment',
    recommend: '团队部署 + 云端部署',
    why: '内网 / 私有化 / 多人共享',
    time: '1 天',
  },
];

function RouteLink({ route }: { route: Route }) {
  if (route.external) {
    return (
      <a href={route.to} target="_blank" rel="noopener noreferrer">
        {route.recommend}
      </a>
    );
  }
  return <Link to={route.to}>{route.recommend}</Link>;
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="hermes-agent 中文教程"
      description='零基础玩转 hermes-agent · 让"马"替你 24 小时写代码 · 38 章 14 万字'
    >
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            🐎 零基础玩转 hermes-agent
          </h1>
          <p className={styles.heroSubtitle}>
            让"马"替你 24 小时写代码 · 38 章 14 万字 · 配套纸书 2026 下半年出版
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} to="/preface/who-is-this-for">
              📖 开始阅读
            </Link>
            <Link className={styles.btnSecondary} to="/basics/02-3min-quickstart">
              ⚡ 3 分钟快速开始
            </Link>
            <Link className={styles.btnSecondary} to="/preface/04-7day-plan">
              📅 7 天速成路径
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2>⚡ 30 秒选路 · 你属于哪一种？</h2>
          <div className={styles.tableWrap}>
            <table className={styles.routesTable}>
              <thead>
                <tr>
                  <th>你是谁</th>
                  <th>推荐方案</th>
                  <th>为什么</th>
                  <th>估时</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.who}>
                    <td>
                      <span className={styles.emoji}>{r.emoji}</span>
                      <strong>{r.who}</strong>
                    </td>
                    <td>
                      <RouteLink route={r} />
                    </td>
                    <td>{r.why}</td>
                    <td>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2>🎯 这本教程能帮你做到什么</h2>
          <ul className={styles.featureList}>
            <li>✅ <strong>零基础上手</strong>：只会用 ChatGPT 网页版也能自己跑起 hermes</li>
            <li>✅ <strong>5 大场景实战</strong>：编程 / 知识库 / 定时监控 / 团队部署 / 便携 USB</li>
            <li>✅ <strong>省钱省到底</strong>：DeepSeek 免费 ¥5 → Ollama 完全免费本地化</li>
            <li>✅ <strong>避坑指南</strong>：作者踩过的 30+ 个坑全部公开</li>
            <li>✅ <strong>超级个体玩法</strong>：5 个 ROI 9000%+ 的"一个人干一家公司"案例</li>
            <li>✅ <strong>办公自动化</strong>：日报/周报/邮件/会议纪要自动化</li>
            <li>✅ <strong>企业 IM 接入</strong>：飞书/钉钉/企微/Slack 多通道集成</li>
            <li>✅ <strong>工程进阶</strong>：把 hermes 打包成便携 USB 的全套方法</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>📚 章节速览</h2>
          <div className={styles.chapterGrid}>
            <Link className={styles.chapterCard} to="/preface/who-is-this-for">
              <h3>序章 · 前言</h3>
              <p>这本教程写给谁 / 为什么学 hermes / 怎么读 / 7 天速成</p>
            </Link>
            <Link className={styles.chapterCard} to="/basics/what-is-hermes">
              <h3>第 1 部 · 入门</h3>
              <p>3 分钟到 3 小时跑起来你的第一只"马"</p>
            </Link>
            <Link className={styles.chapterCard} to="/installation/linux-native">
              <h3>第 2 部 · 安装</h3>
              <p>Linux 原生 / Mac / Windows WSL / 云服务器</p>
            </Link>
            <Link className={styles.chapterCard} to="/core-features/skills-system">
              <h3>第 3 部 · 核心功能</h3>
              <p>Skills / Memory / MCP / Cron —— 区别 Claude Code 的关键</p>
            </Link>
            <Link className={styles.chapterCard} to="/cases/coding-workflow">
              <h3>第 5 部 · 案例</h3>
              <p>编程 / 办公 / 团队 / 便携 USB / ⭐ 超级个体</p>
            </Link>
            <Link className={styles.chapterCard} to="/engineering/portable-packaging">
              <h3>第 6 部 · 工程进阶</h3>
              <p>把 hermes 打包成商业产品的全套方法论</p>
            </Link>
          </div>
        </section>

        <section className={styles.callout}>
          <h2>📖 配套纸质书已在路上</h2>
          <p>
            <strong>《零基础玩转 hermes-agent：让"马"替你 24 小时写代码》</strong>（暂名）
            ——即将由出版社出版（2026 下半年）。在本 GitHub 教程基础上"全面重写 + 逐条验证"，
            新增 120 条 CLI 命令、8 套配置模板、5 大场景案例、安全防护清单。
          </p>
          <p>
            📧 <strong>预约订阅</strong>：发邮件至{' '}
            <a href="mailto:hefangsheng@gmail.com">hefangsheng@gmail.com</a>
            ，纸书发售第一时间通知。
          </p>
        </section>
      </main>
    </Layout>
  );
}
