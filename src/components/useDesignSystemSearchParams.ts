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
  const sp = new URLSearchParams()
  if (params.style) sp.set('style', params.style)
  if (params.iconLibrary) sp.set('iconLibrary', params.iconLibrary)
  const qs = sp.toString()
  const newURL = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  window.history.replaceState(null, '', newURL)
}
