/**
 * Command 命令面板（cmdk 思路的 reka-ui 实现）
 *
 * 结构：
 *   Command（ListboxRoot + 自建过滤上下文）
 *   └─ CommandList
 *        ├─ CommandInput      搜索框（v-model 绑到 filterState.search）
 *        ├─ CommandEmpty      空结果提示（有搜索词且命中 0 时才渲染）
 *        ├─ CommandGroup*     分组（可传 heading，没命中的整组隐藏）
 *        │    └─ CommandItem*  选项（自身文本参与过滤，选中后自动清空搜索词）
 *        └─ CommandSeparator
 * 另外 CommandShortcut 是选项右侧的快捷键提示；弹窗形态用 CommandDialog 包一层。
 *
 * 和 Combobox 的区别：Command 是「搜索 + 可选」的命令面板，没有触发器/弹出层，
 * 过滤不靠 reka 内部，而是本目录自己实现的（见 Command.vue 的 filterItems）。
 */
import type { Ref } from "vue"
import { createContext } from "reka-ui"

export { default as Command } from "./Command.vue"
export { default as CommandDialog } from "./CommandDialog.vue"
export { default as CommandEmpty } from "./CommandEmpty.vue"
export { default as CommandGroup } from "./CommandGroup.vue"
export { default as CommandInput } from "./CommandInput.vue"
export { default as CommandItem } from "./CommandItem.vue"
export { default as CommandList } from "./CommandList.vue"
export { default as CommandSeparator } from "./CommandSeparator.vue"
export { default as CommandShortcut } from "./CommandShortcut.vue"

/**
 * 过滤上下文：Command 负责「收集 + 打分」，Item / Group / Empty 各自据此决定要不要渲染。
 * - allItems：item id → 文本（Item 挂载时注册，过滤就是拿它做 contains 匹配）
 * - allGroups：groupId → 该组内的 item id 集合
 * - filterState：搜索词 + 过滤结果（命中总数 / 每个 item 是否命中 / 还有命中的组）
 */
export const [useCommand, provideCommandContext] = createContext<{
  allItems: Ref<Map<string, string>>
  allGroups: Ref<Map<string, Set<string>>>
  filterState: {
    search: string
    filtered: { count: number, items: Map<string, number>, groups: Set<string> }
  }
}>("Command")

/** 让 CommandItem 知道自己归属于哪个 Group（用于判断「这一组还有命中吗」） */
export const [useCommandGroup, provideCommandGroupContext] = createContext<{
  id?: string
}>("CommandGroup")
