// 受控状态的桥接工具：把 TanStack 的 updater（值或函数）写回 ref。
// `@tanstack/vue-table` 是可选 peer（`peerDependenciesMeta.optional`），
// 同时也在 devDependencies 里（文档站的 data-table 演示页要用），所以本仓库里可解析。
// 只有用到 data-table 的消费项目才需要装它。
import type { Updater } from "@tanstack/vue-table"

import type { Ref } from "vue"
import { isFunction } from "@tanstack/vue-table"

export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>) {
  ref.value = isFunction(updaterOrValue)
    ? updaterOrValue(ref.value)
    : updaterOrValue
}
