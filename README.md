# vue-base-components

Vue 3 + Tailwind CSS + shadcn-vue 共享组件库，为多个项目提供统一的业务组件和 UI 组件。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5+ (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4.x |
| UI 基础 | reka-ui 2.x (shadcn-vue) |
| 构建 | Vite（由消费项目负责打包） |

## 安装

```bash
# 通过 Git URL 安装（推荐）
npm install github:your-username/vue-base-components#v1.0.0

# 或指定分支
npm install github:your-username/vue-base-components#main
```

## 使用

```vue
<script setup lang="ts">
// 业务组件
import { BaseTable, ImportDialog, BaseEdit } from 'vue-base-components'
// 或 shadcn UI 组件
import { Button, Dialog, Input } from 'vue-base-components'
// 工具函数
import { cn } from 'vue-base-components'
</script>
```

## 组件清单

### 业务组件（9 个）

| 组件 | 说明 |
|------|------|
| `BaseTable` | 通用表格（排序/分页/列显示/行详情侧滑） |
| `BaseEdit` | 通用编辑表单（动态字段/图片上传/轮播图） |
| `BasePagination` | 通用分页 |
| `EditDialog` | 编辑弹窗 |
| `ImportDialog` | 导入弹窗（Excel 上传预览） |
| `GlobalSearch` | 全局搜索 |
| `ComboboxField` | 组合搜索下拉框 |
| `MarkDown` | Markdown 编辑器/预览 |
| `TrendChart` | ECharts 趋势图 |

### shadcn-vue UI 组件（65 个）

全部 shadcn-vue 组件，详见 `src/components/ui/` 目录。

## 消费项目需要满足的条件

### 1. 必须安装的依赖

```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "reka-ui": "^2.10.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.3.0",
    "@vueuse/core": "^13.0.0",
    "lucide-vue-next": "^0.525.0"
  }
}
```

### 2. Tailwind CSS 配置

项目 `style.css` 需要包含 shadcn-vue 的 CSS 变量：

```css
@import "tailwindcss";

/* 这些变量是 shadcn 组件正常运行的前提 */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0.042 265.755);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.965 0.001 286.375);
  --secondary-foreground: oklch(0.205 0.042 265.755);
  --muted: oklch(0.965 0.001 286.375);
  --muted-foreground: oklch(0.556 0.019 286.329);
  --accent: oklch(0.965 0.001 286.375);
  --accent-foreground: oklch(0.205 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0.004 286.328);
  --input: oklch(0.922 0.004 286.328);
  --ring: oklch(0.708 0.02 286.355);
  --radius: 0.625rem;
  /* ... 其余变量请从 shadcn-vue 初始化项目中复制 */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### 3. BaseEdit 组件需要额外提供

`BaseEdit` 组件依赖以下项目特定的模块，消费项目需要自行实现：

```
src/api/request.ts        → export function uploadImageApi(...)
src/stores/authStore.ts   → export const useAuthStore
src/stores/editStore.ts   → export const useEditStore
```

如果不需要 `BaseEdit`，可忽略此项。

### 4. 可选依赖（按需安装）

某些组件使用了以下库，不使用对应组件则无需安装：

| 组件 | 需要的包 | 可选标记 |
|------|----------|----------|
| `BaseEdit` | `vue-router`, `pinia`, `vue-sonner` | ✅ optional |
| `BaseTable` | `md-editor-v3` (Markdown 列) | ✅ optional |
| `TrendChart` | `echarts` | ✅ optional |
| `ui/carousel` | `embla-carousel-vue` | ✅ optional |
| `ui/drawer` | `vaul-vue` | ✅ optional |
| `ui/input-otp` | `vue-input-otp` | ✅ optional |

## 版本管理

```bash
# 发布新版本
git tag v1.0.1
git push --tags

# 各项目更新
npm update vue-base-components
```

## 注意事项 / 风险

> ⚠️ 以下风险已记录，请在升级和使用时参考。

### 1. reka-ui 大版本升级
reka-ui 是 shadcn-vue 的底层依赖。当其发布大版本时，所有消费项目必须**同步升级** reka-ui，否则可能出现运行时错误。

**缓解措施**：
- 共享包在 `peerDependencies` 中声明 reka-ui 版本范围
- 新建一个 demo 项目用于升级前验证
- 记录 reka-ui 的 breaking changes，在 README 中维护兼容矩阵

### 2. shadcn 组件定制冲突
所有项目共享同一套 shadcn 组件代码。如果 A 项目的开发者修改了 `Button` 组件的默认样式，B 项目也会受影响。

**缓解措施**：
- 共享包中的 shadcn 组件保持"标准版"，**不要在此仓库中定制样式**
- 项目级别的样式覆盖，使用 Tailwind 的 `class` 属性或 `@layer` 扩展：
  ```vue
  <Button class="rounded-full px-8">项目自定义样式</Button>
  ```
- 如果必须修改组件行为，通过 props/slots 扩展，而非修改源码

### 3. 包体积 (Tree-shaking)
本包包含 65 个 shadcn 组件（约 400+ 文件），但 **Vite 的 tree-shaking 会自动剔除未引用的代码**。最终打包产物只包含实际使用的组件，无需担心体积。

验证方法：
```bash
npm run build && npx vite-bundle-visualizer
```

### 4. BaseEdit 与项目耦合
`BaseEdit` 是目前耦合度最高的组件，它直接依赖项目的：
- API 层（`uploadImageApi`）
- Pinia Store（`authStore`, `editStore`）
- 路由（`vue-router`）

这些依赖由消费项目的 `@` 别名解析。如果项目没有这些模块，`BaseEdit` 将无法使用。未来可考虑通过 `provide/inject` 解耦。

---

## 目录结构

```
vue-base-components/
├── src/
│   ├── index.ts                  ← 统一导出入口
│   ├── lib/
│   │   └── utils.ts              ← cn() 工具函数
│   └── components/
│       ├── BaseTable.vue         ← 9 个业务组件
│       ├── BaseEdit.vue
│       ├── BasePagination.vue
│       ├── EditDialog.vue
│       ├── ImportDialog.vue
│       ├── GlobalSearch.vue
│       ├── ComboboxField.vue
│       ├── MarkDown.vue
│       ├── TrendChart.vue
│       └── ui/                   ← 65 个 shadcn-vue 组件
│           ├── button/
│           ├── dialog/
│           ├── table/
│           └── ...
├── package.json
├── tsconfig.json
└── README.md
```
