/**
 * Context Menu 右键菜单（基于 reka-ui 的 ContextMenu 系列）
 *
 * 结构与 DropdownMenu 很像，但两点不同：
 *  1. 没有触发器按钮 —— ContextMenuTrigger 圈出「右键区域」，菜单在鼠标位置弹出；
 *  2. 多了 SubContent / SubTrigger 这一层子菜单（单项向右展开）。
 *
 * 结构：
 *   ContextMenu（Root：模态、开合状态）
 *   ├─ ContextMenuTrigger    右键 / 长按区域（as-child 可换成自定义元素）
 *   └─ ContextMenuContent    弹出层（内部已包含 Portal，定位到鼠标位置）
 *        ├─ ContextMenuLabel          小标题（可 inset 对齐）
 *        ├─ ContextMenuGroup          分组
 *        ├─ ContextMenuItem           普通项（variant="destructive" / inset / disabled）
 *        ├─ ContextMenuCheckboxItem   可勾选项（v-model:boolean）
 *        ├─ ContextMenuRadioGroup     单选组（v-model）
 *        │    └─ ContextMenuRadioItem 单选项
 *        ├─ ContextMenuSeparator      分隔线
 *        ├─ ContextMenuShortcut       右侧快捷键提示
 *        └─ ContextMenuSub            子菜单
 *             ├─ ContextMenuSubTrigger
 *             └─ ContextMenuSubContent
 *
 * 注：ContextMenuPortal / ContextMenuItemIndicator 没在这里导出 ——
 * Content 已内置 Portal，指示器由 CheckboxItem / RadioItem 内部使用。
 */
export { default as ContextMenu } from "./ContextMenu.vue"
export { default as ContextMenuCheckboxItem } from "./ContextMenuCheckboxItem.vue"
export { default as ContextMenuContent } from "./ContextMenuContent.vue"
export { default as ContextMenuGroup } from "./ContextMenuGroup.vue"
export { default as ContextMenuItem } from "./ContextMenuItem.vue"
export { default as ContextMenuLabel } from "./ContextMenuLabel.vue"
export { default as ContextMenuRadioGroup } from "./ContextMenuRadioGroup.vue"
export { default as ContextMenuRadioItem } from "./ContextMenuRadioItem.vue"
export { default as ContextMenuSeparator } from "./ContextMenuSeparator.vue"
export { default as ContextMenuShortcut } from "./ContextMenuShortcut.vue"
export { default as ContextMenuSub } from "./ContextMenuSub.vue"
export { default as ContextMenuSubContent } from "./ContextMenuSubContent.vue"
export { default as ContextMenuSubTrigger } from "./ContextMenuSubTrigger.vue"
export { default as ContextMenuTrigger } from "./ContextMenuTrigger.vue"
