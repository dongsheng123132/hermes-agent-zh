import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '📖 前言',
      collapsed: false,
      items: [
        '00-preface/01-who-is-this-for',
        '00-preface/02-why-hermes',
        '00-preface/03-how-to-read',
        '00-preface/04-7day-plan',
      ],
    },
    {
      type: 'category',
      label: '🟢 入门（3 分钟到 3 小时）',
      collapsed: false,
      items: [
        '01-basics/01-what-is-hermes',
        '01-basics/02-3min-quickstart',
        '01-basics/03-first-conversation',
      ],
    },
    {
      type: 'category',
      label: '💻 安装（你的系统）',
      items: [
        '02-installation/01-linux-native',
        '02-installation/02-macos-native',
        '02-installation/03-windows-wsl',
        '02-installation/04-cloud-server',
      ],
    },
    {
      type: 'category',
      label: '⚙️ 核心功能',
      items: [
        '03-core-features/01-skills-system',
        '03-core-features/02-memory-and-context',
        '03-core-features/03-mcp-protocol',
        '03-core-features/04-cron-and-scheduling',
        '03-core-features/05-multi-agent',
      ],
    },
    {
      type: 'category',
      label: '🔌 AI 服务商',
      items: [
        '04-providers/01-openai-anthropic',
        '04-providers/02-domestic-providers',
        '04-providers/03-ollama-local',
        '04-providers/04-openrouter-aggregator',
      ],
    },
    {
      type: 'category',
      label: '🚀 实战案例',
      collapsed: false,
      items: [
        '05-cases/01-coding-workflow',
        '05-cases/02-office-automation',
        '05-cases/03-enterprise-im',
        '05-cases/04-team-deployment',
        '05-cases/05-portable-usb',
        '05-cases/06-solo-entrepreneur',
      ],
    },
    {
      type: 'category',
      label: '🔧 工程进阶（产品化）',
      items: [
        '06-engineering/01-portable-packaging',
        '06-engineering/02-electron-launcher',
        '06-engineering/03-bundle-patches',
        '06-engineering/04-provider-template',
      ],
    },
    {
      type: 'category',
      label: '🆘 排错',
      items: [
        '07-troubleshooting/01-install-failures',
        '07-troubleshooting/02-network-issues',
        '07-troubleshooting/03-faq',
      ],
    },
    {
      type: 'category',
      label: '📎 附录',
      items: [
        '99-appendix/01-cli-reference',
        '99-appendix/02-config-templates',
        '99-appendix/03-glossary',
        '99-appendix/04-resources',
      ],
    },
  ],
};

export default sidebars;
