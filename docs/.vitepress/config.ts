import { defineConfig } from 'vitepress'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// 自动生成 UI 组件侧边栏
const uiComponents = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio',
  'attachment', 'avatar', 'badge', 'breadcrumb', 'bubble',
  'button', 'button-group', 'calendar', 'card',
  'carousel', 'chart', 'checkbox', 'collapsible',
  'combobox', 'command', 'context-menu', 'dialog',
  'drawer', 'dropdown-menu', 'empty', 'field',
  'form', 'hover-card', 'input', 'input-group',
  'input-otp', 'item', 'kbd', 'label',
  'marker', 'menubar', 'message', 'message-scroller',
  'native-select', 'navigation-menu', 'number-field',
  'pagination', 'pin-input', 'popover', 'progress',
  'questionnaire', 'radio-group', 'range-calendar', 'resizable', 'scroll-area',
  'select', 'separator', 'sheet', 'sidebar',
  'skeleton', 'slider', 'sonner', 'spinner',
  'stepper', 'switch', 'table', 'tabs',
  'tags-input', 'textarea', 'toggle', 'toggle-group',
  'tooltip',
]

function capitalize(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'RionStudio',
  description: 'RionStudio UI - Vue 3 组件库：业务组件 npm 包 + UI 组件 Registry 源码分发',
  lang: 'zh-CN',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: { light: '', dark: '' },

    nav: [
      { text: '首页', link: '/' },
      { text: 'UI 组件', link: '/components/button' },
      { text: '业务组件', link: '/business/basetable' },
      { text: '🎨 主题预览', link: '/playground' },
    ],

    sidebar: {
      '/components/': [
        {
          text: `UI 组件 (${uiComponents.length})`,
          items: uiComponents.map(name => ({
            text: capitalize(name),
            link: `/components/${name}`,
          })),
        },
      ],
      '/business/': [
        {
          text: '业务组件',
          items: [
            { text: 'BaseTable', link: '/business/basetable' },
            { text: 'BaseEdit', link: '/business/baseedit' },
            { text: 'BasePagination', link: '/business/basepagination' },
            { text: 'EditDialog', link: '/business/editdialog' },
            { text: 'ImportDialog', link: '/business/importdialog' },
            { text: 'GlobalSearch', link: '/business/globalsearch' },
            { text: 'ComboboxField', link: '/business/comboboxfield' },
            { text: 'MarkDown', link: '/business/markdown' },
            { text: 'TrendChart', link: '/business/trendchart' },
            { text: 'BlurText', link: '/business/blurtext' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mffeiron-ai/vue-base-components' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'RionStudio · 基于 reka-ui + Tailwind CSS 构建',
      copyright: '© 2026 RionStudio · MIT License',
    },
  },

  vite: {
    plugins: [
      tailwindcss() as any,
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../src'),
      },
    },
  },
})
