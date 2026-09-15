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
  {
    name: 'aspect-ratio',
    title: 'Aspect Ratio 宽高比',
    description: '按指定比例维持内容尺寸，常用于图片、视频、地图等媒体容器。',
    importCode: `import { AspectRatio } from '@/components/ui/aspect-ratio'`,
  },
  {
    name: 'attachment',
    title: 'Attachment 附件',
    description: '展示文件或图片附件，含媒体、名称、元信息、上传状态与操作按钮。',
    importCode: `import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger } from '@/components/ui/attachment'`,
  },
  {
    name: 'avatar',
    title: 'Avatar 头像',
    description: '用图片表示用户，图片缺失或加载失败时自动回退到兜底内容。',
    importCode: `import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'`,
  },
  {
    name: 'badge',
    title: 'Badge 徽标',
    description: '用于展示状态、分类或计数的短标签。',
    importCode: `import { Badge } from '@/components/ui/badge'`,
  },
  {
    name: 'breadcrumb',
    title: 'Breadcrumb 面包屑',
    description: '用层级链接展示当前页面在站点结构中的位置。',
    importCode: `import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'`,
  },
  {
    name: 'bubble',
    title: 'Bubble 气泡',
    description: '对话场景中的消息气泡，支持变体、左右对齐、分组与反应。',
    importCode: `import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble'`,
  },
  {
    name: 'button',
    title: 'Button 按钮',
    description: '触发操作的基础控件，支持 6 种变体、6 种尺寸、图标、加载态与 as-child 链接。',
    importCode: `import { Button } from '@/components/ui/button'`,
  },
  {
    name: 'button-group',
    title: 'Button Group 按钮组',
    description: '把相关按钮（也可混入 Input / Select / Dropdown）拼成整体，自动合并接缝圆角与边框。',
    importCode: `import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'`,
  },
  {
    name: 'calendar',
    title: 'Calendar 日历',
    description: '选择单个日期，支持月份/年份下拉、多月份、范围限制、禁用规则与多语言历法。',
    importCode: `import { Calendar } from '@/components/ui/calendar'`,
  },
  {
    name: 'card',
    title: 'Card 卡片',
    description: '卡片容器，组合标题、描述、正文、右上角操作与页脚，间距由外层统一控制。',
    importCode: `import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'`,
  },
  {
    name: 'carousel',
    title: 'Carousel 轮播',
    description: '基于 embla 的无头轮播，支持拖拽、循环、自动播放、纵向滚动与自定义对齐。',
    importCode: `import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'`,
  },
  {
    name: 'chart',
    title: 'Chart 图表',
    description: '基于 Unovis 的图表包装：把 ChartConfig 的颜色/名称写成主题变量，并提供统一的提示框与图例。',
    importCode: `import { ChartContainer, ChartTooltip, ChartCrosshair, ChartTooltipContent, ChartLegendContent, componentToString } from '@/components/ui/chart'`,
  },
  {
    name: 'checkbox',
    title: 'Checkbox 复选框',
    description: '三态复选框（选中 / 未选 / 半选），支持键盘切换、表单提交与校验失败态；CheckboxGroup 可成组管理数组。',
    importCode: `import { Checkbox } from '@/components/ui/checkbox'\nimport { CheckboxGroup } from '@/components/ui/checkbox-group'`,
  },
  {
    name: 'collapsible',
    title: 'Collapsible 折叠面板',
    description: '可展开 / 收起的单个内容区，自带 aria 语义与默认高度动画。',
    importCode: `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'`,
  },
  {
    name: 'combobox',
    title: 'Combobox 组合框',
    description: '可搜索的下拉选择框，支持单选 / 多选、分组与分隔线、空状态、禁用项、长列表滚动与受控展开。',
    importCode: `import { Combobox, ComboboxAnchor, ComboboxCancel, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList, ComboboxSeparator, ComboboxTrigger, ComboboxViewport } from '@/components/ui/combobox'`,
  },
  {
    name: 'command',
    title: 'Command 命令面板',
    description: 'cmdk 风格的命令面板：搜索过滤、分组与快捷键提示、空状态、长列表滚动，以及 CommandDialog 弹窗形态。',
    importCode: `import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'`,
  },
  {
    name: 'context-menu',
    title: 'Context Menu 右键菜单',
    description: '右键 / 长按唤出的菜单（开在光标位置）：分组、勾选项、单选组、子菜单、inset 对齐、快捷键提示与自定义触发区。',
    importCode: `import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu'`,
  },
  {
    name: 'data-table',
    title: 'Data Table 数据表格',
    description: '表格标签族的样式包装（Table / TableHead / TableCell …），以及纯 Vue 实现的排序、筛选、分页、行选择与固定表头滚动。',
    importCode: `import { Table, TableBody, TableCaption, TableCell, TableEmpty, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'`,
  },
]

/** 按 kebab 名取文档 */
export function getComponentDoc(name: string): ComponentDoc | undefined {
  return componentDocs.find((d) => d.name === name)
}
