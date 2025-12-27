// @ts-check
// `@type` JSDoc annotations allow IDEs and type checkers to infer types
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'A Comprehensive Guide to Physical AI & Humanoid Robotics',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-username.github.io', // This will be updated for GitHub Pages
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub Pages, this is usually '/<project-name>/'
  baseUrl: '/humanoid-robotics-book/',

  // GitHub pages deployment config.
  organizationName: 'ibrahimgem', // Usually your GitHub username
  projectName: 'humanoid-robotics-book', // The name of your repository
  deploymentBranch: 'gh-pages', // Branch that GitHub Pages will deploy from
  trailingSlash: false, // Set to false for cleaner URLs

  onBrokenLinks: 'warn',
  markdown: {
    mermaid: true,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ibrahimgem/humanoid-robotics-book/edit/main/',
        },
        blog: false, // Optional: disable the blog plugin
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  // Proxy API requests to backend server during development
  plugins: [
    function (context, options) {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer, utils) {
          if (!isServer) {
            return {
              devServer: {
                proxy: [
                  {
                    context: ['/api'],
                    target: 'http://localhost:8000',
                    changeOrigin: true,
                    secure: false,
                  },
                ],
              },
            };
          }
          return {};
        },
      };
    },
  ],

  themes: [
    '@docusaurus/theme-mermaid',
  ],

  clientModules: [
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      // Color mode configuration
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      // Announcement bar (optional - remove if not needed)
      // announcementBar: {
      //   id: 'announcement',
      //   content: 'New content available! Check out our latest chapters on AI integration.',
      //   backgroundColor: '#2563eb',
      //   textColor: '#ffffff',
      //   isCloseable: true,
      // },
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Robotics Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo.svg',
          width: 32,
          height: 32,
        },
        hideOnScroll: false,
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Book',
          },
          {
            type: 'search',
            position: 'right',
          },
          {
            href: 'https://github.com/ibrahimgem/humanoid-robotics-book',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/introduction',
              },
              {
                label: 'ROS 2',
                to: '/docs/ros2',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ibrahimgem/humanoid-robotics-book',
              },
              {
                label: 'RAG AI Chatbot',
                to: '/',
              },
              {
                label: 'Physical AI Course',
                href: 'https://github.com/ibrahimgem',
              },
              {
                label: 'Humanoid Robotics Modules',
                to: '/docs/introduction',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['python', 'yaml', 'bash', 'json', 'javascript', 'jsx', 'tsx', 'typescript'],
      },
      // Table of contents configuration
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      // Documentation sidebar configuration
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      // Metadata
      metadata: [
        {name: 'keywords', content: 'robotics, humanoid, ROS 2, physical AI, robot simulation, Isaac Sim'},
        {name: 'author', content: 'Humanoid Robotics Book Team'},
      ],
    }),
};

module.exports = config;