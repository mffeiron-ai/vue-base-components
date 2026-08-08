/**
 * URL 搜索参数管理组合式函数
 * 用于 RandomUITest 读写 ?style=xxx&iconLibrary=xxx 等参数
 */
import { reactive, watch } from 'vue'

export type DesignSystemStyle = string

export interface DesignSystemSearchParams {
  style: DesignSystemStyle | null
  iconLibrary: string | null
}

export function useDesignSystemSearchParams() {
  const params = reactive<DesignSystemSearchParams>({
    style: null,
    iconLibrary: null,
  })

  function readFromURL() {
    const sp = new URLSearchParams(window.location.search)
    params.style = sp.get('style')
    params.iconLibrary = sp.get('iconLibrary')
  }

  function writeToURL() {
    const sp = new URLSearchParams()
    if (params.style) sp.set('style', params.style)
    if (params.iconLibrary) sp.set('iconLibrary', params.iconLibrary)
    const qs = sp.toString()
    const newURL = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname
    window.history.replaceState(null, '', newURL)
  }

  readFromURL()

  watch(() => [params.style, params.iconLibrary], () => {
    writeToURL()
  })

  return params
}

export function setDesignSystemSearchParams(params: Partial<DesignSystemSearchParams>) {
  const sp = new URLSearchParams(window.location.search)
  if (params.style !== undefined) {
    if (params.style) sp.set('style', params.style)
    else sp.delete('style')
  }
  if (params.iconLibrary !== undefined) {
    if (params.iconLibrary) sp.set('iconLibrary', params.iconLibrary)
    else sp.delete('iconLibrary')
  }
  const qs = sp.toString()
  const newURL = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname
  window.history.replaceState(null, '', newURL)
}
