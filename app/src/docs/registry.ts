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
  {
    name: 'date-picker',
    title: 'Date Picker 日期选择器',
    description: '单日 / 输入框 + 日历 / 日期区间三种形态，底层 reka-ui 日历，值类型为 @internationalized/date 的 CalendarDate；支持可选范围、禁用日期、快捷预设与自定义格式。',
    importCode: `import { DatePicker, DatePickerInput, DatePickerRange, formatDateISO, toCalendarDate } from '@/components/ui/date-picker'`,
  },
  {
    name: 'dialog',
    title: 'Dialog 对话框',
    description: '模态对话框：锁背景滚动与焦点，Esc / 点遮罩 / 右上角 × / 内部按钮都能关；支持受控开关、自定义宽度、隐藏关闭按钮，长内容用 DialogScrollContent 整页滚动。',
    importCode: `import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogScrollContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'`,
  },
  {
    name: 'drawer',
    title: 'Drawer 抽屉',
    description: '带手势的抽屉面板（vaul-vue）：拖拽关闭、顶部把手、背景缩放，支持四个方向、多档吸附、只拖把手与禁止手势关闭，组合方式与 Dialog 一致。',
    importCode: `import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'`,
  },
  {
    name: 'dropdown-menu',
    title: 'Dropdown Menu 下拉菜单',
    description: '点击触发的菜单：普通项、可勾选项、单选组、二级子菜单、分隔线、快捷键提示与危险操作样式，支持受控开合和自动碰撞翻转。',
    importCode: `import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'`,
  },
  {
    name: 'empty',
    title: 'Empty 空状态',
    description: '列表为空 / 搜索无结果时的占位块：图标 + 标题 + 说明 + 操作按钮，自带居中与撑满能力，支持 icon 变体与自定义插画。',
    importCode: `import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'`,
  },
  {
    name: 'field',
    title: 'Field 表单字段',
    description: '表单字段布局组件族：垂直 / 水平 / 响应式三种排布，FieldGroup 与 FieldSet 分组，FieldLabel / FieldTitle / FieldDescription / FieldError 负责各部位，错误可直喂 vee-validate。',
    importCode: `import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from '@/components/ui/field'`,
  },
  {
    name: 'hover-card',
    title: 'Hover Card 悬停卡片',
    description: '鼠标悬停（或键盘聚焦）时弹出的信息卡片：适合用户资料、链接预览；鼠标可移进卡片继续交互，支持延迟调节、受控开合与四向定位。',
    importCode: `import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'`,
  },
  {
    name: 'input',
    title: 'Input 输入框',
    description: '单行文本输入框，原生 input 的样式封装：v-model / defaultValue 两种用法，type 与其它原生属性全部透传，错误态用 aria-invalid，尺寸需带 ! 覆盖预设。',
    importCode: `import { Input } from '@/components/ui/input'`,
  },
  {
    name: 'input-group',
    title: 'Input Group 输入框组',
    description: '把输入框与图标 / 文本 / 按钮拼成一体：外框、圆角、聚焦与错误态由容器统一负责，Addon 支持左右与上下整行四种位置，多行用 Textarea 变体。',
    importCode: `import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'`,
  },
  {
    name: 'input-otp',
    title: 'Input OTP 验证码输入',
    description: '一次性验证码 / PIN 输入框：一排格子背后是一个隐藏 input，整块可聚焦、支持粘贴整串；位数由 maxlength 决定，可分组加分隔符，支持 pattern 限制字符、错误态与 complete 事件。',
    importCode: `import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'`,
  },
  {
    name: 'item',
    title: 'Item 条目',
    description: '通用条目容器：左侧媒体 + 中间内容 + 右侧操作，也可换成 Header / Content / Footer 的上下结构；三种 variant 与三档尺寸，配 as-child 能整块可点，配 ItemGroup + ItemSeparator 就是列表。',
    importCode: `import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/item'`,
  },
]

/** 按 kebab 名取文档 */
export function getComponentDoc(name: string): ComponentDoc | undefined {
  return componentDocs.find((d) => d.name === name)
}

/* ─────────────── 侧边栏分类 ───────────────
   分类只在这一处维护：调整归类时改下面的 names 即可，不用动上面每一条文档记录。
   没被任何分类收进去的组件不会出现在侧边栏（renderCategories 会跳过），
   所以新增组件时记得来这里登记。 */

export interface ComponentCategory {
  /** 稳定标识，用作 key */
  key: string
  /** 卡片标题 */
  title: string
  /** 卡片副标题（一句话说明这类的边界） */
  hint: string
  /** 放在中央文档的哪一侧（不填＝left） */
  side?: 'left' | 'right'
  /** 归入本类的组件名（kebab，对应 ComponentDoc.name） */
  names: string[]
}

export const componentCategories: ComponentCategory[] = [
  {
    key: 'interactive',
    title: '交互',
    hint: '点击 / 悬停 / 键盘驱出，本身会改变界面状态',
    // 组件最多的一类，单放右侧，跟左侧两张卡的合计高度接近
    side: 'right',
    names: [
      'accordion',
      'alert-dialog',
      'button',
      'button-group',
      'carousel',
      'collapsible',
      'combobox',
      'command',
      'context-menu',
      'dialog',
      'drawer',
      'dropdown-menu',
      'hover-card',
    ],
  },
  {
    key: 'display',
    title: '展示',
    hint: '负责「把内容呈现出来」，不承担输入',
    names: [
      'alert',
      'aspect-ratio',
      'attachment',
      'avatar',
      'badge',
      'breadcrumb',
      'bubble',
      'card',
      'chart',
      'data-table',
      'empty',
      'item',
    ],
  },
  {
    key: 'input',
    title: '输入',
    hint: '收集用户填写的内容，通常配 Field / Label 使用',
    names: [
      'calendar',
      'checkbox',
      'date-picker',
      'field',
      'input',
      'input-group',
      'input-otp',
    ],
  },
]

/** 分类 + 该类实际存在的文档（按 names 顺序，找不到的自动跳过） */
export function getCategoriesWithDocs() {
  return componentCategories
    .map((cat) => ({ ...cat, docs: cat.names.map((n) => getComponentDoc(n)).filter((d): d is ComponentDoc => !!d) }))
    .filter((cat) => cat.docs.length > 0)
}
