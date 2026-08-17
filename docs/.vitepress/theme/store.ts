/**
 * 全局应用状态（VitePress 语境下的轻量 store，替代 pinia）
 * 统一管理：路由/页面元信息、全局偏好、toast 快捷方法等
 */
import { reactive } from 'vue'
import { toast } from 'vue-sonner'

// ── 页面路由配置 ─────────────────────────────────────
// 统一在这里维护页面元信息（标题、分组、是否需要全局导航等）
export interface PageMeta {
  /** 路由路径 */
  path: string
  /** 显示标题 */
  title?: string
  /** 页面分组（导航归类用） */
  group?: string
  /** 是否需要全局导航栏（false = 页面自带导航/完全自定义） */
  hasGlobalNav?: boolean
}

// 全站页面注册表
export const pageRegistry: PageMeta[] = [
  { path: '/', title: '首页', group: '首页', hasGlobalNav: false },
  { path: '/getting-started', title: '安装指南', group: '指南', hasGlobalNav: true },
  { path: '/playground', title: '随机 UI 生成器', group: '工具', hasGlobalNav: true },
]

// ── 全局应用状态 ─────────────────────────────────────
export interface AppStore {
  /** 站点名 */
  siteName: string
  /** 当前主题模式（light / dark），与 VitePress 亮暗色联动 */
  themeMode: 'light' | 'dark'
  /** 是否加载完成 */
  isReady: boolean
  /** 扩展字段：任意全局共享数据 */
  extra: Record<string, unknown>
}

export const appStore = reactive<AppStore>({
  siteName: 'RionStudio',
  themeMode: 'light',
  isReady: false,
  extra: {},
})

// ── 路由工具 ─────────────────────────────────────────
/** 根据路径获取页面元信息 */
export function getPageMeta(path: string): PageMeta | undefined {
  return pageRegistry.find(p => p.path === path)
}

/** 判断路径是否需要全局导航栏 */
export function hasGlobalNav(path: string): boolean {
  const meta = getPageMeta(path)
  return meta ? (meta.hasGlobalNav ?? true) : true
}

// ── Toast 快捷方法（统一通知样式）────────────────────
export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifyError(message: string) {
  toast.error(message)
}

export function notifyInfo(message: string) {
  toast.info(message)
}

export function notifyWarning(message: string) {
  toast.warning(message)
}
