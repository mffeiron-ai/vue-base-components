---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Vue Base Components"
  text: "Vue 3 组件库"
  tagline: 基于 reka-ui + Tailwind CSS，开箱即用的业务组件 & UI 组件
  actions:
    - theme: brand
      text: 开始使用
      link: /components/button
    - theme: alt
      text: GitHub
      link: https://github.com/mffeiron-ai/vue-base-components

features:
  - icon: 🧩
    title: 60+ UI 组件
    details: 基于 shadcn-vue，覆盖按钮、表单、对话框、表格等常用场景，可直接复制源码自由定制。
  - icon: 🎨
    title: Tailwind CSS 样式
    details: 完全基于 Tailwind CSS，与你的项目样式体系无缝融合，无需额外 CSS 文件。
  - icon: ♿
    title: 无障碍优先
    details: 底层基于 reka-ui (Radix Vue)，提供完整的 WAI-ARIA 支持和键盘导航。
  - icon: 📦
    title: 业务组件
    details: 内置表格、编辑表单、导入导出、搜索等常用业务组件，加速后台管理系统开发。
  - icon: 🔧
    title: TypeScript 支持
    details: 完整的类型定义，IDE 智能提示全覆盖。
  - icon: 🚀
    title: 轻量按需
    details: 纯源码分发，由消费项目负责构建，Tree-shaking 友好。

---

## 快速开始

```bash
# 安装
npm install github:mffeiron-ai/vue-base-components#v1.0.0

# 或指定分支
npm install github:mffeiron-ai/vue-base-components#main
```

```vue
<script setup lang="ts">
import { Button, Dialog, BaseTable } from 'vue-base-components'
</script>

<template>
  <Button variant="default">点击我</Button>
</template>
```

## 前置依赖

你的项目需要已安装以下依赖：

- `vue` ^3.5.0
- `reka-ui` ^2.10.1
- `tailwindcss` (推荐 4.x，3.x 也可)
- `class-variance-authority` ^0.7.1
- `clsx` ^2.1.1
- `tailwind-merge` ^3.6.0
- `lucide-vue-next` ^0.525.0
- `@vueuse/core` ^13.9.0
