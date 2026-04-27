import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'hermes-agent 中文教程',
  tagline: '让"马"替你 24 小时写代码 · 零基础玩转 hermes-agent',
  favicon: 'img/favicon.ico',

  url: 'https://dongsheng123132.github.io',
  baseUrl: '/hermes-agent-zh/',

  organizationName: 'dongsheng123132',
  projectName: 'hermes-agent-zh',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/dongsheng123132/hermes-agent-zh/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        gtag: undefined, // 后续接 GA 时填
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    metadata: [
      { name: 'keywords', content: 'hermes-agent,hermes,AI Agent,AI编程助手,U-Hermes,马盘,中文教程,自托管,Claude Code 替代' },
      { name: 'description', content: 'hermes-agent 中文教程 · 零基础玩转 · 让"马"替你 24 小时写代码 · 38 章 14 万字 · 配套实体书即将出版' },
    ],
    navbar: {
      title: '🐎 hermes-agent 中文教程',
      logo: {
        alt: 'hermes',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '教程',
        },
        { to: '/00-preface/04-7day-plan', label: '7天速成', position: 'left' },
        { to: '/05-cases/06-solo-entrepreneur', label: '⭐超级个体', position: 'left' },
        { to: '/06-engineering/01-portable-packaging', label: '工程进阶', position: 'left' },
        {
          href: 'https://u-hermes.org',
          label: '🐎 U-Hermes 马盘',
          position: 'right',
        },
        {
          href: 'https://github.com/dongsheng123132/hermes-agent-zh',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '教程',
          items: [
            { label: '前言', to: '/00-preface/01-who-is-this-for' },
            { label: '入门', to: '/01-basics/02-3min-quickstart' },
            { label: '安装', to: '/02-installation/01-linux-native' },
            { label: '核心功能', to: '/03-core-features/01-skills-system' },
          ],
        },
        {
          title: '案例',
          items: [
            { label: '编程工作流', to: '/05-cases/01-coding-workflow' },
            { label: '办公自动化', to: '/05-cases/02-office-automation' },
            { label: '便携 USB', to: '/05-cases/05-portable-usb' },
            { label: '⭐ 超级个体', to: '/05-cases/06-solo-entrepreneur' },
          ],
        },
        {
          title: '相关',
          items: [
            { label: 'U-Hermes 马盘', href: 'https://u-hermes.org' },
            { label: 'U-Claw 虾盘', href: 'https://u-claw.org' },
            { label: 'hermes-agent 上游', href: 'https://github.com/NousResearch/hermes-agent' },
            { label: 'GitHub', href: 'https://github.com/dongsheng123132/hermes-agent-zh' },
          ],
        },
        {
          title: '联系',
          items: [
            { label: '邮箱: hefangsheng@gmail.com', href: 'mailto:hefangsheng@gmail.com' },
            { label: '微信: hecare888', href: '#' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 何方升. 代码 MIT, 文字 CC BY-NC-ND 4.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'toml', 'powershell', 'docker'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    algolia: undefined, // 后续接搜索时填
  },
};

export default config;
