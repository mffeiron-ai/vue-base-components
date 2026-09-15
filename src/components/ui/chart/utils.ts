import type { ChartConfig } from "."
import { isClient } from "@vueuse/core"
import { useId } from "reka-ui"
import { h, render } from "vue"

// 渲染结果缓存：Unovis 在鼠标移动时会反复求模板，同一份数据不重复渲染
// Simple cache using a Map to store serialized object keys
const cache = new Map<string, string>()

// Convert object to a consistent string key
function serializeKey(key: Record<string, any>): string {
  return JSON.stringify(key, Object.keys(key).sort())
}

interface Constructor<P = any> {
  __isFragment?: never
  __isTeleport?: never
  __isSuspense?: never
  new (...args: any[]): {
    $props: P
  }
}

/**
 * 把 Vue 组件渲染成 HTML 字符串。
 *
 * Unovis 的 Crosshair / Tooltip 只接受“字符串模板”，但我们的提示框是 Vue 组件，
 * 所以用 h() + render() 在一个游离 div 里渲染后取 innerHTML。
 * 返回的函数签名与 Unovis 的模板回调一致：(data, x) => string。
 *
 * 注意：依赖 DOM，所以只在客户端返回函数（SSR 下是 undefined）。
 *
 * @see https://unovis.dev/docs/auxiliary/Crosshair#component-props
 */
export function componentToString<P>(config: ChartConfig, component: Constructor<P>, props?: P) {
  if (!isClient)
    return

  // This function will be called once during mount lifecycle
  const id = useId()

  return (_data: any, x: number | Date) => {
    // Unovis 有时把数据包在 { data } 里，这里兼容两种形态
    const data = "data" in _data ? _data.data : _data
    const serializedKey = `${id}-${serializeKey(data)}`
    const cachedContent = cache.get(serializedKey)
    if (cachedContent)
      return cachedContent

    // config 一并注入，提示框才能拿到 label / color
    const vnode = h<unknown>(component, { ...props, payload: data, config, x })
    const div = document.createElement("div")
    render(vnode, div)
    cache.set(serializedKey, div.innerHTML)
    return div.innerHTML
  }
}
