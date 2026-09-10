import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

/**
 * 按钮样式表（class-variance-authority）
 *
 * 基类负责：
 * - 布局：inline-flex + 居中 + gap-2（图标与文字的间距统一由 gap 控制，因此图标不需要额外 margin）
 * - 排版：text-sm font-medium whitespace-nowrap（不换行）
 * - 交互：transition-all、focus-visible 焦点环（ring-[3px] + border-ring）
 * - 禁用：disabled:pointer-events-none disabled:opacity-50
 * - 校验出错：aria-invalid:* 变红环 / 红边（配合表单组件使用）
 * - 图标收敛：[&_svg] 统一禁用指针事件、未显式写 size-* 时默认 size-4、shrink-0
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        /** 主按钮：主题主色实底，页面里最主要的操作 */
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        /** 危险按钮：红色实底，用于删除 / 清空等不可逆操作 */
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        /** 次要按钮：底色 + 描边 + 阴影，暗色模式改用半透明输入底色 */
        outline:
          "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",
        /** 次级按钮：次级色实底，用于并列的辅助操作 */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        /** 幽灵按钮：默认透明，hover 才浮出底色，适合工具栏 / 表格行内 */
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        /** 链接样式：无背景无内边距感，hover 显示下划线 */
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /** 默认尺寸 h-9；内含 <svg> 时左右内边距自动收窄（has-[>svg]）以保持视觉居中 */
        "default": "h-9 px-4 py-2 has-[>svg]:px-3",
        /** 小号 h-8 */
        "sm": "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        /** 大号 h-10 */
        "lg": "h-10 rounded-md px-6 has-[>svg]:px-4",
        /** 正方形纯图标按钮 size-9（无文字时必须提供 aria-label） */
        "icon": "size-9",
        /** 小号图标按钮 size-8 */
        "icon-sm": "size-8",
        /** 大号图标按钮 size-10 */
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
/** 供 Button.vue 推导 props 联合类型（ButtonVariants["variant"] / ["size"]） */
export type ButtonVariants = VariantProps<typeof buttonVariants>
