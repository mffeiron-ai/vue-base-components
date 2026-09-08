/**
 * 组件文档数据注册表（结构化内容，替代 markdown）
 *
 * 将来可由 scripts/gen-docs.mjs 直接生成这份数据 ——
 * 它现在已经能解析出组件的导入、cva 变体、Props，只需把"输出 md 字符串"
 * 改成"输出 ComponentDoc 对象"即可。
 *
 * 渲染层用 app/src/pages/ComponentPage.vue 消费这份数据，
 * 用组件库自己的 button/card/table 等组件来展示。
 */

export interface ComponentVariant {
  /** 变体名，如 variant / size */
  name: string
  /** 可选值列表，如 ['default', 'secondary', ...] */
  values: string[]
}

export interface ComponentProp {
  name: string
  type: string
  description?: string
}

export interface ComponentDoc {
  /** kebab-case 组件名，作为路由段，如 button */
  name: string
  /** 展示标题，如 Button 按钮 */
  title: string
  /** 一句话描述 */
  description: string
  /** 导入语句代码块 */
  importCode: string
  /** cva 变体组 */
  variants?: ComponentVariant[]
  /** Props API 表 */
  props?: ComponentProp[]
}

export const componentDocs: ComponentDoc[] = [
  {
    name: 'button',
    title: 'Button 按钮',
    description: '触发用户操作的交互元素，支持多种视觉变体与尺寸。',
    importCode: `import { Button } from '@/components/ui/button'`,
    variants: [
      {
        name: 'variant',
        values: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      },
      {
        name: 'size',
        values: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      },
    ],
    props: [
      { name: 'as', type: `'button' | 'a' | ...`, description: '渲染的元素标签，默认 button' },
      { name: 'asChild', type: 'boolean', description: '以子元素作为渲染根（继承 reka-ui PrimitiveProps）' },
      { name: 'variant', type: `'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'`, description: '按钮视觉变体' },
      { name: 'size', type: `'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'`, description: '按钮尺寸' },
      { name: 'class', type: 'string', description: '追加 / 覆盖类名' },
    ],
  },
]

/** 按 kebab 名取文档 */
export function getComponentDoc(name: string): ComponentDoc | undefined {
  return componentDocs.find((d) => d.name === name)
}
