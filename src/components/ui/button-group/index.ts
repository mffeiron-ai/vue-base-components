import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as ButtonGroup } from "./ButtonGroup.vue"
export { default as ButtonGroupSeparator } from "./ButtonGroupSeparator.vue"
export { default as ButtonGroupText } from "./ButtonGroupText.vue"

/**
 * 按钮组样式表（class-variance-authority）
 *
 * 基类负责「把组内一堆控件拼成一个整体」：
 * - flex w-fit items-stretch：横向排列、宽度按内容、子元素高度拉齐
 * - 嵌套组之间留 gap-2（has-[>[data-slot=button-group]]）
 * - 组内的 Select 触发器宽度自适应、Input 占满剩余空间
 * - 子元素聚焦时提升 z-index，避免焦点环被相邻按钮遮住
 */
export const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        // 拼接处的圆角 / 边框必须加 `!`（important）：
        // style-*.css 预设会用 [data-slot="button"][data-size=...] 给组内每个按钮重设 rounded-md，
        // 其特异性高于这里的选择器，不加 important 会被压掉 → 接缝处出现双圆角 + 双边框。
        // 末位子元素单独补一次右侧圆角，与预设里的 rounded-r-md! 保持一致。
        horizontal:
          "[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md! [&>*:not(:first-child)]:rounded-l-none! [&>*:not(:first-child)]:border-l-0! [&>*:not(:last-child)]:rounded-r-none!",
        vertical:
          "flex-col [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md! [&>*:not(:first-child)]:rounded-t-none! [&>*:not(:first-child)]:border-t-0! [&>*:not(:last-child)]:rounded-b-none!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
)

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>
