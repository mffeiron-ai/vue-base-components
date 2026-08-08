# 快速开始

安装并使用 Vue Base Components。

## 安装

```bash
# 通过 Git URL 安装（推荐）
npm install github:mffeiron-ai/vue-base-components#v1.0.0

# 或指定分支
npm install github:mffeiron-ai/vue-base-components#main
```

## 使用

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
