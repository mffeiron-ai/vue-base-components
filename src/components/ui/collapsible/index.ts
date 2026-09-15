// 单个可展开 / 收起区域。三段式：Collapsible（状态）→ CollapsibleTrigger（触发器）→ CollapsibleContent（内容）。
// 需要「同时只展开一个」用 Accordion；这里每个 Collapsible 都是独立的。
export { default as Collapsible } from "./Collapsible.vue"
export { default as CollapsibleContent } from "./CollapsibleContent.vue"
export { default as CollapsibleTrigger } from "./CollapsibleTrigger.vue"
