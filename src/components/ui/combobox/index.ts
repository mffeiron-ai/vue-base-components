/**
 * Combobox 组合框（reka-ui 无头原语的样式封装）
 *
 * 结构顺序（和上游 shadcn 一致）：
 *
 *   Combobox                  ← ComboboxRoot，管选中值 / 展开状态 / 多选
 *   ├─ ComboboxAnchor         ← 弹出层的定位锚点，一般 as-child 包住触发器
 *   │   └─ ComboboxTrigger    ← 打开 / 关闭，配合 as-child 包 Button
 *   └─ ComboboxList           ← Portal 弹出的内容层（data-slot=combobox-list）
 *        ├─ ComboboxInput     ← 搜索框（复用 Command 的输入框样式）
 *        ├─ ComboboxEmpty     ← 无匹配项时的空状态
 *        ├─ ComboboxGroup     ← 分组，可传 heading
 *        │    └─ ComboboxItem
 *        │         └─ ComboboxItemIndicator
 *        ├─ ComboboxSeparator ← 分隔线
 *        └─ ComboboxViewport  ← 可选：长列表 / 虚拟滚动用的滚动视口
 */
export { default as Combobox } from "./Combobox.vue"
export { default as ComboboxAnchor } from "./ComboboxAnchor.vue"
export { default as ComboboxEmpty } from "./ComboboxEmpty.vue"
export { default as ComboboxGroup } from "./ComboboxGroup.vue"
export { default as ComboboxInput } from "./ComboboxInput.vue"
export { default as ComboboxItem } from "./ComboboxItem.vue"
export { default as ComboboxItemIndicator } from "./ComboboxItemIndicator.vue"
export { default as ComboboxList } from "./ComboboxList.vue"
export { default as ComboboxSeparator } from "./ComboboxSeparator.vue"
export { default as ComboboxTrigger } from "./ComboboxTrigger.vue"
export { default as ComboboxViewport } from "./ComboboxViewport.vue"

/** ComboboxCancel：清空搜索词（reka 原语直接透传，样式很少单独定制） */
export { ComboboxCancel } from "reka-ui"
