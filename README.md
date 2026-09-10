# vue-base-components

Vue 3 + Tailwind CSS + shadcn-vue 共享组件库，为多个项目提供统一的业务组件和 UI 组件。

## 来源声明（Credits）

> 本项目的 UI 组件部分是**照着 [shadcn-vue](https://github.com/unovue/shadcn-vue) 做的** —— 源码、API 设计、样式预设与文档结构均移植自该项目，特此声明并致谢。

| 来源项目 | 在本仓库中的对应内容 | 许可证 |
|---------|------------------|---------|
| [unovue/shadcn-vue](https://github.com/unovue/shadcn-vue) | `src/components/ui/**`、`src/styles/reka-*/**`（8 套设计版组件）、`src/styles/style-*.css`（8 套风格预设）、`src/styles/utilities.css`、`registry/**`、`shadcn-docs/**` | MIT |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | shadcn-vue 的上游设计体系与文档来源 | MIT |
| [unovue/reka-ui](https://github.com/unovue/reka-ui) | 所有无头（headless）无障碍组件基元 | MIT |
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | 样式引擎（Tailwind CSS 4） | MIT |

本项目在此基础上做的部分：接入自有设计令牌与主题系统、业务组件（`BaseTable` 等）、随机 UI 生成器、纯 Vue 文档站应用（`app/`），以及若干 bug 修复（见 `git log`）。

**本项目与 shadcn / shadcn-vue 官方无任何隶属、赞助或背书关系**，相关名称与商标归各自所有者。

许可证：[MIT](./LICENSE)（包含上述项目的衍生代码，其原始版权声明同样适用，详见 LICENSE 里的第三方来源声明）。

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
npm install github:mffeiron-ai/vue-base-components#v1.0.0

# 或指定分支
npm install github:mffeiron-ai/vue-base-components#main
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

项目 `style.css` 需要包含 shadcn-vue 的 CSS 变量，**并配置 Tailwind 扫描共享组件库**（否则 shadcn 组件样式会缺失）：

```css
@import "tailwindcss";

/* 必须！告诉 Tailwind 扫描 vue-base-components 中的类名 */
@source "../node_modules/vue-base-components/src";
```
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

## 文档站（app/）与部署

文档站是 `app/` 下的纯 Vue 应用（Vite + vue-router），本地命令：

```bash
npm run dev      # http://localhost:5174
npm run build    # 产物在 app/dist/
npm run preview  # 预览构建产物
```

> `docs/` 里的 VitePress 站点是历史产物，已被 `app/` 取代。VitePress 相关命令（`docs:dev` 等）仍可用，但不再参与部署。

### 部署到 GitHub Pages

工作流已就绪：`.github/workflows/deploy-pages.yml`（推送到 `master` 且改动 `app/**`、`src/**`、`package*.json` 时自动构建并发布）。

启用步骤（只需做一次）：

0. 仓库可见性设为 **Public**（Pages 免费计划不支持私有仓库）
1. **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
2. 推送到 `master`，或在 **Actions → Deploy Docs App to GitHub Pages → Run workflow** 手动触发

发布地址：`https://mffeiron-ai.github.io/vue-base-components/`

> ℹ️ GitHub Pages 在**免费计划下只支持公开仓库**，因此本仓库需保持 **public**。
> 若以后要改回私有，得升级到 Pro/Team/Enterprise，或改用下面的其他托管。

### 换用其他托管（支持私有仓库、免费）

三者都不需要改代码 —— `VITE_BASE_PATH` 不设置时 `base` 默认是 `/`（根路径部署）：

| 平台 | 构建命令 | 输出目录 |
|------|----------|----------|
| Cloudflare Pages | `npm run build` | `app/dist` |
| Vercel | `npm run build` | `app/dist` |
| Netlify | `npm run build` | `app/dist` |

根路径部署不需要 `404.html` 回退（这些平台都有 SPA rewrite 配置项）。

### 部署相关的两个关键点（改代码时注意）

- **`base` 由环境变量驱动**：`app/vite.config.ts` 里 `base: process.env.VITE_BASE_PATH || '/'`。部署在子路径（GitHub Pages 项目页）必须传 `/<repo>/`，否则 JS/CSS 全 404。
- **路由基路径跟着 base 走**：`app/src/router.ts` 用 `createWebHistory(import.meta.env.BASE_URL)`，不要改回硬编码 `'/'`。
- **前端路由刷新**：工作流会把 `index.html` 复制成 `404.html` 兜住深链接（如 `/components/button` 直接刷新/分享时状态码是 404，但页面能正常渲染）。想彻底避免 404 状态码，可改用 `createWebHashHistory()`（URL 会变成 `/#/components/button`）。

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
