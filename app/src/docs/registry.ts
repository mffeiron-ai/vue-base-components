/**
 * 组件导航注册表（供侧边栏 & 路由使用）
 *
 * 每篇组件文档都是独立的 `app/src/docs/<Name>Doc.vue`（标准 Vue 写法），
 * 这里只维护导航元信息：组件名（路由段）、标题、描述。
 */

export interface ComponentDoc {
  /** kebab-case 组件名，作为路由段，如 accordion */
  name: string
  /** 展示标题，如 Accordion 手风琴 */
  title: string
  /** 一句话描述 */
  description: string
  /** 导入语句（参考用） */
  importCode?: string
}

export const componentDocs: ComponentDoc[] = [
  {
    name: 'accordion',
    title: 'Accordion 手风琴',
    description: '垂直堆叠的可折叠区块，点击标题展开 / 收起对应内容。',
    importCode: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'`,
  },
  {
    name: 'alert',
    title: 'Alert 提示',
    description: '页面内固定位置的提示条，用于展示重要信息或错误状态。',
    importCode: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'`,
  },
  {
    name: 'alert-dialog',
    title: 'Alert Dialog 警告对话框',
    description: '模态对话框，用于需要用户确认的重要操作，打断当前流程。',
    importCode: `import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'`,
  },
]

/** 按 kebab 名取文档 */
export function getComponentDoc(name: string): ComponentDoc | undefined {
  return componentDocs.find((d) => d.name === name)
}
