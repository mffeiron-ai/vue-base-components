import type { HTMLAttributes } from "vue"

/**
 * 生成「带 `data-slot` 的转发属性对象」，用于包装组件的根元素。
 *
 * 背景（重要）：
 * Vue 会把组件的 fallthrough 属性合并到它的单根子元素上，而且**祖先层级的合并发生在
 * 子组件渲染之后** —— 也就是说「外层包装组件写的 `data-slot` 一定会盖掉子元素自己的
 * `data-slot`」。当子元素是我们自己的组件（Button / Badge / …）时，预设里针对
 * `[data-slot="button"]` 的基础样式会整体失效（典型症状：outline 按钮的 1px 边框消失，
 * 而高度、圆角因为走 cva 类还在，很难一眼看出来）。
 *
 * 所以约定：**`as-child` 时不要把自己的 `data-slot` 传下去**。
 * - 没套 `as-child`：包装组件自己渲染元素，照常带上 `data-slot` 供预设挂钩；
 * - 套了 `as-child`：元素由用户提供（通常是 Button / a / 自定义元素），
 *   让子元素保留自己的身份，不要顶掉它。
 *
 * 为什么不能用 `:data-slot="asChild ? undefined : 'x'"`：
 * 显式的 `undefined` 依然会参与属性合并，把子元素的值覆写成空，等于没让位 —— 必须
 * 【整个 key 都不出现】，所以这里返回空对象而不是 `{ "data-slot": undefined }`。
 *
 * @example
 * ```vue
 * <SomePrimitive v-bind="{ ...$attrs, ...slotAttrs('some-trigger', props.asChild) }" />
 * ```
 */
export function slotAttrs(slot: string, asChild?: boolean): Record<string, string> | HTMLAttributes {
  return asChild ? {} : { "data-slot": slot }
}
