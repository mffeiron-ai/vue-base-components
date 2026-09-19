/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {
  const content: string
  export default content
}

/**
 * 样式子路径（如 `md-editor-v3/lib/style.css`）：按需异步引样式时，
 * 通配 `*.css` 在个别 TS 版本/编辑器里对「带包名的子路径」偶发不生效，这里显式兜一条。
 */
declare module 'md-editor-v3/lib/style.css' {
  const content: string
  export default content
}
