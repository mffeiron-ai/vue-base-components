# 快速开始

安装并使用 **RionStudio**。

## 安装 CLI

```bash
npm install -g @rionstudio/cli
# 或直接使用 npx
npx rionstudio
```

## 初始化

```bash
npx rionstudio init
```

`init` 会生成 `components.json`、`cn()` 工具和 Tailwind 主题。

## 添加 UI 组件（源码复制）

```bash
npx rionstudio add button dialog dropdown-menu
```

组件源码会复制到 `src/components/ui/`，**完全属于你**，可自由修改。

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
</script>

<template>
  <Button variant="default">点击我</Button>
</template>
```

## 安装业务组件（npm 包）

```bash
npm install @rionstudio/ui
```

```vue
<script setup lang="ts">
import { BaseTable } from '@rionstudio/ui'
</script>
```

## 前置依赖

你的项目需要已安装以下依赖（`npx rionstudio init` 会自动安装）：

- `vue` ^3.5.0
- `reka-ui` ^2.10.1
- `tailwindcss` (推荐 4.x)
- `class-variance-authority` ^0.7.1
- `clsx` ^2.1.1
- `tailwind-merge` ^3.6.0
- `lucide-vue-next` ^0.525.0
- `@vueuse/core` ^13.9.0
