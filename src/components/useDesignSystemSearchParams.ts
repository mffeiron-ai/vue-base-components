/**
 * URL 搜索参数管理组合式函数
 * 返回 ref 结构，供 RandomUITest 读写 ?style=xxx&iconLibrary=xxx 等参数
 */
import { ref, watch, type Ref } from 'vue'

export type DesignSystemStyle = string

export interface DesignSystemSearchParams {
  style: Ref<string | null>
  iconLibrary: Ref<string | null>
}

export function useDesignSystemSearchParams(): DesignSystemSearchParams {
  const sp = new URLSearchParams(window.location.search)
  const style = ref<string | null>(sp.get('style'))
  const iconLibrary = ref<string | null>(sp.get('iconLibrary'))

  watch([style, iconLibrary], () => {
    setDesignSystemSearchParams({ style: style.value, iconLibrary: iconLibrary.value })
  })

  return { style, iconLibrary }
}

export function setDesignSystemSearchParams(params: Partial<{ style: string | null; iconLibrary: string | null }>) {
  // 在现有 query 上改，只动自己这两个参数：
  // 之前是新建 URLSearchParams 从零拼，会把别人的参数（如文档站的 ?tab=）整个抹掉。
  const sp = new URLSearchParams(window.location.search)
  for (const key of ['style', 'iconLibrary'] as const) {
    const value = params[key]
    if (value === undefined) continue
    if (value) sp.set(key, value)
    else sp.delete(key)
  }
  const qs = sp.toString()
  const newURL = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  window.history.replaceState(null, '', newURL)
}
