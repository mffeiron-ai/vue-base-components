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
  {
    name: 'kbd',
    title: 'Kbd 键盘按键',
    description: '快捷键的按键标记（原生 kbd 标签）：单个用 Kbd、组合键用 KbdGroup 排一行；放进 Tooltip 会自动切成半透明反色，字号与圆角由各风格预设统一。',
    importCode: `import { Kbd, KbdGroup } from '@/components/ui/kbd'`,
  },
  {
    name: 'label',
    title: 'Label 标签',
    description: '表单控件标签（原生 label）：支持 for+id 或直接包裹控件两种绑定，点标签即聚焦/切换；内置 peer-disabled 与 group-data-[disabled] 两条钩子，控件禁用时标签自动变灰。',
    importCode: `import { Label } from '@/components/ui/label'`,
  },
  {
    name: 'marker',
    title: 'Marker 标记',
    description: '内容流里的提示行 / 分隔行（今天、已编辑、AI 已停止生成）：由 Marker + MarkerIcon + MarkerContent 组成，variant 支持普通灰字、两侧横线分隔与底部带边三档。',
    importCode: `import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'`,
  },
  {
    name: 'menubar',
    title: 'Menubar 菜单栏',
    description: '桌面应用风格的横向菜单栏：一排 MenubarMenu（Trigger + Content），面板部件与 DropdownMenu 一一对应；自带键盘导航与「移到相邻标题自动切换」的菜单栏手感。',
    importCode: `import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar'`,
  },
  {
    name: 'message',
    title: 'Message 消息',
    description: '对话里一行消息的布局骨架：Message 横排头像 + 内容列，内容列再放 MessageHeader（发送者）、Bubble（正文）、MessageFooter（时间）；align 控制是对方还是自己，可配 MessageGroup 成组。',
    importCode: `import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from '@/components/ui/message'`,
  },
  {
    name: 'message-scroller',
    title: 'Message Scroller 消息滚动区',
    description: '聊天 / 流式输出的滚动引擎：贴底跟随、用户上滑自动暂停、往上加载不跳位、跳到指定消息、回到底部按钮，并提供 scrollable / 可见性与锚点读数。',
    importCode: `import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport, useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility } from '@/components/ui/message-scroller'`,
  },
  {
    name: 'navigation-menu',
    title: 'Navigation Menu 导航菜单',
    description: '站点级导航菜单：悬停 / 聚焦 / 方向键展开内容面板，横移自动换项；默认共享一块视口（切换时面板伸缩），可关成逐项卡片，支持指示箭头、受控开合与展开延迟。',
    importCode: `import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'`,
  },
  {
    name: 'number-field',
    title: 'Number Field 数字输入框',
    description: '带增减按钮的数字输入：值是真正的 number，支持范围限制、小数步长、step 吸附、键盘上下键，以及 Intl.NumberFormat 的货币 / 百分比格式化。',
    importCode: `import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'`,
  },
  {
    name: 'pagination',
    title: 'Pagination 分页',
    description: '列表 / 表格的分页导航：页码数组由 reka 按当前页、总页数、sibling-count、show-edges 算好；支持省略号、首末页跳转、前后翻页自动禁用与链接式页码。',
    importCode: `import { Pagination, PaginationContent, PaginationEllipsis, PaginationFirst, PaginationItem, PaginationLast, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'`,
  },
  {
    name: 'popover',
    title: 'Popover 气泡卡片',
    description: '点触发器弹出的可交互面板：面板里能放表单与按钮，点内部不关、点外部 / Esc 关闭；支持 side/align 定位自动翻转、自定义锚点（PopoverAnchor）与模态开关。',
    importCode: `import { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'`,
  },
  {
    name: 'progress',
    title: 'Progress 进度条',
    description: '横向进度条：model-value / max 决定填充比例，带 transition 平滑推进与完整的 progressbar 无障碍语义；高度、颜色、圆角用 class 覆盖。',
    importCode: `import { Progress } from '@/components/ui/progress'`,
  },
  {
    name: 'questionnaire',
    title: 'Questionnaire 问卷',
    description: '一次一题的问卷 / 引导流程：进度、必答校验、跳过、上下题与提交按钮、键盘快捷键都由组件管；根就是 form，答案按题目 name 提交（多选提交多个值）。',
    importCode: `import { Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices, QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress, QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle } from '@/components/ui/questionnaire'`,
  },
  {
    name: 'radio-group',
    title: 'Radio Group 单选组',
    description: '一组互斥选项（role=radiogroup）：v-model 绑值，每个 RadioGroupItem 给一个 value；方向键切换、Tab 进出整组，选中标记可自定义。',
    importCode: `import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'`,
  },
  {
    name: 'range-calendar',
    title: 'Range Calendar 范围日历',
    description: '选一段日期：点第一下是开始、第二下是结束，中间连成高亮带（底色画在单元格上，首尾自动补圆角）；支持多月份并排、限定范围、禁用特定日期。',
    importCode: `import { RangeCalendar } from '@/components/ui/range-calendar'`,
  },
  {
    name: 'resizable',
    title: 'Resizable 可调整面板',
    description: '拖拽分割线布局：Group 给方向、Panel 按百分比分配尺寸、Handle 是那条可拖的线；支持 min/max、折叠、键盘微调与布局持久化。',
    importCode: `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'`,
  },
  {
    name: 'scroll-area',
    title: 'Scroll Area 滚动区域',
    description: '自定义样式的滚动区：底色/宽度/圆角跟设计系统走，可控制悬停或滚动时才浮出；默认只有垂直条，要横条得自己加一个 ScrollBar。',
    importCode: `import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'`,
  },
  {
    name: 'select',
    title: 'Select 选择器',
    description: '从一组选项里挑一个：Trigger + Value 拼出触发器，Content 是 Portal 浮层；支持分组标签与分隔线、自定义选项内容与勾选图标、长列表自动出现滚动按钮，带 name 时直接进 FormData。',
    importCode: `import { Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'`,
  },
  {
    name: 'separator',
    title: 'Separator 分隔线',
    description: '一条 1px 的分割线，横向或纵向：orientation 决定方向，decorative 决定它对屏幕阅读器是「隐形」还是「真的在分隔两块区域」；颜色取设计系统的 --border。',
    importCode: `import { Separator } from '@/components/ui/separator'`,
  },
  {
    name: 'sheet',
    title: 'Sheet 侧边抽屉',
    description: '从屏幕某一边滑出的面板：side 选 top/right/bottom/left，内置右上角关闭按钮；底层就是 Dialog，所以模态、焦点与 Esc/点遮罩关闭都一致，配合 Header/Footer 就是标准的「右滑编辑面板」。',
    importCode: `import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'`,
  },
  {
    name: 'sidebar',
    title: 'Sidebar 侧边栏',
    description: '后台布局的侧边栏：SidebarProvider 管状态（展开 / 折叠 / 移动端抽屉 + cookie 记忆 + Ctrl/Cmd+B），Sidebar 三档折叠（offcanvas / icon / none）× 三种外观（sidebar / floating / inset）× 左右两侧，配 SidebarInset 就是完整骨架。',
    importCode: `import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'`,
  },
  {
    name: 'skeleton',
    title: 'Skeleton 骨架屏',
    description: '加载前的占位块：一个空 div + 呼吸式动画，尺寸与形状全由 class 描述；底色与圆角由设计系统接管（各风格圆角不同），换色/改圆角要带 !，关动画用 animate-none。',
    importCode: `import { Skeleton } from '@/components/ui/skeleton'`,
  },
  {
    name: 'slider',
    title: 'Slider 滑块',
    description: '拖动把手选数值：单个组件同时搞定单值与区间 —— 值是数组，数组里有几个数就有几个把手；支持 min/max/step 吸附、纵向、反转、最小间距与原生表单提交，键盘与触摸都由 reka 处理。',
    importCode: `import { Slider } from '@/components/ui/slider'`,
  },
  {
    name: 'sonner',
    title: 'Sonner Toast 通知',
    description: '全局轻提示：<Toaster />（本库包装，管位置/主题/语义配色）+ vue-sonner 的 toast() 函数。六种类型、描述与操作按钮、promise 全程跟随、六向定位、richColors/closeButton/expand 等开关，一个页面放一个 Toaster 即可。',
    importCode: `import { Toaster } from '@/components/ui/sonner'\nimport { toast } from 'vue-sonner'`,
  },
  {
    name: 'spinner',
    title: 'Spinner 加载指示器',
    description: '一个旋转的圈：内部就是 lucide 的 Loader2 + animate-spin，并带 role="status" + aria-label 无障碍标记；尺寸、颜色、间距全用 class 调，常用于按钮加载态与整块遮罩。',
    importCode: `import { Spinner } from '@/components/ui/spinner'`,
  },
  {
    name: 'stepper',
    title: 'Stepper 步骤条',
    description: '多步流程的进度指示：根节点管当前第几步（从 1 开始），每个 StepperItem 声明自己第几步，状态（active / completed / inactive）由当前步自动派生。默认线性模式只能一步步往前走，可关掉自由跳步，也支持禁用某步、手动标记已完成与纵向布局。',
    importCode: `import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper'`,
  },
  {
    name: 'switch',
    title: 'Switch 开关',
    description: '二态即时生效开关，基于 reka-ui 的 SwitchRoot。根节点是带 data-state 的 button，内部一颗滑块靠 translate-x 滑动；两档尺寸（default / sm），传 name 时会额外渲染隐藏 checkbox 参与原生表单提交。',
    importCode: `import { Switch } from '@/components/ui/switch'`,
  },
  {
    name: 'table',
    title: 'Table 表格',
    description: '表格标签族的样式包装（9 个部件，不依赖任何 headless 库）：每个部件就是对应的原生标签加一组 Tailwind 类与 data-slot 钩子。支持表头 / 表体 / 页脚合计、行 hover 与选中态、复选框列对齐、空状态整行、固定高度滚动 + 粘性表头。',
    importCode: `import { Table, TableBody, TableCaption, TableCell, TableEmpty, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'`,
  },
  {
    name: 'tabs',
    title: 'Tabs 标签页',
    description: '用一排标签切换同级内容，基于 reka-ui 的 TabsRoot：Tabs 管选中值与方向、TabsList 是标签容器（含 default / line 两个档位）、TabsTrigger 是单个标签、TabsContent 是内容面板。支持受控、禁用某标签、纵向布局、图标与计数，以及面板挂载行为（unmountOnHide / forceMount）与键盘激活模式。',
    importCode: `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'`,
  },
  {
    name: 'tags-input',
    title: 'Tags Input 标签输入',
    description: '把自由文本收成一组标签，基于 reka-ui 的 TagsInputRoot。标签可由分隔符 / Enter / Tab / 失焦 / 粘贴五种方式添加，支持数量上限、重复项拦截（拒了会打 data-invalid）、对象值（convertValue + displayValue）与键盘选中删除，传 name 还能参与原生表单提交。',
    importCode: `import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'`,
  },
  {
    name: 'textarea',
    title: 'Textarea 多行输入',
    description: '一个 textarea 的样式包装，只有 v-model / default-value / class 三个 prop，其余原生属性全部透传。自带 field-sizing-content 会随内容自动长高（min-h-16 兜底），并内置禁用与 aria-invalid 校验态样式。',
    importCode: `import { Textarea } from '@/components/ui/textarea'`,
  },
  {
    name: 'toggle',
    title: 'Toggle 切换按钮',
    description: '一个「按下 / 弹起」的双态按钮，基于 reka-ui 的 Toggle：本质是带 aria-pressed 的 button，按下时输出 data-state="on"。支持 variant（default / outline）、size（default / sm / lg）、禁用与插槽参数换图标，默认插槽会给 { modelValue, pressed, state, disabled }。',
    importCode: `import { Toggle } from '@/components/ui/toggle'`,
  },
  {
    name: 'toggle-group',
    title: 'Toggle Group 按钮组',
    description: '一组可切换按钮，基于 reka-ui 的 ToggleGroupRoot：支持单选（type="single"）与多选（type="multiple"），组级 variant / size / spacing 会通过 data 属性下发到每个子项（spacing=0 时自动连体并处理首尾圆角与共享描边），另有方向键导航（rovingFocus / loop）、纵向布局与禁用。',
    importCode: `import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'`,
  },
  {
    name: 'tooltip',
    title: 'Tooltip 文字提示',
    description: '悬停 / 键盘聚焦时弹出的短提示，基于 reka-ui 的 TooltipRoot。气泡是深底浅字的反色样式并自带箭头，支持四个方向与三档对齐、延迟（本库 Provider 默认改成 0，即立刻显示）、受控开合、禁用与「只键盘聚焦才显示」，内容里放 Kbd 会自动切成半透明反色。',
    importCode: `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'`,
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
      'menubar',
      'navigation-menu',
      'pagination',
      'popover',
      'resizable',
      'sheet',
      'sidebar',
      'tabs',
      'toggle',
      'toggle-group',
      'tooltip',
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
      'kbd',
      'marker',
      'message',
      'message-scroller',
      'progress',
      'scroll-area',
      'separator',
      'skeleton',
      'sonner',
      'spinner',
      'stepper',
      'table',
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
      'label',
      'number-field',
      'questionnaire',
      'radio-group',
      'range-calendar',
      'select',
      'slider',
      'switch',
      'tags-input',
      'textarea',
    ],
  },
]

/** 分类 + 该类实际存在的文档（按 names 顺序，找不到的自动跳过） */
export function getCategoriesWithDocs() {
  return componentCategories
    .map((cat) => ({ ...cat, docs: cat.names.map((n) => getComponentDoc(n)).filter((d): d is ComponentDoc => !!d) }))
    .filter((cat) => cat.docs.length > 0)
}
